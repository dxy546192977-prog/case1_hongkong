// 静态行为/结构 smoke test。匹配重写后的 Figma 串联数据。
// 运行：node prototypes/main-demo/tests/behavior.test.js

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  plans,
  intakeQuestions,
  homeSamples,
  passengers,
  prepCards,
  myTrips,
  trip,
} from "../src/data.js";
import {
  getState,
  setState,
  resetState,
  subscribe,
} from "../src/state.js";
import {
  bootChat,
  startIntake,
  answerIntake,
  viewItinerary,
  startOrder,
  togglePassenger,
  confirmPassengers,
  closeSheet,
  toggleMyTrips,
  openTripCard,
} from "../src/actions.js";

// ---- data: 3 plans, 各自的 segment 结构 ----

test("3 个方案，主推方案唯一", () => {
  assert.equal(plans.length, 3);
  const primary = plans.filter((p) => p.primary);
  assert.equal(primary.length, 1);
  assert.equal(primary[0].id, "plan-bus");
});

test("plan-ferry 是 6 段（综合交通行程_香港机场 原版）", () => {
  const ferry = plans.find((p) => p.id === "plan-ferry");
  assert.equal(ferry.segments.length, 6);
  // 段 2 = 轮渡
  assert.equal(ferry.segments[1].mode, "轮渡");
  assert.equal(ferry.segments[1].from, "虎门港澳客运码头");
});

test("plan-bus 是 6 段，段 2 = 大巴", () => {
  const bus = plans.find((p) => p.id === "plan-bus");
  assert.equal(bus.segments.length, 6);
  assert.equal(bus.segments[1].mode, "大巴");
});

test("plan-direct 是 4 段，无香港中转", () => {
  const direct = plans.find((p) => p.id === "plan-direct");
  assert.equal(direct.segments.length, 4);
  const hkSegments = direct.segments.filter((s) => s.from.includes("香港"));
  assert.equal(hkSegments.length, 0);
});

test("3 方案价格符合 Figma：5241 / 5478 / 6827", () => {
  assert.equal(plans.find((p) => p.id === "plan-bus").totalPrice, 5241);
  assert.equal(plans.find((p) => p.id === "plan-ferry").totalPrice, 5478);
  assert.equal(plans.find((p) => p.id === "plan-direct").totalPrice, 6827);
});

test("起点/终点/日期固定", () => {
  assert.equal(trip.origin, "东莞 联丰苑");
  assert.equal(trip.hotel, "雪邦黄金海岸安凡尼度假酒店");
  assert.equal(trip.date, "2026/06/01");
});

// ---- intake Q&A 结构 ----

test("intake 包含 3 轮 Q&A", () => {
  const qaQs = intakeQuestions.filter((q) => q.type === "qa");
  assert.equal(qaQs.length, 3);
  assert.equal(qaQs[0].id, "q1");
  assert.equal(qaQs[2].id, "q3");
});

test("每个 Q&A 都是 2 个选项", () => {
  intakeQuestions
    .filter((q) => q.type === "qa")
    .forEach((q) => {
      assert.equal(q.options.length, 2, `${q.id} should have 2 options`);
    });
});

test("homeSamples 是 3 条全文问句（最后一条进入 intake 流）", () => {
  assert.equal(homeSamples.length, 3);
  assert.equal(homeSamples[2], intakeQuestions[0].text);
});

// ---- 乘机人 ----

test("乘机人前 2 默认选中", () => {
  const sel = passengers.filter((p) => p.selected);
  assert.equal(sel.length, 2);
  assert.equal(passengers[0].self, true);
});

// ---- 行前 ----

test("行前 4 张卡：护照/签证/入境卡/行李", () => {
  assert.equal(prepCards.length, 4);
  assert.deepEqual(
    prepCards.map((c) => c.id),
    ["passport", "visa", "mdac", "luggage"],
  );
});

// ---- 我的行程 ----

test("我的行程 ≥ 3 张卡，每张有 short + detail", () => {
  assert.ok(myTrips.length >= 3);
  myTrips.forEach((c) => {
    assert.ok(c.short, `${c.id} missing short`);
    assert.ok(c.detail, `${c.id} missing detail`);
  });
});

// ---- state + actions ----

test("bootChat 设置 chat 屏 + 1 条 greeting", () => {
  resetState();
  bootChat();
  const s = getState();
  assert.equal(s.screen, "chat");
  assert.equal(s.conversation.length, 1);
  assert.equal(s.conversation[0].type, "greeting");
});

test("startIntake 推入 user 气泡 + 计划 q1", async () => {
  resetState();
  bootChat();
  startIntake("test query");
  // 即时
  assert.equal(getState().conversation[1].type, "user");
  // 等待 600+320ms
  await new Promise((r) => setTimeout(r, 1100));
  const s = getState();
  // 应有 greeting / user / assistant / qa(q1)
  const types = s.conversation.map((m) => m.type);
  assert.ok(types.includes("assistant"));
  assert.ok(types.includes("qa"));
});

test("answerIntake q1 → 推 user 气泡 + q2", async () => {
  resetState();
  bootChat();
  startIntake("seed");
  await new Promise((r) => setTimeout(r, 1000));
  answerIntake("q1", "taxi");
  await new Promise((r) => setTimeout(r, 800));
  const s = getState();
  const lastQa = [...s.conversation].reverse().find((m) => m.type === "qa");
  assert.equal(lastQa.qid, "q2");
  assert.equal(s.intakeAnswers.q1, "taxi");
});

test("viewItinerary 切到 itinerary 屏 + 默认选中 major 段", () => {
  resetState();
  viewItinerary("plan-ferry");
  const s = getState();
  assert.equal(s.screen, "itinerary");
  assert.equal(s.selectedPlanId, "plan-ferry");
  assert.equal(s.selectedSegmentId, "s2"); // ferry 的 major
});

test("startOrder 打开 passenger sheet 并 clone passengers", () => {
  resetState();
  viewItinerary("plan-bus");
  startOrder();
  const s = getState();
  assert.equal(s.sheet, "passenger-pick");
  assert.equal(s.passengers.length, 3);
  // 不该是同一引用
  assert.notEqual(s.passengers, passengers);
});

test("togglePassenger 切换选中态", () => {
  resetState();
  viewItinerary("plan-bus");
  startOrder();
  const before = getState().passengers.find((p) => p.id === "p3").selected;
  togglePassenger("p3");
  const after = getState().passengers.find((p) => p.id === "p3").selected;
  assert.equal(after, !before);
});

test("confirmPassengers → order-confirm sheet", () => {
  resetState();
  viewItinerary("plan-bus");
  startOrder();
  confirmPassengers();
  assert.equal(getState().sheet, "order-confirm");
});

test("closeSheet 清空 sheet", () => {
  resetState();
  viewItinerary("plan-bus");
  startOrder();
  closeSheet();
  assert.equal(getState().sheet, null);
});

test("toggleMyTrips 切 expanded", () => {
  resetState();
  bootChat();
  toggleMyTrips();
  assert.equal(getState().myTripsExpanded, true);
  toggleMyTrips();
  assert.equal(getState().myTripsExpanded, false);
});

test("openTripCard 切到 trip 屏，记录卡 id", () => {
  resetState();
  openTripCard("trip-day-taxi");
  const s = getState();
  assert.equal(s.screen, "trip");
  assert.equal(s.selectedTripCardId, "trip-day-taxi");
  assert.equal(s.myTripsExpanded, false);
});

test("subscribe 收到通知，setState 不可变", () => {
  resetState();
  let count = 0;
  const off = subscribe(() => (count += 1));
  const before = getState();
  setState({ toast: "hi" });
  const after = getState();
  off();
  setState({ toast: "ignored" }); // off 后不应再被记
  assert.equal(count, 1);
  // before 与 after 不是同一引用 = 不可变
  assert.notEqual(before, after);
  assert.equal(before.toast, null);
  assert.equal(after.toast, "hi");
});
