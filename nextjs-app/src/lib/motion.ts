/**
 * 视觉过渡工具。只处理动画，不持有状态。
 * CSS 已经覆盖了 sheet 上下推、按钮按下；这里负责 toast 和 screen 切换的淡入。
 */

export function flashToast(rootEl: HTMLElement, text: string): void {
  const element = rootEl.querySelector<HTMLElement>("#toast");
  if (!element) return;
  element.textContent = text;
  element.dataset.show = "true";
}

export function hideToast(rootEl: HTMLElement): void {
  const element = rootEl.querySelector<HTMLElement>("#toast");
  if (element) element.dataset.show = "false";
}

const SCREEN_CLASS = "screen-enter";
let lastScreen: string | null = null;

export function markScreenChange(frameEl: HTMLElement, screen: string): void {
  if (screen === lastScreen) return;
  lastScreen = screen;
  frameEl.classList.remove(SCREEN_CLASS);
  void frameEl.offsetWidth;
  frameEl.classList.add(SCREEN_CLASS);
}
