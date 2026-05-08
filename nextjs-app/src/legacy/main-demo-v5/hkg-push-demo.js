// 香港机场主动推送 demo（独立调试页）。
// 两屏：
//   1. push 屏 — 空白 chat → thinking → agent 招呼 + 推送卡片（带"查看详情"主按钮）
//   2. detail 屏 — 复用 .itin-screen 原版结构（地图底层 + 浮动 appbar + .itin-sheet 浮起 + composer）
// 屏幕外 profile 切换器（亲子 / 商务 / 中转）方便对比演示。

import { HKG_PROFILE_KEYS, getHkgProfile } from "./data/hkg-profiles.js";
import { ICON } from "./icons.js";
import { renderComposer } from "./views/chat.js";
import { attachItinSheetDrag } from "./views/itinerary-detail.js";
import { attachHkgRouteMap, renderHkgRouteMap } from "./views/hkg-route-map.js";

const DEFAULT_PROFILE = "family";
const THINK_MS = 700;
const REVEAL_MS = 1500;

function normalizeProfile(profileId) {
  return HKG_PROFILE_KEYS.includes(profileId) ? profileId : DEFAULT_PROFILE;
}

const PROFILE_GREETINGS = {
  family:
    "已识别到你和娃今天 12:40 起飞 HKG → KUL 的国泰 CX725，给你预先准备了一份带娃节奏的香港机场路书：",
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

function renderPushBody(profile) {
  const greeting = PROFILE_GREETINGS[profile.id] || PROFILE_GREETINGS.family;
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
        <h2 class="trip-card-detail__headline">${profile.title}</h2>
        <p class="trip-card-detail__lead">${profile.lead}</p>
        ${
          profile.chips?.length
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
// DETAIL 屏 — 复用 .itin-screen 结构
// =====================================================================

export function renderDetailScreen(profile) {
  return `
    <div class="itin-screen hkg-detail-screen"
         data-mode="card1"
         data-profile="${profile.id}">
      <div class="hkg-detail-map" data-hkg-profile-detail data-profile="${profile.id}">
        ${renderHkgRouteMap(profile)}
      </div>

      <header class="appbar appbar--transparent">
        <button class="appbar__icon appbar__icon--floating" data-demo-back aria-label="返回">${ICON.back(22)}</button>
        <div></div>
        <button class="appbar__icon appbar__icon--floating hkg-detail-overview-btn" type="button" data-hkg-overview hidden aria-label="回到总览">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
          </svg>
        </button>
      </header>

      <div class="itin-sheet hkg-detail-sheet" id="itin-sheet">
        <div class="itin-sheet__handle" data-drag-handle aria-hidden="true"></div>
        <div class="itin-sheet__body hkg-detail-sheet__body">
          ${renderRouteCards(profile)}
          ${renderTalkTracks(profile)}
        </div>
      </div>

      ${renderComposer({ placeholder: "想去哪里", interactive: false, chips: false })}
    </div>
  `;
}

function renderRouteCards(profile) {
  const overviewCard = `
    <article class="route-leg hkg-route-leg hkg-route-leg--overview" data-hkg-card="overview" data-hkg-card-link="overview" role="button" tabindex="0" aria-label="路线总览">
      <div class="route-leg__index">
        <span aria-hidden="true">·</span>
        <i></i>
      </div>
      <div class="route-leg__card">
        <p class="route-leg__meta">${profile.routeLabel}</p>
        <div class="route-leg__main">
          <h3>${profile.title}</h3>
        </div>
        <span data-md>${profile.overview}</span>
      </div>
    </article>
  `;

  const nodeCards = profile.nodes
    .map((node, idx, all) => {
      const isLast = idx === all.length - 1;
      const summary = node.summary || node.detail;
      const meta = [node.estimatedTime].filter(Boolean).join(" · ");
      return `
        <article class="route-leg hkg-route-leg" data-hkg-card="${node.id}" data-hkg-card-link="${node.id}" role="button" tabindex="0" aria-label="切换到 ${node.title}">
          <div class="route-leg__index">
            <span>${idx + 1}</span>
            ${isLast ? "" : "<i></i>"}
          </div>
          <div class="route-leg__card">
            ${meta ? `<p class="route-leg__meta">${meta}</p>` : ""}
            <div class="route-leg__main">
              <h3>${node.title}</h3>
            </div>
            <span data-md>${summary}</span>
            ${node.sourceNote ? `<em>${node.sourceNote}</em>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  return `<ol class="route-timeline hkg-route-timeline" data-hkg-route-cards>${overviewCard}${nodeCards}</ol>`;
}

function renderTalkTracks(profile) {
  if (!profile.talkTracks?.length) return "";
  return `
    <div class="hkg-talktracks" aria-label="加急话术">
      <div class="hkg-talktracks__title">加急话术 · 复制即可</div>
      ${profile.talkTracks
        .map(
          (text) =>
            `<button type="button" data-hkg-copy="${text.replace(/"/g, "&quot;")}">${text}</button>`,
        )
        .join("")}
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
// Sheet controller — 拖拽 + 卡片联动
// =====================================================================

function attachDetailSheet(rootFrame, profile) {
  const screen = rootFrame.querySelector(".hkg-detail-screen");
  const sheet = rootFrame.querySelector("#itin-sheet");
  if (!screen || !sheet) return;

  // 拖拽（复用原版 attachItinSheetDrag）—— 3 档：map / card1 / half
  attachItinSheetDrag(screen, (mode) => {
    if (mode === "map") screen.dataset.mode = "map";
    else if (mode === "rail") screen.dataset.mode = "card1";
    else screen.dataset.mode = "half";
  });

  // 卡片 → 地图节点（card-link 是 article，键盘 Enter / Space 也支持）
  const mapEl = rootFrame.querySelector("[data-hkg-route-map]");
  const triggerCard = (btn) => {
    const nodeId = btn.dataset.hkgCardLink;
    if (!nodeId) return;
    mapEl?.dispatchEvent(new CustomEvent("hkg:goto", { detail: { nodeId } }));
  };
  rootFrame.querySelectorAll("[data-hkg-card-link]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      triggerCard(btn);
    });
    btn.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerCard(btn);
      }
    });
  });

  // 地图 → 卡片滚动定位（不再设置横滑选中态）
  const sheetBody = sheet.querySelector(".itin-sheet__body");
  const highlight = (nodeId) => {
    if (!nodeId) return;
    const target = rootFrame.querySelector(`[data-hkg-card="${nodeId}"]`);
    if (!target || !sheetBody) return;
    // 在 sheet body 内滚动让目标卡贴顶（不是默认 nearest 的中部对齐）
    const offset = target.offsetTop - sheetBody.offsetTop;
    sheetBody.scrollTo({ top: Math.max(0, offset - 4), behavior: "smooth" });
  };
  // 右上"回到总览"按钮：进入节点时显示，回到 overview 隐藏
  const overviewBtn = rootFrame.querySelector("[data-hkg-overview]");
  const updateOverviewBtn = (nodeId) => {
    if (!overviewBtn) return;
    if (nodeId && nodeId !== "overview") overviewBtn.removeAttribute("hidden");
    else overviewBtn.setAttribute("hidden", "");
  };
  overviewBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    mapEl?.dispatchEvent(new CustomEvent("hkg:goto", { detail: { nodeId: "overview" } }));
  });

  mapEl?.addEventListener("hkg:node-change", (event) => {
    const nodeId = event.detail?.nodeId;
    highlight(nodeId);
    updateOverviewBtn(nodeId);
  });
  highlight("overview");
  updateOverviewBtn("overview");

  // 加急话术复制反馈
  rootFrame.querySelectorAll("[data-hkg-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.hkgCopy || "";
      try {
        await navigator.clipboard?.writeText(text);
        btn.dataset.copied = "true";
        window.setTimeout(() => {
          btn.dataset.copied = "false";
        }, 900);
      } catch {
        btn.dataset.copied = "false";
      }
    });
  });
}

// =====================================================================
// 简易 markdown：**xxx** → <strong>xxx</strong>
// =====================================================================

function applyMd(rootEl) {
  rootEl.querySelectorAll("[data-md]").forEach((el) => {
    if (el.dataset.mdDone === "true") return;
    el.innerHTML = el.textContent.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    el.dataset.mdDone = "true";
  });
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
        const detail = frame.querySelector("[data-hkg-profile-detail]");
        if (detail) attachHkgRouteMap(detail, profile);
        attachDetailSheet(frame, profile);
        applyMd(frame);
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
