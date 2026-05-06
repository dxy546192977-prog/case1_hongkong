// ============================================================
// 香港机场中转管家 · 全屏地图屏（trip-expanded 的核心视图）
// ------------------------------------------------------------
// 这是一个独立可复用的模块，主项目（trip-detail.js）和独立预览页
// （standalone/子效果_H5沉浸式_亲子人群.html）都从这里 import，保证两边
// 表现完全一致 —— 改这里就两边都改。
//
// 提供：
//   - renderTransitAssistantScreen(d, state)  全屏地图 + 浮层 sheet HTML
//   - attachTransitSheetDrag(rootEl, onModeChange)  浮层 3 档拖拽控制器
//
// 依赖：
//   - ICON                 ../icons.js
//   - renderAirportFlipbook ./airport-flipbook.js
//   - renderComposer       ./chat.js
// ============================================================

import { ICON } from "../icons.js";
import { renderAirportFlipbook } from "./airport-flipbook.js";
import { renderComposer } from "./chat.js";
import {
  renderRouteChain,
  renderCounterGuidanceBlock,
  renderBoardingCountdownBlock,
  renderAnomaliesBlock,
  renderRouteWithArrowIcons,
} from "./transit-helpers.js";

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 元信息只展示时刻，如 10:30（兼容字符串中含日期） */
function displayTimeOnly(raw) {
  const m = String(raw || "").trim().match(/\b(\d{1,2}):(\d{2})\b/);
  return m ? `${m[1]}:${m[2]}` : String(raw || "").trim();
}

function parseHmToMinutes(raw) {
  const m = String(raw || "").trim().match(/\b(\d{1,2}):(\d{2})\b/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min) || h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** 相邻两步之间的间隔（分钟），跨午夜按次日折算 */
function minutesBetweenTasks(prevTask, nextTask) {
  const a = parseHmToMinutes(prevTask?.time);
  const b = parseHmToMinutes(nextTask?.time);
  if (a == null || b == null) return null;
  let d = b - a;
  if (d < 0) d += 24 * 60;
  return d;
}

function formatIntervalCn(deltaMinutes) {
  if (deltaMinutes == null || deltaMinutes <= 0) return "";
  if (deltaMinutes < 60) return `约 ${deltaMinutes} 分钟后到下一步`;
  const h = Math.floor(deltaMinutes / 60);
  const m = deltaMinutes % 60;
  if (m === 0) return `约 ${h} 小时后到下一步`;
  return `约 ${h} 小时 ${m} 分钟后到下一步`;
}

function renderTransitGapBetween(prevTask, nextTask) {
  const delta = minutesBetweenTasks(prevTask, nextTask);
  const label = formatIntervalCn(delta);
  if (!label) return "";
  const safe = escapeHtml(label);
  return `<li><div class="ta-route-gap" aria-label="${safe}"><span class="ta-route-gap__label">${safe}</span></div></li>`;
}

/**
 * 横向步骤卡优先使用「A → B」表达；若原文不是箭头句式，则做轻量语义转换。
 */
function normalizeRailRoute(route) {
  const text = String(route || "").trim();
  if (!text) return "";
  if (text.includes("→")) return text;

  const patterns = [
    /^(.*?)前往\s*(.+)$/,
    /^(.*?)进入\s*(.+)$/,
    /^(.*?)到\s*(.+)$/,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const from = (m[1] || "").replace(/[，,。；;：:\s]+$/g, "").trim();
    const to = (m[2] || "").replace(/^[，,。；;：:\s]+/g, "").trim();
    if (from && to) return `${from} → ${to}`;
  }
  return text;
}

// ------------------------------------------------------------
// 中转管家展开页 v6：全屏地图 + 浮层 sheet + 常驻 composer
//
// 布局（自上而下覆盖）：
//   ┌─────────────────────────┐
//   │  ←  返回                │  ← .ta-screen__back（floating）
//   │   香港机场全屏地图       │  ← .ta-stage 内嵌 flipbook（占满）
//   │   （含可点击光圈）       │
//   ├─ ━━━ handle ───────────┤
//   │   （标题与场景标签同一横排） │
//   │  任务清单 / 服务推荐...  │
//   ├─────────────────────────┤
//   │ 🎤 发消息或者按住说话... │  ← composer（始终常驻）
//   └─────────────────────────┘
//
// 浮层 3 档：
//   - map  : 默认；仅露 handle + 标题，最大化看地图
//   - half : 露 hero 概览（约下半屏）
//   - list : 撑大，看到完整任务清单 + 服务推荐 + 提示
// ------------------------------------------------------------
export function renderTransitAssistantScreen(d, state) {
  const t = d.transit;
  const sheetMode = state?.transitSheetMode || "map";
  // persona 可选；主项目暂不传则走默认主题（外观与改造前一致）。
  const persona = state?.persona;
  const personaAttr = persona ? ` data-persona="${persona}"` : "";
  return `
    <div class="ta-screen"${personaAttr} data-sheet-mode="${sheetMode}">
      <button class="ta-screen__back" data-action="collapse-trip-card" aria-label="返回">${ICON.back(20)}</button>

      <div class="ta-stage">
        ${renderAirportFlipbook(d.airportFlipbook)}
        <div class="ta-scope-toggle" data-scope-toggle role="tablist" aria-label="地图视角">
          <button type="button" class="ta-scope-toggle__btn" data-scope="global" role="tab">全局</button>
          <button type="button" class="ta-scope-toggle__btn is-active" data-scope="focus" role="tab" aria-selected="true">局部</button>
        </div>
      </div>

      <aside class="ta-sheet" id="ta-sheet" aria-label="中转管家详情">
        <div class="ta-sheet__handle" data-drag-handle aria-label="拖动调整高度">
          <span class="ta-sheet__handle-bar"></span>
        </div>

        <header class="ta-sheet__head" data-drag-handle>
          ${renderTransitSheetHead(d, t)}
        </header>

        ${renderTransitRail(t)}

        <div class="ta-sheet__body">
          ${renderTransitTasks(t)}
        </div>
      </aside>

      ${renderComposer({ placeholder: "输入地点，查看前往该点的路线说明…" })}
    </div>
  `;
}

// 浮层始终可见的标题条（map 档时只露这一行）：主标题与场景标签同一横排
function renderTransitSheetHead(d, t) {
  const modeMap = { family: "带娃中转", business: "便携中转", default: "便携中转" };
  const chipLabel = modeMap[t.mode] || "便携中转";
  // 去掉 headline 末尾的「· 亲子管家 / · 商务管家 / · 中转管家」等后缀，保持标题简洁
  const cleanHeadline = (d.headline || "").replace(/\s*·\s*[^·]*管家\s*$/, "");
  return `
    <div class="ta-sheet-head__top">
      <h2 class="ta-sheet-head__title">${cleanHeadline} · 中转 ${t.layoverText}</h2>
      <span class="ta-chip ta-chip--family ta-sheet-head__chip">
        <span>${chipLabel}</span>
      </span>
    </div>
  `;
}

// 横滑步骤卡片（map 模式下可见，拖拽展开后隐藏）
function renderTransitRail(t) {
  const tasks = t.tasks || [];
  if (!tasks.length) return "";
  return `
    <div class="ta-rail route-rail">
      ${tasks.map((task, idx) => {
        const mapAttr = task.mapTarget ? ` data-map-target="${task.mapTarget}"` : "";
        return `<button class="rail-card" data-seg-id="${idx}"${mapAttr}>
          <div class="rail-card__time">${escapeHtml(task.time || "")}</div>
          <div class="rail-card__route">${renderRouteWithArrowIcons(normalizeRailRoute(task.route || ""))}</div>
        </button>`;
      }).join("")}
    </div>
  `;
}

function renderTransitHero(d, t) {
  const bp = t.boardingPassStatus;
  const action =
    bp?.actionLine ? `<p class="ta-hero__status-action">${bp.actionLine}</p>` : "";
  return `
    <section class="ta-hero">
      <p class="ta-hero__tagline">已为你规划好中转路径，按下方步骤执行即可</p>

      <div class="ta-hero__meter">
        <div class="ta-hero__meter-col">
          <span class="ta-hero__meter-label">抵达</span>
          <b class="ta-hero__meter-time">${t.flightArrive}</b>
        </div>
        <div class="ta-hero__meter-bar">
          <span class="ta-hero__meter-bar-fill"></span>
          <span class="ta-hero__meter-bar-tag">中转 ${t.layoverText}</span>
        </div>
        <div class="ta-hero__meter-col ta-hero__meter-col--end">
          <span class="ta-hero__meter-label">起飞</span>
          <b class="ta-hero__meter-time">${t.flightDepart}</b>
        </div>
      </div>

      <div class="ta-hero__block-label">登机牌状态识别</div>
      <div class="ta-hero__status ta-hero__status--ok">
        <span class="ta-hero__status-icon">${ICON.check(12)}</span>
        <div class="ta-hero__status-body">
          <p class="ta-hero__status-label">${bp?.label || ""}</p>
          <p class="ta-hero__status-tip">${bp?.tip || ""}</p>
          ${action}
        </div>
      </div>

      <div class="ta-hero__block-label">中转柜台导览</div>
      ${renderCounterGuidanceBlock(t, "sheet")}

      <div class="ta-hero__block-label">安检与登机口连续路径</div>
      ${renderRouteChain(t)}

      <div class="ta-hero__block-label">登机倒计时与策略</div>
      ${renderBoardingCountdownBlock(t, "sheet")}

      <div class="ta-hero__block-label">异常与动线提醒</div>
      ${renderAnomaliesBlock(t, "sheet")}

      <div class="ta-hero__status ta-hero__status--info">
        <span class="ta-hero__status-icon">${ICON.alert(12)}</span>
        <div class="ta-hero__status-body">
          <p class="ta-hero__status-tip">${t.flightStatus.gateNote}</p>
        </div>
      </div>
    </section>
  `;
}

function renderTransitTasks(t) {
  const tasks = t.tasks || [];
  const rows = [];
  tasks.forEach((task, idx) => {
    if (idx > 0) {
      const gap = renderTransitGapBetween(tasks[idx - 1], task);
      if (gap) rows.push(gap);
    }
    rows.push(renderTransitTask(task, idx, tasks.length));
  });
  return `
    <section class="ta-section">
      <header class="ta-section__head">
        <h2 class="ta-section__title">前往登机口的路线说明</h2>
        <p class="ta-section__sub">按顺序走；每一步都给你方向、位置和用时</p>
      </header>

      <ol class="route-timeline ta-route-timeline">
        ${rows.join("")}
      </ol>
    </section>
  `;
}

function renderTransitTask(task, idx, total) {
  const isLast = idx === total - 1;
  const mapTargetAttr = task.mapTarget ? ` data-map-target="${task.mapTarget}"` : "";
  const familyCls = task.family ? " route-leg--family" : "";
  const meta = task.duration ? `${task.mode} · ${task.duration}` : (task.mode || "");
  const timeMeta = displayTimeOnly(task.time);

  return `
    <li>
      <article class="route-leg${familyCls}"${mapTargetAttr} data-seg-id="${idx}">
        <div class="route-leg__index">
          <span>${idx + 1}</span>
          ${isLast ? "" : "<i></i>"}
        </div>
        <div class="route-leg__card">
          ${timeMeta ? `<p class="route-leg__meta">${escapeHtml(timeMeta)}</p>` : ""}
          <div class="route-leg__main">
            <h3 class="route-leg__route-line">${renderRouteWithArrowIcons(task.route || "")}</h3>
          </div>
          <span>${escapeHtml(meta)}</span>
          ${task.reason ? `<em>${escapeHtml(task.reason)}</em>` : ""}
        </div>
      </article>
    </li>
  `;
}

function renderTransitServices(t) {
  return `
    <section class="ta-section">
      <header class="ta-section__head">
        <h2 class="ta-section__title">顺路推荐</h2>
        <p class="ta-section__sub">根据你的中转时间、位置和家庭情况，已为你筛选合适的服务</p>
      </header>

      <div class="ta-services">
        ${t.services.map(renderTransitService).join("")}
      </div>
    </section>
  `;
}

function renderTransitService(svc) {
  const iconKey = svc.icon;
  const iconSvg = (ICON[iconKey] || ICON.info)(18);
  // 亲子专属服务挂 family 修饰类，让图标背景走粉色作为点缀
  const familyCls = svc.family ? " ta-svc--family" : "";
  const sceneTag = svc.tag ? `<span class="ta-svc__tag">${svc.tag}</span>` : "";
  const tagsRow =
    sceneTag
      ? `<div class="ta-svc__tags">${sceneTag}</div>`
      : "";
  return `
    <article class="ta-svc${familyCls}">
      <span class="ta-svc__icon">${iconSvg}</span>
      <div class="ta-svc__body">
        <div class="ta-svc__head">
          <h3 class="ta-svc__title">${svc.title}</h3>
          ${tagsRow}
        </div>
        <p class="ta-svc__sub">${svc.sub}</p>
        ${svc.note ? `<p class="ta-svc__note">${svc.note}</p>` : ""}
      </div>
    </article>
  `;
}

function renderTransitTips(t) {
  if (!t.tips || !t.tips.length) return "";
  return `
    <section class="ta-section ta-section--tips">
      <header class="ta-section__head">
        <h2 class="ta-section__title">温馨提示</h2>
      </header>

      <ul class="ta-tips">
        ${t.tips.map((tip) => `
          <li class="ta-tip">
            <span class="ta-tip__icon">${ICON.info(18)}</span>
            <span class="ta-tip__text">${tip}</span>
          </li>
        `).join("")}
      </ul>
    </section>
  `;
}

// ------------------------------------------------------------
// 中转管家 sheet 拖拽控制器（仿 attachItinSheetDrag）
//
// 3 档：map / half / list（与 state.transitSheetMode 对齐）
// - 从 .ta-sheet__handle 或 .ta-sheet__head 起拖；body 内滚动不触发拖拽
// - 移动 > 60px：跳到边界（list 或 map）
// - 移动 > 30px：跳到相邻档
// - 否则：就近 snap
// ------------------------------------------------------------
export function attachTransitSheetDrag(rootEl, onModeChange) {
  const sheet = rootEl.querySelector("#ta-sheet");
  if (!sheet) return;
  const screen = rootEl.querySelector(".ta-screen");
  if (!screen) return;

  function computeStops() {
    const containerH = (screen || rootEl).clientHeight || 824;
    const composerH =
      parseFloat(getComputedStyle(screen).getPropertyValue("--composer-h")) || 108;
    const handleEl = sheet.querySelector(".ta-sheet__handle");
    const headEl = sheet.querySelector(".ta-sheet__head");
    const railEl = sheet.querySelector(".ta-rail");
    const handleH = handleEl?.offsetHeight ?? 26;
    const headH = headEl?.offsetHeight ?? 54;
    const railCs = railEl ? getComputedStyle(railEl) : null;
    const railVisible = railCs && railCs.display !== "none";
    const railH = railVisible ? railEl.offsetHeight : 76;
    const mapPeek = Math.max(118, Math.round(handleH + headH + railH));
    return {
      list: containerH - 110 - composerH, // 顶部留 110px 给地图
      half: containerH * 0.55 - composerH, // 略大于一半，让 hero 完整露出
      map: mapPeek,
    };
  }

  function nearestStop(h, stops) {
    let best = "half";
    let bestDist = Infinity;
    for (const k of ["list", "half", "map"]) {
      const d = Math.abs(h - stops[k]);
      if (d < bestDist) { bestDist = d; best = k; }
    }
    return best;
  }

  function adjacent(mode, dir) {
    const order = ["map", "half", "list"]; // 短 → 长
    const idx = Math.max(0, order.indexOf(mode));
    return order[Math.max(0, Math.min(order.length - 1, idx + dir))];
  }

  let startY = 0;
  let startH = 0;
  let dragging = false;
  let totalDelta = 0;
  let activePointerId = null;

  function isDragSurface(target) {
    return !!target.closest("[data-drag-handle]");
  }

  function onDown(e) {
    if (e.button && e.button !== 0) return;
    if (!isDragSurface(e.target)) return;
    e.preventDefault();
    dragging = true;
    activePointerId = e.pointerId ?? null;
    sheet.classList.add("is-dragging");
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startH = sheet.offsetHeight;
    totalDelta = 0;
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);
  }

  function onMove(e) {
    if (!dragging) return;
    if (e.pointerId != null && activePointerId != null && e.pointerId !== activePointerId) return;
    e.preventDefault();
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    totalDelta = y - startY;
    const stops = computeStops();
    const newH = Math.max(stops.map - 20, Math.min(stops.list + 40, startH - totalDelta));
    sheet.style.height = newH + "px";
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    activePointerId = null;
    sheet.classList.remove("is-dragging");
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointercancel", onUp);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onUp);

    const stops = computeStops();
    const finalH = sheet.offsetHeight;
    sheet.style.height = "";

    let nextMode;
    if (Math.abs(totalDelta) > 60) {
      nextMode = totalDelta < 0 ? "list" : "map";
    } else if (Math.abs(totalDelta) > 30) {
      const startMode = nearestStop(startH, stops);
      nextMode = adjacent(startMode, totalDelta < 0 ? 1 : -1);
    } else {
      nextMode = nearestStop(finalH, stops);
    }
    onModeChange(nextMode);
  }

  sheet.addEventListener("pointerdown", onDown);
  sheet.addEventListener("touchstart", onDown, { passive: false });
}

// ------------------------------------------------------------
// 步骤 ↔ 地图联动控制器
//
// 点击面板中 [data-map-target] 的任务步骤 → 触发 flipbook 切换到
// 对应区域。实现方式：通过模拟 hotspot click 或 crossfade 直接切换。
//
// 同时暴露 navigateMapTo(rootEl, targetId) 供 composer 关键词联动调用。
// ------------------------------------------------------------
export function attachTransitStepMapSync(rootEl, { onStepSelect } = {}) {
  if (!rootEl) return;

  // 高亮当前选中的步骤（竖向列表 + 横滑卡片同步）
  function highlightStep(targetId) {
    rootEl.querySelectorAll(".route-leg.is-map-active, .rail-card.is-selected").forEach((el) => {
      el.classList.remove("is-map-active");
      el.classList.remove("is-selected");
    });
    const leg = rootEl.querySelector(`.route-leg[data-map-target="${targetId}"]`);
    if (leg) leg.classList.add("is-map-active");
    const rail = rootEl.querySelector(`.rail-card[data-map-target="${targetId}"]`);
    if (rail) rail.classList.add("is-selected");
  }

  // 步骤 click → 地图联动 + 编辑模式回调（竖向列表 + 横滑卡片均响应）
  rootEl.addEventListener("click", (e) => {
    const task = e.target.closest(".route-leg[data-map-target], .rail-card[data-map-target]");
    if (!task) return;
    const targetId = task.dataset.mapTarget;
    const segId = task.dataset.segId;
    if (!targetId) return;
    navigateMapTo(rootEl, targetId);
    highlightStep(targetId);
    // 通知外部进入编辑模式
    if (typeof onStepSelect === "function") {
      onStepSelect(segId, targetId);
    }
  });
}

// 清除步骤选中状态（供外部退出编辑模式时调用）
export function clearStepSelection(rootEl) {
  if (!rootEl) return;
  rootEl.querySelectorAll(".route-leg.is-map-active, .rail-card.is-selected").forEach((el) => {
    el.classList.remove("is-map-active");
    el.classList.remove("is-selected");
  });
}

// 导航地图到指定节点（供步骤 click 和 composer 关键词共用）
//
// 关键策略：节点之间「直切」，不再走 1→overview→2 的中转。
//   - 优先调 flipbook 暴露的 _afpGoTo(targetId) —— 它内部用 edges[from→to] 找视频边，
//     有视频走视频，没有走 crossfade，全程不过 overview，效果是 1→2→3→4 的体验。
//   - 仅在「目标是 overview 根节点」时才走 reset（这是 overview 本身的合法路径）。
//   - 兜底：拿不到 _afpGoTo（极少见的早期/未挂载状态）才退回旧的 hotspot.click() 路径。
export function navigateMapTo(rootEl, targetId) {
  if (!rootEl || !targetId) return;
  const flipbook = rootEl.querySelector("[data-airport-flipbook]");
  if (!flipbook) return;
  const currentId = flipbook.dataset.current;

  if (currentId === targetId) return;

  // 目标是 overview / 根节点：直接 reset
  const resetBtn = flipbook.querySelector("[data-afp-reset]");
  const isOverviewTarget =
    targetId === "overview" || flipbook.dataset.rootId === targetId;
  if (isOverviewTarget) {
    if (typeof flipbook._afpReset === "function") flipbook._afpReset();
    else if (resetBtn && !resetBtn.hidden) resetBtn.click();
    return;
  }

  // 普通节点：优先走直切 API，避免视觉上的「先回总览再出去」
  if (typeof flipbook._afpGoTo === "function") {
    flipbook._afpGoTo(targetId);
    return;
  }

  // 兜底：旧实现（找不到 _afpGoTo 时才走，仅做最低限度兼容）
  const hotspot = flipbook.querySelector(
    `[data-afp-hotspot][data-target="${targetId}"]`,
  );
  if (hotspot) {
    if (currentId !== "overview" && resetBtn && !resetBtn.hidden) {
      resetBtn.click();
      setTimeout(() => hotspot.click(), 400);
    } else {
      hotspot.click();
    }
  }
}
