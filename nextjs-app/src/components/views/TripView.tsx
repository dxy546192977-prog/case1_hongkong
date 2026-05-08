"use client";

import { useAppStore } from "@/lib/store";
import { myTrips } from "@/lib/data";
import { Composer } from "@/components/ui/Composer";
import { MyTripsControl } from "@/components/views/MyTripsControl";
import { IconBack, IconMore } from "@/components/Icons";

export function TripView() {
  const selectedTripCardId = useAppStore((s) => s.selectedTripCardId);
  const backToPrep = useAppStore((s) => s.backToPrep);
  const expandTripCard = useAppStore((s) => s.expandTripCard);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card = (myTrips as any[]).find((c) => c.id === selectedTripCardId) || myTrips[1];
  const detail = card.detail;
  const transit = detail?.transit;

  return (
    <>
      <header className="appbar">
        <button className="appbar__icon" onClick={backToPrep} aria-label="返回">
          <IconBack size={22} />
        </button>
        <div className="appbar__title">出行助手</div>
        <button className="appbar__icon" aria-label="更多">
          <IconMore size={22} />
        </button>
      </header>

      <div className="feed">
        <div className={`trip-detail${transit ? " trip-detail--plain" : ""}`}>
          {transit ? (
            <>
              <p className="trip-detail__lead">
                亲子中转已为你规划好，已优先串联婴儿车租借、育婴室和安静休息点，按路线走更省心。
              </p>
              <h3 className="trip-detail__section-title">中转提示</h3>
              <TransitCardSimple transit={transit} detail={detail} />
            </>
          ) : (
            <>
              <div className="trip-detail__top">你的有 1 个行程即将出发</div>
              <button
                className="trip-card-detail trip-card-detail--clickable"
                onClick={expandTripCard}
                aria-label="展开详情"
              >
                {detail.time && (
                  <div className="trip-card-detail__time">{detail.time}</div>
                )}
                <h2 className="trip-card-detail__headline">
                  {detail.headline}
                </h2>
                <p className="trip-card-detail__lead">{detail.lead || ""}</p>
              </button>
            </>
          )}
        </div>
      </div>

      <MyTripsControl />
      <Composer />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TransitCardSimple({ transit, detail }: { transit: any; detail: any }) {
  return (
    <div className="transit-card">
      <div className="transit-card__status">
        <span className="transit-card__label">中转停留</span>
        <span className="transit-card__value">{transit.layoverText}</span>
        <span className="transit-card__feel">体感：{transit.layoverFeel}</span>
      </div>
      {transit.boardingPassStatus && (
        <div className={`transit-card__bp ${transit.boardingPassStatus.ok ? "is-ok" : ""}`}>
          {transit.boardingPassStatus.label}
        </div>
      )}
      {transit.flightStatus && (
        <div className="transit-card__flight">
          <span>{transit.flightStatus.code}</span>
          <span className="transit-card__flight-status">{transit.flightStatus.status}</span>
        </div>
      )}
      <div className="transit-card__chain">
        {transit.routeChain?.map((step: { id: string; label: string; sub: string }) => (
          <div key={step.id} className="transit-card__chain-step">
            <span className="transit-card__chain-label">{step.label}</span>
            <span className="transit-card__chain-sub">{step.sub}</span>
          </div>
        ))}
      </div>
      <button className="btn btn--primary btn--block" style={{ marginTop: 12 }}>
        查看详情
      </button>
    </div>
  );
}
