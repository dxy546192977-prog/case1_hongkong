import { ICON } from "../icons.js";

const ICON_VOICE = new URL("../../assets/icons/icon-voice.png", import.meta.url).href;
const ICON_CAMERA = new URL("../../assets/icons/icon-camera.png", import.meta.url).href;
const ICON_PLUS = new URL("../../assets/icons/icon-plus.png", import.meta.url).href;

const ITIN_CHIPS = [
  "大巴换成轮渡出行",
  "吉隆坡打车需要商务车",
  "想要下午起飞的航班",
  "酒店换成机场附近",
];

export function renderBottomComposer({
  suggestions = [],
  leadingShortcut = null,
  composer = {},
  ariaLabel = "智能建议",
} = {}) {
  const items = leadingShortcut ? [leadingShortcut, ...suggestions] : suggestions;
  const rail = items.length
    ? renderSuggestionRail({ items, docked: true, ariaLabel })
    : "";

  return `
    <div class="bottom-composer">
      ${rail}
      ${renderComposer(composer)}
    </div>
  `;
}

export function renderSuggestionRail({
  items = [],
  docked = false,
  inline = false,
  ariaLabel = "智能建议",
} = {}) {
  if (!items.length) return "";

  const className = [
    "smart-suggestions",
    docked ? "smart-suggestions--docked" : "",
    inline ? "smart-suggestions--inline" : "",
  ].filter(Boolean).join(" ");

  return `
    <div class="${className}" aria-label="${escapeAttr(ariaLabel)}">
      ${items.map(renderSuggestionChip).join("")}
    </div>
  `;
}

export function renderComposer({ placeholder = "发消息或者按住说话…", interactive = false, state = null, chips = false } = {}) {
  const draft = state?.composerDraft || "";
  const inputAttrs = interactive
    ? `data-action="focus-composer" value="${escapeAttr(draft)}"`
    : "";
  const showSend = interactive && state?.composerActive;
  const segPrefix =
    state?.screen === "itinerary" && state?.selectedSegmentId != null
      ? `行程${(parseInt(state.selectedSegmentId, 10) || 0) + 1}：`
      : "";

  const chipsRow = chips
    ? `<div class="composer__chips">
        ${ITIN_CHIPS.map((label) => renderSuggestionChip({ label })).join("")}
      </div>`
    : "";

  return `
    <div class="composer${state?.composerActive ? " composer--active" : ""}${chips ? " composer--with-chips" : ""}">
      ${chipsRow}
      <div class="composer__bar">
        ${showSend || segPrefix ? "" : `<button class="composer__icon composer__icon--img" aria-label="语音"><img src="${ICON_VOICE}" alt="" aria-hidden="true" /></button>`}
        ${segPrefix ? `<span class="composer__prefix">${segPrefix}</span>` : ""}
        <input class="composer__input" placeholder="${escapeAttr(segPrefix ? "发消息…" : placeholder)}" ${inputAttrs} />
        ${showSend
          ? `<button class="composer__send" data-action="send-modification" aria-label="发送">${ICON.send(16)}</button>`
          : `<button class="composer__icon composer__icon--img" aria-label="相机"><img src="${ICON_CAMERA}" alt="" aria-hidden="true" /></button>
             <button class="composer__icon composer__icon--img" aria-label="更多"><img src="${ICON_PLUS}" alt="" aria-hidden="true" /></button>`}
      </div>
      <p class="composer__disclaimer">内容由 AI 生成</p>
    </div>
  `;
}

function renderSuggestionChip(item) {
  const normalized = typeof item === "string" ? { label: item } : item;
  const label = normalized.label || "";
  const action = normalized.action || "suggest-chip";
  const dataAttrs = Object.entries(normalized.data || {})
    .map(([key, value]) => `data-${toKebab(key)}="${escapeAttr(value)}"`)
    .join(" ");
  const icon = normalized.trailingIcon === "chevron"
    ? `<span class="smart-suggestion-chip__icon" aria-hidden="true">${ICON.chevronRight(14)}</span>`
    : "";
  const className = [
    "smart-suggestion-chip",
    icon ? "smart-suggestion-chip--with-icon" : "",
  ].filter(Boolean).join(" ");

  return `<button class="${className}" data-action="${escapeAttr(action)}" data-text="${escapeAttr(label)}" ${dataAttrs}>
    <span>${escapeHtml(label)}</span>${icon}
  </button>`;
}

function toKebab(value) {
  return String(value).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
