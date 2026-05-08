"use client";

import { useAppStore } from "@/lib/store";
import { plans, buildDisruption, replanProcessSteps, refundAllProcessSteps } from "@/lib/data";
import { Composer } from "@/components/ui/Composer";
import { IconBack, IconMore } from "@/components/Icons";

export function RefundView() {
  const refundFlow = useAppStore((s) => s.refundFlow);
  const selectedPlanId = useAppStore((s) => s.selectedPlanId);
  const paymentStatus = useAppStore((s) => s.paymentStatus);
  const replanProgress = useAppStore((s) => s.replanProgress);
  const backToPrep = useAppStore((s) => s.backToPrep);
  const backToChat = useAppStore((s) => s.backToChat);
  const viewReplanCompare = useAppStore((s) => s.viewReplanCompare);
  const confirmReplan = useAppStore((s) => s.confirmReplan);
  const chooseFullRefund = useAppStore((s) => s.chooseFullRefund);
  const submitRefund = useAppStore((s) => s.submitRefund);
  const refreshRefundStatus = useAppStore((s) => s.refreshRefundStatus);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = (plans as any[]).find((p) => p.id === selectedPlanId) || plans[0];
  const disruption = buildDisruption(plan);
  const backAction = paymentStatus === "paid" ? backToPrep : backToChat;

  const orderSummary = {
    title: plan.title,
    date: "2026/06/01",
    flight: plan.fullLegs?.find((l: { mode: string }) => l.mode === "飞机")?.code || "国泰 CX725",
    passengers: "李雷、张三",
    plan,
  };

  return (
    <>
      <header className="appbar">
        <button className="appbar__icon" onClick={backAction} aria-label="返回">
          <IconBack size={22} />
        </button>
        <div className="appbar__title">退改保障</div>
        <button className="appbar__icon" aria-label="更多">
          <IconMore size={22} />
        </button>
      </header>

      <div className="feed refund-feed" id="feed">
        <RefundContent
          flow={refundFlow}
          order={orderSummary}
          disruption={disruption}
          replanProgress={replanProgress}
          onViewReplan={viewReplanCompare}
          onConfirmReplan={confirmReplan}
          onChooseFullRefund={chooseFullRefund}
          onSubmitRefund={submitRefund}
          onRefreshStatus={refreshRefundStatus}
        />
      </div>

      <RefundShortcuts />
      <Composer placeholder="输入问题或按住说话" />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RefundContent({ flow, order, disruption, replanProgress, onViewReplan, onConfirmReplan, onChooseFullRefund, onSubmitRefund, onRefreshStatus }: any) {
  if (flow === "disruption") {
    return (
      <>
        <div className="bubble bubble--refund-user">收到航变提醒，帮我看看怎么处理</div>
        <div className="refund-assistant">
          <div className="refund-assistant__meta">
            <span className="refund-assistant__avatar">飞</span>
            <span>飞猪旅行助手</span>
          </div>
          <article className="refund-panel">
            <p>你的 {order.flight} 因「{disruption.reason}」被取消。飞猪已识别到这会影响从东莞出发、经香港到吉隆坡酒店的全链路行程。</p>
            <div className="disruption-alert">
              <h4>全链路影响概览</h4>
              <ul className="disruption-impact-list">
                {disruption.impactList.map((item: { id: string; mode: string; route: string; status: string; detail: string; impacted: boolean }) => (
                  <li key={item.id} className={`impact-row ${item.impacted ? "is-impacted" : ""}`}>
                    <span className="impact-row__mode">{item.mode}</span>
                    <span className="impact-row__route">{item.route}</span>
                    <span className={`impact-row__status ${item.impacted ? "is-warn" : ""}`}>{item.status}</span>
                    <span className="impact-row__detail">{item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="refund-cta-row">
              <button className="btn btn--primary btn--block" onClick={onViewReplan}>查看替代方案</button>
            </div>
          </article>
        </div>
      </>
    );
  }

  if (flow === "replan-confirm") {
    return (
      <>
        <div className="bubble bubble--refund-user">帮我看看替代方案</div>
        <div className="refund-assistant">
          <div className="refund-assistant__meta">
            <span className="refund-assistant__avatar">飞</span>
            <span>飞猪旅行助手</span>
          </div>
          <article className="refund-panel">
            <h4>替代方案对比</h4>
            <table className="replan-compare-table">
              <thead>
                <tr><th>项目</th><th>原方案</th><th>新方案</th></tr>
              </thead>
              <tbody>
                {disruption.replanRows.map((row: { label: string; before: string; after: string }, index: number) => (
                  <tr key={index}>
                    <td>{row.label}</td>
                    <td className="is-old">{row.before}</td>
                    <td className="is-new">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="replan-fee-note">费用变化：<strong>¥0</strong>（航变免费保障）</p>
            <div className="refund-cta-row">
              <button className="btn btn--primary btn--block" onClick={onConfirmReplan}>接受替代方案</button>
              <button className="btn btn--ghost btn--block" onClick={onChooseFullRefund}>全部退款</button>
            </div>
          </article>
        </div>
      </>
    );
  }

  if (flow === "replan-processing" || flow === "replan-success") {
    return (
      <>
        <div className="bubble bubble--refund-user">接受替代方案</div>
        <div className="refund-assistant">
          <div className="refund-assistant__meta">
            <span className="refund-assistant__avatar">飞</span>
            <span>飞猪旅行助手</span>
          </div>
          <article className="refund-panel">
            {flow === "replan-success" ? (
              <>
                <div className="replan-success-icon">&#10003;</div>
                <h4>替代方案已生效</h4>
                <p>航班、接驳和接机已全部调整完成，费用不变。新行程已更新到「我的行程」。</p>
              </>
            ) : (
              <>
                <h4>正在处理替代方案</h4>
                <div className="replan-progress-bar">
                  <div className="replan-progress-bar__fill" style={{ width: `${replanProgress}%` }} />
                </div>
                <ul className="replan-steps">
                  {replanProcessSteps.map((step, index) => (
                    <li key={index} className={replanProgress > (index + 1) * 25 ? "is-done" : ""}>{step}</li>
                  ))}
                </ul>
              </>
            )}
          </article>
        </div>
      </>
    );
  }

  if (flow === "refund-all-processing" || flow === "refund-all-success") {
    return (
      <>
        <div className="bubble bubble--refund-user">全部退款</div>
        <div className="refund-assistant">
          <div className="refund-assistant__meta">
            <span className="refund-assistant__avatar">飞</span>
            <span>飞猪旅行助手</span>
          </div>
          <article className="refund-panel">
            {flow === "refund-all-success" ? (
              <>
                <div className="replan-success-icon">&#10003;</div>
                <h4>全额退款已提交</h4>
                <p>全链路 6 段订单已取消，退款 ¥{disruption.refundTotal} 将在 1-3 个工作日内原路退回。</p>
              </>
            ) : (
              <>
                <h4>正在处理全额退款</h4>
                <div className="replan-progress-bar">
                  <div className="replan-progress-bar__fill" style={{ width: `${replanProgress}%` }} />
                </div>
                <ul className="replan-steps">
                  {refundAllProcessSteps.map((step, index) => (
                    <li key={index} className={replanProgress > (index + 1) * 25 ? "is-done" : ""}>{step}</li>
                  ))}
                </ul>
              </>
            )}
          </article>
        </div>
      </>
    );
  }

  // Normal refund flows: free / fee / submitted / status / blocked / failed
  const flowConfig: Record<string, { userText: string; bodyText: string; showCta?: boolean }> = {
    free: {
      userText: "我想退这次去吉隆坡的行程",
      bodyText: `好的，查询到你已预订 ${order.date} 出发的「${order.title}」，航班为 ${order.flight}，出行人为 ${order.passengers}。当前普通退票分支可使用，手续费 ¥0。`,
      showCta: true,
    },
    fee: {
      userText: "我已知晓，提交飞猪订单退款申请",
      bodyText: `因为你长时间未操作，现在重新为你计算「${order.title}」的退款金额。普通退票预计需扣除手续费 ¥200。`,
      showCta: true,
    },
    submitted: {
      userText: "我已知晓，提交飞猪订单退款申请",
      bodyText: `好的，已为你提交 ${order.flight} 及相关接驳的退票申请。你可以手动刷新查看最新退款状态。`,
    },
    status: {
      userText: "我的退款什么时候到账",
      bodyText: `查询到你有一笔 ${order.date} 出发的「${order.title}」退款申请。该笔订单最新退款状态如下。`,
    },
    blocked: {
      userText: "我的行程能退么",
      bodyText: `查询到你已预订 ${order.date} 出发的「${order.title}」。部分接驳或票券不支持在线主动退票，可前往订单详情查看退改规则。`,
    },
    failed: {
      userText: "我已知晓，提交飞猪订单退款申请",
      bodyText: "抱歉，当前申请提交失败，请重新尝试。",
    },
  };

  const config = flowConfig[flow] || flowConfig.free;

  return (
    <>
      <div className="bubble bubble--refund-user">{config.userText}</div>
      <div className="refund-assistant">
        <div className="refund-assistant__meta">
          <span className="refund-assistant__avatar">飞</span>
          <span>飞猪旅行助手</span>
        </div>
        <article className="refund-panel">
          <p>{config.bodyText}</p>
          {flow === "status" && (
            <button className="btn btn--ghost btn--block" onClick={onRefreshStatus}>刷新退款状态</button>
          )}
          {config.showCta && (
            <div className="refund-cta-row">
              <button className="btn btn--primary btn--block" onClick={onSubmitRefund}>申请退款</button>
            </div>
          )}
        </article>
      </div>
    </>
  );
}

function RefundShortcuts() {
  const startRefundFlow = useAppStore((s) => s.startRefundFlow);
  const shortcuts = [
    { label: "航变退票", flow: "disruption" },
    { label: "普通退票", flow: "free" },
    { label: "退款进度", flow: "status" },
  ];
  return (
    <div className="smart-suggestions" aria-label="退改快捷入口">
      {shortcuts.map((item) => (
        <button key={item.flow} className="smart-suggestion-chip" onClick={() => startRefundFlow(item.flow)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
