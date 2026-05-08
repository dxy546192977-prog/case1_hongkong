"use client";

/**
 * ScreenRouter — 根据 store.screen 条件渲染对应视图。
 * 替代原 render.js 中的 screens 映射 + frame.innerHTML 调度。
 */

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ChatView } from "@/components/views/ChatView";
import { ItineraryView } from "@/components/views/ItineraryView";
import { PrepView } from "@/components/views/PrepView";
import { RefundView } from "@/components/views/RefundView";
import { TripView } from "@/components/views/TripView";
import { TripExpandedView } from "@/components/views/TripExpandedView";

export function ScreenRouter() {
  const screen = useAppStore((state) => state.screen);
  const bootChat = useAppStore((state) => state.bootChat);

  useEffect(() => {
    bootChat();
  }, [bootChat]);

  switch (screen) {
    case "chat":
      return <ChatView />;
    case "itinerary":
      return <ItineraryView />;
    case "prep":
      return <PrepView />;
    case "refund":
      return <RefundView />;
    case "trip":
      return <TripView />;
    case "trip-expanded":
      return <TripExpandedView />;
    default:
      return <ChatView />;
  }
}
