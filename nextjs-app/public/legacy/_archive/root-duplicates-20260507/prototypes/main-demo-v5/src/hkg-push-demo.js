// 香港机场主动推送 demo（独立调试页）。
// 两屏：
//   1. push 屏 — 空白 chat → thinking → agent 招呼 + 推送卡片（带"查看详情"主按钮）
//   2. detail 屏 — 复用沉浸式 H5 那一套皮肤：transit-assistant.js 的 .ta-screen
//      + airport-flipbook 地图（hotspot 点击 → 视频/crossfade 转场）+ .ta-sheet（3 档拖拽）
//      数据仍来自 hkg-profiles.js（family/business/transfer），由 adaptHkgProfileToTransitDetail
//      一次性映射到 transit-assistant 期望的 d 对象。
// 屏幕外 profile 切换器（亲子 / 商务 / 中转）方便对比演示。

import { HKG_PROFILE_KEYS, getHkgProfile } from "./data/hkg-profiles.js";
import { ICON } from "./icons.js";
import { renderComposer } from "./views/chat.js";
import { attachAirportFlipbook } from "./views/airport-flipbook.js";
import { renderHkgRouteMap, attachHkgRouteMap } from "./views/hkg-route-map.js";
import { renderHkgDrawer, attachHkgDrawer } from "./views/hkg-drawer.js";
import {
  renderTransitAssistantScreen,
  attachTransitSheetDrag,
  attachTransitStepMapSync,
  navigateMapTo,
} from "./views/transit-assistant.js";

const DEFAULT_PROFILE = "family";
const THINK_MS = 700;
const REVEAL_MS = 1500;

function normalizeProfile(profileId) {
  return HKG_PROFILE_KEYS.includes(profileId) ? profileId : DEFAULT_PROFILE;
}

const PROFILE_GREETINGS = {
  family:
    "已识别到你和孩子今天 12:40 起飞 HKG → KUL 的国泰 CX725，给你预先准备了一份带娃节奏的香港机场路书：",
  business:
    "已识别到你今天 12:40 起飞 HKG → KUL 的国泰 CX725，给你拉通了 4 个商务节点的香港机场路书：",
  transfer:
    "已识别到你今天 14:35 起飞 HKG → KUL 的马航 MH073，1h35m 紧凑中转，给你准备了一条可执行的中转管家路书：",
};

// =====================================================================
// PUSH 屏 — chat 思考 → 推送卡
// =====================================================================

export function renderPushFrame() {
  return `
    <div class="hkg-push-screen" data-demo-screen="push">
      <header class="appbar">
        <button class="appbar__icon" aria-label="菜单">${ICON.menu(22)}</button>
        <div class="appbar__title">出行助手</div>
        <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
      </header>

      <div class="feed hkg-push-feed" data-hkg-feed></div>

      ${renderComposer({ placeholder: "想去哪里", interactive: false, chips: false })}
    </div>
  `;
}

function renderThinking() {
  return `<div class="thinking hkg-push-thinking" data-hkg-thinking>正在为你准备路书</div>`;
}

// 从 profile.nodes 中挑前 3 条作为推送卡的"行程提示"清单。
// 取 node.shortLabel 做小标题、node.estimatedTime 做时长 chip、node.summary 去掉 markdown 后做描述。
function pickPushHighlights(profile, limit = 3) {
  if (!Array.isArray(profile.nodes) || profile.nodes.length === 0) return [];
  const stripMd = (text) =>
    String(text || "").replace(/\*\*(.+?)\*\*/g, "$1").trim();
  return profile.nodes.slice(0, limit).map((node) => ({
    title: node.shortLabel || node.title,
    desc: stripMd(node.summary || node.detail),
    time: node.estimatedTime || "",
  }));
}

// 根据 profile 给出顶部一行 meta（10:30 抵达 · 12:40 起飞 · 3h20m 充裕）。
// 不同 profile 的 sub 字段已带类似信息，没有特殊场景就直接复用。
function buildHighlightMeta(profile) {
  return profile.sub || profile.time || "";
}

function renderPushBody(profile) {
  const greeting = PROFILE_GREETINGS[profile.id] || PROFILE_GREETINGS.family;
  const highlights = pickPushHighlights(profile, 3);
  const highlightMeta = buildHighlightMeta(profile);
  const cardHeadline = "香港国际机场（中转停留）";

  return `
    <div class="hkg-push-pushtag hkg-push-anim-step-1">
      <span class="hkg-push-pushtag__dot" aria-hidden="true"></span>
      ${profile.push}
    </div>

    <div class="bubble bubble--assistant hkg-push-anim-step-2">${greeting}</div>

    <div class="trip-detail hkg-push-trip-detail hkg-push-anim-step-3">
      <div class="trip-detail__top">你的有 1 个行程即将出发</div>
      <article class="trip-card-detail hkg-push-card" data-profile="${profile.id}">
        ${
          profile.time
            ? `<div class="trip-card-detail__time">${profile.time}</div>`
            : ""
        }
        <h2 class="trip-card-detail__headline">${cardHeadline}</h2>
        <p class="trip-card-detail__lead">${profile.lead}</p>

        ${
          highlights.length
            ? `<section class="hkg-push-card__highlights" aria-label="中转停留信息">
                <header class="hkg-push-card__highlights-head">
                  ${
                    highlightMeta
                      ? `<span class="hkg-push-card__highlights-title">${highlightMeta}</span>`
                      : ""
                  }
                </header>
                <ul class="hkg-push-card__highlights-list">
                  ${highlights
                    .map(
                      (item) => `
                    <li class="hkg-push-card__highlight">
                      <span class="hkg-push-card__highlight-icon" aria-hidden="true"></span>
                      <div class="hkg-push-card__highlight-body">
                        <div class="hkg-push-card__highlight-title">
                          <span>${item.title}</span>
                          ${
                            item.time
                              ? `<em class="hkg-push-card__highlight-time">${item.time}</em>`
                              : ""
                          }
                        </div>
                        ${
                          item.desc
                            ? `<p class="hkg-push-card__highlight-desc">${item.desc}</p>`
                            : ""
                        }
                      </div>
                    </li>`,
                    )
                    .join("")}
                </ul>
              </section>`
            : profile.chips?.length
              ? `<div class="hkg-push-card__chips" aria-label="${profile.tabLabel}重点">
                  ${profile.chips.map((chip) => `<span>${chip}</span>`).join("")}
                </div>`
              : ""
        }

        <button
          class="btn btn--primary btn--block hkg-push-card__cta"
          type="button"
          data-demo-open="${profile.id}"
        >${profile.cta || "查看详情"}</button>
      </article>
    </div>
  `;
}

// 控制 push 动画播放
function playPushAnimation(frame, profile) {
  const feed = frame.querySelector("[data-hkg-feed]");
  if (!feed) return;
  feed.innerHTML = "";

  // step 1：空白 → 显示 thinking
  window.setTimeout(() => {
    feed.innerHTML = renderThinking();
  }, 200);

  // step 2：thinking 退场 → 推送内容入场
  window.setTimeout(() => {
    feed.innerHTML = renderPushBody(profile);
  }, THINK_MS + REVEAL_MS);
}

// =====================================================================
// DETAIL 屏 — 沉浸式 H5 皮肤（.ta-screen + airport-flipbook + .ta-sheet）
//
// 数据走 hkg-profiles.js（family/business/transfer），由
// adaptHkgProfileToTransitDetail 一次性映射成 transit-assistant 期望的
// d 对象（headline / sub / airportFlipbook / transit.{ mode, layoverText,
// flightArrive, flightDepart, boardingInfo, tasks }）。
// =====================================================================

// profile.id → ta-screen 的 persona 主题（决定 personas.css 里的色板）
const PROFILE_TO_PERSONA = {
  family: "family",
  business: "business",
  transfer: "default",
};

// profile.id → renderTransitSheetHead 里的 chip 文案：
//   t.mode = "family"   → "带娃中转"
//   t.mode = "business" → "便携中转"（直接复用默认映射）
//   其他              → "便携中转"
function profileToTransitMode(profileId) {
  if (profileId === "family") return "family";
  return "default";
}

// 去掉 markdown 加粗标记，**xxx** → xxx
function stripMd(text) {
  return String(text || "").replace(/\*\*(.+?)\*\*/g, "$1").trim();
}

// 从 profile.time / profile.sub 等字段里抽出 起飞 / 抵达 / 中转时长。
// hkg-profiles 里的字段示例：
//   family.time   = "今天 12:40 起飞 · 国泰 CX725"
//   family.sub    = "T1 出发 · 停留 3 小时 20 分"
//   transfer.time = "14:35 起飞 · 马航 MH073 · 距起飞 1h30m"
//   transfer.sub  = "T1 中转 · 停留 1 小时 35 分"
function extractFlightWindow(profile) {
  const text = `${profile.time || ""} ${profile.sub || ""} ${profile.lead || ""}`;
  const departMatch = text.match(/(\d{1,2}:\d{2})\s*起飞/);
  const arriveMatch = text.match(/(\d{1,2}:\d{2})\s*(?:抵达|抵港|落地|降落)/);
  // "停留 3 小时 20 分" / "停留 1 小时 35 分"
  const layoverCnMatch = text.match(/停留\s*(\d+)\s*小时(?:\s*(\d+)\s*分)?/);
  // "1h35m" / "3h20m"
  const layoverEnMatch = text.match(/(\d+)h(\d+)?m?/i);

  const flightDepart = departMatch ? departMatch[1] : "";
  // 没有显式抵达时间时，用起飞前 3h20m 兜底（亲子/商务剧本"今天 12:40 起飞 · 停留 3h20m"对应 09:20）
  let flightArrive = arriveMatch ? arriveMatch[1] : "";
  let layoverText = "";
  if (layoverCnMatch) {
    const h = layoverCnMatch[1];
    const m = layoverCnMatch[2] || "0";
    layoverText = `${h}h${m === "0" ? "" : `${m}m`}`;
  } else if (layoverEnMatch) {
    layoverText = `${layoverEnMatch[1]}h${layoverEnMatch[2] || "0"}m`;
  }

  if (!flightArrive && flightDepart && layoverText) {
    flightArrive = subtractDurationFromTime(flightDepart, layoverText);
  }

  return { flightDepart, flightArrive, layoverText };
}

function subtractDurationFromTime(hhmm, durationText) {
  const [h, m] = hhmm.split(":").map((v) => parseInt(v, 10));
  const dur = durationText.match(/(\d+)h(\d+)?m?/i);
  if (!dur) return "";
  const dh = parseInt(dur[1] || "0", 10);
  const dm = parseInt(dur[2] || "0", 10);
  let total = h * 60 + m - (dh * 60 + dm);
  while (total < 0) total += 24 * 60;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

// 把单个 profile node 适配成 transit-assistant 的 task。
//   - time:     节点用时（n.estimatedTime）
//   - route:    节点标题（中文人话），transit-assistant 会渲染成 .route-leg__main h3
//   - mode:     楼层副标题已按需求隐藏（不再展示 L6 / L7）
//   - duration: 留空
//   - reason:   去掉 markdown 后的 summary
//   - mapTarget: 节点 id，与 flipbook hotspot.target / nodes[].id 对齐 → 联动地图
function nodeToTask(node, idx) {
  return {
    id: node.id,
    order: idx + 1,
    time: node.estimatedTime || "",
    route: node.title || node.shortLabel || "",
    mode: "",
    duration: "",
    reason: stripMd(node.summary || node.detail),
    mapTarget: node.id,
    family: node.id.startsWith("family-") ? true : undefined,
  };
}

// 把 hkg profile 适配成 transit-assistant 期望的 d 对象
export function adaptHkgProfileToTransitDetail(profile) {
  const win = extractFlightWindow(profile);
  const persona = PROFILE_TO_PERSONA[profile.id] || "default";

  // flipbook nodes：overview + 各 profile node（image 取 node.image）
  const flipbookNodes = [
    {
      id: "overview",
      image: profile.map.overview,
      bodyTitle: profile.title,
      body: stripMd(profile.overview || profile.lead || ""),
    },
    ...profile.nodes.map((n) => ({
      id: n.id,
      image: n.image,
      bodyTitle: n.title,
      body: stripMd(n.detail || n.summary || ""),
    })),
  ];

  // flipbook hotspots：从节点 x/y 来
  const flipbookHotspots = profile.nodes.map((n) => ({
    id: n.id,
    target: n.id,
    x: n.x,
    y: n.y,
    label: n.shortLabel || n.label || n.title,
  }));

  // flipbook edges：profile.edges 已是 { from, to, video } 结构，直接复用
  const flipbookEdges = (profile.edges || []).map((e) => ({
    from: e.from,
    to: e.to,
    video: e.video,
  }));

  return {
    headline: profile.title,
    sub: profile.sub || "",
    transit: {
      mode: profileToTransitMode(profile.id),
      modeLabel: profile.tabLabel,
      modeTagline: profile.badge || "",
      flightArrive: win.flightArrive,
      flightDepart: win.flightDepart,
      layoverText: win.layoverText || "—",
      // 登机牌信息 5 列卡片：与原视觉一致（登机时间 / 航站楼 / 登机口 / 组别 / 座位号）
      // 起飞前 90 分钟登机口才会公布，因此默认 gate 为「待定」、group 为「—」
      boardingPass: {
        boardingTime: win.boardingTime || "14:05",
        terminal: win.terminal || "T1",
        gate: win.gate || "待定",
        group: win.boardingGroup || "—",
        seat: win.seat || "27C",
      },
      tasks: profile.nodes.map((n, idx) => nodeToTask(n, idx)),
    },
    airportFlipbook: {
      rootNodeId: "overview",
      nodes: flipbookNodes,
      hotspots: flipbookHotspots,
      edges: flipbookEdges,
    },
    // 透传给 detail 屏外层使用：talkTracks 仅 transfer profile 有
    _talkTracks: profile.talkTracks || [],
    _profileId: profile.id,
    _persona: persona,
  };
}

// 把"加急话术"按沉浸式 H5 的视觉拼成 sheet body 末尾的一段（仅 transfer 有数据）
function renderTalkTracksBlock(talkTracks) {
  if (!talkTracks || !talkTracks.length) return "";
  return `
    <section class="ta-section ta-section--talktracks">
      <header class="ta-section__head">
        <h2 class="ta-section__title">加急话术</h2>
        <p class="ta-section__sub">点一下复制，到柜台直接念</p>
      </header>
      <div class="hkg-talktracks" aria-label="加急话术">
        ${talkTracks
          .map(
            (text) =>
              `<button type="button" data-hkg-copy="${text.replace(/"/g, "&quot;")}">${text}</button>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

// 在 transit-assistant 的 ta-screen 之上做一件外层增强：
//   浮动返回按钮：原 .ta-screen__back 的 data-action 是 collapse-trip-card，我们额外加一个
//   data-demo-back 让 push demo 的 click handler（state.screen = "push"）能直接捕获。
export function renderDetailScreen(profile) {
  return `
    <div
      class="hkg-profile-detail hkg-detail-screen"
      data-hkg-profile-detail
      data-profile="${profile.id}"
      style="--hkg-accent: ${profile.accent}; --hkg-accent-soft: ${profile.accentSoft}"
    >
      <header class="hkg-profile-detail__appbar">
        <button class="hkg-profile-detail__back" type="button" data-demo-back aria-label="返回">
          ${ICON.back(22)}
        </button>
      </header>

      <main class="hkg-profile-detail__main">
        <div class="hkg-detail-map">
          ${renderHkgRouteMap(profile)}
        </div>
      </main>

      ${renderHkgDrawer(profile)}
      ${renderComposer({ placeholder: "想去哪里", interactive: true, chips: false })}
    </div>
  `;
}

// =====================================================================
// 屏幕外 profile 切换器
// =====================================================================

export function renderOffstageSwitcher(activeProfileId) {
  return `
    <nav class="hkg-demo-switcher" aria-label="profile 切换">
      <span class="hkg-demo-switcher__label">profile</span>
      ${HKG_PROFILE_KEYS.map((key) => {
        const profile = getHkgProfile(key);
        return `<button
          type="button"
          data-demo-profile="${key}"
          class="${activeProfileId === key ? "is-active" : ""}"
          style="--hkg-accent: ${profile.accent}"
        >${profile.tabLabel}</button>`;
      }).join("")}
    </nav>
  `;
}

// =====================================================================
// Sheet controller — 沉浸式 H5 同款 + 三大新交互
//   1. flipbook 挂载 + 3 档拖拽（沿用沉浸式 H5）
//   2. rail 横滑 snap → 自动 navigateMapTo（用户额外要求）
//   3. list 竖滑 → 贴顶卡片 → 自动 navigateMapTo（用户额外要求）
//   4. 编辑模式：点竖排卡片 → composer 显示编辑上下文 → 打字修改 / 删除节点
//                删除时同步移除：竖卡 + 横卡 + 地图 hotspot DOM；停在该节点则 reset
// =====================================================================

function attachDetailSheet(rootFrame, profile) {
  const hkg = rootFrame.querySelector("[data-hkg-profile-detail]");
  if (hkg) {
    attachHkgRouteMap(hkg, profile);
    attachHkgDrawer(hkg);
    return;
  }

  const screen = rootFrame.querySelector(".ta-screen");
  if (!screen) return;
  const d = adaptHkgProfileToTransitDetail(profile);

  // 节点标签朝向：默认右侧水平；x ≥ 70% 切左侧（避免触碰容器右边缘）
  rootFrame.querySelectorAll(".hkg-route-node").forEach((btn) => {
    const xStr = btn.style.getPropertyValue("--node-x") || "";
    const xVal = parseFloat(xStr);
    btn.dataset.labelSide = xVal >= 70 ? "left" : "right";
  });

  // ---------------------------------------------------------------
  // 0) 模块状态（多个子模块共享）
  // ---------------------------------------------------------------
  const sheetState = {
    sheetMode: "map",       // map | half | list
    isDragging: false,      // 拖 sheet 期间禁用所有 observer
    selectedSegId: null,    // 当前编辑模式下选中的卡片 segId（null = 未编辑）
    selectedTarget: null,   // 当前编辑卡片的 mapTarget
    suppressUntil: 0,       // 在此时间戳前忽略 observer 联动（避免点击/编辑刚切完又被 observer 反向覆盖）
    lastNavTarget: null,    // 上次联动 navigate 的目标，避免重复 navigate
    scope: "global",        // 'global' | 'focus' —— 默认先全局；点击下方卡片后再进入局部联动
    userInteracted: false,  // 用户是否主动操作过任意联动入口（rail/list/hotspot/卡片）。未交互前 IO 不自动联动，保持总览态
  };
  const SUPPRESS_AFTER_NAV_MS = 700;
  const SCROLL_DEBOUNCE_MS = 140;

  // ---------------------------------------------------------------
  // 1) 挂 flipbook 控制器
  // ---------------------------------------------------------------
  const fb = rootFrame.querySelector("[data-airport-flipbook]");
  if (fb) {
    attachAirportFlipbook(fb, d.airportFlipbook);
    // 地图 hotspot 点击 → 联动 sheet：滚动并高亮对应卡片
    // 与"点击下方 rail/list 卡片"的行为对齐：用户主动点节点也算交互，
    // 全局视角下自动切到「局部」再联动，避免地图节点点击后下面卡片无任何反应。
    fb._afpOnHotspotTap = (targetId) => {
      if (sheetState.scope === "global") applyScope?.("focus");
      sheetState.userInteracted = true;
      sheetState.lastNavTarget = targetId;
      sheetState.suppressUntil = Date.now() + SUPPRESS_AFTER_NAV_MS;
      activateRouteTarget(targetId, {
        source: "map",
        scrollLeg: sheetState.sheetMode !== "map",
      });
    };
  }

  // ---------------------------------------------------------------
  // 1.5) 全局/局部 视角切换：global → reset 地图 + 清空选中；focus → 恢复联动
  // ---------------------------------------------------------------
  const scopeToggleEl = rootFrame.querySelector("[data-scope-toggle]");
  let applyScope = null;
  if (scopeToggleEl && fb) {
    // 把"按钮 active/aria 同步"独立出来，确保初始化时即使 scope 没变也能把
    // 高亮真正写到 DOM 上，避免初次进 detail 时切换器没视觉锚点。
    const syncScopeButtons = (scope) => {
      scopeToggleEl.querySelectorAll("[data-scope]").forEach((btn) => {
        const active = btn.dataset.scope === scope;
        btn.classList.toggle("is-active", active);
        if (active) btn.setAttribute("aria-selected", "true");
        else btn.removeAttribute("aria-selected");
      });
    };

    applyScope = (nextScope) => {
      if (nextScope !== "global" && nextScope !== "focus") return;
      if (sheetState.scope === nextScope) return;
      sheetState.scope = nextScope;

      syncScopeButtons(nextScope);

      if (nextScope === "global") {
        // 1. 地图回到 overview 大图
        if (typeof fb._afpReset === "function") fb._afpReset();
        // 2. 清空所有卡片选中态
        clearRouteTargetSelection();
        // 3. 清掉联动状态，避免下次切回 focus 时残留
        sheetState.lastNavTarget = null;
        sheetState.userInteracted = false;
        sheetState.suppressUntil = Date.now() + SUPPRESS_AFTER_NAV_MS;
      }
      // focus 模式不主动跳节点，等用户点 hotspot / rail / 卡片再联动
    };

    scopeToggleEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-scope]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      applyScope(btn.dataset.scope);
    });

    // 初始进入 detail 时统一锚定在「全局」视角：
    // - sheetState.scope 默认就是 "global"，不需要再 applyScope 切换；
    // - 但按钮的 is-active / aria-selected 必须显式写一次，否则首次渲染没有视觉锚点。
    syncScopeButtons("global");
  }

  // ---------------------------------------------------------------
  // 2) sheet 3 档拖拽 — 拖拽期间标记 isDragging，避免和 observer 打架
  // ---------------------------------------------------------------
  attachTransitSheetDrag(rootFrame, (mode) => {
    sheetState.sheetMode = mode;
    sheetState.isDragging = false;
    screen.setAttribute("data-sheet-mode", mode);
    sheetState.suppressUntil = Date.now() + 280; // 模式切换后短暂禁用观察，等动画稳定
    // 模式切换后保持原选中态（global / focus 都生效）：
    // 避免切回 map 档时 railObserver 立刻把首张卡判成"当前可见"而覆盖。
    // 用户在 global 下手动选卡后，拉起/收起浮层也应保持和 focus 一致的同步。
    if (sheetState.lastNavTarget) {
      // 等 sheet 高度动画稳定后再激活，确保 scrollIntoView 能算出正确位置
      window.setTimeout(() => {
        activateRouteTarget(sheetState.lastNavTarget, {
          source: "sheet-mode-change",
          // 切回 map：把对应 rail-card 吸到锚点；切到 half/list：把对应 leg 滚到中间
          scrollRail: mode === "map",
          scrollLeg: mode !== "map",
        });
        // 激活后再延长一段静默期，避免我们自己触发的滚动被 IO 反向解读为"用户滑卡"
        sheetState.suppressUntil = Date.now() + SUPPRESS_AFTER_NAV_MS;
      }, 320);
    }
  });
  // 拖拽过程中（mousedown/touchstart 在 sheet handle 上）→ 暂停 observer
  const sheetEl = rootFrame.querySelector("#ta-sheet");
  if (sheetEl) {
    const markDraggingOn = () => { sheetState.isDragging = true; };
    const markDraggingOff = () => {
      // 拖拽结束的 mode change 会在 onModeChange 里把 isDragging 重置；这里兜底
      window.setTimeout(() => { sheetState.isDragging = false; }, 50);
    };
    sheetEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest("[data-drag-handle]")) markDraggingOn();
    });
    document.addEventListener("pointerup", markDraggingOff, true);
    document.addEventListener("pointercancel", markDraggingOff, true);
  }

  // ---------------------------------------------------------------
  // 3) 卡片点击联动 + 编辑模式入口
  //    - rail-card 点击：仅切地图，不进编辑
  //    - route-leg 点击：切地图 + 进入/退出编辑
  // ---------------------------------------------------------------
  attachTransitStepMapSync(rootFrame, {
    onStepSelect(segId, mapTarget) {
      // 用户点击下方步骤卡后，自动从「全局」切到「局部」。
      if (sheetState.scope === "global") applyScope?.("focus");
      sheetState.suppressUntil = Date.now() + SUPPRESS_AFTER_NAV_MS;
      sheetState.lastNavTarget = mapTarget;
      // 只有从竖排卡片（route-leg）发起的点击才进编辑模式；横排 rail 不进
      const ev = window.event;
      const fromRail = ev?.target?.closest?.(".rail-card");
      if (fromRail) {
        // 用户主动点了 rail-card → 解锁后续滚动联动
        sheetState.userInteracted = true;
        activateRouteTarget(mapTarget, {
          source: "rail-click",
          scrollRail: false,
          scrollLeg: false,
        });
        return;
      }
      // route-leg 点击也算用户交互
      sheetState.userInteracted = true;
      activateRouteTarget(mapTarget, {
        source: "list-click",
        scrollLeg: false,
      });
      // 再次点击同一张卡 → 退出编辑
      if (sheetState.selectedSegId === segId) {
        exitEditMode();
        return;
      }
      enterEditMode(segId, mapTarget);
    },
  });

  // ---------------------------------------------------------------
  // 4) RAIL 横滑联动：滑到哪张卡就 navigate 到哪张
  //    实现：IntersectionObserver 监听 rail-card 与 .ta-rail 的交叉比例，
  //    取交叉比例最高的那张作为"当前可视卡"。
  // ---------------------------------------------------------------
  const railEl = rootFrame.querySelector(".ta-rail");
  if (railEl && fb) {
    let railTimer = null;
    const railObserver = new IntersectionObserver(
      (entries) => {
        if (sheetState.isDragging) return;
        if (Date.now() < sheetState.suppressUntil) return;
        // 仅在 map 档（rail 可见）才生效
        if (sheetState.sheetMode !== "map") return;
        // 全局视角下不联动地图，保持 overview 大图
        if (sheetState.scope !== "focus") return;
        // 初始未交互前不自动联动地图，避免 IO 一启动就把第一张卡当选中
        if (!sheetState.userInteracted) return;

        clearTimeout(railTimer);
        railTimer = window.setTimeout(() => {
          // 找到当前 ratio 最大的 rail-card
          let bestCard = null;
          let bestRatio = 0;
          railEl.querySelectorAll(".rail-card[data-map-target]").forEach((card) => {
            const rect = card.getBoundingClientRect();
            const railRect = railEl.getBoundingClientRect();
            // 计算与容器的重叠宽度比例
            const overlap = Math.max(
              0,
              Math.min(rect.right, railRect.right) - Math.max(rect.left, railRect.left),
            );
            const ratio = overlap / rect.width;
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestCard = card;
            }
          });
          if (!bestCard) return;
          const target = bestCard.dataset.mapTarget;
          if (!target || target === sheetState.lastNavTarget) return;
          sheetState.lastNavTarget = target;
          sheetState.suppressUntil = Date.now() + SUPPRESS_AFTER_NAV_MS;
          navigateMapToSafe(target);
          activateRouteTarget(target, {
            source: "rail-scroll",
            scrollRail: false,
            scrollLeg: false,
          });
        }, SCROLL_DEBOUNCE_MS);
      },
      { root: railEl, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    railEl.querySelectorAll(".rail-card").forEach((c) => railObserver.observe(c));
    // 直接监听滚动事件兜底（部分浏览器 IO 触发不及时）
    railEl.addEventListener("scroll", () => {
      if (sheetState.isDragging) return;
      if (Date.now() < sheetState.suppressUntil) return;
      if (sheetState.sheetMode !== "map") return;
      if (sheetState.scope !== "focus") return;
      // 用户主动滑动 rail → 解锁后续滚动联动
      sheetState.userInteracted = true;
      // 触发 IO 重算
      railObserver.disconnect();
      railEl.querySelectorAll(".rail-card").forEach((c) => railObserver.observe(c));
    }, { passive: true });
  }

  // ---------------------------------------------------------------
  // 5) LIST 竖滑联动：滚到哪张卡贴顶就 navigate 到哪张
  //    实现：监听 .ta-sheet__body 的 scroll，找出"距 body 顶部最近且仍可见"的 .route-leg。
  // ---------------------------------------------------------------
  const sheetBodyEl = rootFrame.querySelector(".ta-sheet__body");
  if (sheetBodyEl && fb) {
    let listTimer = null;
    sheetBodyEl.addEventListener("scroll", () => {
      if (sheetState.isDragging) return;
      if (Date.now() < sheetState.suppressUntil) return;
      // 仅在 half / list 档（竖卡可见）才生效
      if (sheetState.sheetMode === "map") return;
      // 全局视角下不联动地图
      if (sheetState.scope !== "focus") return;
      // 用户主动滚 sheet → 解锁
      sheetState.userInteracted = true;

      clearTimeout(listTimer);
      listTimer = window.setTimeout(() => {
        const bodyRect = sheetBodyEl.getBoundingClientRect();
        // 从顶部往下找第一张顶部 ≥ bodyTop 的卡（即"贴顶或刚露头"的卡）
        const legs = Array.from(sheetBodyEl.querySelectorAll(".route-leg[data-map-target]"));
        let pick = null;
        const ANCHOR_OFFSET = 40; // 顶端再往下 40px 处当作"贴顶判定线"，更接近"看到的那张卡"
        const anchorY = bodyRect.top + ANCHOR_OFFSET;
        for (const leg of legs) {
          const r = leg.getBoundingClientRect();
          if (r.top <= anchorY && r.bottom >= anchorY) {
            pick = leg;
            break;
          }
        }
        // 兜底：取距 anchor 最近的一张
        if (!pick && legs.length) {
          let bestDist = Infinity;
          for (const leg of legs) {
            const r = leg.getBoundingClientRect();
            const center = (r.top + r.bottom) / 2;
            const d2 = Math.abs(center - anchorY);
            if (d2 < bestDist) { bestDist = d2; pick = leg; }
          }
        }
        if (!pick) return;
        const target = pick.dataset.mapTarget;
        if (!target || target === sheetState.lastNavTarget) return;
        sheetState.lastNavTarget = target;
        sheetState.suppressUntil = Date.now() + SUPPRESS_AFTER_NAV_MS;
        navigateMapToSafe(target);
        activateRouteTarget(target, {
          source: "list-scroll",
          scrollLeg: false,
        });
      }, SCROLL_DEBOUNCE_MS);
    }, { passive: true });
  }

  // ---------------------------------------------------------------
  // 6) 编辑模式 — 完整移植自 子效果_H5沉浸式.html，并追加"删除时同步移除地图 hotspot"
  // ---------------------------------------------------------------
  const composer = rootFrame.querySelector(".composer");
  // 注入编辑上下文行（仅一次）
  if (composer && !composer.querySelector(".composer__edit-context")) {
    const composerBar = composer.querySelector(".composer__bar");
    const ctx = document.createElement("div");
    ctx.className = "composer__edit-context";
    ctx.innerHTML = `
      <span class="composer__edit-badge" data-edit-badge></span>
      <span class="composer__edit-hint" data-edit-hint>修改此步骤的途经点</span>
      <button class="composer__edit-close" data-action="exit-edit" aria-label="退出编辑">&times;</button>
    `;
    if (composerBar) composerBar.insertBefore(ctx, composerBar.firstChild);
  }
  // 把 composer 的 input 设为可编辑（默认 push demo 是 interactive: false）
  const composerInput = rootFrame.querySelector(".composer__input");
  if (composerInput) {
    composerInput.removeAttribute("readonly");
    composerInput.removeAttribute("disabled");
  }

  function enterEditMode(segId, mapTarget) {
    sheetState.selectedSegId = segId;
    sheetState.selectedTarget = mapTarget;
    syncEditModeUI();
    if (composerInput) {
      composerInput.placeholder = "输入修改内容，如：改为途经免税店…（输入「删除」可移除该节点）";
      composerInput.focus();
    }
  }

  function exitEditMode() {
    sheetState.selectedSegId = null;
    sheetState.selectedTarget = null;
    clearRouteTargetSelection();
    if (composer) composer.classList.remove("composer--editing");
    if (composerInput) {
      composerInput.placeholder = "输入地点，查看前往该点的路线说明…";
      composerInput.value = "";
    }
  }

  function syncEditModeUI() {
    if (!composer) return;
    composer.classList.add("composer--editing");
    const badge = composer.querySelector("[data-edit-badge]");
    const hint = composer.querySelector("[data-edit-hint]");
    const segId = sheetState.selectedSegId;
    if (badge) {
      const stepNum = parseInt(segId, 10) + 1;
      badge.textContent = `修改步骤${stepNum}`;
    }
    if (hint) {
      const legH3 = rootFrame.querySelector(`.route-leg[data-seg-id="${segId}"] .route-leg__main h3`);
      hint.textContent = legH3 ? legH3.textContent : "修改此步骤的途经点";
    }
  }

  function clearRouteTargetSelection() {
    rootFrame.querySelectorAll(".route-leg.is-map-active, .rail-card.is-selected").forEach((el) => {
      el.classList.remove("is-map-active");
      el.classList.remove("is-selected");
    });
  }

  function activateRouteTarget(targetId, options = {}) {
    if (!targetId) return;
    const {
      scrollRail = true,
      scrollLeg = sheetState.sheetMode !== "map",
    } = options;

    clearRouteTargetSelection();
    const leg = rootFrame.querySelector(`.route-leg[data-map-target="${targetId}"]`);
    if (leg) {
      leg.classList.add("is-map-active");
      if (scrollLeg) {
        try {
          leg.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
          leg.scrollIntoView();
        }
      }
    }
    const rail = rootFrame.querySelector(`.rail-card[data-map-target="${targetId}"]`);
    if (rail) {
      rail.classList.add("is-selected");
      // 主动吸附：当激活来源不是 rail 滚动本身时，把对应卡贴到横向 rail 的锚点。
      // （rail 滚动联动地图时不要再触发 scrollIntoView，否则死循环）
      if (scrollRail) {
        // 短暂关闭"滚动联动地图"的 observer，避免我们自己触发的滚动被反向解读为"用户滑卡"
        sheetState.suppressUntil = Date.now() + SUPPRESS_AFTER_NAV_MS;
        try {
          // inline:'start' 与 CSS 的 scroll-snap-align: start 保持一致 —— 选中卡贴左吸附
          rail.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        } catch {
          // 老浏览器兜底：手动算 scrollLeft（贴左 16px，对齐 scroll-padding-inline）
          if (railEl) {
            const target = rail.offsetLeft - 16;
            railEl.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
          }
        }
      }
    }
  }

  // navigate：直接调 navigateMapTo —— flipbook 内部已经支持「busy 期间记 pending，
  // busy 释放后补播最新目标」，所以高频调用不再会被静默丢弃。
  // 我们只做一个最低限度防抖：和当前一致就跳过。
  function navigateMapToSafe(target) {
    if (!fb || !target) return;
    if (fb.dataset.current === target) return;
    navigateMapTo(rootFrame, target);
  }

  // composer 输入回车 → 编辑模式 send；非编辑模式回车不做特殊处理
  if (composerInput) {
    composerInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if (sheetState.selectedSegId == null) return;
      const text = composerInput.value.trim();
      if (!text) return;
      e.preventDefault();
      handleEditSend(text);
    });
  }

  // 编辑上下文行的关闭按钮 + 点击空白退出编辑
  rootFrame.addEventListener("click", (e) => {
    const exitBtn = e.target.closest('[data-action="exit-edit"]');
    if (exitBtn) {
      e.preventDefault();
      exitEditMode();
      return;
    }
    if (sheetState.selectedSegId != null) {
      const isCard = e.target.closest(".route-leg[data-map-target], .rail-card[data-map-target]");
      const isComposer = e.target.closest(".composer");
      if (!isCard && !isComposer) exitEditMode();
    }
  });

  // 编辑发送 — mock 大模型反馈：删除 / 改路线
  function handleEditSend(text) {
    const segId = sheetState.selectedSegId;
    const stepNum = parseInt(segId, 10) + 1;
    const mock = buildMockEditResult(segId, text);

    if (mock.action === "delete") {
      const targetToRemove = sheetState.selectedTarget;
      // 1. 删竖卡（包含父 li）
      const legItem = rootFrame.querySelector(`.route-leg[data-seg-id="${segId}"]`)?.closest("li");
      if (legItem) {
        // 顺手把和它相邻的 .ta-route-gap 也删掉
        const prev = legItem.previousElementSibling;
        const next = legItem.nextElementSibling;
        if (prev?.querySelector?.(".ta-route-gap")) prev.remove();
        else if (next?.querySelector?.(".ta-route-gap")) next.remove();
        legItem.remove();
      }
      // 2. 删横卡
      const railItem = rootFrame.querySelector(`.rail-card[data-seg-id="${segId}"]`);
      if (railItem) railItem.remove();
      // 3. 删地图 hotspot DOM
      const hotspot = fb?.querySelector(`[data-afp-hotspot][data-target="${targetToRemove}"]`);
      if (hotspot) hotspot.remove();
      // 4. 若当前停在被删的节点 → reset 回 overview
      if (fb && fb.dataset.current === targetToRemove) {
        const resetBtn = fb.querySelector("[data-afp-reset]");
        if (resetBtn && !resetBtn.hidden) resetBtn.click();
      }
      // 5. 重排序号
      reindexSteps();
      composerInput.value = "";
      showToast(`已删除步骤${stepNum}途经点，已自动重排路线`);
      window.setTimeout(exitEditMode, 500);
      return;
    }

    // update：改路线文案
    const legH3 = rootFrame.querySelector(`.route-leg[data-seg-id="${segId}"] .route-leg__main h3`);
    if (legH3) legH3.textContent = mock.route;
    const railRoute = rootFrame.querySelector(`.rail-card[data-seg-id="${segId}"] .rail-card__route`);
    if (railRoute) railRoute.textContent = mock.route;
    // 反馈原因（写入卡片底部 em）
    let reasonEl = rootFrame.querySelector(`.route-leg[data-seg-id="${segId}"] .route-leg__card em`);
    if (!reasonEl) {
      const card = rootFrame.querySelector(`.route-leg[data-seg-id="${segId}"] .route-leg__card`);
      if (card) {
        reasonEl = document.createElement("em");
        card.appendChild(reasonEl);
      }
    }
    if (reasonEl && mock.reason) reasonEl.textContent = mock.reason;
    composerInput.value = "";
    showToast(`已重算步骤${stepNum}：${mock.reason || "路线已更新"}`);
    window.setTimeout(exitEditMode, 800);
  }

  function reindexSteps() {
    const legs = Array.from(rootFrame.querySelectorAll(".route-leg[data-seg-id]"));
    legs.forEach((leg, idx) => {
      leg.dataset.segId = String(idx);
      const idxEl = leg.querySelector(".route-leg__index span");
      if (idxEl) idxEl.textContent = String(idx + 1);
    });
    const rails = Array.from(rootFrame.querySelectorAll(".rail-card[data-seg-id]"));
    rails.forEach((rail, idx) => {
      rail.dataset.segId = String(idx);
    });
  }

  // ---------------------------------------------------------------
  // 7) 加急话术复制反馈（仅 transfer profile 有）
  // ---------------------------------------------------------------
  rootFrame.querySelectorAll("[data-hkg-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.hkgCopy || "";
      try {
        await navigator.clipboard?.writeText(text);
        btn.dataset.copied = "true";
        window.setTimeout(() => { btn.dataset.copied = "false"; }, 900);
      } catch {
        btn.dataset.copied = "false";
      }
    });
  });
}

// ---------------------------------------------------------------
// mock 大模型反馈（移植自 子效果_H5沉浸式.html，仅做轻量裁剪）
// segId: 当前选中卡的 segId（字符串数字）
// text:  用户在 composer 输入的内容
// ---------------------------------------------------------------
function buildMockEditResult(segId, rawText) {
  const text = String(rawText || "").trim();
  const deleteHint = /(删除|删掉|去掉|移除|不要|不想要)/.test(text);
  const avoidHint = /避开|绕开|不经过|跳过/.test(text);
  const toDutyFree = /免税|商店|购物|DFS/.test(text);
  const toNursery = /育婴|哺乳|换尿布/.test(text);
  const toLounge = /贵宾|休息室|lounge/i.test(text);

  if (deleteHint) {
    return { action: "delete", route: "", reason: "已删除该途经点，并自动衔接前后路径" };
  }
  let route = text;
  let reason = "已按你的输入更新该步骤路线";
  if (avoidHint) {
    route = `直接前往下一节点（已避开"${text.replace(/避开|绕开|不经过|跳过/, "").trim() || "原路径"}"）`;
    reason = "已避开指定区域，改为更直接的动线";
  } else if (toDutyFree) {
    route = "经免税商业区短停 → 继续前往下一节点";
    reason = "已加入免税短停点，预计额外增加约 6 分钟";
  } else if (toNursery) {
    route = "经最近育婴室短停 → 继续前往下一节点";
    reason = "已插入育婴室停留点，便于换尿布与温奶";
  } else if (toLounge) {
    route = "经贵宾休息室 → 继续前往登机口";
    reason = "已加入贵宾室短停，按起飞前 30 分钟离开提醒";
  }
  return { action: "update", route, reason };
}

// 简易 toast（dock 在文件底部的 #toast；若没有则降级为 alert-free 的 console）
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.dataset.show = "true";
  clearTimeout(toast._hideTimer);
  toast._hideTimer = window.setTimeout(() => {
    toast.dataset.show = "false";
  }, 2200);
}

// =====================================================================
// Demo controller
// =====================================================================

function createDemo(root) {
  const frame = root.querySelector("#frame");
  const params = new URLSearchParams(window.location.search);
  // 刷新页面始终回到首页（push 屏），保留 ?profile= 用于预选画像
  const state = {
    screen: "push",
    profile: normalizeProfile(params.get("profile")),
  };

  if (!document.querySelector(".hkg-demo-switcher")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      renderOffstageSwitcher(state.profile),
    );
  }

  const syncUrl = () => {
    // 仅同步 profile；不写 detail/view，确保刷新永远回到首页
    const next = new URL(window.location.href);
    next.searchParams.set("profile", state.profile);
    next.searchParams.delete("detail");
    next.searchParams.delete("view");
    window.history.replaceState(null, "", next);
  };

  const syncSwitcher = () => {
    document.querySelectorAll("[data-demo-profile]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.demoProfile === state.profile);
    });
  };

  const render = () => {
    if (!frame) return;
    const profile = getHkgProfile(state.profile);
    frame.classList.remove("screen-enter");

    if (state.screen === "detail") {
      frame.innerHTML = renderDetailScreen(profile);
      void frame.offsetWidth;
      frame.classList.add("screen-enter");
      requestAnimationFrame(() => {
        attachDetailSheet(frame, profile);
      });
    } else {
      frame.innerHTML = renderPushFrame();
      void frame.offsetWidth;
      frame.classList.add("screen-enter");
      playPushAnimation(frame, profile);
    }

    syncUrl();
    syncSwitcher();
  };

  frame?.addEventListener("click", (event) => {
    const open = event.target.closest("[data-demo-open]");
    if (open) {
      event.preventDefault();
      state.profile = normalizeProfile(open.dataset.demoOpen);
      state.screen = "detail";
      render();
      return;
    }
    const back = event.target.closest("[data-demo-back]");
    if (back) {
      event.preventDefault();
      state.screen = "push";
      render();
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-demo-profile]");
    if (!trigger) return;
    const next = normalizeProfile(trigger.dataset.demoProfile);
    if (next === state.profile) return;
    state.profile = next;
    render();
  });

  render();
}

const root = typeof document !== "undefined" ? document.getElementById("app") : null;
if (root) createDemo(root);
