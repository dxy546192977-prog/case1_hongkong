"use client";

import { useAppStore } from "@/lib/store";
import { plans } from "@/lib/data";
import { Composer } from "@/components/ui/Composer";
import { IconBack } from "@/components/Icons";

export function ItineraryView() {
  const selectedPlanId = useAppStore((s) => s.selectedPlanId);
  const itineraryMode = useAppStore((s) => s.itineraryMode);
  const selectedSegmentId = useAppStore((s) => s.selectedSegmentId);
  const segmentLoading = useAppStore((s) => s.segmentLoading);
  const backToChat = useAppStore((s) => s.backToChat);
  const setItineraryMode = useAppStore((s) => s.setItineraryMode);
  const selectSegment = useAppStore((s) => s.selectSegment);
  const startOrder = useAppStore((s) => s.startOrder);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = plans.find((p: any) => p.id === selectedPlanId) || plans[0];
  const mode = itineraryMode || "list";

  return (
    <div className="itin-screen" data-mode={mode}>
      <div className="itin-map-placeholder" style={{ background: "var(--bg-surface-mute)", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)", fontSize: 13 }}>
        路线地图区域
      </div>

      <header className="appbar appbar--transparent">
        <button className="appbar__icon appbar__icon--floating" onClick={backToChat} aria-label="返回">
          <IconBack size={22} />
        </button>
        <div />
        <div />
      </header>

      <div className="appbar__tabs">
        <button className={mode === "list" ? "is-active" : ""} onClick={() => setItineraryMode("list")}>行程图</button>
        <button className={mode === "map" ? "is-active" : ""} onClick={() => setItineraryMode("map")}>线路图</button>
      </div>

      <div className="itin-sheet" id="itin-sheet">
        <div className="itin-sheet__handle" aria-hidden="true" />
        <p className="itin-sheet__lede">详细行程，可选择行程继续调整</p>

        <div className="itin-sheet__body">
          <ol className="route-timeline">
            {(plan.fullLegs || []).map((leg: { time?: string; route: string; mode: string; duration?: string; price?: string; code?: string; cabin?: string; luggage?: string; reason?: string }, index: number) => (
              <li
                key={index}
                className={`route-leg ${String(index) === selectedSegmentId ? "is-selected" : ""} ${segmentLoading && String(index) === selectedSegmentId ? "is-loading" : ""}`}
                onClick={() => selectSegment(String(index))}
              >
                <div className="route-leg__time">{leg.time || ""}</div>
                <div className="route-leg__body">
                  <div className="route-leg__route">{leg.route}</div>
                  <div className="route-leg__meta">
                    <span className="route-leg__mode">{leg.mode}</span>
                    {leg.duration && <span className="route-leg__duration">{leg.duration}</span>}
                    {leg.price && <span className="route-leg__price">{leg.price}</span>}
                  </div>
                  {leg.code && <div className="route-leg__flight">{leg.code} {leg.cabin || ""}</div>}
                  {leg.reason && <div className="route-leg__reason">{leg.reason}</div>}
                </div>
              </li>
            ))}
          </ol>

          <div className="itin-sheet__total">
            <span className="itin-sheet__total-label">合计总价</span>
            <span className={`itin-sheet__total-value${segmentLoading ? " itin-sheet__total-value--loading" : ""}`}>
              {segmentLoading ? "加载中…" : plan.totalPrice.toLocaleString()}
            </span>
          </div>

          <div className="itin-sheet__cta">
            <button className="btn btn--primary btn--block" onClick={startOrder}>确认行程并预订</button>
          </div>
        </div>
      </div>

      <Composer placeholder="可以针对行程进行修改…" interactive />
    </div>
  );
}
