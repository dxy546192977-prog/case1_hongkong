"use client";

import { useEffect, useRef } from "react";

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
import { render } from "@/legacy/main-demo-v5/render.js";
import { getState, resetState, setState, subscribe } from "@/legacy/main-demo-v5/state.js";

type DemoMode = "payment" | "refund" | "flipbook" | "order-detail";

type DeviceShellProps = {
  mode: DemoMode;
};

export default function DeviceShell({ mode }: DeviceShellProps) {
  const appRef = useRef<HTMLDivElement | null>(null);

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
