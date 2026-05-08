"use client";

import { useAppStore } from "@/lib/store";
import { prepCards, plans } from "@/lib/data";
import { Composer } from "@/components/ui/Composer";
import { IconBack, IconMore, IconChevronRight } from "@/components/Icons";
import { MyTripsControl } from "@/components/views/MyTripsControl";

export function PrepView() {
  const selectedPlanId = useAppStore((s) => s.selectedPlanId);
  const myTripsExpanded = useAppStore((s) => s.myTripsExpanded);
  const prepOpenId = useAppStore((s) => s.prepOpenId);
  const backToChat = useAppStore((s) => s.backToChat);
  const startRefundFlow = useAppStore((s) => s.startRefundFlow);
  const openPrepCard = useAppStore((s) => s.openPrepCard);
  const closePrepCard = useAppStore((s) => s.closePrepCard);
  const toggleMyTrips = useAppStore((s) => s.toggleMyTrips);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = (plans as any[]).find((p) => p.id === selectedPlanId) || plans[0];
  const flightLeg = (plan?.fullLegs || []).find((l: { mode: string }) => l.mode === "飞机");
  const departTime = plan?.routeMeta?.depart || "06:20";
  const flightCode = flightLeg?.code || "国泰 CX725";

  return (
    <>
      <header className="appbar">
        <button className="appbar__icon" onClick={backToChat} aria-label="返回">
          <IconBack size={22} />
        </button>
        <div className="appbar__title">出行助手</div>
        <button className="appbar__icon" aria-label="更多">
          <IconMore size={22} />
        </button>
      </header>

      <div className="feed prep-feed">
        <section className="success-home">
          <article className="disruption-prep-card">
            <span className="card-kicker">航变提醒</span>
            <h3>{flightCode} 因台风天气取消，飞猪已为你生成免费替代方案</h3>
            <p>受影响的机票、跨境接驳和接机可一键联动改好，费用变化 ¥0。</p>
            <div className="success-card__actions">
              <button className="success-detail-link" type="button" onClick={() => startRefundFlow("replan-confirm")}>查看新方案 &rsaquo;</button>
              <button className="success-detail-link" type="button" onClick={() => startRefundFlow("disruption")}>查看影响明细 &rsaquo;</button>
            </div>
          </article>

          <article className="success-card">
            <div className="success-card__head">
              <span className="card-kicker">预订成功</span>
              <h3>出票后将短信通知你，航变保障已开启</h3>
            </div>
            <dl className="success-summary">
              <div><dt>订单</dt><dd>{plan.title}</dd></div>
              <div><dt>出发</dt><dd>2026/06/01 {departTime}</dd></div>
              <div><dt>航班</dt><dd>{flightCode}</dd></div>
            </dl>
            <div className="success-card__actions">
              <button className="success-detail-link" type="button">查看订单详情 &rsaquo;</button>
              <button className="success-detail-link" type="button" onClick={() => startRefundFlow("disruption")}>申请退改 &rsaquo;</button>
            </div>
          </article>

          <article className="pretrip-card">
            <span className="card-kicker">行前注意事项</span>
            <h3>出发前建议完成以下检查，避免影响值机、入境和入住</h3>
            <div className="prep-list">
              {prepCards.map((card) => (
                <button key={card.id} className="assistant-item" type="button" onClick={() => openPrepCard(card.id)}>
                  <span>
                    <b>{card.title}</b>
                    <small>{card.sub}</small>
                  </span>
                  <i aria-hidden="true"><IconChevronRight size={16} /></i>
                </button>
              ))}
            </div>
          </article>
        </section>
      </div>

      {myTripsExpanded ? (
        <MyTripsControl />
      ) : (
        <PrepSmartSuggestions onToggleMyTrips={toggleMyTrips} />
      )}

      <Composer />
      {prepOpenId && <PrepDetailOverlay prepOpenId={prepOpenId} onClose={closePrepCard} />}
    </>
  );
}

function PrepSmartSuggestions({ onToggleMyTrips }: { onToggleMyTrips: () => void }) {
  const suggestions = ["出发前要准备什么", "我几点出门", "司机到了吗", "到香港机场了"];
  return (
    <div className="smart-suggestions" aria-label="智能建议">
      <button className="smart-suggestion-chip smart-suggestion-chip--with-icon" onClick={onToggleMyTrips}>
        <span>我的行程</span>
        <IconChevronRight size={14} />
      </button>
      {suggestions.map((label) => (
        <button key={label} className="smart-suggestion-chip">{label}</button>
      ))}
    </div>
  );
}

function PrepDetailOverlay({ prepOpenId, onClose }: { prepOpenId: string; onClose: () => void }) {
  const card = prepCards.find((c) => c.id === prepOpenId);
  if (!card) return null;
  return (
    <div className="prep-overlay" onClick={onClose}>
      <div className="prep-overlay__panel" onClick={(event) => event.stopPropagation()}>
        <div className="prep-overlay__head">
          <span className="card-kicker">行前注意事项</span>
          <button className="prep-overlay__close" onClick={onClose} aria-label="关闭">&times;</button>
        </div>
        <h2 className="prep-overlay__title">{card.title}</h2>
        <p className="prep-overlay__date">{card.date}</p>
        <p className="prep-overlay__desc">{card.sub}</p>
      </div>
    </div>
  );
}
