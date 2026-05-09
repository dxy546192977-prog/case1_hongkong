// 横向轮播 3 方案卡 + 卡组下方的服务权益卡片（不再用图片）。
// 卡内 mini-timeline：每行带 ¥价格 + 子说明。只有大交通飞机段 + 总价用红色，其余用 ink。

import { perks } from "../data-source.js";
import { ICON } from "../icons.js";

export function renderPlanCarousel(plans) {
  return `
    <div class="plans-carousel" data-region="plans">
      ${plans.map(renderPlanCard).join("")}
    </div>
    ${renderPerksCard()}
  `;
}

function renderPlanCard(plan) {
  const cls = "plan-card" + (plan.primary ? " plan-card--primary" : "");
  return `
    <article class="${cls}" data-plan-id="${plan.id}">
      <span class="plan-card__tag">${plan.tag}</span>
      <h3 class="plan-card__title">${plan.title}</h3>
      <p class="plan-card__sub">${plan.subtitle}</p>

      <div class="plan-card__totalrow">
        <span class="label">总耗时</span>
        <span class="value">${plan.totalTime}</span>
      </div>

      <div class="plan-mini">
        ${plan.miniTimeline
          .map(
            (m) => `<div class="plan-mini__row">
              <span class="plan-mini__time">${m.time}</span>
              <span class="plan-mini__text">${m.text}${m.sub ? `<span class="plan-mini__sub">${m.sub}</span>` : ""}</span>
              <span class="plan-mini__price${m.redPrice ? " is-red" : ""}">${m.price ? m.price.toLocaleString() : "0"}</span>
            </div>`,
          )
          .join("")}
      </div>

      <div class="plan-card__pricerow">
        <span class="pp-left"><span class="pp-label">${plan.headcount} 人均价</span><span class="pp-value">${plan.perHead.toLocaleString()}</span></span>
        <span class="pp-detail">查看明细</span>
      </div>

      <div class="plan-card__cta">
        <button class="btn btn--ghost btn--inline" data-action="view-itinerary" data-plan-id="${plan.id}">查看详情</button>
        <button class="btn btn--primary btn--inline" data-action="book-now" data-plan-id="${plan.id}">立即预订</button>
      </div>
    </article>
  `;
}

function renderPerksCard() {
  const iconMap = {
    delay: ICON.delay(20),
    navigate: ICON.navigate(20),
    taxi: ICON.taxi(20),
    shield: ICON.shield(20),
    gift: ICON.gift(20),
  };

  return `
    <div class="perks-card">
      <div class="perks-card__head">
        <span class="perks-card__title">${perks.title}</span>
        <span class="perks-card__sub">${perks.subtitle}</span>
      </div>
      <p class="perks-card__intro">${perks.intro}</p>
      <ul class="perks-list">
        ${perks.items
          .map(
            (it) => `<li class="perks-row">
              <span class="perks-row__icon">${iconMap[it.icon] || ""}</span>
              <div>
                <span class="perks-row__title">${it.title}</span>
                <span class="perks-row__desc">${it.sub}</span>
              </div>
            </li>`,
          )
          .join("")}
      </ul>
    </div>
  `;
}
