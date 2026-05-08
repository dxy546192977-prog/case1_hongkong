"use client";

import { useAppStore } from "@/lib/store";
import { plans, perks } from "@/lib/data";
import {
  IconDelay,
  IconNavigate,
  IconTaxi,
  IconShield,
  IconGift,
} from "@/components/Icons";

export function PlanCarousel() {
  return (
    <>
      <div className="plans-carousel" data-region="plans">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
      <PerksCard />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PlanCard({ plan }: { plan: any }) {
  const viewItinerary = useAppStore((s) => s.viewItinerary);
  const startOrder = useAppStore((s) => s.startOrder);

  const handleBookNow = () => {
    viewItinerary(plan.id);
    setTimeout(() => startOrder(), 80);
  };

  return (
    <article
      className={`plan-card${plan.primary ? " plan-card--primary" : ""}`}
      data-plan-id={plan.id}
    >
      <span className="plan-card__tag">{plan.tag}</span>
      <h3 className="plan-card__title">{plan.title}</h3>
      <p className="plan-card__sub">{plan.subtitle}</p>

      <div className="plan-card__totalrow">
        <span className="label">总耗时</span>
        <span className="value">{plan.totalTime}</span>
      </div>

      <div className="plan-mini">
        {plan.miniTimeline.map(
          (
            m: {
              time: string;
              text: string;
              sub?: string;
              price: number;
              redPrice: boolean;
            },
            index: number
          ) => (
            <div key={index} className="plan-mini__row">
              <span className="plan-mini__time">{m.time}</span>
              <span className="plan-mini__text">
                {m.text}
                {m.sub && <span className="plan-mini__sub">{m.sub}</span>}
              </span>
              <span
                className={`plan-mini__price${m.redPrice ? " is-red" : ""}`}
              >
                {m.price ? m.price.toLocaleString() : "0"}
              </span>
            </div>
          )
        )}
      </div>

      <div className="plan-card__pricerow">
        <span className="pp-left">
          <span className="pp-label">{plan.headcount} 人均价</span>
          <span className="pp-value">{plan.perHead.toLocaleString()}</span>
        </span>
        <span className="pp-detail">查看明细</span>
      </div>

      <div className="plan-card__cta">
        <button
          className="btn btn--ghost btn--inline"
          onClick={() => viewItinerary(plan.id)}
        >
          查看详情
        </button>
        <button className="btn btn--primary btn--inline" onClick={handleBookNow}>
          立即预订
        </button>
      </div>
    </article>
  );
}

const perkIconMap: Record<string, React.ReactNode> = {
  delay: <IconDelay size={20} />,
  navigate: <IconNavigate size={20} />,
  taxi: <IconTaxi size={20} />,
  shield: <IconShield size={20} />,
  gift: <IconGift size={20} />,
};

function PerksCard() {
  return (
    <div className="perks-card">
      <div className="perks-card__head">
        <span className="perks-card__title">{perks.title}</span>
        <span className="perks-card__sub">{perks.subtitle}</span>
      </div>
      <p className="perks-card__intro">{perks.intro}</p>
      <ul className="perks-list">
        {perks.items.map((item) => (
          <li key={item.icon} className="perks-row">
            <span className="perks-row__icon">
              {perkIconMap[item.icon] || null}
            </span>
            <div>
              <span className="perks-row__title">{item.title}</span>
              <span className="perks-row__desc">{item.sub}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
