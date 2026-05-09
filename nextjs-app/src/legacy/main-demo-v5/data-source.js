// 数据源选择层（superthin re-export）。
//
// 目的：在不改动各 view / actions / state 文件的前提下，把整套 demo 数据源
// 在「国际版（东莞→吉隆坡）」与「国内版（北京→拉萨）」之间切换。
//
// 切换方式：
//   - 读取 localStorage["demo-region"]：未设置 / "international" → 国际版（默认）
//                                      "domestic" → 国内版
//   - 写入后调用 setRegion(...)，会触发 location.reload()，避免 state.js 内的
//     运行时状态（中转管家档位 / 退改流程 / 选中 plan 等）与新数据不一致。
//
// 为什么用同步 import 两份再选一份导出，而不是动态 import：
//   - 动态 import 需要顶层 await，会让 Next.js SSR 报错；
//   - ESM 静态 import 已经被打包器 tree-shake，多导入一份未启用模块的代价很小；
//   - 切换需要 reload，运行时只会真正用到一份。

import * as intl from "./data.js";
import * as cn from "./data-domestic.js";

const REGION_KEY = "demo-region";
const VALID_REGIONS = new Set(["international", "domestic"]);

function readRegion() {
  if (typeof window === "undefined") return "international";
  try {
    const v = window.localStorage?.getItem(REGION_KEY);
    return VALID_REGIONS.has(v) ? v : "international";
  } catch {
    // 极端情况下 localStorage 被禁用（隐私模式 / iframe sandbox）
    return "international";
  }
}

export const CURRENT_REGION = readRegion();

const src = CURRENT_REGION === "domestic" ? cn : intl;

// 与 data.js 完全对齐的导出清单，避免 view 层做任何改动
export const plans = src.plans;
export const intakeQuestions = src.intakeQuestions;
export const homeSamples = src.homeSamples;
export const passengers = src.passengers;
export const order = src.order;
export const prepCards = src.prepCards;
export const myTrips = src.myTrips;
export const perks = src.perks;
export const buildDisruption = src.buildDisruption;
export const replanProcessSteps = src.replanProcessSteps;
export const refundAllProcessSteps = src.refundAllProcessSteps;

// 国际版独有的工具方法：国内版若没实现就回退到国际版实现，
// 避免 view 层 import 报 undefined。
export const buildOrderSnapshot = src.buildOrderSnapshot || intl.buildOrderSnapshot;
export const buildOrderHistory = src.buildOrderHistory || intl.buildOrderHistory;

// 切换器：写入 localStorage 并 reload（payment.html / refund.html / flipbook.html
// 的 dock 开关会通过原生 JS 直接操作 localStorage，不必经过这里；这个 export
// 仅为了未来在 React/JS 侧切换时有统一入口）。
export function setRegion(next) {
  if (!VALID_REGIONS.has(next)) {
    throw new Error(`unknown region: ${next}`);
  }
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REGION_KEY, next);
  } catch {
    // 写入失败时不阻断
  }
  window.location.reload();
}
