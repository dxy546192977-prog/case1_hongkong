// Bootstrap：挂事件委托、订阅 state、渲染。

import { subscribe, getState, update, setState } from "./state.js";
import {
  bootChat,
  startIntake,
  answerIntake,
  viewItinerary,
  setItineraryMode,
  selectSegment,
  zoomRouteMap,
  resetRouteMapView,
  startOrder,
  togglePassenger,
  confirmPassengers,
  openPayPad,
  pressPayKey,
  closeSheet,
  toggleMyTrips,
  openTripCard,
  expandTripCard,
  collapseTripCard,
  backToPrep,
  backToChat,
  focusComposer,
  blurComposer,
  setComposerDraft,
  applyModification,
  toggleAgreement,
} from "./actions.js";
import { render } from "./render.js";

const root = document.getElementById("app");

// data-action 派发
const handlers = {
  "start-intake": (el) => startIntake(el.dataset.text),
  "answer-intake": (el) => answerIntake(el.dataset.qid, el.dataset.opt),
  "view-itinerary": (el) => viewItinerary(el.dataset.planId),
  "book-now": (el) => {
    if (getState().screen !== "itinerary") {
      viewItinerary(el.dataset.planId);
      setTimeout(() => startOrder(), 80);
    } else {
      startOrder();
    }
  },
  "back-from-itinerary": () => backToChat(),
  "set-itin-mode": (el) => setItineraryMode(el.dataset.mode),
  "select-seg": (el) => selectSegment(el.dataset.segId),
  "route-map-zoom": (el) => zoomRouteMap(el.dataset.zoom),
  "route-map-reset": () => resetRouteMapView(),
  "suggest-chip": (el) => {
    applyModification(getState().selectedSegmentId, el.dataset.text || el.textContent.trim());
  },
  "focus-composer": () => focusComposer(),
  "blur-composer": () => blurComposer(),
  "send-modification": () => {
    const s = getState();
    applyModification(s.selectedSegmentId, s.composerDraft || "调整这一段");
  },
  "start-order": () => startOrder(),
  "toggle-passenger": (el) => togglePassenger(el.dataset.pid),
  "confirm-passengers": () => confirmPassengers(),
  "open-paypad": () => openPayPad(),
  "press-pay-key": (el) => pressPayKey(el.dataset.key),
  "close-sheet": () => closeSheet(),
  "open-prep-card": (el) => {
    const id = el.dataset.prepId;
    import("./actions.js").then((a) => a.openPrepCard(id));
  },
  "close-prep-card": () => import("./actions.js").then((a) => a.closePrepCard()),
  "toggle-mytrips": () => toggleMyTrips(),
  "open-trip-card": (el) => openTripCard(el.dataset.cardId),
  "expand-trip-card": () => expandTripCard(),
  "collapse-trip-card": () => collapseTripCard(),
  "back-to-prep": () => backToPrep(),
  "back-to-chat": () => backToChat(),
  "toggle-agreement": () => toggleAgreement(),
};

root.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const handler = handlers[action];
  if (handler) {
    e.preventDefault();
    handler(target);
  }
});

// 渲染管线
subscribe((state) => render(state, root));

// 启动：默认进 chat 流；?airport 直达机场展开页（调试快捷入口，跳过前置步骤）
const params = new URLSearchParams(window.location.search);
if (params.has("airport")) {
  setState({
    screen: "trip-expanded",
    selectedTripCardId: "trip-hkg-airport",
  });
} else {
  bootChat();
}
