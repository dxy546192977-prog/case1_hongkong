// 3 个 sheet：选乘机人 / 订单确认 / 飞猪式密码键盘（无 logo）。

import { plans, order } from "../data-source.js";
import { ICON } from "../icons.js";

export function renderSheet(state) {
  if (state.sheet === "passenger-pick") return renderPassengerSheet(state);
  if (state.sheet === "order-confirm") return renderOrderSheet(state);
  if (state.sheet === "pay-pad") return renderPayPad(state);
  if (state.sheet === "refund-warning") return renderRefundWarningSheet();
  return "";
}

function renderPassengerSheet(state) {
  const list = state.passengers || [];
  const selectedCount = list.filter((p) => p.selected).length;

  return `
    <div class="sheet-content sheet--passenger">
      <div class="sheet__handle" aria-hidden="true"></div>
      <div class="sheet__head">
        <div class="sheet__title">选择乘机人</div>
        <button class="sheet__close" data-action="close-sheet" aria-label="收起">${ICON.chevronDown(22)}</button>
      </div>
      <div class="sheet__body">
        <button class="pp-add">${ICON.plus(18)} 手动添加</button>
        <div class="pp-list">
          ${list
            .map(
              (p) => `<div class="pp-row" data-action="toggle-passenger" data-pid="${p.id}">
                <span class="pp-row__edit">${ICON.pencil(18)}</span>
                <div>
                  <div class="pp-row__name">
                    ${p.name}${p.self ? `<span class="pp-row__tag">本人</span>` : ""}
                  </div>
                  <div class="pp-row__id">身份证 ${p.idNo} · 换证件 ›</div>
                </div>
                <span class="pp-row__check ${p.selected ? "is-on" : ""}">${p.selected ? ICON.check(14) : ""}</span>
              </div>`,
            )
            .join("")}
        </div>
      </div>
      <div class="sheet__foot">
        <button class="btn btn--primary btn--block" data-action="confirm-passengers" ${selectedCount === 0 ? "disabled" : ""}>确认</button>
      </div>
    </div>
  `;
}

function renderOrderSheet(state) {
  const plan = plans.find((p) => p.id === state.selectedPlanId) || plans[0];
  const passengers = (state.passengers || []).filter((p) => p.selected);
  const trips = plan.segments
    .filter((s) => s.cat === "major" || s.mode === "打车")
    .slice(0, 3);
  const progress = state.orderProgress || 0;
  const ready = progress >= 100;

  return `
    <div class="sheet-content sheet--order">
      <div class="sheet__handle" aria-hidden="true"></div>
      <div class="sheet__head">
        <div class="sheet__title">确认订单</div>
        <button class="sheet__close" data-action="close-sheet" aria-label="关闭">${ICON.x(18)}</button>
      </div>
      <div class="sheet__body">
        <div class="order-trips">
          ${trips.map(renderOrderTrip).join("")}
        </div>

        ${passengers
          .map(
            (p, i) => `<div class="order-block">
              <span class="lbl">${i === 0 ? "乘机人" : ""}</span>
              <span class="val">${p.name} ${p.self ? `<span class="pp-row__tag">本人</span>` : ""}<small>身份证 ${p.idNo}</small></span>
            </div>`,
          )
          .join("")}

        <div class="order-block">
          <span class="lbl">联系方式</span>
          <span class="val">${order.contact}</span>
        </div>

        <div class="order-total">
          <span class="order-total__lbl">总价格</span>
          <span class="order-total__val">${plan.totalPrice.toLocaleString()}</span>
        </div>

        <button class="order-policy" type="button" data-action="toggle-agreement" aria-pressed="${state.agreementAccepted ? "true" : "false"}">
          <span class="order-policy__check${state.agreementAccepted ? " is-checked" : ""}">${state.agreementAccepted ? ICON.check(12) : ""}</span>
          <span class="order-policy__text">${order.policy}</span>
        </button>
      </div>

      <div class="sheet__foot">
        <div class="order-progress-row">
          <span class="order-progress" data-ready="${ready}">
            ${ready ? `${ICON.check(14)} 订单已生成` : `<span class="order-progress__spin"></span> 订单生成中 ${progress}%`}
          </span>
        </div>
        <div class="order-actions-pair">
          <button class="btn btn--ghost" data-action="close-sheet">重新选择</button>
          <button class="btn btn--primary" data-action="open-paypad" ${ready && state.agreementAccepted ? "" : "disabled"}>
            ${ready ? (state.agreementAccepted ? "立即支付" : "请先勾选协议") : "等待订单生成…"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOrderTrip(seg) {
  const date = `2026年6月1日 周一 ${seg.timeStart || ""}-${seg.timeEnd || ""}`;
  const flight = seg.flight
    ? `${seg.flight.airline} ${seg.flight.number}`
    : seg.mode;
  return `<div class="order-trip">
    <div class="order-trip__title">${seg.from}—${seg.to}</div>
    <div class="order-trip__meta">${date} · ${flight}</div>
    ${seg.classNote ? `<div class="order-trip__sub">${seg.classNote}</div>` : ""}
  </div>`;
}

function renderPayPad(state) {
  const plan = plans.find((p) => p.id === state.selectedPlanId) || plans[0];
  const amount = plan.totalPrice;
  const filled = state.payPadFilled || 0;
  const pwds = Array.from({ length: 6 }, (_, i) =>
    `<span class="paypad__pwd${i < filled ? " is-on" : ""}"></span>`,
  ).join("");

  // 飞猪样式 3x4 数字键盘：1-9 / blank / 0 / 退格
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];
  const keypad = keys
    .map((k) => {
      if (k === "") {
        return `<button class="paypad__key paypad__key--blank" disabled aria-hidden="true"></button>`;
      }
      if (k === "back") {
        return `<button class="paypad__key paypad__key--back" data-action="press-pay-key" data-key="back" aria-label="退格">⌫</button>`;
      }
      return `<button class="paypad__key" data-action="press-pay-key" data-key="${k}">${k}</button>`;
    })
    .join("");

  return `
    <div class="sheet-content sheet--paypad">
      <div class="paypad">
        <div class="paypad__toast">
          <span class="paypad__toast-icon" aria-hidden="true">✦</span>
          <span class="paypad__toast-text">我正在 飞猪旅行帮你下单，请确认 <em>已送达</em></span>
        </div>
        <div class="paypad__card">
          <button class="paypad__close" data-action="close-sheet" aria-label="关闭">×</button>
          <p class="paypad__account">
            <span class="paypad__account-icon" aria-hidden="true">支</span>
            支付宝 139******50
            <i class="paypad__account-switch" aria-hidden="true"></i>
          </p>
          <strong class="paypad__amount">¥${amount.toLocaleString()}</strong>
          <span class="paypad__lede">请输入支付密码</span>
          <div class="paypad__pwds">${pwds}</div>
          <p class="paypad__note">同意 <b>用户协议</b>，开通 AI 付服务完成支付</p>
          <button class="paypad__forgot" type="button">忘记密码?</button>
        </div>
        <div class="paypad__keypad" role="group" aria-label="支付密码键盘">
          ${keypad}
        </div>
      </div>
    </div>
  `;
}

function renderRefundWarningSheet() {
  return `
    <div class="sheet-content sheet--refund-warning">
      <div class="sheet__head refund-warning__head">
        <div class="sheet__title">温馨提示</div>
        <button class="sheet__close" data-action="close-sheet" aria-label="关闭">${ICON.x(18)}</button>
      </div>
      <div class="refund-warning__body">
        <p>
          再次提醒您，请仔细核对您的退票信息，退票提交后，座位将被取消，无法继续乘机，退票申请一旦提交将无法修改和撤销。当前时间退票，<strong>会收取手续费 ¥200</strong>，请谨慎操作。
        </p>
      </div>
      <div class="sheet__foot refund-warning__foot">
        <button class="btn btn--primary btn--block" data-action="submit-refund">我已知晓，提交申请</button>
      </div>
    </div>
  `;
}
