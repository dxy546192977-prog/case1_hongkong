"use client";

/**
 * DeviceShell — 模拟手机设备外壳。
 * 包含 notch、statusbar、app-frame、sheet-root 和 toast。
 * 对应原 HTML 中 .stage > .device > .app 的结构。
 */

import { useAppStore } from "@/lib/store";

interface DeviceShellProps {
  children: React.ReactNode;
}

export function DeviceShell({ children }: DeviceShellProps) {
  const toast = useAppStore((state) => state.toast);
  const sheet = useAppStore((state) => state.sheet);

  return (
    <div className="stage">
      <div className="device" role="presentation">
        <div className="app" id="app">
          <div className="notch" aria-hidden="true" />
          <div className="statusbar" aria-hidden="true">
            <span>9:41</span>
            <span className="right">5G &middot; 100%</span>
          </div>
          <div className="app-frame" id="frame">
            {children}
          </div>
          <div
            className="sheet-root"
            id="sheet-root"
            data-open={sheet ? "true" : "false"}
          >
            <div className="sheet-dim" data-action="close-sheet" />
            <div className="sheet" id="sheet" />
          </div>
          <div
            className="toast"
            id="toast"
            data-show={toast ? "true" : "false"}
          >
            {toast || ""}
          </div>
        </div>
      </div>
    </div>
  );
}
