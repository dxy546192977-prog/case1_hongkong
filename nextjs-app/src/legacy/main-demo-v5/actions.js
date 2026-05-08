// 用户意图 → 状态变更。命名动作，不在 onclick 里写复杂逻辑。

import { getState, setState, update } from "./state.js";
import { plans, intakeQuestions, passengers as initialPassengers } from "./data.js";

// ---------- 启动 / chat ----------

export function bootChat() {
  setState({
    screen: "chat",
    conversation: [{ type: "greeting" }],
  });
}

// 点首页问句卡 → 进入需求收敛流：
// 把"用户提问 → assistant 引导 → 3 轮 Q&A"按时间顺序铺到 conversation 里
export function startIntake(seedText) {
  // tone='soft'：从 chip 触发的首问句用浅冷蓝白底（Figma 真实色 #ebf5ff）
  const trigger = { type: "user", text: seedText, tone: "soft" };
  setState({
    conversation: [{ type: "greeting" }, trigger],
  });

  // 引导文 600ms 后出现
  setTimeout(() => {
    update((s) => ({
      conversation: [...s.conversation, { type: "assistant", text: intakeQuestions[1].text }],
    }));

    // q1 选项卡 320ms 后出现
    setTimeout(() => {
      update((s) => ({
        conversation: [...s.conversation, { type: "qa", qid: "q1" }],
      }));
    }, 320);
  }, 600);
}

// 用户在 Q&A 里点了某个选项
export function answerIntake(qid, optId) {
  const q = intakeQuestions.find((x) => x.id === qid);
  if (!q) return;
  const opt = q.options.find((o) => o.id === optId);
  if (!opt) return;

  // 用户文本：优先 userText（酒店名那种），否则用 label
  const userText = opt.userText || opt.label;

  update((s) => ({
    intakeAnswers: { ...s.intakeAnswers, [qid]: optId },
    conversation: s.conversation.map((m) =>
      m.qid === qid ? { ...m, answered: optId } : m,
    ),
  }));

  // 用户气泡 + 下一题（或最终方案）
  // tone='solid'：Q&A 答案用实蓝白字（Figma 真实色 #0044ff）
  setTimeout(() => {
    update((s) => ({
      conversation: [...s.conversation, { type: "user", text: userText, tone: "solid" }],
    }));

    const nextQid = qid === "q1" ? "q2" : qid === "q2" ? "q3" : null;
    if (nextQid) {
      // v3 step B·①：每题之间插入「思考中」加载状态，营造 AI 推理体感
      setTimeout(() => {
        update((s) => ({
          conversation: [...s.conversation, { type: "thinking" }],
        }));
        setTimeout(() => {
          update((s) => ({
            conversation: [
              ...s.conversation.filter((m) => m.type !== "thinking"),
              { type: "qa", qid: nextQid },
            ],
          }));
        }, 700);
      }, 280);
    } else {
      // 最后一题 → 思考 → 推方案
      setTimeout(() => {
        update((s) => ({
          conversation: [...s.conversation, { type: "thinking" }],
        }));
        setTimeout(() => {
          update((s) => ({
            conversation: [
              ...s.conversation.filter((m) => m.type !== "thinking"),
              { type: "plans-intro", text: "为你找到以下 3 种方案，供你选择" },
              { type: "plans" },
            ],
          }));
        }, 900);
      }, 380);
    }
  }, 240);
}

// ---------- 方案 / 行程定制 ----------

export function viewItinerary(planId) {
  setState({
    selectedPlanId: planId,
    screen: "itinerary",
    // v3 step 4b：默认 half 模式（地图露上半，sheet 占下半）
    itineraryMode: "half",
    selectedSegmentId: getDefaultHighlightSegmentId(planId),
    segmentLoading: false,
    // 重置地图视野
    routeMapZoom: 1,
    routeMapOffset: { x: 0, y: 0 },
  });
}

function getDefaultHighlightSegmentId(planId) {
  const p = plans.find((x) => x.id === planId);
  if (!p || !p.fullLegs) return null;
  // v3 step 4c：默认高亮飞机段（route-leg 索引为字符串）
  const flightIdx = p.fullLegs.findIndex((l) => l.mode === "飞机");
  return String(flightIdx >= 0 ? flightIdx : 0);
}

// v5 I4：模式 = 'list' | 'half' | 'rail' | 'map'
//   list = sheet 撑满（仅顶端留 110px 给地图）
//   half = sheet 占下半（地图占上半）— 默认
//   rail = sheet 收到底部一行横滑卡片（保留交互，不再继续收窄）
//   map  = sheet 收到底部仅露 handle（地图占满可视区）
export function setItineraryMode(mode) {
  if (!["list", "half", "rail", "map"].includes(mode)) return;
  setState({ itineraryMode: mode });
}

export function toggleItineraryMode() {
  const s = getState();
  // 兼容旧代码：list ↔ map 切换；half 时切到 list
  setState({ itineraryMode: s.itineraryMode === "list" ? "map" : "list" });
}

export function selectSegment(segId) {
  setState({ selectedSegmentId: segId });
}

// v5 O2：切换协议勾选
export function toggleAgreement() {
  const s = getState();
  setState({ agreementAccepted: !s.agreementAccepted });
}

// v3 step 4a：地图缩放 / 重置（zoom 范围 1.0–2.4，每次 +/- 0.2）
export function zoomRouteMap(direction) {
  const s = getState();
  const delta = direction === "in" ? 0.2 : -0.2;
  const next = Math.min(2.4, Math.max(1, (s.routeMapZoom || 1) + delta));
  setState({ routeMapZoom: next });
}

export function resetRouteMapView() {
  setState({ routeMapZoom: 1, routeMapOffset: { x: 0, y: 0 } });
}

// ---------- 订单流：选乘机人 → 订单 → 飞猪密码 ----------

export function startOrder() {
  setState({
    sheet: "passenger-pick",
    passengers: initialPassengers.map((p) => ({ ...p })),
  });
}

export function togglePassenger(pid) {
  update((s) => ({
    passengers: (s.passengers || []).map((p) =>
      p.id === pid ? { ...p, selected: !p.selected } : p,
    ),
  }));
}

export function confirmPassengers() {
  setState({ sheet: "order-confirm", orderProgress: 20 });
  // 启动进度 ticker：从 20% 涨到 100%（约 3.2s）
  tickOrderProgress();
}

let progressTimer = null;
function tickOrderProgress() {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    const s = getState();
    if (s.sheet !== "order-confirm") {
      clearInterval(progressTimer);
      progressTimer = null;
      return;
    }
    const next = Math.min(100, (s.orderProgress || 20) + 2);
    setState({ orderProgress: next });
    if (next >= 100) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }, 80);
}

// 自动填充 ticker（demo 默认自动播完 6 位密码；用户手动按键会接管）
let payAutoTimer = null;

export function openPayPad() {
  setState({ sheet: "pay-pad", paymentStatus: "pending", payPadFilled: 0 });
  if (payAutoTimer) clearInterval(payAutoTimer);
  let n = 0;
  payAutoTimer = setInterval(() => {
    const s = getState();
    if (s.sheet !== "pay-pad") {
      clearInterval(payAutoTimer);
      payAutoTimer = null;
      return;
    }
    n += 1;
    setState({ payPadFilled: n });
    if (n >= 6) {
      clearInterval(payAutoTimer);
      payAutoTimer = null;
      finishPayment();
    }
  }, 320);
}

export function pressPayKey(key) {
  // 用户手动按键 → 停止自动填充，由用户控制后续输入
  if (payAutoTimer) {
    clearInterval(payAutoTimer);
    payAutoTimer = null;
  }
  const s = getState();
  let filled = s.payPadFilled || 0;
  if (key === "back") {
    filled = Math.max(0, filled - 1);
  } else if (filled < 6) {
    filled += 1;
  }
  setState({ payPadFilled: filled });
  if (filled >= 6) {
    finishPayment();
  }
}

function finishPayment() {
  setTimeout(() => {
    setState({
      sheet: null,
      paymentStatus: "paid",
      screen: "prep",
      toast: "支付成功",
      payPadFilled: 0,
    });
    setTimeout(() => setState({ toast: null }), 1400);
  }, 600);
}

export function closeSheet() {
  setState({ sheet: null });
}

// ---------- 退改链路：询问规则 → 申请退款 → 状态查询 ----------

export function startRefundFlow(flow = "free") {
  const current = getState();
  const allowed = [
    "disruption",
    "replan-confirm",
    "replan-processing",
    "replan-success",
    "refund-all-processing",
    "refund-all-success",
    "free",
    "fee",
    "submitted",
    "status",
    "blocked",
    "failed",
  ];
  setState({
    screen: "refund",
    sheet: null,
    selectedPlanId: current.selectedPlanId || "balanced",
    paymentStatus: "paid",
    refundFlow: allowed.includes(flow) ? flow : "disruption",
    replanProgress: 0,
    replanApplied: current.replanApplied || flow === "replan-success",
    refundRefreshCount: 0,
  });
}

export function viewReplanCompare() {
  setState({ screen: "refund", sheet: null, refundFlow: "replan-confirm", replanProgress: 0 });
}

export function confirmReplan() {
  setState({ screen: "refund", sheet: null, refundFlow: "replan-processing", replanProgress: 20 });
  setTimeout(() => setState({ replanProgress: 62 }), 520);
  setTimeout(() => setState({ replanProgress: 100 }), 1080);
  setTimeout(() => setState({ refundFlow: "replan-success", replanProgress: 100, replanApplied: true }), 1500);
}

export function chooseFullRefund() {
  setState({ screen: "refund", sheet: null, refundFlow: "refund-all-processing", replanProgress: 20 });
  setTimeout(() => setState({ replanProgress: 68 }), 620);
  setTimeout(() => setState({ replanProgress: 100 }), 1300);
  setTimeout(() => setState({ refundFlow: "refund-all-success", replanProgress: 100 }), 2000);
}

export function requestRefund() {
  const s = getState();
  if (s.refundFlow === "fee") {
    setState({ sheet: "refund-warning" });
    return;
  }
  submitRefund();
}

export function submitRefund() {
  setState({ sheet: null, refundFlow: "submitted", refundRefreshCount: 0, toast: "退票申请已提交" });
  setTimeout(() => setState({ toast: null }), 1400);
}

export function showRefundFeeRequote() {
  setState({ screen: "refund", sheet: null, refundFlow: "fee", refundRefreshCount: 0 });
}

export function showRefundStatus() {
  setState({ screen: "refund", sheet: null, refundFlow: "status", refundRefreshCount: 0 });
}

export function showRefundBlocked() {
  setState({ screen: "refund", sheet: null, refundFlow: "blocked", refundRefreshCount: 0 });
}

export function showRefundFailed() {
  setState({ screen: "refund", sheet: null, refundFlow: "failed", refundRefreshCount: 0 });
}

export function refreshRefundStatus() {
  const next = (getState().refundRefreshCount || 0) + 1;
  setState({
    refundFlow: "status",
    refundRefreshCount: next,
    toast: next > 1 ? "退款状态暂无更新" : "已刷新退款状态",
  });
  setTimeout(() => setState({ toast: null }), 1400);
}

// ---------- 我的行程 / 推送 ----------

export function toggleMyTrips() {
  update((s) => ({ myTripsExpanded: !s.myTripsExpanded }));
}

export function openTripCard(cardId) {
  if (cardId === "trip-disruption") {
    setState({
      screen: "refund",
      sheet: null,
      selectedPlanId: "balanced",
      paymentStatus: "paid",
      refundFlow: "disruption",
      replanProgress: 0,
      refundRefreshCount: 0,
      myTripsExpanded: false,
    });
    return;
  }

  setState({
    screen: "trip",
    selectedTripCardId: cardId,
    myTripsExpanded: false,
  });
}

// v5 R5：点 prep 卡片改用 overlay 浮层（不切 screen）
export function openPrepCard(prepId) {
  setState({ prepOpenId: prepId });
}

export function closePrepCard() {
  setState({ prepOpenId: null });
}

export function expandTripCard() {
  // 从 trip-detail collapsed 状态展开为 trip-expanded（全屏地图/详情）
  // 每次进入重置为 map：首屏最大化地图，用户再拖或切 half/list
  setState({ screen: "trip-expanded", transitSheetMode: "map" });
}

export function collapseTripCard() {
  setState({ screen: "trip" });
}

// 中转管家浮层 3 档切换：'map' | 'half' | 'list'
export function setTransitSheetMode(mode) {
  if (!["map", "half", "list"].includes(mode)) return;
  setState({ transitSheetMode: mode });
}

export function backToPrep() {
  const s = getState();
  setState({
    screen: "prep",
    replanApplied: s.replanApplied || s.refundFlow === "replan-success",
  });
}

export function backToItinerary() {
  setState({ screen: "itinerary" });
}

export function backToChat() {
  setState({ screen: "chat" });
}

// ---------- Composer 唤起键盘 + send 触发段卡更新 ----------

export function focusComposer() {
  setState({ composerActive: true, composerDraft: "" });
}

export function blurComposer() {
  setState({ composerActive: false });
}

export function setComposerDraft(text) {
  setState({ composerDraft: text });
}

// 用户用 chip 或 send 触发"修改某段"。模拟段卡 loading → 价格更新。
export function applyModification(targetSegId, hintText) {
  const s = getState();
  const planId = s.selectedPlanId;
  if (!planId) return;

  setState({
    composerActive: false,
    selectedSegmentId: targetSegId || s.selectedSegmentId,
    segmentLoading: true,
    composerDraft: "",
    toast: hintText ? `调整：${hintText}` : null,
  });

  // 1.6s 后回到非 loading，并改 segmentDraftPrice 让段卡数字略变（视觉反馈）
  setTimeout(() => {
    setState({ segmentLoading: false, toast: null, segmentDraftPrice: 580 });
  }, 1600);
}

// ---------- 中转管家编辑模式（trip-expanded 步骤卡片选中 → 修改途经点） ----------

export function enterStepEditMode(segId, mapTarget) {
  setState({ selectedStepIdx: segId, selectedMapTarget: mapTarget });
}

export function exitStepEditMode() {
  setState({ selectedStepIdx: null, selectedMapTarget: null });
}

/** 纯函数：根据步骤 id 和用户输入文本，生成 mock 编辑结果 */
export function buildMockEditResult(segId, rawText) {
  const text = String(rawText || "").trim();
  const avoidHint = /不想|不要|绕开|避开/.test(text);
  const toDutyFree = /免税|商店|购物|DFS/.test(text);
  const toNursery = /育婴|哺乳|换尿布/.test(text);
  const toPlayArea = /儿童|游乐|放电/.test(text);

  let route = text;
  let reason = "";

  if (segId === "1") {
    if (avoidHint) {
      route = "沿主通道直行 → 中转安检家庭通道";
      reason = "已避开商业区绕行段，改为更直接路线";
    } else if (toDutyFree) {
      route = "婴儿车租借点 → 免税商业区短停 → 中转安检";
      reason = "已加入免税短停点，预计额外增加约 6 分钟";
    } else if (toNursery) {
      route = "婴儿车租借点 → 最近育婴室 → 中转安检";
      reason = "已插入育婴室停留点，便于换尿布与温奶";
    } else {
      route = `婴儿车租借点 → ${text}`;
      reason = "已按你的输入生成替代途经点";
    }
  } else if (segId === "2") {
    if (avoidHint) {
      route = "中转安检家庭通道 → 主脊直行 → 登机口";
      reason = "已取消可选绕路点，优先保证准点到达";
    } else if (toPlayArea) {
      route = "中转安检家庭通道 → 儿童游乐区短停 → 登机口";
      reason = "已加入儿童区停留，系统将按登机时间动态收紧";
    } else {
      route = `中转安检家庭通道 → ${text} → 登机口`;
      reason = "已按你的输入更新后续路径";
    }
  } else {
    route = text;
    reason = "已更新当前步骤描述";
  }

  return { route, reason };
}
