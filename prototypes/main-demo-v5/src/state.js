// 极简 pub/sub store。state 不可变更新，订阅者收到全量 state。
// Render 只读 state，永不直接改 state。所有改动经 actions。

const initialState = {
  screen: "chat", // 'chat' | 'plans' | 'itinerary' | 'order' | 'prep' | 'trip' | 'trip-expanded'
  conversation: [], // [{type, payload}] 见 actions.js 注释
  intakeAnswers: {}, // q-id → option-id
  selectedPlanId: null,
  itineraryMode: "half", // 'list' | 'half' | 'rail' | 'map'  (v5 I4：4 档 sheet 模式)
  selectedSegmentId: null,
  segmentLoading: false,
  // 路线地图（v3 step 4a）：缩放 1.0–2.4，平移 px。zoom 控制按钮 + 拖动 pan 用。
  routeMapZoom: 1,
  routeMapOffset: { x: 0, y: 0 },
  sheet: null, // 'passenger-pick' | 'order-confirm' | 'pay-pad' | null
  passengers: null, // 临时被 sheet 编辑的乘机人状态
  paymentStatus: "idle", // 'idle' | 'pending' | 'paid'
  orderProgress: 0, // 0–100，订单生成进度
  payPadFilled: 0, // 0–6，已输入密码位
  composerActive: false, // 输入框是否被点开（唤起键盘）
  composerDraft: "", // 输入框内容
  segmentDraftPrice: null, // 修改后段卡的临时新价格
  agreementAccepted: false, // v5 O2：订单确认页用户协议勾选状态
  myTripsExpanded: false,
  selectedTripCardId: null, // 当前看的"我的行程" detail 卡
  prepOpenId: null,
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
