// 视觉过渡。只处理动画，不持有状态。CSS 已经覆盖了 sheet 上下推、按钮按下；
// 这里负责 toast 的开关与 screen 切换的淡入。

export function flashToast(rootEl, text) {
  const el = rootEl.querySelector("#toast");
  if (!el) return;
  el.textContent = text;
  el.dataset.show = "true";
}

export function hideToast(rootEl) {
  const el = rootEl.querySelector("#toast");
  if (el) el.dataset.show = "false";
}

// 页面级切换：给 frame 容器加一个轻量 fade-up 类，CSS 兜底
const SCREEN_CLASS = "screen-enter";
let lastScreen = null;
export function markScreenChange(frameEl, screen) {
  if (screen === lastScreen) return;
  lastScreen = screen;
  frameEl.classList.remove(SCREEN_CLASS);
  // 触发回流后再加，确保动画播放
  void frameEl.offsetWidth;
  frameEl.classList.add(SCREEN_CLASS);
}
