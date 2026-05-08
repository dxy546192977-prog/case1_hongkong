// 出行推送 / 单卡 detail（Frame 14 风格）+ 展开页（点击卡片后的全屏地图/详情）。
//
// 香港机场中转管家：当 detail.transit 存在时，折叠卡和展开页都会渲染
// 「中转管家」UI（状态条 + 任务清单 + 顺路服务 + 温馨提示），
// 用于体现差异化的人设服务（当前 demo 默认展示亲子模式）。
//
// 注意：折叠卡（.transit-card）和全屏管家屏（.ta-screen）的 HTML / 样式 /
// 拖拽控制器已经被拆到独立模块，本文件只负责"分发"和兜底分支：
//   - ./transit-card.js        折叠卡 HTML
//   - ./transit-assistant.js   全屏地图屏 HTML + sheet 拖拽控制器
// 改两个模块，主项目 + 独立预览页同步生效。

import { myTrips, prepCards } from "../data.js";
import { applyPersonaToDetail } from "../../standalone/_personas.js";
import { renderMyTripsControl } from "./my-trips-control.js";
import { renderComposer } from "./chat.js";
import { renderAirportFlipbook } from "./airport-flipbook.js";
import { ICON } from "../icons.js";
import { renderTransitCard } from "./transit-card.js";
import { renderTransitAssistantScreen, attachTransitSheetDrag } from "./transit-assistant.js";

// 重新导出，方便 render.js 等老代码继续从 trip-detail.js import 拖拽控制器
export { attachTransitSheetDrag };

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

function detailForPersona(state, card) {
  const raw = card.detail;
  if (state.persona && raw?.transit) return applyPersonaToDetail(state.persona, raw);
  return raw;
}

// trip-detail 屏：collapsed 卡片视图（点击卡片可展开）
export function renderTrip(state) {
  const card = findCardById(state.selectedTripCardId) || myTrips[1];
  const d = detailForPersona(state, card);
  const transit = d.transit;

  // 香港机场中转：折叠卡升级为「中转管家」状态卡
  // v6 视觉：参考 figma 7435-37137，整屏白底、卡片仅 hairline、文字层级靠灰阶
  if (transit) {
    return `
      <header class="appbar">
        <button class="appbar__icon" data-action="back-to-prep" aria-label="返回">${ICON.back(22)}</button>
        <div class="appbar__title">出行助手</div>
        <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
      </header>

      <div class="feed">
        <div class="trip-detail trip-detail--plain">
          <p class="trip-detail__lead">亲子中转已为你规划好，已优先串联婴儿车租借、育婴室和安静休息点，按路线走更省心。</p>
          <h3 class="trip-detail__section-title">中转提示</h3>

          ${renderTransitCard(d, transit, state.persona)}
        </div>
      </div>

      ${renderMyTripsControl(state)}
      ${renderComposer()}
    `;
  }

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
          ${d.time ? `<div class="trip-card-detail__time">${d.time}</div>` : ""}
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
  const d = detailForPersona(state, card);

  // HK 机场卡 v5：中转管家（亲子模式）+ 保留 flipbook 总览图
  if (d.airportFlipbook && d.transit) {
    return renderTransitAssistantScreen(d, state);
  }

  // 兜底：仅有 flipbook 没有 transit（旧数据）
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

