// 行前准备：v3 step C·⑦+⑧
// 顶部 success-card（预订成功摘要）+ pretrip-card（行前注意事项 4 张卡）+
// 浮动智能建议 chip 行 + composer。

import { buildDisruption, prepCards, plans } from "../data.js";
import { renderMyTripsControl } from "./my-trips-control.js";
import { renderComposer } from "./chat.js";
import { ICON } from "../icons.js";

export function renderPrep(state) {
  const plan = plans.find((p) => p.id === state.selectedPlanId) || plans[0];
  const flightLeg = (plan?.fullLegs || []).find((l) => l.mode === "飞机");
  const disruption = buildDisruption(plan);
  const isReplanned = Boolean(state.replanApplied);
  const departTime = plan?.routeMeta?.depart || "06:20";
  const displayDepartTime = isReplanned ? "10:10" : departTime;
  const flightCode = isReplanned
    ? `${disruption.alternative.code} ${disruption.alternative.time}`
    : flightLeg?.code || "国泰 CX725";
  const cardKicker = isReplanned ? "改签成功" : "预订成功";
  const cardTitle = isReplanned
    ? "新行程已生效，短信将同步通知你"
    : "出票后将短信通知你，航变保障已开启";

  return `
    <header class="appbar">
      <button class="appbar__icon" data-action="back-to-chat" aria-label="返回">${ICON.back(22)}</button>
      <div class="appbar__title">出行助手</div>
      <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
    </header>

    <div class="feed prep-feed">
      <section class="success-home">
        <article class="success-card" data-replanned="${isReplanned}">
          <div class="success-card__head">
            <span class="card-kicker">${cardKicker}</span>
            <h3>${cardTitle}</h3>
          </div>
          <dl class="success-summary">
            <div><dt>订单</dt><dd>${plan.title}</dd></div>
            <div><dt>出发</dt><dd>2026/06/01 ${displayDepartTime}</dd></div>
            <div><dt>航班</dt><dd>${flightCode}</dd></div>
            ${isReplanned ? `<div><dt>接机</dt><dd>${disruption.newPickupTime} 吉隆坡 KUL T1</dd></div>` : ""}
          </dl>
          <div class="success-card__actions">
            <button class="success-detail-link" type="button">查看订单详情 ›</button>
          </div>
        </article>

        <article class="pretrip-card">
          <span class="card-kicker">行前注意事项</span>
          <h3>出发前建议完成以下检查，避免影响值机、入境和入住</h3>
          <div class="prep-list">
            ${prepCards
              .map(
                (c) => `<button class="assistant-item" type="button" data-action="open-prep-card" data-prep-id="${c.id}">
                  <span>
                    <b>${c.title}</b>
                    <small>${c.sub}</small>
                  </span>
                  <i aria-hidden="true">${ICON.chevronRight(16)}</i>
                </button>`,
              )
              .join("")}
          </div>
        </article>
      </section>
    </div>

    ${state.myTripsExpanded ? renderMyTripsControl(state) : renderPrepSmartSuggestions(state)}
    ${renderComposer()}
    ${renderPrepDetailOverlay(state)}
  `;
}

// v5 R5：行前卡点击后 detail overlay
function renderPrepDetailOverlay(state) {
  if (!state.prepOpenId) return "";
  const card = prepCards.find((c) => c.id === state.prepOpenId);
  if (!card) return "";
  return `
    <div class="prep-overlay" data-action="close-prep-card">
      <div class="prep-overlay__panel" onclick="event.stopPropagation()">
        <div class="prep-overlay__head">
          <span class="card-kicker">行前注意事项</span>
          <button class="prep-overlay__close" data-action="close-prep-card" aria-label="关闭">×</button>
        </div>
        <h2 class="prep-overlay__title">${card.title}</h2>
        <p class="prep-overlay__date">${card.date}</p>
        <p class="prep-overlay__desc">${card.sub}</p>
        ${card.details && card.details.length ? `
          <div class="prep-overlay__details">
            ${card.details.map((d) => `<article class="prep-overlay__detail-card"><span>${d}</span></article>`).join("")}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

// v5：合并「我的行程 pill」+ 智能建议 chip 到统一一行（不再重叠）
function renderPrepSmartSuggestions(state) {
  const list = ["出发前要准备什么", "我几点出门", "司机到了吗", "到香港机场了"];
  return `
    <div class="smart-suggestions" aria-label="智能建议">
      <button class="smart-suggestion-chip smart-suggestion-chip--with-icon" data-action="toggle-mytrips">
        <span>我的行程</span>
        ${ICON.chevronRight(14)}
      </button>
      ${list
        .map((label) => `<button class="smart-suggestion-chip" data-action="suggest-chip" data-text="${label}">${label}</button>`)
        .join("")}
    </div>
  `;
}
