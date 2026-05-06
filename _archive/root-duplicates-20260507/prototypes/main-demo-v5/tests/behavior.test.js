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
import { HKG_PROFILE_KEYS, hkgProfiles } from "../src/data/hkg-profiles.js";
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
import { renderDetailScreen, renderOffstageSwitcher, renderPushFrame } from "../src/hkg-push-demo.js";

// ---- data: 3 plans, 各自的 segment 结构 ----

test("3 个方案，主推方案唯一", () => {
  assert.equal(plans.length, 3);
  const primary = plans.filter((p) => p.primary);
  assert.equal(primary.length, 1);
  assert.equal(primary[0].id, "balanced");
});

test("balanced 是 6 段，段 2 = 大巴", () => {
  const bus = plans.find((p) => p.id === "balanced");
  assert.equal(bus.segments.length, 6);
  assert.equal(bus.segments[1].mode, "大巴");
});

test("comfort 是 4 段，无香港中转", () => {
  const direct = plans.find((p) => p.id === "comfort");
  assert.equal(direct.segments.length, 4);
  const hkSegments = direct.segments.filter((s) => s.from.includes("香港"));
  assert.equal(hkSegments.length, 0);
});

test("low 也是 4 段，无香港中转", () => {
  const low = plans.find((p) => p.id === "low");
  assert.equal(low.segments.length, 4);
  const hkSegments = low.segments.filter((s) => s.from.includes("香港"));
  assert.equal(hkSegments.length, 0);
});

test("3 方案价格符合 v5：1545 / 1660 / 1592", () => {
  assert.equal(plans.find((p) => p.id === "balanced").totalPrice, 1545);
  assert.equal(plans.find((p) => p.id === "comfort").totalPrice, 1660);
  assert.equal(plans.find((p) => p.id === "low").totalPrice, 1592);
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
  await new Promise((r) => setTimeout(r, 1400));
  const s = getState();
  const lastQa = [...s.conversation].reverse().find((m) => m.type === "qa");
  assert.equal(lastQa.qid, "q2");
  assert.equal(s.intakeAnswers.q1, "taxi");
});

test("viewItinerary 切到 itinerary 屏 + 默认选中 major 段", () => {
  resetState();
  viewItinerary("balanced");
  const s = getState();
  assert.equal(s.screen, "itinerary");
  assert.equal(s.selectedPlanId, "balanced");
  assert.equal(s.selectedSegmentId, "3");
});

test("startOrder 打开 passenger sheet 并 clone passengers", () => {
  resetState();
  viewItinerary("balanced");
  startOrder();
  const s = getState();
  assert.equal(s.sheet, "passenger-pick");
  assert.equal(s.passengers.length, 3);
  // 不该是同一引用
  assert.notEqual(s.passengers, passengers);
});

test("togglePassenger 切换选中态", () => {
  resetState();
  viewItinerary("balanced");
  startOrder();
  const before = getState().passengers.find((p) => p.id === "p3").selected;
  togglePassenger("p3");
  const after = getState().passengers.find((p) => p.id === "p3").selected;
  assert.equal(after, !before);
});

test("confirmPassengers → order-confirm sheet", () => {
  resetState();
  viewItinerary("balanced");
  startOrder();
  confirmPassengers();
  assert.equal(getState().sheet, "order-confirm");
});

test("closeSheet 清空 sheet", () => {
  resetState();
  viewItinerary("balanced");
  startOrder();
  closeSheet();
  assert.equal(getState().sheet, null);
});

// ---- HKG profiles: 亲子 / 商务 / 中转机场路书 ----

test("HKG profiles 覆盖亲子 / 商务 / 中转", () => {
  assert.deepEqual(HKG_PROFILE_KEYS, ["family", "business", "transfer"]);
  HKG_PROFILE_KEYS.forEach((key) => {
    const profile = hkgProfiles[key];
    assert.equal(profile.id, key);
    assert.ok(profile.title.includes("香港国际机场"));
    assert.ok(profile.lead);
    assert.ok(profile.overview);
    assert.ok(profile.map.overview);
    assert.ok(profile.nodes.length >= 3);
  });
});

test("HKG profile 节点都有坐标、图片和 drawer 文案", () => {
  Object.values(hkgProfiles).forEach((profile) => {
    profile.nodes.forEach((node) => {
      assert.match(node.num, /^\d{2}$/);
      assert.ok(node.label);
      assert.ok(node.title);
      assert.ok(node.detail);
      assert.ok(node.image);
      assert.ok(node.x >= 0 && node.x <= 1);
      assert.ok(node.y >= 0 && node.y <= 1);
    });
  });
});

test("亲子 profile 使用用户提供的 main-demo-v5 亲子组图", () => {
  const family = hkgProfiles.family;
  assert.equal(family.nodes.length, 4);
  assert.ok(family.map.overview.includes("/main-demo-v5/airport/family/overview.png"));
  family.nodes.forEach((node) => {
    assert.ok(node.image.includes("/main-demo-v5/airport/family/"));
  });
});

test("亲子 profile 转场都从总览图进入目标帧", () => {
  const family = hkgProfiles.family;
  const expected = new Map([
    ["family-checkin", "overview_to_checkin.mp4"],
    ["family-assist", "overview_to_security.mp4"],
    ["family-leisure", "overview_to_leisure.mp4"],
    ["family-gate", "overview_to_gate.mp4"],
  ]);
  const overviewEdges = family.edges.filter((edge) => edge.from === "overview");
  assert.equal(overviewEdges.length, expected.size);
  overviewEdges.forEach((edge) => {
    assert.equal(edge.from, "overview");
    assert.equal(edge.video.endsWith(expected.get(edge.to)), true);
    assert.equal(edge.required, true);
  });
});

test("商务 profile 使用 main-demo-v5 商务组图和总览转场", () => {
  const business = hkgProfiles.business;
  const expected = new Map([
    ["business-checkin", "overview_to_checkin.mp4"],
    ["business-fast", "overview_to_security.mp4"],
    ["business-pier", "overview_to_lounge.mp4"],
    ["business-boarding", "overview_to_gate.mp4"],
  ]);
  assert.equal(business.nodes.length, 4);
  assert.ok(business.map.overview.includes("/main-demo-v5/airport/business/overview.png"));
  business.nodes.forEach((node) => {
    assert.ok(node.image.includes("/main-demo-v5/airport/business/"));
    assert.equal(node.video?.includes("/main-demo-v5/airport/business/transitions/"), true);
    assert.equal(node.video?.endsWith(expected.get(node.id)), true);
    assert.ok(node.video?.endsWith(".mp4"));
  });
});

test("HKG profile 所有转场边都有 mp4 素材引用", () => {
  Object.values(hkgProfiles).forEach((profile) => {
    profile.edges?.forEach((edge) => {
      assert.ok(edge.from);
      assert.ok(edge.to);
      assert.ok(edge.video);
      assert.equal(edge.video.endsWith(".mp4"), true);
      assert.equal(edge.video.includes(`/main-demo-v5/airport/${profile.id}/transitions/`), true);
    });
  });
});

test("中转 profile 使用 main-demo-v5 中转组图和总览转场", () => {
  const transfer = hkgProfiles.transfer;
  const expected = new Map([
    ["transfer-arrival", "overview_to_arrival.mp4"],
    ["transfer-desk", "overview_to_desk.mp4"],
    ["transfer-security", "overview_to_security.mp4"],
    ["transfer-gate", "overview_to_gate.mp4"],
  ]);
  assert.equal(transfer.nodes.length, 4);
  assert.equal(transfer.talkTracks.length, 3);
  assert.ok(transfer.map.overview.includes("/main-demo-v5/airport/transfer/overview.png"));
  transfer.nodes.forEach((node) => {
    assert.ok(node.image.includes("/main-demo-v5/airport/transfer/"));
    assert.equal(node.video?.includes("/main-demo-v5/airport/transfer/transitions/"), true);
    assert.equal(node.video?.endsWith(expected.get(node.id)), true);
  });
});

test("亲子文案不渲染免税店或商圈维护信息", () => {
  const text = JSON.stringify(hkgProfiles.family);
  assert.doesNotMatch(text, /免税|商圈|品牌促销/);
});

test("商务文案不写死权益承诺", () => {
  const text = JSON.stringify(hkgProfiles.business);
  assert.doesNotMatch(text, /100%|必能|保证/);
});

test("HKG push demo 只保留推送卡片页和路书详情页", () => {
  const push = renderPushFrame();
  const switcher = renderOffstageSwitcher("family");
  const detail = renderDetailScreen(hkgProfiles.business);
  HKG_PROFILE_KEYS.forEach((key) => {
    assert.ok(switcher.includes(`data-demo-profile="${key}"`));
  });
  assert.ok(push.includes(`data-demo-screen="push"`));
  assert.ok(detail.includes("data-hkg-profile-detail"));
  assert.ok(detail.includes("data-hkg-route-map"));
  assert.doesNotMatch(detail, /data-action="set-hkg-view"/);
});

test("中转主线不把提取行李作为默认步骤", () => {
  const text = JSON.stringify(hkgProfiles.transfer);
  assert.doesNotMatch(text, /提取行李|取行李/);
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
