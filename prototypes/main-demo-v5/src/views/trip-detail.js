// 出行推送 / 单卡 detail（Frame 14 风格）+ 展开页（点击卡片后的全屏地图/详情）。

import { myTrips, prepCards } from "../data.js";
import { renderMyTripsControl } from "./my-trips-control.js";
import { renderComposer } from "./chat.js";
import { renderAirportFlipbook } from "./airport-flipbook.js";
import { ICON } from "../icons.js";

// 把 prep 卡片转成 trip-detail 期望的形态
function findCardById(id) {
  if (!id) return null;
  if (id.startsWith("prep:")) {
    const prepId = id.slice(5);
    const p = prepCards.find((x) => x.id === prepId);
    if (!p) return null;
    return {
      id,
      detail: {
        time: p.date,
        headline: p.title,
        lead: p.detail,
        bullets: p.sub ? [p.sub] : [],
      },
      isPrep: true,
    };
  }
  return myTrips.find((c) => c.id === id);
}

// trip-detail 屏：collapsed 卡片视图（点击卡片可展开）
export function renderTrip(state) {
  const card = findCardById(state.selectedTripCardId) || myTrips[1];
  const d = card.detail;

  return `
    <header class="appbar">
      <button class="appbar__icon" data-action="back-to-prep" aria-label="返回">${ICON.back(22)}</button>
      <div class="appbar__title">出行助手</div>
      <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
    </header>

    <div class="feed">
      <div class="trip-detail">
        <div class="trip-detail__top">${card.isPrep ? "行前必读" : "你的有 1 个行程即将出发"}</div>

        <button class="trip-card-detail trip-card-detail--clickable" data-action="expand-trip-card" aria-label="展开详情">
          ${d.time ? `<div class="trip-card-detail__time">${d.time}<span class="trip-card-detail__chev">${ICON.chevronDown(18)}</span></div>` : ""}
          <h2 class="trip-card-detail__headline">${d.headline}</h2>
          <p class="trip-card-detail__lead">${d.lead || ""}</p>
        </button>
      </div>
    </div>

    ${renderMyTripsControl(state)}
    ${renderComposer()}
  `;
}

// trip-expanded 屏：全屏展开。HK 卡用 HTML-native 布局还原 figma 截图，其他卡用简单文本详情。
export function renderTripExpanded(state) {
  const card = findCardById(state.selectedTripCardId) || myTrips[1];
  const d = card.detail;

  // HK 机场卡 v4：可点击 flipbook（光圈 → mp4 转场 → 真实文案随节点联动）
  if (d.airportFlipbook) {
    return `
      <div class="airport-screen">
        <button class="airport-screen__back" data-action="collapse-trip-card" aria-label="返回">${ICON.back(22)}</button>

        <div class="airport-screen__scroll">
          <h1 class="airport-screen__title">${d.headline}</h1>
          <p class="airport-screen__sub">${d.sub || ""}</p>

          <article class="airport-card airport-card--flipbook">
            ${renderAirportFlipbook(d.airportFlipbook)}
          </article>
        </div>
      </div>
    `;
  }

  // 兼容老 v2 数据：单张静态地图
  if (d.airportMap) {
    return `
      <div class="airport-screen">
        <button class="airport-screen__back" data-action="collapse-trip-card" aria-label="返回">${ICON.back(22)}</button>

        <div class="airport-screen__scroll">
          <h1 class="airport-screen__title">${d.headline}</h1>
          <p class="airport-screen__sub">${d.sub || ""}</p>

          <article class="airport-card">
            <img class="airport-card__map" src="${d.airportMap}" alt="${d.headline}路线图" loading="lazy" />
            <div class="airport-card__body-section">
              ${d.bodyTitle ? `<h2 class="airport-card__body-title">${d.bodyTitle}</h2>` : ""}
              <p class="airport-card__body">${d.lead || ""}</p>
            </div>
          </article>
        </div>
      </div>
    `;
  }

  // 其他卡：最小成本展开 — 大标题 + 副文 + 时间 + bullets
  return `
    <header class="appbar">
      <button class="appbar__icon" data-action="collapse-trip-card" aria-label="返回">${ICON.back(22)}</button>
      <div class="appbar__title">出行助手</div>
      <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
    </header>

    <div class="feed">
      <div class="trip-expanded">
        <h1 class="trip-expanded__title">${d.headline}</h1>
        ${d.sub ? `<p class="trip-expanded__sub">${d.sub}</p>` : ""}
        ${d.time ? `<div class="trip-expanded__time">${d.time}</div>` : ""}

        <p class="trip-expanded__lead">${d.lead || ""}</p>

        ${
          d.bullets && d.bullets.length
            ? `<ul class="trip-expanded__bullets">${d.bullets
                .map((b) => `<li>${b}</li>`)
                .join("")}</ul>`
            : ""
        }
      </div>
    </div>
  `;
}
