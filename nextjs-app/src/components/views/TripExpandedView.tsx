"use client";

import { useAppStore } from "@/lib/store";
import { myTrips } from "@/lib/data";
import { Composer } from "@/components/ui/Composer";
import { IconBack, IconMore } from "@/components/Icons";

export function TripExpandedView() {
  const selectedTripCardId = useAppStore((s) => s.selectedTripCardId);
  const transitSheetMode = useAppStore((s) => s.transitSheetMode);
  const collapseTripCard = useAppStore((s) => s.collapseTripCard);
  const setTransitSheetMode = useAppStore((s) => s.setTransitSheetMode);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card = (myTrips as any[]).find((c) => c.id === selectedTripCardId) || myTrips[1];
  const detail = card.detail;
  const transit = detail?.transit;

  if (!transit) {
    return (
      <>
        <header className="appbar">
          <button className="appbar__icon" onClick={collapseTripCard} aria-label="返回">
            <IconBack size={22} />
          </button>
          <div className="appbar__title">{detail.headline}</div>
          <button className="appbar__icon" aria-label="更多">
            <IconMore size={22} />
          </button>
        </header>
        <div className="feed">
          <div className="trip-detail">
            {detail.time && <p className="trip-detail__time">{detail.time}</p>}
            <h2>{detail.headline}</h2>
            <p>{detail.lead}</p>
            {detail.bullets && (
              <ul className="trip-detail__bullets">
                {detail.bullets.map((bullet: string, index: number) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <Composer />
      </>
    );
  }

  return (
    <div className="ta-screen" data-sheet-mode={transitSheetMode}>
      <header className="appbar appbar--transparent">
        <button className="appbar__icon appbar__icon--floating" onClick={collapseTripCard} aria-label="返回">
          <IconBack size={22} />
        </button>
        <div />
        <div />
      </header>

      <div className="ta-map-area" style={{ background: "var(--bg-surface-mute)", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)", fontSize: 13 }}>
        机场地图区域
      </div>

      <div className="ta-sheet" data-mode={transitSheetMode}>
        <div className="ta-sheet__handle" aria-hidden="true" />
        <div className="ta-sheet__tabs">
          <button className={transitSheetMode === "map" ? "is-active" : ""} onClick={() => setTransitSheetMode("map")}>地图</button>
          <button className={transitSheetMode === "half" ? "is-active" : ""} onClick={() => setTransitSheetMode("half")}>路线</button>
          <button className={transitSheetMode === "list" ? "is-active" : ""} onClick={() => setTransitSheetMode("list")}>详情</button>
        </div>

        <div className="ta-sheet__body">
          <div className="ta-status-bar">
            <span>中转停留 {transit.layoverText}</span>
            <span>体感：{transit.layoverFeel}</span>
          </div>

          {transit.counterGuidance && (
            <div className="ta-counter-guidance">
              <p className="ta-counter-guidance__airline">{transit.counterGuidance.airlineLine}</p>
              <p>{transit.counterGuidance.summary}</p>
              <p className="ta-counter-guidance__next">{transit.counterGuidance.nextStep}</p>
            </div>
          )}

          <h4 className="ta-section-title">中转管家定制路线</h4>
          <ol className="ta-task-list">
            {transit.tasks?.map((task: { id: string; order: number; time: string; route: string; mode: string; duration: string; reason: string; family?: boolean }) => (
              <li key={task.id} className={`ta-task ${task.family ? "is-family" : ""}`}>
                <span className="ta-task__time">{task.time}</span>
                <div className="ta-task__body">
                  <div className="ta-task__route">{task.route}</div>
                  <div className="ta-task__meta">{task.mode} &middot; {task.duration}</div>
                  <div className="ta-task__reason">{task.reason}</div>
                </div>
              </li>
            ))}
          </ol>

          {transit.services && (
            <>
              <h4 className="ta-section-title">顺路服务推荐</h4>
              <div className="ta-services">
                {transit.services.map((svc: { id: string; title: string; sub: string; tag?: string; note?: string; family?: boolean }) => (
                  <div key={svc.id} className={`ta-service-card ${svc.family ? "is-family" : ""}`}>
                    <div className="ta-service-card__head">
                      <span className="ta-service-card__title">{svc.title}</span>
                      {svc.tag && <span className="ta-service-card__tag">{svc.tag}</span>}
                    </div>
                    <p className="ta-service-card__sub">{svc.sub}</p>
                    {svc.note && <p className="ta-service-card__note">{svc.note}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {transit.tips && (
            <>
              <h4 className="ta-section-title">温馨提示</h4>
              <ul className="ta-tips">
                {transit.tips.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <Composer placeholder="可以修改中转路线…" interactive />
    </div>
  );
}
