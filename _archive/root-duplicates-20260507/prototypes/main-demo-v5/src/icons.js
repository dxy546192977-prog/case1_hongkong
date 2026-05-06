// Lucide icons (https://lucide.dev), MIT license, inlined as SVG strings.
// 每个 icon 的 size 由 `width`/`height` 属性默认 24px，stroke-width 1.6 适合中性界面。
// 用法：import { ICON } from './icons.js'; element.innerHTML = ICON.menu;

const SVG_BASE = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;

function svg(size, path) {
  return `<svg width="${size}" height="${size}" ${SVG_BASE}>${path}</svg>`;
}

export const ICON = {
  // appbar
  menu: (s = 22) =>
    svg(s, `<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="14" y1="18" y2="18"/>`),
  more: (s = 22) =>
    svg(s, `<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>`),
  back: (s = 22) =>
    svg(s, `<path d="m15 18-6-6 6-6"/>`),
  chevronDown: (s = 20) =>
    svg(s, `<path d="m6 9 6 6 6-6"/>`),
  chevronRight: (s = 16) =>
    svg(s, `<path d="m9 18 6-6-6-6"/>`),
  x: (s = 18) =>
    svg(s, `<path d="M18 6 6 18M6 6l12 12"/>`),
  check: (s = 14) =>
    `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  pencil: (s = 18) =>
    svg(s, `<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>`),
  plus: (s = 18) =>
    svg(s, `<path d="M12 5v14M5 12h14"/>`),

  // composer
  mic: (s = 18) =>
    svg(s, `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>`),
  camera: (s = 18) =>
    svg(s, `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>`),
  send: (s = 16) =>
    svg(s, `<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>`),

  // travel modes (大/小/自由 区分)
  plane: (s = 16) =>
    svg(s, `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>`),
  ship: (s = 16) =>
    svg(s, `<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/>`),
  car: (s = 16) =>
    svg(s, `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>`),
  walk: (s = 16) =>
    svg(s, `<circle cx="13" cy="4" r="2"/><path d="M15 22V14l-4-3 1-5"/><path d="M8 13l-2 4 2 5"/><path d="M11 9l4-3 4 1"/>`),

  // status
  zap: (s = 14) =>
    svg(s, `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`),
  flag: (s = 14) =>
    svg(s, `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>`),
  notebook: (s = 18) =>
    svg(s, `<path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/>`),

  // perks
  delay: (s = 20) =>
    svg(s, `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M16 3l2 2-2 2"/>`),
  navigate: (s = 20) =>
    svg(s, `<polygon points="12 2 19 21 12 17 5 21 12 2"/>`),
  taxi: (s = 20) =>
    svg(s, `<path d="M5 11l1.5-4.5h11L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7" cy="17" r="1.4"/><circle cx="17" cy="17" r="1.4"/><path d="M9 4h6"/>`),
  shield: (s = 20) =>
    svg(s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`),
  gift: (s = 20) =>
    svg(s, `<rect width="20" height="14" x="2" y="8" rx="1"/><path d="M2 12h20M12 8v14"/><path d="M7.5 8a3 3 0 0 1 0-6c2 0 4.5 6 4.5 6"/><path d="M16.5 8a3 3 0 0 0 0-6c-2 0-4.5 6-4.5 6"/>`),
};
