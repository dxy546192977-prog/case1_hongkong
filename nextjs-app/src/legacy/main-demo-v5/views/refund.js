// 退改链路：从正向方案派生订单信息，航变免费退改为主链路。

import { renderComposer } from "./chat.js";
import { ICON } from "../icons.js";
import {
  buildDisruption,
  passengers as defaultPassengers,
  plans,
  refundAllProcessSteps,
  replanProcessSteps,
} from "../data.js";

const NORMAL_FLOW = {
  free: {
    user: "我想退这次去吉隆坡的行程",
    paragraphs: (order) => [
      `好的，查询到你已预订 ${order.date} 出发的「${order.title}」，航班为 ${order.flight}，出行人为 ${order.passengers}。`,
      "当前普通退票分支仍可使用。若不是航变原因，系统会按各段商品规则校验退款金额；若命中航变保障，建议优先走上方「航变联动」免费退改。",
    ],
    card: "quote",
    fee: 0,
  },
  fee: {
    user: "我已知晓，提交飞猪订单退款申请",
    paragraphs: (order) => [
      `因为你长时间未操作，现在重新为你计算「${order.title}」的退款金额。普通退票预计需扣除手续费 ¥200。`,
      "手续费可能随时间变化。如需继续退款，请点击下方「申请退款」按钮。",
    ],
    card: "quote",
    fee: 200,
  },
  submitted: {
    user: "我已知晓，提交飞猪订单退款申请",
    paragraphs: (order) => [`好的，已为你提交 ${order.flight} 及相关接驳的退票申请。`],
    card: "status",
    after: "你可以手动刷新上方卡片查看最新退款状态。",
  },
  status: {
    user: "我的退款什么时候到账",
    paragraphs: (order) => [
      `查询到你有一笔 ${order.date} 出发的「${order.title}」退款申请。`,
      "该笔订单最新退款状态如下，你可以手动刷新下方卡片查看最新进展。",
    ],
    card: "status",
    orderList: true,
  },
  blocked: {
    user: "我的行程能退么",
    paragraphs: (order) => [
      `查询到你已预订 ${order.date} 出发的「${order.title}」。`,
      "部分接驳或票券不支持在线主动退票，可前往订单详情查看退改规则，或联系平台人工处理。",
    ],
    card: "blocked",
    orderList: true,
  },
  failed: {
    user: "我已知晓，提交飞猪订单退款申请",
    paragraphs: () => ["抱歉，当前申请提交失败，请重新尝试。"],
    card: "failed",
  },
};

export function renderRefund(state) {
  const order = getOrderSummary(state);
  const disruption = buildDisruption(order.plan);
  const backAction = state.paymentStatus === "paid" ? "back-to-prep" : "back-to-chat";
  const content = renderRefundContent(state, order, disruption);
  const factLead = content.factLead
    ? `<p class="refund-fact-lead">${content.factLead}</p>`
    : "";
  const userBubble = content.user
    ? `<div class="bubble bubble--refund-user">${content.user}</div>`
    : "";

  return `
    <header class="appbar">
      <button class="appbar__icon" data-action="${backAction}" aria-label="返回">${ICON.back(22)}</button>
      <div class="appbar__title">退改保障</div>
      <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
    </header>

    <div class="feed refund-feed" id="feed">
      ${userBubble}
      ${factLead}
      <div class="refund-assistant">
        <div class="refund-assistant__meta">
          <span class="refund-assistant__avatar">飞</span>
          <span>飞猪旅行助手</span>
        </div>
        <article class="refund-panel">
          ${content.body}
        </article>
      </div>
    </div>

    ${renderRefundShortcuts()}
    ${renderComposer({ placeholder: "输入问题或按住说话" })}
  `;
}

function renderRefundContent(state, order, disruption) {
  const factLead = `你的 ${order.flight} 因「${disruption.reason}」被取消。飞猪已识别到这会影响从东莞出发、经香港到吉隆坡酒店的全链路行程。`;

  if (state.refundFlow === "disruption") {
    return {
      factLead,
      body: `
        ${renderDisruptionAlert(order, disruption)}
        ${renderImpactList(disruption)}
      `,
    };
  }

  if (state.refundFlow === "replan-confirm") {
    return {
      factLead,
      body: `
        <p>我已把受影响的机票、跨境接驳和接机重新串好。新方案保持舱等、行李额和酒店抵达目标不变。</p>
        ${renderReplanCompare(disruption)}
        ${renderShieldBar(disruption)}
      `,
    };
  }

  if (state.refundFlow === "replan-processing") {
    return {
      factLead,
      body: renderProcessingCard("正在为你免费改好全程", state.replanProgress, replanProcessSteps),
    };
  }

  if (state.refundFlow === "replan-success") {
    return {
      factLead,
      body: renderSuccessCard("全程已自动改好", [
        `新航班：${disruption.alternative.code} ${disruption.alternative.time}`,
        `接机时间：${disruption.newPickupTime}`,
        "费用变化：¥0，平台已兜底差价",
      ]),
    };
  }

  if (state.refundFlow === "refund-all-processing") {
    return {
      factLead,
      body: renderProcessingCard("正在为你办理全链路免费退款", state.replanProgress, refundAllProcessSteps),
    };
  }

  if (state.refundFlow === "refund-all-success") {
    return {
      factLead,
      body: renderSuccessCard("全链路退款已提交", [
        `预计退还：¥${disruption.refundTotal.toLocaleString()}`,
        "手续费：¥0",
        "退款将原路返回至支付账户",
      ]),
    };
  }

  const flow = NORMAL_FLOW[state.refundFlow] || NORMAL_FLOW.free;
  return {
    user: flow.user,
    body: `
      ${flow.paragraphs(order).map((p) => `<p>${p}</p>`).join("")}
      ${renderRefundCard(flow, state, order)}
      ${flow.after ? `<p>${flow.after}</p>` : ""}
      ${flow.orderList ? renderOrderListHint() : ""}
    `,
  };
}

function getOrderSummary(state) {
  const plan = plans.find((p) => p.id === state.selectedPlanId) || plans.find((p) => p.id === "balanced") || plans[0];
  const flightLeg = (plan.fullLegs || []).find((l) => l.mode === "飞机") || {};
  const passengerNames = ((state.passengers || defaultPassengers).filter((p) => p.selected !== false).map((p) => p.name));
  return {
    plan,
    title: plan.title,
    date: "2026年6月1日",
    route: plan.routeMeta?.mapPins?.join(" - ") || plan.title,
    flight: flightLeg.code || "国泰 CX725",
    flightTime: flightLeg.time || "12:40",
    passengers: passengerNames.join("、") || "李雷",
    refund: plan.totalPrice,
  };
}

function renderDisruptionAlert(order, disruption) {
  return `
    <section class="disruption-alert">
      <span class="disruption-alert__tag">航变保障已触发</span>
      <h3>一程航变，全程自动改好，不加钱</h3>
      <dl class="disruption-alert__grid">
        <div><dt>原航班</dt><dd>${order.flight} ${disruption.alternative.oldTime}</dd></div>
        <div><dt>影响范围</dt><dd>${disruption.affected.length} 段需联动处理</dd></div>
        <div><dt>平台处理</dt><dd>改签机票、顺延接驳、调整接机</dd></div>
        <div><dt>费用变化</dt><dd>¥0</dd></div>
      </dl>
      <div class="refund-order-card__actions">
        <button class="refund-btn refund-btn--primary" data-action="view-replan-compare">查看替代方案</button>
        <button class="refund-btn refund-btn--ghost" data-action="choose-full-refund">全部退款</button>
      </div>
    </section>
  `;
}

function renderImpactList(disruption) {
  return `
    <section class="refund-impact-list" aria-label="6 段影响清单">
      <h3>6 段行程影响明细</h3>
      ${disruption.impactList.map((item) => `
        <article class="refund-impact-row" data-impacted="${item.impacted}">
          <span class="refund-impact-row__idx">${item.id}</span>
          <div>
            <strong>${item.mode}</strong>
            <small>${item.time ? `${item.time} · ` : ""}${item.route}</small>
            <em>${item.detail}</em>
          </div>
          <b>${item.status}</b>
        </article>
      `).join("")}
    </section>
  `;
}

function renderReplanCompare(disruption) {
  return `
    <section class="refund-replan-compare">
      <h3>替代方案对比</h3>
      ${disruption.replanRows.map((row) => `
        <article class="refund-replan-row">
          <span>${row.label}</span>
          <div>
            <small>原计划：${row.before}</small>
            <strong>新方案：${row.after}</strong>
          </div>
        </article>
      `).join("")}
      <div class="refund-order-card__actions">
        <button class="refund-btn refund-btn--primary" data-action="confirm-replan">接受替代方案</button>
        <button class="refund-btn refund-btn--ghost" data-action="choose-full-refund">全部退款</button>
      </div>
    </section>
  `;
}

function renderShieldBar(disruption) {
  return `
    <aside class="refund-shield-bar">
      <strong>平台保障</strong>
      <span>改签差价 ¥${disruption.alternative.priceDelta}，手续费 ¥${disruption.fee}，你无需补差价。</span>
    </aside>
  `;
}

function renderProcessingCard(title, progress = 0, steps = []) {
  return `
    <section class="refund-processing-card">
      <h3>${title}</h3>
      <div class="refund-processing-card__bar"><span style="width:${Math.max(12, progress)}%"></span></div>
      <ol>
        ${steps.map((step, index) => `<li data-done="${progress >= (index + 1) * 25}">${step}</li>`).join("")}
      </ol>
    </section>
  `;
}

function renderSuccessCard(title, items) {
  return `
    <section class="refund-success-card">
      <span class="refund-success-card__icon">${ICON.check(18)}</span>
      <h3>${title}</h3>
      <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
      <button class="refund-btn refund-btn--primary" data-action="back-to-prep">回到行程</button>
    </section>
  `;
}

function renderRefundCard(flow, state, order) {
  if (flow.card === "status") return renderStatusCard(state, order);
  if (flow.card === "blocked") return renderBlockedCard();
  if (flow.card === "failed") return renderFailedCard();
  return renderQuoteCard(flow.fee || 0, order);
}

function renderQuoteCard(fee, order) {
  return `
    <section class="refund-order-card">
      <div class="refund-order-card__route">
        <strong>${order.date} ${order.flightTime}</strong>
        <span>${order.route}</span>
        <em>飞猪旅行</em>
      </div>
      <div class="refund-order-card__flight">${order.flight}</div>
      <dl class="refund-order-card__meta">
        <div><dt>出行人</dt><dd>${order.passengers}</dd></div>
      </dl>
      <div class="refund-order-card__money">
        <span>预计退还</span>
        <strong>¥${Math.max(0, order.refund - fee).toLocaleString()}</strong>
        ${fee ? `<small>已扣费 ¥${fee}</small>` : ""}
      </div>
      <div class="refund-order-card__actions">
        <button class="refund-btn refund-btn--ghost" data-action="refund-status">订单详情</button>
        <button class="refund-btn refund-btn--primary" data-action="request-refund">申请退款</button>
      </div>
      ${renderOrderListHint()}
    </section>
  `;
}

function renderStatusCard(state, order) {
  const refreshed = state.refundRefreshCount > 0;
  return `
    <button class="refund-status-card" type="button" data-action="refresh-refund-status" aria-label="刷新退款状态">
      <span class="refund-status-card__icon">${ICON.ticket(22)}</span>
      <span class="refund-status-card__text">
        <strong>${order.flight} 退票申请已受理，审核中</strong>
        <small>${refreshed ? "刚刚刷新，预计 06-01 12:40 前反馈处理结果" : "预计 06-01 12:40 前反馈处理结果"}</small>
      </span>
      <span class="refund-status-card__refresh">${ICON.clock(18)}</span>
    </button>
  `;
}

function renderBlockedCard() {
  return `
    <section class="refund-blocked-card">
      <span class="refund-blocked-card__icon">${ICON.alert(18)}</span>
      <div>
        <strong>暂不支持在线主动退票</strong>
        <small>该商品需前往订单详情查看退改规则，或联系平台人工处理。</small>
      </div>
      <button class="refund-btn refund-btn--ghost" data-action="refund-status">查看订单详情</button>
    </section>
  `;
}

function renderFailedCard() {
  return `
    <section class="refund-failed-card">
      <span>${ICON.alert(18)}</span>
      <div>
        <strong>提交失败</strong>
        <small>可重新发起退款申请，系统会重新校验票规和退款金额。</small>
      </div>
      <button class="refund-btn refund-btn--primary" data-action="request-refund">重新申请</button>
    </section>
  `;
}

function renderOrderListHint() {
  return `<p class="refund-order-hint">如你想操作其他订单，可以查看飞猪订单列表进行选择。<button data-action="refund-status">查看订单列表</button></p>`;
}

function renderRefundShortcuts() {
  const items = [
    ["disruption", "航变联动"],
    ["replan-confirm", "替代方案"],
    ["free", "普通退票"],
  ];
  return `
    <div class="refund-shortcuts" aria-label="退改快捷入口">
      ${items
        .map(([flow, label]) => `<button type="button" data-action="start-refund" data-flow="${flow}">${label}</button>`)
        .join("")}
    </div>
  `;
}
