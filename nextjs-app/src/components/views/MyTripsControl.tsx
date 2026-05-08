"use client";

import { useAppStore } from "@/lib/store";
import { myTrips } from "@/lib/data";

export function MyTripsControl() {
  const myTripsExpanded = useAppStore((s) => s.myTripsExpanded);
  const toggleMyTrips = useAppStore((s) => s.toggleMyTrips);
  const openTripCard = useAppStore((s) => s.openTripCard);

  if (myTripsExpanded) {
    return (
      <div className="mytrips">
        <div className="mytrips__rail">
          <div className="mytrips__rail-head">
            <span>我的行程</span>
            <button className="mytrips__rail-close" onClick={toggleMyTrips} aria-label="收起">&times;</button>
          </div>
          <div className="mytrips__cards">
            {myTrips.map((card) => (
              <button key={card.id} className="mt-card" onClick={() => openTripCard(card.id)}>
                <div className="mt-card__top">{card.short.topLine}</div>
                <div className="mt-card__title">{card.short.title}</div>
                <div className="mt-card__sub">{card.short.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mytrips">
      <button className="mytrips__pill" onClick={toggleMyTrips}>我的行程</button>
    </div>
  );
}
