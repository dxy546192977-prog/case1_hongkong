// 行程定制：地图为底 + sheet 浮起（含全部行程卡 + 总价 + 确认按钮）+
// composer 上方常驻一条「推荐修改标签」chips bar + composer 吸底。
// 段卡总是展开（不收起），按 cat/mode 显示对应详情结构。

import { plans } from "../data.js";
import { renderComposer } from "./chat.js";
import { ICON } from "../icons.js";

export function renderItinerary(state) {
  const plan = plans.find((p) => p.id === state.selectedPlanId) || plans[0];
  const mode = state.itineraryMode || "list";

  return `
    <div class="itin-screen" data-mode="${mode}">
      ${renderRouteMap(plan, state)}

      <header class="appbar appbar--transparent">
        <button class="appbar__icon appbar__icon--floating" data-action="back-from-itinerary" aria-label="返回">${ICON.back(22)}</button>
        <div></div>
        <div></div>
      </header>

      <div class="appbar__tabs">
        <button class="${mode === "list" ? "is-active" : ""}" data-action="set-itin-mode" data-mode="list">行程图</button>
        <button class="${mode === "map" ? "is-active" : ""}" data-action="set-itin-mode" data-mode="map">线路图</button>
      </div>

      <div class="itin-sheet" id="itin-sheet">
        <div class="itin-sheet__handle" data-drag-handle aria-hidden="true"></div>
        <p class="itin-sheet__lede">详细行程，可选择行程继续调整</p>

        <div class="itin-sheet__body">
          <ol class="route-timeline">
            ${(plan.fullLegs || []).map((leg, i, all) => renderRouteLeg(leg, i, all, state)).join("")}
          </ol>

          <div class="itin-sheet__total">
            <span class="itin-sheet__total-label">合计总价</span>
            <span class="itin-sheet__total-value${state.segmentLoading ? " itin-sheet__total-value--loading" : ""}">${state.segmentLoading ? "加载中…" : plan.totalPrice.toLocaleString()}</span>
          </div>

          <div class="itin-sheet__cta">
            <button class="btn btn--primary btn--block" data-action="start-order">确认行程并预订</button>
          </div>
        </div>

        ${mode === "rail" ? renderRailCards(plan, state) : ""}
      </div>

      ${renderSmartSuggestions(plan, state)}

      ${renderComposer({ placeholder: "可以针对行程进行修改…", interactive: true, state, chips: false })}

      ${state.composerActive ? renderKeyboardLayer() : ""}
    </div>
  `;
}

// v3 step 6：浮动智能建议 chip 行（移植自分支 currentSuggestions）
// 按当前选中段的 mode 动态出建议词；浮在 composer 上方独立一行
function renderSmartSuggestions(plan, state) {
  const suggestions = currentSuggestions(plan, state);
  if (!suggestions.length) return "";
  return `
    <div class="smart-suggestions" aria-label="智能建议">
      ${suggestions
        .map((label) => `<button class="smart-suggestion-chip" data-action="suggest-chip" data-text="${escapeHtml(label)}">${escapeHtml(label)}</button>`)
        .join("")}
    </div>
  `;
}

function currentSuggestions(plan, state) {
  const legs = plan.fullLegs || [];
  if (!legs.length) return [];
  const segIdx = parseInt(state.selectedSegmentId, 10);
  if (Number.isInteger(segIdx) && legs[segIdx]) {
    return routeSegmentSuggestions(legs[segIdx], segIdx, plan);
  }
  return planSuggestions(plan);
}

function planSuggestions(plan) {
  const map = {
    balanced: ["大巴换成轮渡出行", "吉隆坡打车需要商务车", "想要下午起飞的航班"],
    comfort: ["深圳机场再晚一点出发", "帮我加一件托运行李", "酒店接机改成商务车"],
    low: ["广州段减少换乘", "高铁时间再留宽一点", "想保留午后到店"],
  };
  return map[plan.id] || map.balanced;
}

function routeSegmentSuggestions(leg, index, plan) {
  const mode = leg?.mode || "";
  const route = leg?.route || "";
  const routeEnd = route.split("→").pop()?.trim() || "目的地";
  const airportName = routeEnd.includes("机场") ? routeEnd : "机场";
  const segLabel = `行程${index + 1}`;

  const byMode = [
    {
      match: ["打车"],
      list: [
        index === 0 && route.includes("东莞金域名苑") ? "坐船直达香港" : `${segLabel} 改成送机服务`,
        "行李多，换 7 座商务车",
        "查公共交通备选路线",
      ],
    },
    {
      match: ["跨城机场大巴", "机场巴士"],
      list: [`${segLabel} 大巴提前一班`, "改成包车直达机场", "确认上车点和行李限制"],
    },
    {
      match: ["高铁"],
      list: ["高铁时间再留宽一点", "改成直达包车去机场", "查带行李进站动线"],
    },
    {
      match: ["机场快线"],
      list: ["机场快线提前一班", "换打车直达机场", "查带行李换乘路线"],
    },
    {
      match: ["值机", "托运", "安检"],
      list: [`${airportName} 值机柜台提醒`, "列出托运行李清单", "标出排队风险最高点"],
    },
    {
      match: ["飞机"],
      list: [
        `${leg.code || "航班"} 加托运行李`,
        "对比同日更便宜航班",
        "延误时自动改签方案",
      ],
    },
    {
      match: ["入境", "取行李"],
      list: ["准备入境材料清单", "标出入境排队风险", "取完行李后接机点"],
    },
    {
      match: ["接机"],
      list: [`${routeEnd} 改商务接机`, "确认司机举牌位置", "查公共交通到酒店"],
    },
  ];
  const matched = byMode.find(({ match }) => match.some((kw) => mode.includes(kw)));
  return matched?.list || planSuggestions(plan);
}

function renderKeyboardLayer() {
  return `
    <div class="kbd-layer" data-action="blur-composer">
      <div class="kbd-layer__img" aria-hidden="true"></div>
    </div>
  `;
}

// v5 I4：rail 模式 — sheet 收到底部，露一行横滑卡片
function renderRailCards(plan, state) {
  const legs = plan.fullLegs || [];
  return `
    <div class="route-rail">
      ${legs
        .map((leg, idx) => {
          const selected = String(state.selectedSegmentId) === String(idx);
          const price = leg.price ? String(leg.price).replace(/^约/, "").replace(/^¥/, "") : "";
          return `<button class="rail-card${selected ? " is-selected" : ""}${leg.mode === "飞机" ? " rail-card--flight" : ""}" data-action="select-seg" data-seg-id="${idx}">
            <div class="rail-card__num">${idx + 1}</div>
            <div class="rail-card__time">${escapeHtml(leg.time)}</div>
            <div class="rail-card__route">${escapeHtml(simpleRoute(leg.route))}</div>
            ${price ? `<div class="rail-card__price">¥${escapeHtml(price)}</div>` : ""}
          </button>`;
        })
        .join("")}
    </div>
  `;
}

function simpleRoute(route) {
  // rail card 用极简标签：xxx → yyy  → 拆出最后两个 token
  if (!route) return "";
  if (!route.includes("→")) return route.replace(/^到达/, "");
  const [from, to] = route.split("→").map((s) => s.trim());
  // 缩短长名
  const shorten = (s) => s
    .replace(/东莞.*?(候机楼|金域名苑)/, (_, p) => p.includes("候机楼") ? "南城" : "金域名苑")
    .replace("东莞金域名苑", "金域名苑")
    .replace(/广州.*?(白云机场|南站|客运站)/, (_, p) => p === "南站" ? "广州南" : (p.includes("白云") ? "白云" : "广州"))
    .replace("香港国际机场", "香港")
    .replace("吉隆坡国际机场", "吉隆坡")
    .replace("吉隆坡 KUL", "吉隆坡")
    .replace("KUL", "")
    .replace("雪邦黄金海岸安凡尼度假酒店", "雪邦")
    .replace(/\s*T(\d)\b/g, " T$1");
  return `${shorten(from)} → ${shorten(to)}`;
}

// v3 step 4c：段卡渲染（移植分支风格）
// fullLegs 元素结构：{ time, route, mode, duration, price?, code?, cabin?, luggage?, refundPolicy?, reason }
// 飞机段（mode === "飞机"）→ rich 卡（航班号 / 机型 / 经济舱·行李·退改 chip / 价格立体）
// 其它段 → 简版（时间 / 路线 / 价格 / reason 灰色斜体）

function renderRouteLeg(leg, idx, all, state) {
  const total = all.length;
  const selected = String(state.selectedSegmentId) === String(idx);
  const loading = selected && state.segmentLoading;
  const cls = ["route-leg"];
  if (leg.mode === "飞机") cls.push("route-leg--flight");
  if (selected) cls.push("is-selected");
  if (loading) cls.push("route-leg--loading");

  const indexBadge = `
    <div class="route-leg__index">
      <span>${idx + 1}</span>
      ${idx < total - 1 ? "<i></i>" : ""}
    </div>`;

  // v3 step A·⑤：调整中（applyModification 触发）显示骨架屏
  if (loading) {
    return `
      <article class="${cls.join(" ")}" data-seg-id="${idx}">
        ${indexBadge}
        <div class="route-leg__card route-leg__card--skeleton" aria-busy="true">
          <span class="skeleton-line skeleton-line--short"></span>
          <span class="skeleton-line skeleton-line--wide"></span>
          <span class="skeleton-line skeleton-line--mid"></span>
        </div>
      </article>
    `;
  }

  const card = leg.mode === "飞机"
    ? renderFlightLegCard(leg, idx, all)
    : renderSimpleLegCard(leg, idx);

  return `
    <article class="${cls.join(" ")}" data-seg-id="${idx}" data-action="select-seg">
      ${indexBadge}
      ${card}
    </article>
  `;
}

function renderSimpleLegCard(leg, idx) {
  const date = "2026/06/01";
  const price = formatPrice(leg.price);
  const meta = leg.duration ? `${leg.mode} · ${leg.duration.replace(/^约/, "")}` : leg.mode;
  return `
    <div class="route-leg__card">
      <p class="route-leg__meta">行程${idx + 1}：${date} ${leg.time}</p>
      <div class="route-leg__main">
        <h3>${escapeHtml(leg.route)}</h3>
        ${price ? `<strong>${escapeHtml(price)}</strong>` : ""}
      </div>
      <span>${escapeHtml(meta)}</span>
      ${leg.reason ? `<em>${escapeHtml(leg.reason)}</em>` : ""}
    </div>
  `;
}

function renderFlightLegCard(leg, idx, all) {
  const arriveLeg = all[idx + 1]; // 到达时间从下一段读
  const arriveTime = arriveLeg?.time || "";
  const { from, to } = splitRoute(leg.route);
  const fromAirport = compactAirportLabel(from);
  const toAirport = compactAirportLabel(to);
  const duration = leg.duration ? `总${leg.duration.replace(/^约/, "")}` : "";
  const price = formatPrice(leg.price);

  const tags = [];
  if (leg.cabin) tags.push(leg.cabin);
  // 行李额度做成简短 chip：取「托运行李20公斤」首段
  if (leg.luggage) {
    const lug = leg.luggage.split("｜")[0]?.trim() || leg.luggage;
    tags.push(lug);
  }
  if (leg.refundPolicy) {
    tags.push("退改 ¥80 起");
  }

  return `
    <div class="route-leg__card route-leg__card--flight">
      <p class="route-leg__meta">行程${idx + 1}：${leg.time}${arriveTime ? "-" + arriveTime : ""}</p>
      <div class="route-flight__title">${escapeHtml(from)} → ${escapeHtml(to)}</div>
      <div class="route-flight__body">
        <div class="route-flight__info">
          <div class="route-flight__times">
            <div>
              <b>${escapeHtml(leg.time)}</b>
              <span>${escapeHtml(fromAirport)}</span>
            </div>
            <div class="route-flight__duration">
              <span>${escapeHtml(duration)}</span>
              <i></i>
            </div>
            <div>
              <b>${escapeHtml(arriveTime)}</b>
              <span>${escapeHtml(toAirport)}</span>
            </div>
          </div>
          ${leg.code ? `<div class="route-flight__meta">
            <span class="airline-mark">◖</span>
            <span>${escapeHtml(leg.code)}</span>
            ${leg.aircraft ? `<button type="button">机型 ${escapeHtml(leg.aircraft)}</button>` : ""}
          </div>` : ""}
          ${tags.length ? `<div class="route-flight__tags">
            ${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}
          </div>` : ""}
        </div>
        ${price ? `<div class="route-flight__price"><strong>${escapeHtml(price)}</strong></div>` : ""}
      </div>
    </div>
  `;
}

function formatPrice(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (!/\d/.test(text)) return text;
  const cleaned = text.replace(/^约/, "").replace(/^¥/, "").trim();
  return `¥ ${cleaned}`;
}

function splitRoute(route) {
  const [from = "", to = ""] = String(route).split("→").map((s) => s.trim());
  return { from, to };
}

function compactAirportLabel(label) {
  const normalized = String(label || "")
    .replace("香港国际机场", "香港")
    .replace("香港机场", "香港")
    .replace("吉隆坡国际机场", "吉隆坡")
    .replace("吉隆坡 KUL", "吉隆坡")
    .replace("KUL", "")
    .trim();
  const terminal = normalized.match(/\bT\d\b/)?.[0] || "";
  const city = normalized.includes("香港") ? "香港"
    : normalized.includes("吉隆坡") ? "吉隆坡"
      : normalized.includes("深圳") ? "深圳"
        : normalized.includes("广州") ? "广州"
          : normalized.split(" ")[0] || normalized;
  return terminal ? `${city} ${terminal}` : city;
}

// v3 step 4b：sheet 3 档拖拽（list / half / map）
// - 从 handle 或 lede 拖：始终允许
// - 释放时：移动 > 30px 走方向 snap（上一档/下一档），否则就近 snap
// - 速度阈值：移动 > 60px 直接跳 2 档（map ↔ list）
export function attachItinSheetDrag(rootEl, onModeChange) {
  const sheet = rootEl.querySelector("#itin-sheet");
  if (!sheet) return;
  const screen = rootEl.querySelector(".itin-screen");

  function computeStops() {
    const containerH = (screen || rootEl).clientHeight || 824;
    const composerH =
      parseFloat(getComputedStyle(screen || rootEl).getPropertyValue("--composer-h")) || 162;
    return {
      list: containerH - 110 - composerH,
      half: containerH * 0.5 - composerH,
      rail: 156, // 横滑卡片行 ~156px
      map: 48,   // 仅 handle
    };
  }

  function nearestStop(h, stops) {
    let best = "half";
    let bestDist = Infinity;
    for (const k of ["list", "half", "rail", "map"]) {
      const d = Math.abs(h - stops[k]);
      if (d < bestDist) { bestDist = d; best = k; }
    }
    return best;
  }

  function adjacent(mode, dir) {
    const order = ["map", "rail", "half", "list"]; // 短 → 长
    const idx = Math.max(0, order.indexOf(mode));
    return order[Math.max(0, Math.min(order.length - 1, idx + dir))];
  }

  let startY = 0;
  let startH = 0;
  let dragging = false;
  let totalDelta = 0;
  let activePointerId = null;

  function isDragSurface(target) {
    return !!target.closest("[data-drag-handle], .itin-sheet__lede");
  }

  function onDown(e) {
    if (e.button && e.button !== 0) return;
    if (!isDragSurface(e.target)) return;
    e.preventDefault();
    dragging = true;
    activePointerId = e.pointerId ?? null;
    sheet.classList.add("is-dragging");
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startH = sheet.offsetHeight;
    totalDelta = 0;
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);
  }

  function onMove(e) {
    if (!dragging) return;
    if (e.pointerId != null && activePointerId != null && e.pointerId !== activePointerId) return;
    e.preventDefault();
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    totalDelta = y - startY;
    const stops = computeStops();
    const newH = Math.max(stops.map - 20, Math.min(stops.list + 40, startH - totalDelta));
    sheet.style.height = newH + "px";
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    activePointerId = null;
    sheet.classList.remove("is-dragging");
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointercancel", onUp);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onUp);

    const stops = computeStops();
    const finalH = sheet.offsetHeight;
    sheet.style.height = ""; // 取下 inline，让 CSS 模式接管

    let nextMode;
    if (Math.abs(totalDelta) > 60) {
      // 大幅滑动 → 跳 2 档（直接到边界）
      nextMode = totalDelta < 0 ? "list" : "map";
    } else if (Math.abs(totalDelta) > 30) {
      // 中等滑动 → 邻近档
      const startMode = nearestStop(startH, stops);
      nextMode = adjacent(startMode, totalDelta < 0 ? 1 : -1);
    } else {
      // 小幅 / 无移动 → 就近 snap
      nextMode = nearestStop(finalH, stops);
    }
    onModeChange(nextMode);
  }

  sheet.addEventListener("pointerdown", onDown);
  sheet.addEventListener("touchstart", onDown, { passive: false });
}

// ============================================================
// v3 step 4a：路线地图（抽象风格 — 网格 + 有机轮廓 + 蓝虚线 + 编号 pin + 区域水印）
// 移植自分支 chat-demo2-legacy/script.js: routeWaypointLabels / coordinateForWaypoint / renderRouteMap
// ============================================================

function renderRouteMap(plan, state) {
  const stops = routeMapStops(plan);
  const points = stops.map((s) => `${s.x},${s.y}`).join(" ");
  const offset = state.routeMapOffset || { x: 0, y: 0 };
  const zoom = state.routeMapZoom || 1;
  const transform = `transform: translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom});`;

  return `
    <div class="route-map-canvas" data-region="map">
      <div class="route-map-scene" style="${transform}">
        <span class="map-region region-gba">粤港澳大湾区</span>
        <span class="map-region region-sea">南海</span>
        <span class="map-region region-malaysia">马来西亚</span>
        <svg class="route-map-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="${points}" />
        </svg>
        ${stops
          .map(
            (s, i) => `
              <span class="route-map-pin pin-${i + 1}" style="--pin-x:${s.x}%; --pin-y:${s.y}%;">
                <i>${i + 1}</i><b>${escapeHtml(s.label)}</b>
              </span>
            `,
          )
          .join("")}
      </div>
      <div class="route-map-controls" aria-label="地图比例尺控制">
        <button type="button" data-action="route-map-zoom" data-zoom="in" aria-label="放大地图">+</button>
        <button type="button" data-action="route-map-zoom" data-zoom="out" aria-label="缩小地图">−</button>
        <button type="button" data-action="route-map-reset" aria-label="重置地图视野">
          <span aria-hidden="true"></span>
        </button>
      </div>
    </div>
  `;
}

function routeMapStops(plan) {
  const labels = routeWaypointLabels(plan);
  return labels.map((label, i) => ({
    label,
    ...coordinateForWaypoint(label, i, labels.length),
  }));
}

function routeWaypointLabels(plan) {
  const labels = [];
  const legs = plan.fullLegs || [];

  legs.forEach((seg) => {
    const parts = String(seg.route)
      .split("→")
      .map((item) => normalizeStopLabel(item.trim()))
      .filter(Boolean);

    if (parts.length >= 2) {
      if (!labels.length) labels.push(parts[0]);
      const dest = parts[parts.length - 1];
      if (labels[labels.length - 1] !== dest) labels.push(dest);
      return;
    }
    const arrival = normalizeStopLabel(seg.route.replace(/^到达/, ""));
    if (arrival && labels[labels.length - 1] !== arrival) labels.push(arrival);
  });

  if (labels.length > 1) return labels;
  // 兜底：用 routeMeta.mapPins
  return (plan.routeMeta?.mapPins || []).map(normalizeStopLabel);
}

function normalizeStopLabel(text) {
  // 把候机楼/车站/机场等"同城节点"全部归并到城市级，避免地图上多个 pin 叠在一起。
  return String(text || "")
    .replace(/东莞[^→]*?(金域名苑|南城CBD候机楼|南城候机楼|候机楼)/g, "东莞")
    .replace("东莞金域名苑", "东莞")
    .replace("虎门站", "虎门")
    .replace("虎门港澳客运码头", "虎门")
    .replace(/广州[^→]*?(南站|白云机场|白云国际机场|客运站)/g, "广州")
    .replace("广州南", "广州")
    .replace("广州白云", "广州")
    .replace(/深圳[^→]*?(宝安机场|宝安国际机场|宝安)/g, "深圳")
    .replace("香港国际机场", "香港")
    .replace("香港机场", "香港")
    .replace("吉隆坡国际机场", "吉隆坡")
    .replace("吉隆坡 KUL", "吉隆坡")
    .replace(/\bKUL\b/g, "")
    .replace("雪邦黄金海岸安凡尼度假酒店", "雪邦")
    .replace("雪邦黄金海岸安凡尼", "雪邦")
    .replace(/\s*T\d\b/g, "")
    .trim();
}

function coordinateForWaypoint(label, index, total) {
  const presets = [
    { match: "东莞", x: 22, y: 34 },
    { match: "虎门", x: 31, y: 35 },
    { match: "广州", x: 42, y: 30 },
    { match: "深圳", x: 46, y: 37 },
    { match: "香港", x: 52, y: 38 },
    { match: "吉隆坡", x: 72, y: 76 },
    { match: "雪邦", x: 61, y: 86 },
  ];
  const preset = presets.find((p) => label.includes(p.match));
  if (preset) return { x: preset.x, y: preset.y };

  const progress = total <= 1 ? 0.5 : index / (total - 1);
  return {
    x: 18 + progress * 66,
    y: 52 - Math.sin(progress * Math.PI) * 20 + Math.sin(progress * Math.PI * 2) * 7,
  };
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
