// 我的行程：跨屏中控台。
// 折叠态：composer 上方左侧的 pill。
// 展开态：横向卡组，每张点击进 detail。

import { myTrips } from "../data-source.js";

export function renderMyTripsControl(state) {
  if (state.myTripsExpanded) {
    return `
      <div class="mytrips">
        <div class="mytrips__rail">
          <div class="mytrips__rail-head">
            <span>我的行程</span>
            <button class="mytrips__rail-close" data-action="toggle-mytrips" aria-label="收起">×</button>
          </div>
          <div class="mytrips__cards">
            ${myTrips
              .map((c) => getDisplayTripCard(c, state))
              .map(
                (c) => `<button class="mt-card" data-action="open-trip-card" data-card-id="${c.id}" data-kind="${c.kind || ""}">
                  <div class="mt-card__top">${c.short.topLine}</div>
                  <div class="mt-card__title">${c.short.title}</div>
                  <div class="mt-card__sub">${c.short.sub}</div>
                </button>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="mytrips">
      <button class="mytrips__pill" data-action="toggle-mytrips">我的行程</button>
    </div>
  `;
}

function getDisplayTripCard(card, state) {
  if (card.id !== "trip-disruption" || !state.replanApplied) return card;
  return {
    ...card,
    short: {
      topLine: "改签完成",
      title: "CX727 已生效",
      sub: "接机 20:45",
    },
  };
}
