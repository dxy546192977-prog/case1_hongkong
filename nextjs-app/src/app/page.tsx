"use client";

import { DeviceShell } from "@/components/ui/DeviceShell";
import { DemoStageDock } from "@/components/ui/DemoStageDock";
import { ScreenRouter } from "@/components/ScreenRouter";

/** 正向支付链路 - 主 demo 页面 */
export default function HomePage() {
  return (
    <>
      <DeviceShell>
        <ScreenRouter />
      </DeviceShell>
      <DemoStageDock
        links={[
          { href: "/refund", label: "退改链路" },
          { href: "/flipbook", label: "订详 Flipbook" },
        ]}
      />
    </>
  );
}
