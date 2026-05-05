// Screen 调度器。按 state.screen 选 view 渲染到 #frame；按 state.sheet 渲染浮层。

import { renderChat } from "./views/chat.js";
import { renderItinerary, attachItinSheetDrag } from "./views/itinerary-detail.js";
import { renderPrep } from "./views/prep.js";
import { renderTrip, renderTripExpanded } from "./views/trip-detail.js";
import { renderSheet } from "./views/order-sheet.js";
import { attachAirportFlipbook } from "./views/airport-flipbook.js";
import { myTrips } from "./data.js";
import { setItineraryMode } from "./actions.js";

const screens = {
  chat: renderChat,
  itinerary: renderItinerary,
  prep: renderPrep,
  trip: renderTrip,
  "trip-expanded": renderTripExpanded,
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

  // trip-expanded 屏：若包含 airport-flipbook，挂载 vanilla 控制器（不走 store）
  if (state.screen === "trip-expanded") {
    requestAnimationFrame(() => {
      const fb = frame.querySelector("[data-airport-flipbook]");
      if (!fb) return;
      const card = myTrips.find((c) => c.id === state.selectedTripCardId);
      const flipbook = card?.detail?.airportFlipbook;
      if (flipbook) attachAirportFlipbook(fb, flipbook);
    });
  }
}
