// Screen 调度器。按 state.screen 选 view 渲染到 #frame；按 state.sheet 渲染浮层。

import { renderChat } from "./views/chat.js";
import { renderItinerary, attachItinSheetDrag } from "./views/itinerary-detail.js";
import { renderPrep } from "./views/prep.js";
import { renderRefund } from "./views/refund.js";
import { renderTrip, renderTripExpanded, attachTransitSheetDrag } from "./views/trip-detail.js";
import { renderSheet } from "./views/order-sheet.js";
import { attachAirportFlipbook } from "./views/airport-flipbook.js";
import { attachTransitStepMapSync, clearStepSelection, navigateMapTo } from "./views/transit-assistant.js";
import { myTrips } from "./data.js";
import { getState, setState } from "./state.js";
import {
  setItineraryMode,
  setTransitSheetMode,
  enterStepEditMode,
  exitStepEditMode,
  buildMockEditResult,
} from "./actions.js";

// composer 关键词 → flipbook 节点映射（与 standalone/子效果_H5沉浸式.html 保持一致）
const KEYWORD_MAP = {
  "值机": "checkin", "办理": "checkin", "柜台": "checkin", "check-in": "checkin", "checkin": "checkin",
  "安检": "security", "出境": "security", "通关": "security", "security": "security",
  "免税": "spine", "商业": "spine", "购物": "spine", "DFS": "spine",
  "登机口": "lounge", "登机": "lounge", "贵宾": "lounge", "休息室": "lounge", "gate": "lounge",
  "总览": "overview", "地图": "overview", "全景": "overview",
};

const screens = {
  chat: renderChat,
  itinerary: renderItinerary,
  prep: renderPrep,
  trip: renderTrip,
  "trip-expanded": renderTripExpanded,
  refund: renderRefund,
};

export function render(state, root) {
  const frame = root.querySelector("#frame");
  const sheetRoot = root.querySelector("#sheet-root");
  const sheet = root.querySelector("#sheet");
  const toast = root.querySelector("#toast");

  // 保存 itinerary sheet body 的 scrollTop（避免段卡点击或 chip 触发 loading 后跳到顶部）
  let preservedSheetScroll = 0;
  const prevSheetBody = frame.querySelector(".itin-sheet__body");
  if (prevSheetBody && state.screen === "itinerary") {
    preservedSheetScroll = prevSheetBody.scrollTop;
  }

  // screen
  const renderer = screens[state.screen] || renderChat;
  frame.innerHTML = renderer(state);

  // 还原 itinerary sheet body 滚动位置
  if (preservedSheetScroll > 0 && state.screen === "itinerary") {
    const newSheetBody = frame.querySelector(".itin-sheet__body");
    if (newSheetBody) {
      newSheetBody.scrollTop = preservedSheetScroll;
    }
  }

  // sheet
  if (state.sheet) {
    sheet.innerHTML = renderSheet(state);
    sheetRoot.dataset.open = "true";
  } else {
    sheetRoot.dataset.open = "false";
    setTimeout(() => {
      if (sheetRoot.dataset.open === "false") sheet.innerHTML = "";
    }, 540);
  }

  // toast
  if (state.toast) {
    toast.textContent = state.toast;
    toast.dataset.show = "true";
  } else {
    toast.dataset.show = "false";
  }

  // chat 屏自动滚动锚定：
  //  - plans-intro 出现时把它锚到 feed 顶部
  //  - v3 step B·①：新 qa 卡出现时也锚到 feed 顶部（一次只看一个问题）
  //  - 其他情况滚到底部
  if (state.screen === "chat") {
    const feed = frame.querySelector("#feed");
    if (feed) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const items = feed.children;
          const last = items[items.length - 1];
          if (last && (last.classList.contains("plans-carousel") || last.classList.contains("perks-card"))) {
            const intro = feed.querySelector(".plans-intro");
            const target = intro || last;
            feed.scrollTop = Math.max(0, target.offsetTop - 8);
          } else if (last && last.classList?.contains("qa-block")) {
            // v5 Q3：新问答卡锚到顶部，留 24px 顶 padding 让 prompt 不贴边
            feed.scrollTop = Math.max(0, last.offsetTop - 24);
          } else {
            feed.scrollTop = feed.scrollHeight;
          }
        });
      });
    }
  }

  // itinerary 屏：挂载 sheet 拖拽手势
  if (state.screen === "itinerary") {
    requestAnimationFrame(() => {
      attachItinSheetDrag(frame, (mode) => setItineraryMode(mode));
    });
  }

  // trip-expanded 屏：
  //  1. flipbook 控制器（不走 store，避免视频被 re-render 打断）
  //  2. 中转管家浮层 sheet 拖拽控制器（map / half / list 三档）
  //  3. 步骤 ↔ 地图联动 + 编辑模式（与 standalone/子效果_H5沉浸式.html 同步）
  //  4. composer 关键词联动（值机/安检/免税/登机口 → flipbook 节点切换）
  if (state.screen === "trip-expanded") {
    requestAnimationFrame(() => {
      const fb = frame.querySelector("[data-airport-flipbook]");
      if (fb) {
        const card = myTrips.find((c) => c.id === state.selectedTripCardId);
        const flipbook = card?.detail?.airportFlipbook;
        if (flipbook) attachAirportFlipbook(fb, flipbook);
      }

      const hasTaScreen = !!frame.querySelector(".ta-screen");

      // 仅在中转管家屏（含 .ta-screen 容器）才挂载 sheet 拖拽
      if (hasTaScreen) {
        attachTransitSheetDrag(frame, (mode) => setTransitSheetMode(mode));
      }

      // ---- 步骤 ↔ 地图联动 + 编辑模式 ----
      if (hasTaScreen) {
        attachTransitStepMapSync(frame, {
          onStepSelect(segId, mapTarget) {
            const currentState = getState();
            // 再次点击已选中的卡片 → 退出编辑模式
            if (currentState.selectedStepIdx === segId) {
              doExitEditMode(frame);
              return;
            }
            doEnterEditMode(frame, segId, mapTarget);
          },
        });

        // 注入编辑上下文行到 composer
        injectEditContextRow(frame);

        // 如果 render 时仍处于编辑模式（如切换人群后），恢复编辑态视觉
        if (state.selectedStepIdx != null) {
          syncEditModeUI(frame, state);
        }

        // composer 输入联动（关键词 + 编辑模式发送）
        attachComposerKeydown(frame, toast);

        // 点击空白区域退出编辑模式（排除卡片、composer、按钮本身）
        frame.addEventListener("click", (e) => {
          const currentState = getState();
          if (currentState.selectedStepIdx == null) return;

          const exitBtn = e.target.closest('[data-action="exit-edit"]');
          if (exitBtn) {
            doExitEditMode(frame);
            return;
          }

          const isCard = e.target.closest(".route-leg[data-map-target], .rail-card[data-map-target]");
          const isComposer = e.target.closest(".composer");
          if (!isCard && !isComposer) {
            doExitEditMode(frame);
          }
        });
      }
    });
  }
}

// ============================================================
// 编辑模式辅助函数（与 standalone/子效果_H5沉浸式.html 逻辑同步）
// ============================================================

function doEnterEditMode(frame, segId, mapTarget) {
  enterStepEditMode(segId, mapTarget);
  syncEditModeUI(frame, getState());
  const input = frame.querySelector(".composer__input");
  if (input) {
    input.placeholder = "输入修改内容，如：改为途经免税店…";
    input.focus();
  }
}

function doExitEditMode(frame) {
  exitStepEditMode();
  clearStepSelection(frame);
  const composer = frame.querySelector(".composer");
  if (composer) composer.classList.remove("composer--editing");
  const input = frame.querySelector(".composer__input");
  if (input) {
    input.placeholder = "问问机场任何事…";
    input.value = "";
  }
}

function syncEditModeUI(frame, state) {
  const composer = frame.querySelector(".composer");
  if (!composer) return;
  composer.classList.add("composer--editing");
  const badge = composer.querySelector("[data-edit-badge]");
  const hint = composer.querySelector("[data-edit-hint]");
  const stepNum = parseInt(state.selectedStepIdx, 10) + 1;
  if (badge) badge.textContent = `修改步骤${stepNum}`;
  if (hint) {
    const leg = frame.querySelector(`.route-leg[data-seg-id="${state.selectedStepIdx}"] .route-leg__main h3`);
    hint.textContent = leg ? leg.textContent : "修改此步骤的途经点";
  }
}

function injectEditContextRow(frame) {
  const composer = frame.querySelector(".composer");
  if (!composer || composer.querySelector(".composer__edit-context")) return;
  const composerBar = composer.querySelector(".composer__bar");
  const ctx = document.createElement("div");
  ctx.className = "composer__edit-context";
  ctx.innerHTML = `<span class="composer__edit-badge" data-edit-badge></span>
    <span class="composer__edit-hint" data-edit-hint>修改此步骤的途经点</span>
    <button class="composer__edit-close" data-action="exit-edit" aria-label="退出编辑">&times;</button>`;
  if (composerBar) composerBar.insertBefore(ctx, composerBar.firstChild);
}

function attachComposerKeydown(frame, toastEl) {
  const composerInput = frame.querySelector(".composer__input");
  if (!composerInput) return;

  composerInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const text = composerInput.value.trim();
    if (!text) return;
    e.preventDefault();

    const currentState = getState();

    // ---- 编辑模式：修改途经点 ----
    if (currentState.selectedStepIdx != null) {
      handleEditSend(frame, currentState.selectedStepIdx, text, composerInput, toastEl);
      return;
    }

    // ---- 常规模式：关键词地图联动 ----
    let matched = null;
    for (const [keyword, target] of Object.entries(KEYWORD_MAP)) {
      if (text.includes(keyword)) { matched = target; break; }
    }

    if (matched) {
      navigateMapTo(frame, matched);
      frame.querySelectorAll(".route-leg.is-map-active").forEach((el) => el.classList.remove("is-map-active"));
      const step = frame.querySelector(`.route-leg[data-map-target="${matched}"]`);
      if (step) step.classList.add("is-map-active");
      composerInput.value = "";
      showToastMessage(toastEl, `已切换到：${matched === "overview" ? "总览" : text}`);
    } else {
      showToastMessage(toastEl, "可以试试：值机、安检、登机口、免税、柜台…");
    }
  });
}

function handleEditSend(frame, segId, text, inputEl, toastEl) {
  const stepNum = parseInt(segId, 10) + 1;
  const mock = buildMockEditResult(segId, text);

  // 更新对应卡片的路线文案（DOM 直接修改，避免触发 re-render）
  const leg = frame.querySelector(`.route-leg[data-seg-id="${segId}"] .route-leg__main h3`);
  if (leg) {
    leg.textContent = mock.route;
    const rail = frame.querySelector(`.rail-card[data-seg-id="${segId}"] .rail-card__route`);
    if (rail) rail.textContent = mock.route;
  }

  const reasonEl = frame.querySelector(`.route-leg[data-seg-id="${segId}"] .route-leg__card em`);
  if (reasonEl && mock.reason) {
    reasonEl.textContent = mock.reason;
  }

  inputEl.value = "";
  showToastMessage(toastEl, `已重算步骤${stepNum}：${mock.reason || "路线已更新"}`);

  // 短暂保持编辑态让用户看到反馈，再自动退出
  setTimeout(() => doExitEditMode(frame), 800);
}

function showToastMessage(toastEl, message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.dataset.show = "true";
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => { toastEl.dataset.show = "false"; }, 2500);
}
