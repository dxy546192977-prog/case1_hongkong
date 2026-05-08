// ============================================================
// 独立预览页共享外壳（standalone shell）
// ------------------------------------------------------------
// 作用：让两个 standalone HTML 与主 index.html 的真机外壳像素一致。
//   - 沿用主 index 的 .stage / .device / .app / .notch / .statusbar
//     / .app-frame / .sheet-root / .toast 结构
//   - 沿用主 index 的右下圆形 dock（演示阶段定位 + 独立预览跳转）
//   - 顶部加一条"独立预览"小横条，提示当前在哪个壳
//
// 改这个文件 = 两个 standalone 同步生效。
// 改主 index.html 的外壳/dock 后，请同步把差异 patch 到这里。
// ============================================================

// 主 index.html 同款的真机外壳结构（注意：不要改 class 名，base.css 依赖这些 class）
const SHELL_HTML = `
  <div class="stage">
    <div class="device" role="presentation">
      <div class="app" id="app">
        <div class="notch" aria-hidden="true"></div>
        <div class="statusbar" aria-hidden="true">
          <span>9:41</span>
          <span class="right">5G · 100%</span>
        </div>
        <div class="app-frame" id="frame"></div>
        <div class="sheet-root" id="sheet-root" data-open="false">
          <div class="sheet-dim" data-action="close-sheet"></div>
          <div class="sheet" id="sheet"></div>
        </div>
        <div class="toast" id="toast" data-show="false"></div>
      </div>
    </div>
  </div>
`;

// 主 index.html 同款的右下圆形 dock（仅保留与本仓库其他独立预览页跳转有关的入口）
// 这里去掉了主项目里 chat / plans / itinerary 等业务跳转项，只保留：
//   - 主 index（回主舞台）
//   - 折叠卡（独立页）
//   - 中转管家（独立页）
const DOCK_HTML = `
  <style id="demo-stage-dock-style">
    .demo-stage-dock-root { position: fixed; right: max(14px, env(safe-area-inset-right, 0px)); bottom: max(14px, env(safe-area-inset-bottom, 0px)); z-index: 100000; font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
    .demo-stage-dock-fab { width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; background: #000; box-shadow: 0 6px 20px rgba(15, 19, 26, 0.35); transition: all 0.2s ease; }
    .demo-stage-dock-fab:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(15, 19, 26, 0.45); }
    .demo-stage-dock-fab:active { transform: scale(0.96); }
    .demo-stage-dock-fab svg { width: 24px; height: 24px; fill: #fff; }
    .demo-stage-dock-panel { display: none; position: absolute; right: 0; bottom: 60px; flex-direction: column; gap: 4px; min-width: 220px; max-height: 70vh; overflow-y: auto; padding: 12px; background: rgba(15, 19, 26, 0.96); border-radius: 20px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.32); backdrop-filter: blur(12px); }
    .demo-stage-dock-root.open .demo-stage-dock-panel { display: flex; }
    .demo-stage-dock-group-label { padding: 8px 10px 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; }
    .demo-stage-dock-group-label:not(:first-child) { margin-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 10px; }
    .demo-stage-dock-item { display: flex; align-items: center; gap: 12px; width: 100%; margin: 0; padding: 10px 12px; border: 0; border-radius: 10px; text-align: left; font-size: 13px; line-height: 1.4; color: #e8eaf0; background: rgba(255, 255, 255, 0.04); cursor: pointer; transition: all 0.15s ease; text-decoration: none; }
    .demo-stage-dock-item:hover { background: rgba(255, 255, 255, 0.1); transform: translateX(-2px); }
    .demo-stage-dock-item svg { width: 18px; height: 18px; fill: currentColor; opacity: 0.85; flex-shrink: 0; }
    .demo-stage-dock-item:hover svg { opacity: 1; }
    .demo-stage-dock-item[aria-current="page"] { background: rgba(255, 255, 255, 0.18); }
    .demo-stage-dock-panel::-webkit-scrollbar { width: 4px; }
    .demo-stage-dock-panel::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 4px; }
  </style>
  <div id="demoStageDockRoot" class="demo-stage-dock-root">
    <button type="button" class="demo-stage-dock-fab" id="demoStageDockFab" aria-haspopup="true" aria-expanded="false" aria-controls="demoStageDockPanel" title="演示阶段定位">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#ffffff" d="M12 14.5a2.5 2.5 0 1 1 2.5-2.5a2.5 2.5 0 0 1-2.5 2.5m0-4a1.5 1.5 0 1 0 1.5 1.5a1.5 1.5 0 0 0-1.5-1.5"/><path fill="#ffffff" d="M21.435 11.505h-1.46a7.98 7.98 0 0 0-7.48-7.48v-1.46a.51.51 0 0 0-.5-.5a.515.515 0 0 0-.5.5v1.46a8 8 0 0 0-7.48 7.48h-1.45a.5.5 0 1 0 0 1h1.45a8.01 8.01 0 0 0 7.48 7.48v1.45a.51.51 0 0 0 .5.5a.5.5 0 0 0 .5-.5v-1.45a8 8 0 0 0 7.48-7.48h1.46a.5.5 0 0 0 0-1M12 19.005a7 7 0 1 1 7-7a7.02 7.02 0 0 1-7 7"/></svg>
    </button>
    <div class="demo-stage-dock-panel" id="demoStageDockPanel" role="menu" aria-label="独立预览跳转">
      <div class="demo-stage-dock-group-label">独立预览 · 亲子人群</div>
      <a class="demo-stage-dock-item" role="menuitem" data-shell-link="card-kids" href="./子效果_H5折叠卡.html">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 22q-.825 0-1.412-.587T1 20v-3q0-.825.588-1.412T3 15h2v-3q0-.825.588-1.412T7 10h2v3.05q-1.075.275-1.787 1.075T6.5 16v6zm5 0v-6q0-.625.438-1.062T9.5 14.5h3q.625 0 1.063.438T14 16v6zm7 0v-6q0-1.075-.712-1.875T12.5 13.05V10h2q.825 0 1.413.588T16.5 12v3h2q.825 0 1.413.588T20.5 17v3q0 .825-.587 1.413T18.5 22zM4 8q-.825 0-1.412-.587T2 6t.588-1.412T4 4t1.413.588T6 6t-.587 1.413T4 8m16 0q-.825 0-1.412-.587T18 6t.588-1.412T20 4t1.413.588T22 6t-.587 1.413T20 8m-9-1q-.825 0-1.412-.587T9 5t.588-1.412T11 3t1.413.588T13 5t-.587 1.413T11 7"/></svg>
        <span>折叠卡（亲子）</span>
      </a>
      <a class="demo-stage-dock-item" role="menuitem" data-shell-link="assistant-kids" href="./子效果_H5沉浸式_亲子人群.html">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 14v-2.65q0-2.5-1.062-4.575T16.95 3.45q-.45-.275-.95-.038t-.5.713V11H6.05q-.475 0-.812.275t-.413.7q-.275 1.4.063 2.738t1.087 2.412t1.85 1.788t2.4.987L8.4 22h2.4l1.7-2H17q1.65 0 2.825-1.175T21 17q0-.625-.187-1.213T20.25 14.7q.375-.225.563-.6T21 14M6.5 20q-.625 0-1.062-.437T5 18.5t.438-1.062T6.5 17t1.063.438T8 18.5t-.437 1.063T6.5 20m10-2H10q-1.625 0-2.962-.95T5.225 14.55l-.025-.05H17q.625 0 1.063.438T18.5 16t-.437 1.063T17 17.5z"/></svg>
        <span>沉浸式H5（亲子）</span>
      </a>

      <div class="demo-stage-dock-group-label">回到主舞台</div>
      <a class="demo-stage-dock-item" role="menuitem" href="../index.html">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h3v-5q0-.425.288-.712T10 13h4q.425 0 .713.288T15 14v5h3v-9l-6-4.5L6 10zm-2 0v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.587 1.413T18 21h-4q-.425 0-.712-.288T13 20v-5h-2v5q0 .425-.288.713T10 21H6q-.825 0-1.412-.587T4 19"/></svg>
        <span>主 index（完整 demo）</span>
      </a>
    </div>
  </div>
`;

// 顶部细横条：提示当前在哪个 standalone 壳，并指出"改哪个文件能两边同步"
const BANNER_CSS = `
  .standalone-banner {
    position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
    padding: 6px 14px; background: rgba(20, 20, 24, 0.88); color: #fff;
    font-size: 12px; border-radius: 999px;
    font-family: -apple-system, "PingFang SC", sans-serif;
    backdrop-filter: blur(12px); z-index: 999;
    max-width: calc(100vw - 24px);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .standalone-banner code { color: #ffd166; font-family: ui-monospace, monospace; }
`;

// ------------------------------------------------------------
// mount(opts)：把外壳 + dock + banner 注入页面，并返回 #frame DOM
//   opts.bannerHtml  顶部 banner 的 HTML（必填，提示用户改哪个文件）
//   opts.activeKey   高亮 dock 中的哪一项（"card" | "assistant"）
// ------------------------------------------------------------
export function mountShell({ bannerHtml = "", activeKey = "" } = {}) {
  // 注入 banner CSS
  const style = document.createElement("style");
  style.textContent = BANNER_CSS;
  document.head.appendChild(style);

  // 注入顶部 banner
  if (bannerHtml) {
    const banner = document.createElement("div");
    banner.className = "standalone-banner";
    banner.innerHTML = bannerHtml;
    document.body.appendChild(banner);
  }

  // 注入真机外壳 + dock
  document.body.insertAdjacentHTML("beforeend", SHELL_HTML);
  document.body.insertAdjacentHTML("beforeend", DOCK_HTML);

  // dock 行为（与主 index.html 同款）
  const root = document.getElementById("demoStageDockRoot");
  const fab = document.getElementById("demoStageDockFab");
  const panel = document.getElementById("demoStageDockPanel");
  if (root && fab && panel) {
    const setOpen = (open) => {
      root.classList.toggle("open", open);
      fab.setAttribute("aria-expanded", open ? "true" : "false");
    };
    fab.addEventListener("click", (e) => { e.stopPropagation(); setOpen(!root.classList.contains("open")); });
    document.addEventListener("click", () => setOpen(false));
    root.addEventListener("click", (e) => e.stopPropagation());

    // 高亮当前页对应的项
    if (activeKey) {
      const cur = panel.querySelector(`[data-shell-link="${activeKey}"]`);
      if (cur) cur.setAttribute("aria-current", "page");
    }
  }

  return document.getElementById("frame");
}
