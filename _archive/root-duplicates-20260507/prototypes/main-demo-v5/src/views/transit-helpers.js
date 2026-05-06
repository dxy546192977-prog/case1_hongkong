// 中转管家共用：时间档位、连续路径与信息块渲染（折叠卡 + 全屏 sheet）
import { ICON } from "../icons.js";

/** 路径分隔箭头图标（CDN SVG，48 逻辑像素资源；展示尺寸由 CSS .route-arrow-ico 控制） */
export const ROUTE_ARROW_ICON_URL =
  "https://gw.alicdn.com/imgextra/i3/O1CN013CtYg7272WI8z5BaY_!!6000000007739-55-tps-22-8.svg";

function escapeHtmlLite(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Unicode / ASCII 箭头拆分（与数据里「→」「->」一致） */
const ROUTE_ARROW_SPLIT = /\s*(?:→|->)\s*/;

/** 行内箭头 `<img>`，供 tc-route / 卡片路径使用 */
export function routeArrowImgHtml() {
  return `<img class="route-arrow-ico" src="${ROUTE_ARROW_ICON_URL}" alt="" decoding="async" draggable="false" />`;
}

/**
 * 将「A → B → C」文案转为 HTML：段转义后用箭头图标连接（用于步骤标题、横滑卡等）
 * @param {string} routePlain
 */
export function renderRouteWithArrowIcons(routePlain) {
  const raw = String(routePlain ?? "").trim();
  if (!raw) return "";
  const parts = raw.split(ROUTE_ARROW_SPLIT).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return escapeHtmlLite(parts[0]);
  const sep = `<span class="route-arrow-wrap" aria-hidden="true">${routeArrowImgHtml()}</span>`;
  return parts.map((p) => escapeHtmlLite(p)).join(sep);
}

export function getTimeTier(transit) {
  if (transit.timeTier) return transit.timeTier;
  const f = transit.layoverFeel;
  if (f === "紧张") return "tight";
  if (f === "充裕") return "ample";
  return "normal";
}

export function timeTierChipLabel(tier) {
  if (tier === "tight") return "时间紧张";
  if (tier === "ample") return "时间充裕";
  return "正常中转";
}

export function timeTierFeelClass(tier) {
  if (tier === "tight") return "warn";
  if (tier === "ample") return "ok";
  return "normal";
}

/** @param transit {object} @param opts {{ compact?: boolean }} */
export function renderRouteChain(transit, opts = {}) {
  const segments = transit.routeChain;
  if (!segments?.length) return "";
  if (opts.compact) {
    const chunks = segments.map((seg) =>
      escapeHtmlLite(seg.sub ? `${seg.label}（${seg.sub}）` : seg.label),
    );
    const sep = `<span class="route-arrow-wrap" aria-hidden="true">${routeArrowImgHtml()}</span>`;
    const html = chunks.join(sep);
    return `<p class="transit-card__path-inline" aria-label="安检与登机口连续路径">${html}</p>`;
  }
  const segs = segments.map((seg) => {
    const tone =
      seg.tone === "skip"
        ? " tc-route__seg--skip"
        : seg.tone === "apm"
          ? " tc-route__seg--apm"
          : "";
    const sub = seg.sub
      ? `<span class="tc-route__seg-sub">${escapeHtmlLite(seg.sub)}</span>`
      : "";
    return `<span class="tc-route__seg${tone}"><span class="tc-route__seg-label">${escapeHtmlLite(seg.label)}</span>${sub}</span>`;
  });
  let out = "";
  segs.forEach((html, i) => {
    out +=
      (i
        ? `<span class="tc-route__arr route-arrow-wrap" aria-hidden="true">${routeArrowImgHtml()}</span>`
        : "") + html;
  });
  return `<div class="tc-route" aria-label="安检与登机口连续路径"><div class="tc-route__track">${out}</div></div>`;
}

export function renderCounterGuidanceBlock(transit, variant) {
  const c = transit.counterGuidance;
  if (!c) return "";
  const tag = c.needCounter ? "需中转柜台" : "免中转柜台";
  if (variant === "card-compact") {
    return `
    <div class="transit-card__counter-inline" aria-label="中转柜台导览">
      <span class="transit-card__counter-tag" data-need="${c.needCounter ? "yes" : "no"}">${tag}</span>
      ${c.airlineLine ? `<span class="transit-card__counter-inline-airline">${c.airlineLine}</span>` : ""}
      ${c.nextStep ? `<p class="transit-card__counter-inline-next">${c.nextStep}</p>` : ""}
    </div>`;
  }
  const card = variant === "card";
  return `
    <div class="${card ? "transit-card__counter" : "ta-counter"}">
      <div class="${card ? "transit-card__counter-head" : "ta-counter__head"}">
        <span class="${card ? "transit-card__counter-tag" : "ta-counter__tag"}" data-need="${c.needCounter ? "yes" : "no"}">${tag}</span>
      </div>
      ${c.airlineLine ? `<p class="${card ? "transit-card__counter-airline" : "ta-counter__airline"}">${c.airlineLine}</p>` : ""}
      ${c.summary ? `<p class="${card ? "transit-card__counter-sum" : "ta-counter__sum"}">${c.summary}</p>` : ""}
      ${c.nextStep ? `<p class="${card ? "transit-card__counter-next" : "ta-counter__next"}">${c.nextStep}</p>` : ""}
    </div>`;
}

export function renderBoardingCountdownBlock(transit, variant) {
  const bc = transit.boardingCountdown;
  if (!bc) return "";
  const minPart =
    bc.minutesToBoarding != null
      ? `约 ${bc.minutesToBoarding} 分钟后开始登机`
      : bc.boardingLabel || "";
  const title =
    bc.phaseLabel && minPart ? `${bc.phaseLabel} · ${minPart}` : `登机倒计时 · ${minPart}`;
  if (variant === "card-compact") {
    return `
    <p class="transit-card__cd-inline" aria-label="登机倒计时">
      <span class="transit-card__cd-inline-ico" aria-hidden="true">${ICON.clock(14)}</span>
      <span class="transit-card__cd-inline-tx">${title}</span>
    </p>`;
  }
  const card = variant === "card";
  const root = card ? "transit-card__cd" : "ta-cd";
  return `
    <div class="${root}">
      <span class="${root}-icon" aria-hidden="true">${ICON.clock(16)}</span>
      <div class="${root}-body">
        <p class="${root}-title">${title}</p>
        ${bc.strategyGuide ? `<p class="${root}-strat">${bc.strategyGuide}</p>` : ""}
      </div>
    </div>`;
}

export function renderAnomaliesBlock(transit, variant) {
  const items = transit.anomalies;
  if (!items?.length) return "";
  if (variant === "card-compact") {
    const text = items.map((a) => a.title).join(" · ");
    return `<p class="transit-card__anomaly-inline" aria-label="重要提醒">${text}</p>`;
  }
  const card = variant === "card";
  const list = card ? "transit-card__alerts" : "ta-alerts";
  return `
    <div class="${list}" role="list" aria-label="异常与重要提醒">
      ${items
        .map((a) => {
          const lv = a.level || "info";
          const icon = lv === "warn" ? ICON.alert(14) : ICON.info(14);
          return `
        <div class="${list}-item ${list}-item--${lv}" role="listitem">
          <span class="${list}-ico" aria-hidden="true">${icon}</span>
          <div class="${list}-body">
            <p class="${list}-ti">${a.title}</p>
            <p class="${list}-tx">${a.detail}</p>
          </div>
        </div>`;
        })
        .join("")}
    </div>`;
}
