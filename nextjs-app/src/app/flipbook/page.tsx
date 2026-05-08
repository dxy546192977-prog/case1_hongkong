"use client";

import { DeviceShell } from "@/components/ui/DeviceShell";
import { DemoStageDock } from "@/components/ui/DemoStageDock";
import { FlipbookView } from "@/components/views/FlipbookView";

/** 订详 Flipbook 效果页面 */
export default function FlipbookPage() {
  return (
    <>
      <DeviceShell>
        <FlipbookView />
      </DeviceShell>
      <DemoStageDock
        links={[
          { href: "/", label: "正向支付链路" },
          { href: "/refund", label: "退改链路" },
        ]}
      />
    </>
  );
}
