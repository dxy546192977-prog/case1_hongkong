// ============================================================
// 香港机场中转 · 折叠卡（trip 屏内的「中转提示」hero 卡）
// ------------------------------------------------------------
// 这是一个独立可复用的模块，主项目（trip-detail.js）和独立预览页
// （standalone/子效果_H5折叠卡.html）都从这里 import，保证两边表现
// 完全一致 —— 改这里就两边都改。
//
// 提供：
//   - renderTransitCard(d, transit)  折叠卡 HTML（按钮形态，可点击展开）
//   - renderTransitTripScreen(d, transit, opts)  折叠卡所在的整屏布局
//     （顶部 appbar + lead + 标题 + 折叠卡），不包含 myTrips 控件 / composer
//
// 依赖：
//   - ICON  ../icons.js
//   - transit-helpers.js（时间档位、连续路径、柜台/倒计时/异常块）
// ============================================================

import { ICON } from "../icons.js";
import { getTimeTier } from "./transit-helpers.js";

function escapeHtmlLite(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitRoute(route) {
  return String(route || "")
    .split(/\s*(?:→|->)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickPrimaryTask(transit) {
  const tasks = Array.isArray(transit?.tasks) ? transit.tasks : [];
  if (!tasks.length) return null;
  const priority = ["stroller", "security", "counter", "fast", "arrive", "boarding"];
  for (const id of priority) {
    const found = tasks.find((t) => t?.id === id);
    if (found) return found;
  }
  return tasks[0] || null;
}

function pickService(transit, matcher) {
  const services = Array.isArray(transit?.services) ? transit.services : [];
  return services.find((s) => matcher(`${s?.id || ""} ${s?.title || ""} ${s?.sub || ""} ${s?.note || ""}`)) || null;
}

function getTierLabel(transit) {
  if (transit?.layoverFeel) return transit.layoverFeel;
  const tier = getTimeTier(transit);
  if (tier === "tight") return "紧张";
  if (tier === "balanced") return "正常";
  return "充裕";
}

function buildTransitHints(transit) {
  const primaryTask = pickPrimaryTask(transit);
  const primaryRoute = splitRoute(primaryTask?.route);
  const primaryTarget = primaryRoute[primaryRoute.length - 1] || "下一节点";
  const primaryTitle = `优先前往${primaryTarget}`;
  const primaryTip = [primaryTask?.duration ? `预计${primaryTask.duration}` : "", primaryTask?.reason || ""]
    .filter(Boolean)
    .join("，") || "按中转动线前进，系统会持续给你路径提醒。";

  const nursery = pickService(transit, (txt) => /(育婴|哺乳|温奶|nursery)/i.test(txt));
  const calm = pickService(transit, (txt) => /(感官|安静|休息|calm|sensory|lounge|贵宾室)/i.test(txt));

  const rows = [
    { title: "提供婴儿车租借", tip: primaryTip },
    {
      title: nursery ? "可途径育婴室" : "顺路照护点",
      tip: nursery
        ? `${nursery.note || "如需换尿布或温奶，可先停留后再继续前往安检。"}`
        : "按当前位置推荐顺路照护点，少绕路更省心。",
    },
    {
      title: calm ? "途径安静休息点" : "顺路补给点",
      tip: calm
        ? `${calm.sub || "按当前位置就近推荐"}，${calm.note || "需要缓一缓时可先短暂停留。"}`
        : "按登机口方向推荐补给和休息点，减少来回折返。",
    },
  ];

  const hintRows = rows
    .map(
      (row) => `
      <div class="transit-card__hint-row">
        <span class="transit-card__hint-icon" aria-hidden="true">${ICON.check(14)}</span>
        <div class="transit-card__hint-body">
          <p class="transit-card__hint-title">${escapeHtmlLite(row.title)}</p>
          <p class="transit-card__hint-tip">${escapeHtmlLite(row.tip)}</p>
        </div>
      </div>`,
    )
    .join("");

  const statusLine = `中转状态：${getTierLabel(transit)}，当前建议优先前往${primaryTarget}。`;
  return { hintRows, statusLine };
}

// 折叠卡本体：按钮形态，点击 data-action="expand-trip-card" 触发展开
//
// persona 可选，独立预览壳传入（"default" / "family" / "business"）；
// 主项目暂不传，则走默认主题（与改造前外观一致）。
export function renderTransitCard(d, transit, persona) {
  const personaAttr = persona ? ` data-persona="${persona}"` : "";
  const { hintRows } = buildTransitHints(transit);

  return `
    <button class="transit-card transit-card--collapsed"${personaAttr} data-action="expand-trip-card" aria-label="展开机场中转详情">
      <h2 class="transit-card__headline">途径 香港国际机场</h2>
      <p class="transit-card__meta">${transit.flightArrive} 抵达 · ${transit.flightDepart} 起飞 · 中转 ${transit.layoverText} · ${getTierLabel(transit)}</p>

      <div class="transit-card__hint-stack" aria-label="中转关键信息">
        ${hintRows}
      </div>

      <span class="transit-card__detail-cta">查看详情</span>
    </button>
  `;
}

// 折叠卡所在的整屏布局（trip 屏的中转分支）
// 不包含 myTrips 控件 / composer —— 那两个由 trip-detail 在外层拼接，
// 让本模块可以被独立预览页直接渲染（独立预览不需要 chat 上下文）。
export function renderTransitTripScreen(d, transit) {
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

        ${renderTransitCard(d, transit)}
      </div>
    </div>
  `;
}
