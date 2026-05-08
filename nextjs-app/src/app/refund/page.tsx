"use client";

import { useEffect } from "react";
import { DeviceShell } from "@/components/ui/DeviceShell";
import { DemoStageDock } from "@/components/ui/DemoStageDock";
import { ScreenRouter } from "@/components/ScreenRouter";
import { useAppStore } from "@/lib/store";

/** 退改链路页面 */
export default function RefundPage() {
  const setRefundFlow = useAppStore((state) => state.setRefundFlow);

  useEffect(() => {
    setRefundFlow("disruption");
  }, [setRefundFlow]);

  return (
    <>
      <DeviceShell>
        <ScreenRouter />
      </DeviceShell>
      <DemoStageDock
        links={[
          { href: "/", label: "正向支付链路" },
          { href: "/flipbook", label: "订详 Flipbook" },
        ]}
      />
    </>
  );
}
