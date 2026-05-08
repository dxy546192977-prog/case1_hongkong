/**
 * Zustand store — 替代原 state.js + actions.js 的手写 pub/sub。
 * 所有状态集中管理，actions 作为 store 方法暴露。
 */

import { create } from "zustand";
import {
  plans,
  intakeQuestions,
  passengers as initialPassengers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} from "@/lib/data";

// ---------- 类型定义 ----------

export type ScreenType =
  | "chat"
  | "plans"
  | "itinerary"
  | "order"
  | "prep"
  | "trip"
  | "trip-expanded"
  | "refund";

export type ItineraryMode = "list" | "half" | "rail" | "map";
export type TransitSheetMode = "map" | "half" | "list";
export type PaymentStatus = "idle" | "pending" | "paid";
export type RefundFlow =
  | "disruption"
  | "replan-confirm"
  | "replan-processing"
  | "replan-success"
  | "refund-all-processing"
  | "refund-all-success"
  | "free"
  | "fee"
  | "submitted"
  | "status"
  | "blocked"
  | "failed";

export type SheetType =
  | "passenger-pick"
  | "order-confirm"
  | "pay-pad"
  | "refund-warning"
  | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ConversationItem {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PassengerItem {
  id: string;
  name: string;
  self?: boolean;
  idNo: string;
  selected: boolean;
}

export interface AppState {
  screen: ScreenType;
  conversation: ConversationItem[];
  intakeAnswers: Record<string, string>;
  selectedPlanId: string | null;
  itineraryMode: ItineraryMode;
  selectedSegmentId: string | null;
  segmentLoading: boolean;
  routeMapZoom: number;
  routeMapOffset: { x: number; y: number };
  sheet: SheetType;
  passengers: PassengerItem[] | null;
  paymentStatus: PaymentStatus;
  refundFlow: RefundFlow;
  replanProgress: number;
  refundRefreshCount: number;
  orderProgress: number;
  payPadFilled: number;
  composerActive: boolean;
  composerDraft: string;
  segmentDraftPrice: number | null;
  agreementAccepted: boolean;
  myTripsExpanded: boolean;
  selectedTripCardId: string | null;
  prepOpenId: string | null;
  transitSheetMode: TransitSheetMode;
  persona: string;
  selectedStepIdx: string | null;
  selectedMapTarget: string | null;
  toast: string | null;
}

export interface AppActions {
  // 基础操作
  setScreen: (screen: ScreenType) => void;
  setToast: (toast: string | null) => void;
  setRefundFlow: (flow: RefundFlow) => void;

  // Chat / Intake
  bootChat: () => void;
  startIntake: (seedText: string) => void;
  answerIntake: (qid: string, optId: string) => void;

  // 方案 / 行程
  viewItinerary: (planId: string) => void;
  setItineraryMode: (mode: ItineraryMode) => void;
  selectSegment: (segId: string) => void;
  toggleAgreement: () => void;
  zoomRouteMap: (direction: string) => void;
  resetRouteMapView: () => void;

  // 订单流
  startOrder: () => void;
  togglePassenger: (pid: string) => void;
  confirmPassengers: () => void;
  openPayPad: () => void;
  pressPayKey: (key: string) => void;
  closeSheet: () => void;

  // 退改
  startRefundFlow: (flow?: string) => void;
  viewReplanCompare: () => void;
  confirmReplan: () => void;
  chooseFullRefund: () => void;
  requestRefund: () => void;
  submitRefund: () => void;
  showRefundFeeRequote: () => void;
  showRefundStatus: () => void;
  showRefundBlocked: () => void;
  showRefundFailed: () => void;
  refreshRefundStatus: () => void;

  // 行程 / 中转
  toggleMyTrips: () => void;
  openTripCard: (cardId: string) => void;
  openPrepCard: (prepId: string) => void;
  closePrepCard: () => void;
  expandTripCard: () => void;
  collapseTripCard: () => void;
  setTransitSheetMode: (mode: TransitSheetMode) => void;
  backToPrep: () => void;
  backToChat: () => void;

  // Composer
  focusComposer: () => void;
  blurComposer: () => void;
  setComposerDraft: (text: string) => void;
  applyModification: (targetSegId: string | null, hintText?: string) => void;

  // 中转编辑
  enterStepEditMode: (segId: string, mapTarget: string) => void;
  exitStepEditMode: () => void;

  // 重置
  resetState: () => void;
}

// ---------- 初始状态 ----------

const initialState: AppState = {
  screen: "chat",
  conversation: [],
  intakeAnswers: {},
  selectedPlanId: null,
  itineraryMode: "half",
  selectedSegmentId: null,
  segmentLoading: false,
  routeMapZoom: 1,
  routeMapOffset: { x: 0, y: 0 },
  sheet: null,
  passengers: null,
  paymentStatus: "idle",
  refundFlow: "free",
  replanProgress: 0,
  refundRefreshCount: 0,
  orderProgress: 0,
  payPadFilled: 0,
  composerActive: false,
  composerDraft: "",
  segmentDraftPrice: null,
  agreementAccepted: false,
  myTripsExpanded: false,
  selectedTripCardId: null,
  prepOpenId: null,
  transitSheetMode: "map",
  persona: "family",
  selectedStepIdx: null,
  selectedMapTarget: null,
  toast: null,
};

// ---------- 工具函数 ----------

function getDefaultHighlightSegmentId(planId: string): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = plans.find((x: any) => x.id === planId);
  if (!plan || !plan.fullLegs) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flightIdx = plan.fullLegs.findIndex((l: any) => l.mode === "飞机");
  return String(flightIdx >= 0 ? flightIdx : 0);
}

// Timer references for cleanup
let progressTimer: ReturnType<typeof setInterval> | null = null;
let payAutoTimer: ReturnType<typeof setInterval> | null = null;

// ---------- Store ----------

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  // 基础操作
  setScreen: (screen) => set({ screen }),
  setToast: (toast) => set({ toast }),
  setRefundFlow: (flow) => set({ refundFlow: flow }),

  // ---------- Chat / Intake ----------

  bootChat: () =>
    set({ screen: "chat", conversation: [{ type: "greeting" }] }),

  startIntake: (seedText) => {
    const trigger = { type: "user", text: seedText, tone: "soft" };
    set({ conversation: [{ type: "greeting" }, trigger] });

    setTimeout(() => {
      set((state) => ({
        conversation: [
          ...state.conversation,
          { type: "assistant", text: intakeQuestions[1].text },
        ],
      }));
      setTimeout(() => {
        set((state) => ({
          conversation: [...state.conversation, { type: "qa", qid: "q1" }],
        }));
      }, 320);
    }, 600);
  },

  answerIntake: (qid, optId) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const question = intakeQuestions.find((x: any) => x.id === qid) as any;
    if (!question) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opt = question.options?.find((o: any) => o.id === optId);
    if (!opt) return;

    const userText = opt.userText || opt.label;

    set((state) => ({
      intakeAnswers: { ...state.intakeAnswers, [qid]: optId },
      conversation: state.conversation.map((m) =>
        m.qid === qid ? { ...m, answered: optId } : m
      ),
    }));

    setTimeout(() => {
      set((state) => ({
        conversation: [
          ...state.conversation,
          { type: "user", text: userText, tone: "solid" },
        ],
      }));

      const nextQid =
        qid === "q1" ? "q2" : qid === "q2" ? "q3" : null;
      if (nextQid) {
        setTimeout(() => {
          set((state) => ({
            conversation: [...state.conversation, { type: "thinking" }],
          }));
          setTimeout(() => {
            set((state) => ({
              conversation: [
                ...state.conversation.filter((m) => m.type !== "thinking"),
                { type: "qa", qid: nextQid },
              ],
            }));
          }, 700);
        }, 280);
      } else {
        setTimeout(() => {
          set((state) => ({
            conversation: [...state.conversation, { type: "thinking" }],
          }));
          setTimeout(() => {
            set((state) => ({
              conversation: [
                ...state.conversation.filter((m) => m.type !== "thinking"),
                {
                  type: "plans-intro",
                  text: "为你找到以下 3 种方案，供你选择",
                },
                { type: "plans" },
              ],
            }));
          }, 900);
        }, 380);
      }
    }, 240);
  },

  // ---------- 方案 / 行程 ----------

  viewItinerary: (planId) =>
    set({
      selectedPlanId: planId,
      screen: "itinerary",
      itineraryMode: "half",
      selectedSegmentId: getDefaultHighlightSegmentId(planId),
      segmentLoading: false,
      routeMapZoom: 1,
      routeMapOffset: { x: 0, y: 0 },
    }),

  setItineraryMode: (mode) => {
    if (!["list", "half", "rail", "map"].includes(mode)) return;
    set({ itineraryMode: mode });
  },

  selectSegment: (segId) => set({ selectedSegmentId: segId }),

  toggleAgreement: () =>
    set((state) => ({ agreementAccepted: !state.agreementAccepted })),

  zoomRouteMap: (direction) => {
    const delta = direction === "in" ? 0.2 : -0.2;
    set((state) => ({
      routeMapZoom: Math.min(
        2.4,
        Math.max(1, (state.routeMapZoom || 1) + delta)
      ),
    }));
  },

  resetRouteMapView: () =>
    set({ routeMapZoom: 1, routeMapOffset: { x: 0, y: 0 } }),

  // ---------- 订单流 ----------

  startOrder: () =>
    set({
      sheet: "passenger-pick",
      passengers: initialPassengers.map((p) => ({ ...p })),
    }),

  togglePassenger: (pid) =>
    set((state) => ({
      passengers: (state.passengers || []).map((p) =>
        p.id === pid ? { ...p, selected: !p.selected } : p
      ),
    })),

  confirmPassengers: () => {
    set({ sheet: "order-confirm", orderProgress: 20 });
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      const currentState = get();
      if (currentState.sheet !== "order-confirm") {
        if (progressTimer) clearInterval(progressTimer);
        progressTimer = null;
        return;
      }
      const next = Math.min(100, (currentState.orderProgress || 20) + 2);
      set({ orderProgress: next });
      if (next >= 100 && progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    }, 80);
  },

  openPayPad: () => {
    set({ sheet: "pay-pad", paymentStatus: "pending", payPadFilled: 0 });
    if (payAutoTimer) clearInterval(payAutoTimer);
    let count = 0;
    payAutoTimer = setInterval(() => {
      const currentState = get();
      if (currentState.sheet !== "pay-pad") {
        if (payAutoTimer) clearInterval(payAutoTimer);
        payAutoTimer = null;
        return;
      }
      count += 1;
      set({ payPadFilled: count });
      if (count >= 6) {
        if (payAutoTimer) clearInterval(payAutoTimer);
        payAutoTimer = null;
        // finishPayment
        setTimeout(() => {
          set({
            sheet: null,
            paymentStatus: "paid",
            screen: "prep",
            toast: "支付成功",
            payPadFilled: 0,
          });
          setTimeout(() => set({ toast: null }), 1400);
        }, 600);
      }
    }, 320);
  },

  pressPayKey: (key) => {
    if (payAutoTimer) {
      clearInterval(payAutoTimer);
      payAutoTimer = null;
    }
    const currentState = get();
    let filled = currentState.payPadFilled || 0;
    if (key === "back") {
      filled = Math.max(0, filled - 1);
    } else if (filled < 6) {
      filled += 1;
    }
    set({ payPadFilled: filled });
    if (filled >= 6) {
      setTimeout(() => {
        set({
          sheet: null,
          paymentStatus: "paid",
          screen: "prep",
          toast: "支付成功",
          payPadFilled: 0,
        });
        setTimeout(() => set({ toast: null }), 1400);
      }, 600);
    }
  },

  closeSheet: () => set({ sheet: null }),

  // ---------- 退改链路 ----------

  startRefundFlow: (flow = "free") => {
    const allowed: RefundFlow[] = [
      "disruption", "replan-confirm", "replan-processing", "replan-success",
      "refund-all-processing", "refund-all-success",
      "free", "fee", "submitted", "status", "blocked", "failed",
    ];
    set({
      screen: "refund",
      sheet: null,
      selectedPlanId: get().selectedPlanId || "balanced",
      paymentStatus: "paid",
      refundFlow: allowed.includes(flow as RefundFlow)
        ? (flow as RefundFlow)
        : "disruption",
      replanProgress: 0,
      refundRefreshCount: 0,
    });
  },

  viewReplanCompare: () =>
    set({ screen: "refund", sheet: null, refundFlow: "replan-confirm", replanProgress: 0 }),

  confirmReplan: () => {
    set({ screen: "refund", sheet: null, refundFlow: "replan-processing", replanProgress: 20 });
    setTimeout(() => set({ replanProgress: 62 }), 520);
    setTimeout(() => set({ replanProgress: 100 }), 1080);
    setTimeout(() => set({ refundFlow: "replan-success", replanProgress: 100 }), 1500);
  },

  chooseFullRefund: () => {
    set({ screen: "refund", sheet: null, refundFlow: "refund-all-processing", replanProgress: 20 });
    setTimeout(() => set({ replanProgress: 68 }), 620);
    setTimeout(() => set({ replanProgress: 100 }), 1300);
    setTimeout(() => set({ refundFlow: "refund-all-success", replanProgress: 100 }), 2000);
  },

  requestRefund: () => {
    if (get().refundFlow === "fee") {
      set({ sheet: "refund-warning" });
      return;
    }
    get().submitRefund();
  },

  submitRefund: () => {
    set({
      sheet: null,
      refundFlow: "submitted",
      refundRefreshCount: 0,
      toast: "退票申请已提交",
    });
    setTimeout(() => set({ toast: null }), 1400);
  },

  showRefundFeeRequote: () =>
    set({ screen: "refund", sheet: null, refundFlow: "fee", refundRefreshCount: 0 }),

  showRefundStatus: () =>
    set({ screen: "refund", sheet: null, refundFlow: "status", refundRefreshCount: 0 }),

  showRefundBlocked: () =>
    set({ screen: "refund", sheet: null, refundFlow: "blocked", refundRefreshCount: 0 }),

  showRefundFailed: () =>
    set({ screen: "refund", sheet: null, refundFlow: "failed", refundRefreshCount: 0 }),

  refreshRefundStatus: () => {
    const next = (get().refundRefreshCount || 0) + 1;
    set({
      refundFlow: "status",
      refundRefreshCount: next,
      toast: next > 1 ? "退款状态暂无更新" : "已刷新退款状态",
    });
    setTimeout(() => set({ toast: null }), 1400);
  },

  // ---------- 行程 / 中转 ----------

  toggleMyTrips: () =>
    set((state) => ({ myTripsExpanded: !state.myTripsExpanded })),

  openTripCard: (cardId) =>
    set({ screen: "trip", selectedTripCardId: cardId, myTripsExpanded: false }),

  openPrepCard: (prepId) => set({ prepOpenId: prepId }),
  closePrepCard: () => set({ prepOpenId: null }),

  expandTripCard: () =>
    set({ screen: "trip-expanded", transitSheetMode: "map" }),

  collapseTripCard: () => set({ screen: "trip" }),

  setTransitSheetMode: (mode) => {
    if (!["map", "half", "list"].includes(mode)) return;
    set({ transitSheetMode: mode });
  },

  backToPrep: () => set({ screen: "prep" }),
  backToChat: () => set({ screen: "chat" }),

  // ---------- Composer ----------

  focusComposer: () => set({ composerActive: true, composerDraft: "" }),
  blurComposer: () => set({ composerActive: false }),
  setComposerDraft: (text) => set({ composerDraft: text }),

  applyModification: (targetSegId, hintText) => {
    const currentState = get();
    set({
      composerActive: false,
      selectedSegmentId: targetSegId || currentState.selectedSegmentId,
      segmentLoading: true,
      composerDraft: "",
      toast: hintText ? `调整：${hintText}` : null,
    });
    setTimeout(() => {
      set({ segmentLoading: false, toast: null, segmentDraftPrice: 580 });
    }, 1600);
  },

  // ---------- 中转编辑 ----------

  enterStepEditMode: (segId, mapTarget) =>
    set({ selectedStepIdx: segId, selectedMapTarget: mapTarget }),

  exitStepEditMode: () =>
    set({ selectedStepIdx: null, selectedMapTarget: null }),

  // 重置
  resetState: () => set({ ...initialState, conversation: [], intakeAnswers: {} }),
}));
