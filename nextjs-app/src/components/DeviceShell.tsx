"use client";

import { useEffect, useRef, useState } from "react";

import {
  answerIntake,
  applyModification,
  backToChat,
  backToPrep,
  blurComposer,
  chooseFullRefund,
  closeSheet,
  collapseTripCard,
  confirmPassengers,
  confirmReplan,
  backToOrderDetail,
  exitStepEditMode,
  expandTripCard,
  focusComposer,
  openAlternativeFromOrder,
  openOrderDetail,
  openPayPad,
  pressPayKey,
  refreshRefundStatus,
  requestRefund,
  resetRouteMapView,
  selectSegment,
  setComposerDraft,
  setItineraryMode,
  showRefundBlocked,
  showRefundFailed,
  showRefundFeeRequote,
  showRefundStatus,
  startIntake,
  startOrder,
  startRefundFlow,
  submitRefund,
  toggleAgreement,
  toggleMyTrips,
  togglePassenger,
  viewItinerary,
  viewReplanCompare,
  zoomRouteMap,
  openTripCard,
  bootChat,
} from "@/legacy/main-demo-v5/actions.js";
import { passengers as defaultPassengers } from "@/legacy/main-demo-v5/data-source.js";
import { render } from "@/legacy/main-demo-v5/render.js";
import { getState, resetState, setState, subscribe } from "@/legacy/main-demo-v5/state.js";

type DemoMode = "payment" | "refund" | "flipbook" | "order-detail";
type DemoRegion = "international" | "domestic";

type DeviceShellProps = {
  mode: DemoMode;
};

export default function DeviceShell({ mode }: DeviceShellProps) {
  const appRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [region, setRegion] = useState<DemoRegion>("international");

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem("demo-region");
      if (cached === "domestic" || cached === "international") {
        setRegion(cached);
      }
    } catch {
      setRegion("international");
    }
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !dockRef.current?.contains(target)) {
        setDockOpen(false);
      }
    };
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  useEffect(() => {
    const root = appRef.current;
    if (!root) return undefined;

    resetState();

    const unsubscribe = subscribe((state: unknown) => render(state, root));
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-action]");
      if (!target) return;

      const action = target.dataset.action;
      const handler = action ? handlers[action] : undefined;
      if (!handler) return;

      event.preventDefault();
      handler(target);
    };

    root.addEventListener("click", onClick);
    bootMode(mode);
    applyUrlBootstrap(mode);
    render(getState(), root);

    return () => {
      root.removeEventListener("click", onClick);
      unsubscribe();
    };
  }, [mode]);

  return (
    <div className="stage">
      <div className="device" role="presentation">
        <div className="app" id="app" ref={appRef}>
          <div className="notch" aria-hidden="true" />
          <div className="statusbar" aria-hidden="true">
            <span>9:41</span>
            <span className="right">5G · 100%</span>
          </div>
          <div className="app-frame" id="frame" />
          <div className="sheet-root" id="sheet-root" data-open="false">
            <div className="sheet-dim" data-action="close-sheet" />
            <div className="sheet" id="sheet" />
          </div>
          <div className="toast" id="toast" data-show="false" />
        </div>
      </div>
      <div
        ref={dockRef}
        className={`demo-stage-dock-root${dockOpen ? " open" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="demo-stage-dock-fab"
          aria-haspopup="true"
          aria-expanded={dockOpen ? "true" : "false"}
          aria-controls="demoStageDockPanel"
          title="演示阶段定位"
          aria-label="演示阶段定位"
          onClick={() => setDockOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#ffffff" d="M12 14.5a2.5 2.5 0 1 1 2.5-2.5a2.5 2.5 0 0 1-2.5 2.5m0-4a1.5 1.5 0 1 0 1.5 1.5a1.5 1.5 0 0 0-1.5-1.5" />
            <path fill="#ffffff" d="M21.435 11.505h-1.46a7.98 7.98 0 0 0-7.48-7.48v-1.46a.51.51 0 0 0-.5-.5a.515.515 0 0 0-.5.5v1.46a8 8 0 0 0-7.48 7.48h-1.45a.5.5 0 1 0 0 1h1.45a8.01 8.01 0 0 0 7.48 7.48v1.45a.51.51 0 0 0 .5.5a.5.5 0 0 0 .5-.5v-1.45a8 8 0 0 0 7.48-7.48h1.46a.5.5 0 0 0 0-1M12 19.005a7 7 0 1 1 7-7a7.02 7.02 0 0 1-7 7" />
          </svg>
        </button>
        <div className="demo-stage-dock-panel" id="demoStageDockPanel" role="menu" aria-label="快速滚动">
          <div className="demo-stage-dock-region" role="group" aria-label="数据源">
            <button
              type="button"
              aria-pressed={region === "international"}
              onClick={() => switchRegion("international", region)}
            >
              国际
            </button>
            <button
              type="button"
              aria-pressed={region === "domestic"}
              onClick={() => switchRegion("domestic", region)}
            >
              国内
            </button>
          </div>
          <div className="demo-stage-dock-group-label">首页</div>
          <a className="demo-stage-dock-item" role="menuitem" href="/payment?stage=home" target="_top">
            <span>首页</span>
          </a>
          <div className="demo-stage-dock-group-label">方案</div>
          <a className="demo-stage-dock-item" role="menuitem" href="/payment?stage=plans" target="_top">
            <span>方案列表</span>
          </a>
          <div className="demo-stage-dock-group-label">行程</div>
          <a className="demo-stage-dock-item" role="menuitem" href="/payment?stage=itin-map" target="_top">
            <span>行程·地图</span>
          </a>
          <div className="demo-stage-dock-group-label">下单</div>
          <a className="demo-stage-dock-item" role="menuitem" href="/payment?stage=passengers" target="_top">
            <span>出行人</span>
          </a>
          <a className="demo-stage-dock-item" role="menuitem" href="/payment?stage=order" target="_top">
            <span>订单确认</span>
          </a>
          <a className="demo-stage-dock-item" role="menuitem" href="/payment?stage=pay" target="_top">
            <span>支付</span>
          </a>
          <div className="demo-stage-dock-group-label">行中</div>
          <a className="demo-stage-dock-item" role="menuitem" href="/payment?stage=prep" target="_top">
            <span>出行管家</span>
          </a>
          <a className="demo-stage-dock-item" role="menuitem" href="/flipbook" target="_top">
            <span>Flipbook</span>
          </a>
          <div className="demo-stage-dock-group-label">打包退票</div>
          <a className="demo-stage-dock-item" role="menuitem" href="/refund?refund=disruption" target="_top">
            <span>航变退票</span>
          </a>
        </div>
      </div>
    </div>
  );
}

const PLAN_ID = "balanced";

const handlers: Record<string, (element: HTMLElement) => void> = {
  "start-intake": (el) => startIntake(el.dataset.text),
  "answer-intake": (el) => answerIntake(el.dataset.qid, el.dataset.opt),
  "view-itinerary": (el) => viewItinerary(el.dataset.planId),
  "book-now": (el) => {
    if (getState().screen !== "itinerary") {
      viewItinerary(el.dataset.planId);
      window.setTimeout(() => startOrder(), 80);
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
    applyModification(getState().selectedSegmentId, el.dataset.text || el.textContent?.trim() || "");
  },
  "focus-composer": () => focusComposer(),
  "blur-composer": () => blurComposer(),
  "send-modification": () => {
    const state = getState();
    applyModification(state.selectedSegmentId, state.composerDraft || "调整这一段");
  },
  "start-order": () => startOrder(),
  "toggle-passenger": (el) => togglePassenger(el.dataset.pid),
  "confirm-passengers": () => confirmPassengers(),
  "open-paypad": () => openPayPad(),
  "press-pay-key": (el) => pressPayKey(el.dataset.key),
  "close-sheet": () => closeSheet(),
  "open-prep-card": (el) => import("@/legacy/main-demo-v5/actions.js").then((a) => a.openPrepCard(el.dataset.prepId)),
  "close-prep-card": () => import("@/legacy/main-demo-v5/actions.js").then((a) => a.closePrepCard()),
  "toggle-mytrips": () => toggleMyTrips(),
  "open-trip-card": (el) => {
    const cardId = el.dataset.cardId;
    openTripCard(cardId);
  },
  "expand-trip-card": () => expandTripCard(),
  "collapse-trip-card": () => collapseTripCard(),
  "back-to-prep": () => backToPrep(),
  "open-order-detail": () => openOrderDetail(),
  "open-alternative-from-order": () => openAlternativeFromOrder(),
  "back-to-order-detail": () => backToOrderDetail(),
  "back-to-chat": () => backToChat(),
  "toggle-agreement": () => toggleAgreement(),
  "start-refund": (el) => startRefundFlow(el.dataset.flow || "free"),
  "view-replan-compare": () => viewReplanCompare(),
  "confirm-replan": () => confirmReplan(),
  "choose-full-refund": () => chooseFullRefund(),
  "request-refund": () => requestRefund(),
  "submit-refund": () => submitRefund(),
  "refund-fee-requote": () => showRefundFeeRequote(),
  "refund-status": () => showRefundStatus(),
  "refund-blocked": () => showRefundBlocked(),
  "refund-failed": () => showRefundFailed(),
  "refresh-refund-status": () => refreshRefundStatus(),
  "exit-edit": () => exitStepEditMode(),
};

function bootMode(mode: DemoMode) {
  if (mode === "refund") {
    startRefundFlow("disruption");
    return;
  }

  if (mode === "order-detail") {
    openOrderDetail();
    return;
  }

  if (mode === "flipbook") {
    setState({
      screen: "trip-expanded",
      sheet: null,
      selectedTripCardId: "trip-hkg-airport",
      selectedPlanId: PLAN_ID,
      paymentStatus: "paid",
      transitSheetMode: "map",
    });
    return;
  }

  bootChat();
}

function switchRegion(next: DemoRegion, current: DemoRegion) {
  if (next === current) return;
  try {
    window.localStorage.setItem("demo-region", next);
  } catch {
    // ignore localStorage write error
  }
  window.location.reload();
}

function applyUrlBootstrap(mode: DemoMode) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);

  if (mode === "refund") {
    const refund = params.get("refund");
    if (refund) {
      startRefundFlow(refund);
    }
    return;
  }

  if (mode !== "payment") return;

  const stage = params.get("stage");
  if (!stage) return;

  const selectedPassengers = defaultPassengers.map((p) => ({ ...p }));
  const stageHandlers: Record<string, () => void> = {
    home: () => bootChat(),
    plans: () =>
      setState({
        screen: "chat",
        sheet: null,
        conversation: [
          { type: "user", text: "6月1号从东莞去吉隆坡", tone: "solid" },
          { type: "plans-intro", text: "为你找到以下 3 种方案，供你选择" },
          { type: "plans" },
        ],
      }),
    "itin-half": () => {
      viewItinerary(PLAN_ID);
      setItineraryMode("half");
    },
    "itin-list": () => {
      viewItinerary(PLAN_ID);
      setItineraryMode("list");
    },
    "itin-map": () => {
      viewItinerary(PLAN_ID);
      setItineraryMode("map");
    },
    passengers: () =>
      setState({
        screen: "chat",
        selectedPlanId: PLAN_ID,
        sheet: "passenger-pick",
        passengers: selectedPassengers,
      }),
    order: () =>
      setState({
        screen: "chat",
        selectedPlanId: PLAN_ID,
        sheet: "order-confirm",
        orderProgress: 100,
        passengers: selectedPassengers,
      }),
    pay: () =>
      setState({
        screen: "chat",
        selectedPlanId: PLAN_ID,
        sheet: "pay-pad",
        payPadFilled: 3,
        paymentStatus: "pending",
      }),
    prep: () =>
      setState({
        screen: "prep",
        sheet: null,
        selectedPlanId: PLAN_ID,
        paymentStatus: "paid",
      }),
    hkg: () =>
      setState({
        screen: "trip",
        sheet: null,
        selectedTripCardId: "trip-hkg-airport",
        selectedPlanId: PLAN_ID,
        paymentStatus: "paid",
      }),
    h5: () =>
      setState({
        screen: "trip-expanded",
        sheet: null,
        selectedTripCardId: "trip-hkg-airport",
        selectedPlanId: PLAN_ID,
        paymentStatus: "paid",
        transitSheetMode: "map",
      }),
  };
  stageHandlers[stage]?.();
}
