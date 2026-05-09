// Chat screen: greeting + 3 全文问句 + 多轮 Q&A + 4-icon composer.
// 渲染会话流。每个 conversation item 一个 renderer。

import { homeSamples, intakeQuestions, plans } from "../data-source.js";
import { renderPlanCarousel } from "./plan-cards.js";
import { ICON } from "../icons.js";
import { renderComposer, renderSuggestionRail } from "./bottom-composer.js";

export { renderBottomComposer, renderComposer, renderSuggestionRail } from "./bottom-composer.js";

export function renderChat(state) {
  return `
    <header class="appbar">
      <button class="appbar__icon" aria-label="菜单">${ICON.menu(22)}</button>
      <div class="appbar__title">出行助手</div>
      <button class="appbar__icon" aria-label="更多">${ICON.more(22)}</button>
    </header>

    <div class="feed" id="feed">
      ${state.conversation.map((item) => renderItem(item, state)).join("")}
    </div>

    ${renderChatSmartSuggestions(state)}
    ${renderComposer()}
  `;
}

// v3 step B·②：Q&A 阶段底部浮动智能建议（让用户感知"可以这么问"）
// chat 屏 composer 是普通流，需要 chip 行也走普通流（覆盖默认 absolute）
function renderChatSmartSuggestions(state) {
  const hasPlans = state.conversation.some((m) => m.type === "plans");
  const hasQa = state.conversation.some((m) => m.type === "qa" || m.type === "user");
  if (hasPlans || !hasQa) return "";
  const list = ["想去性价比最高", "希望中转少一点", "想要早班机出发"];
  return renderSuggestionRail({ items: list, inline: true });
}

function renderItem(item, state) {
  if (item.type === "greeting") {
    return `
      <div class="greeting">
        <h1>HI. 今天想去哪儿呢？</h1>
        <p>把这趟出行说清楚，剩下的我来安排。</p>
      </div>
      <div class="qchips">
        ${homeSamples
          .map(
            (s) => `<button class="qchip" data-action="start-intake" data-text="${escapeAttr(s)}">${s}</button>`,
          )
          .join("")}
      </div>
    `;
  }
  if (item.type === "user") {
    const tone = item.tone === "soft" ? "user-soft" : "user-solid";
    return `<div class="bubble bubble--${tone}">${item.text}</div>`;
  }
  if (item.type === "assistant") {
    return `<div class="bubble bubble--assistant">${item.text}</div>`;
  }
  if (item.type === "qa") {
    return renderQa(item, state);
  }
  if (item.type === "thinking") {
    return `<div class="thinking">正在思考</div>`;
  }
  if (item.type === "plans-intro") {
    return `<div class="plans-intro">${item.text}</div>`;
  }
  if (item.type === "plans") {
    return renderPlanCarousel(plans);
  }
  return "";
}

function renderQa(item, state) {
  const q = intakeQuestions.find((x) => x.id === item.qid);
  if (!q) return "";
  const answered = item.answered || state.intakeAnswers[q.id];
  return `
    <div class="qa-block">
      <div class="qa-block__prompt">${q.prompt}</div>
      ${q.hint ? `<div class="qa-block__hint">${q.hint}</div>` : ""}
      <div class="qa-options">
        ${q.options
          .map((o) => {
            const dim = answered && answered !== o.id;
            const cls = "qa-option" + (dim ? " is-disabled" : "");
            const subHtml = o.sub
              ? `<span class="qa-option__sub">${o.sub}</span>`
              : "";
            return `<button class="${cls}" data-action="answer-intake" data-qid="${q.id}" data-opt="${o.id}">
              <span class="qa-option__label">${o.label}</span>${subHtml}
            </button>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}
