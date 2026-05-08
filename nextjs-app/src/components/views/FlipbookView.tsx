"use client";

import { useState, useRef, useCallback } from "react";
import { myTrips } from "@/lib/data";
import { IconBack } from "@/components/Icons";

/**
 * FlipbookView — 订详 Flipbook 效果页面。
 * 展示机场平面图的点击式导航（原 airport-flipbook.js 的独立入口版本）。
 */
export function FlipbookView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hkgTrip = (myTrips as any[]).find((c) => c.id === "trip-hkg-airport");
  const flipbookData = hkgTrip?.detail?.airportFlipbook;

  const [currentNodeId, setCurrentNodeId] = useState(
    flipbookData?.rootNodeId || "overview"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentNode = flipbookData?.nodes?.find((n: any) => n.id === currentNodeId);
  const isOverview = currentNodeId === flipbookData?.rootNodeId;

  const navigateTo = useCallback(
    (targetId: string) => {
      if (isTransitioning || targetId === currentNodeId) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const edge = flipbookData?.edges?.find(
        (e: any) =>
          (e.from === currentNodeId && e.to === targetId) ||
          (e.from === targetId && e.to === currentNodeId)
      );

      if (edge?.video && videoRef.current) {
        setIsTransitioning(true);
        const video = videoRef.current;
        video.src = edge.video;
        video.currentTime = 0;
        video.play().catch(() => {
          setCurrentNodeId(targetId);
          setIsTransitioning(false);
        });
        video.onended = () => {
          setCurrentNodeId(targetId);
          setIsTransitioning(false);
        };
      } else {
        setCurrentNodeId(targetId);
      }
    },
    [currentNodeId, flipbookData, isTransitioning]
  );

  if (!flipbookData) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--ink-muted)" }}>
        Flipbook 数据未找到
      </div>
    );
  }

  return (
    <div className="flipbook-screen">
      <header className="appbar appbar--transparent">
        <button
          className="appbar__icon appbar__icon--floating"
          onClick={() => navigateTo(flipbookData.rootNodeId)}
          aria-label="返回总览"
        >
          <IconBack size={22} />
        </button>
        <div className="appbar__title" style={{ opacity: 0.7 }}>
          {currentNode?.bodyTitle || "机场地图"}
        </div>
        <div />
      </header>

      <div className="flipbook-canvas">
        {/* 当前节点图片 */}
        {currentNode?.image && (
          <img
            className="flipbook-canvas__image"
            src={currentNode.image}
            alt={currentNode.bodyTitle}
            style={{
              width: "100%",
              display: isTransitioning ? "none" : "block",
            }}
          />
        )}

        {/* 转场视频 */}
        <video
          ref={videoRef}
          className="flipbook-canvas__video"
          muted
          playsInline
          style={{
            width: "100%",
            display: isTransitioning ? "block" : "none",
          }}
        />

        {/* 总览图上的热点 */}
        {isOverview &&
          !isTransitioning &&
          flipbookData.hotspots?.map(
            (hotspot: {
              id: string;
              target: string;
              x: number;
              y: number;
              label: string;
            }) => (
              <button
                key={hotspot.id}
                className="flipbook-hotspot"
                style={{
                  position: "absolute",
                  left: `${hotspot.x * 100}%`,
                  top: `${hotspot.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => navigateTo(hotspot.target)}
              >
                <span className="flipbook-hotspot__ring" />
                <span className="flipbook-hotspot__label">{hotspot.label}</span>
              </button>
            )
          )}
      </div>

      {/* 底部说明 */}
      <div className="flipbook-body">
        <h3 className="flipbook-body__title">
          {currentNode?.bodyTitle || ""}
        </h3>
        <p className="flipbook-body__text">{currentNode?.body || ""}</p>
        {!isOverview && (
          <button
            className="btn btn--ghost btn--block"
            onClick={() => navigateTo(flipbookData.rootNodeId)}
            style={{ marginTop: 12 }}
          >
            返回总览
          </button>
        )}
      </div>
    </div>
  );
}
