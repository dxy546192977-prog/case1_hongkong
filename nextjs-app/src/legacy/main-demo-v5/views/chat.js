// Chat screen: greeting + 3 全文问句 + 多轮 Q&A + 4-icon composer.
// 渲染会话流。每个 conversation item 一个 renderer。

import { homeSamples, intakeQuestions, plans } from "../data.js";
import { renderPlanCarousel } from "./plan-cards.js";
import { ICON } from "../icons.js";

// composer 三个图标的 URL：基于 chat.js 自身位置解析，避免被宿主页 URL 影响。
// 这样无论入口是 /case1_hongkong/.../index.html 还是 /正向支付链路.html，路径都正确。
const ICON_VOICE = new URL("../../assets/icons/icon-voice.png", import.meta.url).href;
const ICON_CAMERA = new URL("../../assets/icons/icon-camera.png", import.meta.url).href;
const ICON_PLUS = new URL("../../assets/icons/icon-plus.png", import.meta.url).href;

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
  return `
    <div class="smart-suggestions smart-suggestions--inline" aria-label="智能建议">
      ${list
        .map((label) => `<button class="smart-suggestion-chip" data-action="suggest-chip" data-text="${label}">${label}</button>`)
        .join("")}
    </div>
  `;
}

// 推荐修改 chips：在 itinerary 屏作为 composer 的前置 row 渲染。
// 跟 composer 同 bg、同容器，没有独立 bar 视觉。
const ITIN_CHIPS = [
  "大巴换成轮渡出行",
  "吉隆坡打车需要商务车",
  "想要下午至晚上的航班",
  "酒店换成机场附近",
];

export function renderComposer({ placeholder = "发消息或者按住说话…", interactive = false, state = null, chips = false } = {}) {
  const draft = state?.composerDraft || "";
  const inputAttrs = interactive
    ? `data-action="focus-composer" value="${draft.replace(/"/g, "&quot;")}"`
    : "";
  const showSend = interactive && state?.composerActive;
  // v3 step 4d：在 itinerary 屏 + 选中段时，输入框前置「行程N：」上下文（无需聚焦）
  const segPrefix =
    state?.screen === "itinerary" && state?.selectedSegmentId != null
      ? `行程${(parseInt(state.selectedSegmentId, 10) || 0) + 1}：`
      : "";

  const chipsRow = chips
    ? `<div class="composer__chips">
        ${ITIN_CHIPS.map((c) => `<button class="chip" data-action="suggest-chip" data-text="${c}">${c}</button>`).join("")}
      </div>`
    : "";

  return `
    <div class="composer${state?.composerActive ? " composer--active" : ""}${chips ? " composer--with-chips" : ""}">
      ${chipsRow}
      <div class="composer__bar">
        ${showSend || segPrefix ? "" : `<button class="composer__icon composer__icon--img" aria-label="语音"><img src="${ICON_VOICE}" alt="" aria-hidden="true" /></button>`}
        ${segPrefix ? `<span class="composer__prefix">${segPrefix}</span>` : ""}
        <input class="composer__input" placeholder="${segPrefix ? "发消息…" : placeholder}" ${inputAttrs} />
        ${showSend
          ? `<button class="composer__send" data-action="send-modification" aria-label="发送">${ICON.send(16)}</button>`
          : `<button class="composer__icon composer__icon--img" aria-label="相机"><img src="${ICON_CAMERA}" alt="" aria-hidden="true" /></button>
             <button class="composer__icon composer__icon--img" aria-label="更多"><img src="${ICON_PLUS}" alt="" aria-hidden="true" /></button>`}
      </div>
      <p class="composer__disclaimer">内容由 AI 生成</p>
    </div>
  `;
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
