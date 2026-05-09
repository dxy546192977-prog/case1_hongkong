// 极简 pub/sub store。state 不可变更新，订阅者收到全量 state。
// Render 只读 state，永不直接改 state。所有改动经 actions。

const initialState = {
  screen: "chat", // 'chat' | 'plans' | 'itinerary' | 'order' | 'prep' | 'order-detail' | 'trip' | 'trip-expanded' | 'refund'
  conversation: [], // [{type, payload}] 见 actions.js 注释
  intakeAnswers: {}, // q-id → option-id
  selectedPlanId: null,
  itineraryMode: "half", // 'list' | 'half' | 'rail' | 'map'  (v5 I4：4 档 sheet 模式)
  selectedSegmentId: null,
  segmentLoading: false,
  // 路线地图（v3 step 4a）：缩放 1.0–2.4，平移 px。zoom 控制按钮 + 拖动 pan 用。
  routeMapZoom: 1,
  routeMapOffset: { x: 0, y: 0 },
  sheet: null, // 'passenger-pick' | 'order-confirm' | 'pay-pad' | 'refund-warning' | null
  passengers: null, // 临时被 sheet 编辑的乘机人状态
  paymentStatus: "idle", // 'idle' | 'pending' | 'paid'
  refundFlow: "free", // 'disruption' | 'replan-confirm' | 'replan-processing' | 'replan-success' | 'refund-all-processing' | 'refund-all-success' | 'free' | 'fee' | 'submitted' | 'status' | 'blocked' | 'failed'
  replanProgress: 0,
  replanApplied: false,
  refundRefreshCount: 0,
  orderProgress: 0, // 0–100，订单生成进度
  payPadFilled: 0, // 0–6，已输入密码位
  composerActive: false, // 输入框是否被点开（唤起键盘）
  composerDraft: "", // 输入框内容
  segmentDraftPrice: null, // 修改后段卡的临时新价格
  agreementAccepted: false, // v5 O2：订单确认页用户协议勾选状态
  myTripsExpanded: false,
  selectedTripCardId: null, // 当前看的"我的行程" detail 卡
  prepOpenId: null,
  // 中转管家屏（trip-expanded 且 detail.transit 存在时）的浮层档位
  // 'map'  = sheet 收到底，仅露 handle + 标题，最大化看地图（默认）
  // 'half' = sheet 占下半屏
  // 'list' = sheet 撑大，看到完整任务清单 + 服务推荐 + 提示
  transitSheetMode: "map",
  /** 中转管家：default | family | business，见 standalone/_personas.js */
  persona: "family",
  /** 编辑模式：当前选中的步骤索引（null = 未选中 / 非编辑模式） */
  selectedStepIdx: null,
  /** 编辑模式：当前选中步骤的 mapTarget id */
  selectedMapTarget: null,
  toast: null,
};

let state = { ...initialState };
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}

export function update(updater) {
  setState(updater(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetState() {
  state = { ...initialState, conversation: [], intakeAnswers: {} };
  listeners.forEach((l) => l(state));
}
