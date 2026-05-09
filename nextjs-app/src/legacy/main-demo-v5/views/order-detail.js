// 订单详情：承载订单历史与航变二级处理入口。

import { buildDisruption, buildOrderHistory, buildOrderSnapshot, plans } from "../data-source.js";
import { ICON } from "../icons.js";
import { renderComposer } from "./bottom-composer.js";
import { renderMyTripsControl } from "./my-trips-control.js";

export function renderOrderDetail(state) {
  const plan = plans.find((p) => p.id === state.selectedPlanId) || plans.find((p) => p.id === "balanced") || plans[0];
  const snapshot = buildOrderSnapshot(plan, state);
  const history = buildOrderHistory(plan, state);
  const disruption = buildDisruption(plan);
  const backAction = state.paymentStatus === "paid" ? "back-to-prep" : "back-to-chat";

  return `
    <header class="appbar">
      <button class="appbar__icon" data-action="${backAction}" aria-label="返回">${ICON.back(22)}</button>
      <div class="appbar__title">订单详情</div>
      <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
    </header>

    <div class="feed order-detail-feed" id="feed">
      <main class="order-detail-screen">
        ${renderOrderSummary(snapshot, state)}
        ${renderHistory(history)}
        ${renderAirportService(disruption)}
      </main>
    </div>

    ${renderMyTripsControl(state)}
    ${renderComposer({ placeholder: "问问这笔订单" })}
  `;
}

function renderOrderSummary(snapshot, state) {
  const isReplanned = Boolean(state.replanApplied);
  return `
    <section class="order-summary-card" data-replanned="${isReplanned}">
      <div class="order-summary-card__head">
        <span class="order-status-pill">${snapshot.status}</span>
        <strong>${snapshot.statusSub}</strong>
      </div>
      <h2>${snapshot.title}</h2>
      <p>${snapshot.departDate} 出发 · ${snapshot.route}</p>
      <dl class="order-current-list">
        <div>
          <dt>${isReplanned ? "新航班" : "航班"}</dt>
          <dd>${snapshot.flight.code} ${snapshot.flight.time}</dd>
        </div>
        <div>
          <dt>${isReplanned ? "新接机" : "接机"}</dt>
          <dd>${snapshot.pickup.time} · ${snapshot.pickup.route}</dd>
        </div>
        <div>
          <dt>实付</dt>
          <dd>¥${snapshot.totalPrice.toLocaleString()}</dd>
        </div>
        <div>
          <dt>费用变化</dt>
          <dd>¥${snapshot.feeDelta}</dd>
        </div>
      </dl>
      ${
        isReplanned
          ? `<div class="order-guarantee-bar">航变保障不加钱，机票和接驳已同步到新行程。</div>`
          : `<div class="order-guarantee-bar">一程航变时，平台会联动调整后续行程。</div>`
      }
    </section>
  `;
}

function renderHistory(history) {
  return `
    <section class="order-history" aria-label="订单历史">
      ${history.map((item) => renderHistoryItem(item)).join("")}
    </section>
  `;
}

function renderHistoryItem(item) {
  return `
    <article class="order-history-item" data-kind="${item.kind}">
      <div class="order-history-item__rail" aria-hidden="true">
        <span class="order-history-dot"></span>
      </div>
      <div class="order-history-card" data-kind="${item.kind}">
        <div class="order-history-card__top">
          <span>${item.time}</span>
          <em>${item.status}</em>
        </div>
        <h3>${item.title}</h3>
        ${item.summary ? `<p>${item.summary}</p>` : ""}
        ${item.rows ? renderHistoryRows(item.rows) : ""}
        ${item.tags ? renderHistoryTags(item.tags) : ""}
        ${
          item.action
            ? `<div class="order-history-card__actions">
                <button class="refund-btn refund-btn--primary" data-action="open-alternative-from-order">查看替代方案</button>
                <button class="refund-btn refund-btn--ghost" data-action="start-refund" data-flow="disruption">查看影响明细</button>
              </div>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderHistoryRows(rows) {
  return `
    <dl class="order-history-rows">
      ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}
    </dl>
  `;
}

function renderHistoryTags(tags) {
  return `
    <div class="order-history-tags">
      ${tags.map((tag) => `<span>${tag}</span>`).join("")}
    </div>
  `;
}

function renderAirportService(disruption) {
  return `
    <button class="order-service-entry" type="button" data-action="open-trip-card" data-card-id="trip-hkg-airport">
      <span class="order-service-entry__icon">${ICON.ticket(20)}</span>
      <span>
        <strong>香港机场中转详情</strong>
        <small>查看值机、安检、免税店和登机口动线；航变后以 ${disruption.alternative.code} 为准。</small>
      </span>
      <i aria-hidden="true">${ICON.chevronRight(16)}</i>
    </button>
  `;
}
