// 国内版 demo 数据：北京 → 成都 → 林芝 → 拉萨。
// 结构与 data.js 对称（同名字段、同 shape），通过 data-source.js 切换。
// 数据来源：
//   - 截图给的真实段：望京A座 → 大兴 15:38-17:00 打车（落到 plan-balanced 的 s1）
//   - 其余段、航班号、价格为占位数据，便于先把页面跑通，待校正
//
// 与国际版的对应关系：
//   trip-hkg-airport（香港机场中转）→ trip-ctu-airport（成都天府机场过夜中转）
//   东莞→吉隆坡 国际场景 → 北京→拉萨 国内高反 + 自驾场景

const ORIGIN = "阿里 望京A座";
const HOTEL = "拉萨布达拉宫智选假日酒店";
const TRIP_DATE = "2026/06/01";

// =====================================================================
// 6 段骨架（balanced：京→蓉过夜→林芝→自驾拉萨）
// =====================================================================
const skeletonOvernight = [
  {
    id: "s1",
    cat: "small",
    catLabel: "小交通",
    mode: "打车",
    cityFromTo: "北京 - 北京",
    from: ORIGIN,
    to: "大兴国际机场 国内出发",
    timeStart: "15:38",
    timeEnd: "17:00",
    duration: "1h22m",
    price: 130,
    note: "打车直达大兴机场，准点率高",
  },
  {
    id: "s2",
    cat: "major",
    catLabel: "大交通",
    mode: "飞机",
    cityFromTo: "北京 - 成都",
    from: "大兴 T1",
    to: "成都天府 T2",
    timeStart: "19:00",
    timeEnd: "22:10",
    duration: "3h10m",
    price: 980,
    flight: { airline: "中国国航", number: "CA4194", aircraft: "空客 A330" },
    classNote: "经济舱 6.0 折 · 含 20kg 行李 · 提前 2 小时改期免费",
  },
  {
    id: "s3",
    cat: "free",
    catLabel: "自由交通",
    mode: "酒店中转",
    cityFromTo: "成都 - 成都",
    from: "成都天府 T2",
    to: "天府机场华品酒店",
    timeStart: "22:30",
    timeEnd: "次日 04:30",
    duration: "过夜约 6h",
    price: 380,
    note: "机场内步行 8 分钟 · 含早餐叫醒 · 平台已锁定",
  },
  {
    id: "s4",
    cat: "major",
    catLabel: "大交通",
    mode: "飞机",
    cityFromTo: "成都 - 林芝",
    from: "成都天府 T2",
    to: "林芝米林机场",
    timeStart: "06:50",
    timeEnd: "09:00",
    duration: "2h10m",
    price: 1280,
    flight: { airline: "中国国航", number: "CA4401", aircraft: "空客 A319 高原型" },
    classNote: "经济舱 · 高原机型 · 落地即可看南迦巴瓦日照金山",
  },
  {
    id: "s5",
    cat: "small",
    catLabel: "小交通",
    mode: "包车",
    cityFromTo: "林芝 - 林芝",
    from: "林芝米林机场",
    to: "南迦巴瓦观景台",
    timeStart: "09:30",
    timeEnd: "10:30",
    duration: "1h",
    price: 200,
    note: "司导接机 · 直达观景台拍日照金山",
  },
  {
    id: "s6",
    cat: "small",
    catLabel: "小交通",
    mode: "自驾",
    cityFromTo: "林芝 - 拉萨",
    from: "林芝市区取车点",
    to: HOTEL,
    timeStart: "14:00",
    timeEnd: "18:30",
    duration: "约 4h30m",
    price: 0,
    note: "G4218 林拉高等级公路 · 沿尼洋河 · 已预订 SUV 一价全包",
  },
];

// =====================================================================
// comfort 变体（耗时最短：成都短中转，2h 内接驳上次日早班）
// =====================================================================
const skeletonShortLayover = skeletonOvernight.map((s) => {
  if (s.id === "s2") {
    return {
      ...s,
      timeStart: "20:30",
      timeEnd: "23:40",
      duration: "3h10m",
      price: 1120,
      flight: { airline: "四川航空", number: "3U8888", aircraft: "空客 A350" },
      classNote: "经济舱 · 红眼前一档 · 含 20kg 行李",
    };
  }
  if (s.id === "s3") {
    return {
      ...s,
      mode: "短中转",
      to: "T2 国内中转候机区",
      timeStart: "23:50",
      timeEnd: "次日 05:50",
      duration: "中转停留 6h",
      price: 0,
      note: "中转休息舱 · 免费躺椅 · 无需出航站楼",
    };
  }
  if (s.id === "s6") {
    return {
      ...s,
      mode: "包车",
      from: "林芝米林机场",
      to: HOTEL,
      timeStart: "15:00",
      timeEnd: "19:30",
      duration: "约 4h30m",
      price: 980,
      note: "司导一价全包 · 沿途拍照不限次",
    };
  }
  return s;
});

// =====================================================================
// low 变体（体验最均衡：京→西安转→林芝，节奏从容）
// =====================================================================
const skeletonViaXian = [
  {
    id: "s1",
    cat: "small",
    catLabel: "小交通",
    mode: "打车",
    cityFromTo: "北京 - 北京",
    from: ORIGIN,
    to: "首都机场 T3",
    timeStart: "13:00",
    timeEnd: "14:10",
    duration: "1h10m",
    price: 110,
    note: "打车直达 T3，避免地铁拖箱",
  },
  {
    id: "s2",
    cat: "major",
    catLabel: "大交通",
    mode: "飞机",
    cityFromTo: "北京 - 西安",
    from: "首都 T3",
    to: "西安咸阳 T3",
    timeStart: "16:00",
    timeEnd: "18:20",
    duration: "2h20m",
    price: 760,
    flight: { airline: "海南航空", number: "HU7238", aircraft: "波音 737" },
    classNote: "经济舱 · 含 20kg 行李",
  },
  {
    id: "s3",
    cat: "free",
    catLabel: "自由交通",
    mode: "酒店中转",
    cityFromTo: "西安 - 西安",
    from: "西安咸阳 T3",
    to: "咸阳机场福朋喜来登酒店",
    timeStart: "19:00",
    timeEnd: "次日 06:00",
    duration: "过夜约 11h",
    price: 420,
    note: "机场免费班车 5 分钟 · 节奏从容",
  },
  {
    id: "s4",
    cat: "major",
    catLabel: "大交通",
    mode: "飞机",
    cityFromTo: "西安 - 林芝",
    from: "西安咸阳 T3",
    to: "林芝米林机场",
    timeStart: "08:30",
    timeEnd: "11:30",
    duration: "3h",
    price: 1180,
    flight: { airline: "中国国航", number: "CA4215", aircraft: "空客 A319 高原型" },
    classNote: "经济舱 · 高原机型",
  },
  {
    id: "s5",
    cat: "small",
    catLabel: "小交通",
    mode: "自驾",
    cityFromTo: "林芝 - 林芝",
    from: "林芝米林机场",
    to: "鲁朗林海观景台",
    timeStart: "12:00",
    timeEnd: "13:30",
    duration: "1h30m",
    price: 0,
    note: "顺路看林海，下午茶在鲁朗",
  },
  {
    id: "s6",
    cat: "small",
    catLabel: "小交通",
    mode: "自驾",
    cityFromTo: "林芝 - 拉萨",
    from: "鲁朗",
    to: HOTEL,
    timeStart: "15:30",
    timeEnd: "20:00",
    duration: "约 4h30m",
    price: 0,
    note: "SUV 一价全包 · 米拉山口拍照",
  },
];

// =====================================================================
// 三个方案（横向轮播）
// =====================================================================
export const plans = [
  {
    id: "balanced",
    tag: "价格最实惠",
    primary: true,
    title: "北京经成都过夜，飞林芝看日照金山",
    subtitle: "成都机场酒店过夜，次日早班直飞林芝，落地拍南迦巴瓦。",
    totalTime: "约 27h（含过夜）",
    totalPrice: 2970,
    perHead: 2970,
    headcount: 1,
    miniTimeline: [
      { time: "15:38", text: "望京A座 → 大兴机场", price: 130, sub: "打车 · 1h22m", redPrice: false },
      { time: "19:00", text: "大兴 → 成都天府", price: 980, sub: "国航 CA4194 · 经济舱", redPrice: true },
      { time: "22:30", text: "天府机场华品酒店", price: 380, sub: "机场内 · 过夜 6h", redPrice: false },
      { time: "06:50", text: "成都 → 林芝米林", price: 1280, sub: "国航 CA4401 · 高原机型", redPrice: true },
      { time: "09:30", text: "米林 → 南迦巴瓦观景台", price: 200, sub: "包车 · 1h", redPrice: false },
      { time: "14:00", text: "林芝 → 拉萨", price: 0, sub: "自驾 · G4218 · 4h30m", redPrice: false },
    ],
    fullLegs: [
      { time: "15:38", route: "阿里 望京A座 → 大兴国际机场 国内出发", mode: "打车", duration: "1h22m", price: "¥130", reason: "下午出发避高峰，最省心直达" },
      { time: "19:00", route: "大兴 T1 → 成都天府 T2", mode: "飞机", duration: "约3h10m", code: "国航 CA4194", aircraft: "空客 A330", price: "约¥980", cabin: "经济舱", luggage: "托运行李20公斤 ｜ 手提行李1件，5公斤/件", refundPolicy: "提前 2 小时改期免费", reason: "傍晚航班价格更友好，落地即可入住机场酒店" },
      { time: "22:30", route: "成都天府 T2 → 天府机场华品酒店", mode: "酒店中转", duration: "过夜 6h", price: "¥380", reason: "机场内步行 8 分钟，含叫早，零距离接早班" },
      { time: "06:50", route: "成都天府 T2 → 林芝米林机场", mode: "飞机", duration: "约2h10m", code: "国航 CA4401", aircraft: "空客 A319 高原型", price: "约¥1280", cabin: "经济舱", luggage: "托运行李20公斤 ｜ 手提行李1件，5公斤/件", refundPolicy: "高原航线，改签需提前 4 小时", reason: "早班抵林芝是看南迦巴瓦日照金山的关键时间窗" },
      { time: "09:30", route: "林芝米林机场 → 南迦巴瓦观景台", mode: "包车", duration: "1h", price: "¥200", reason: "司导直接接机，赶上日照金山尾段" },
      { time: "14:00", route: "林芝市区取车点 → 拉萨布达拉宫智选假日酒店", mode: "自驾 SUV", duration: "约4h30m", price: "已含车费", reason: "林拉高等级公路，沿尼洋河风景最佳" },
    ],
    routeMeta: { depart: "15:38", arrive: "次日 18:30", risk: "中", accent: "blue", mapPins: ["北京", "成都", "林芝", "拉萨"], pricePrefix: "预估" },
    segments: skeletonOvernight,
  },
  {
    id: "comfort",
    tag: "耗时最短",
    title: "北京经成都短中转，红眼接早班",
    subtitle: "成都候机区休息 6h 直接转早班，门到门最快。",
    totalTime: "约 24h",
    totalPrice: 3530,
    perHead: 3530,
    headcount: 1,
    miniTimeline: [
      { time: "15:38", text: "望京A座 → 大兴机场", price: 130, sub: "打车 · 1h22m", redPrice: false },
      { time: "20:30", text: "大兴 → 成都天府", price: 1120, sub: "川航 3U8888 · 经济舱", redPrice: true },
      { time: "23:50", text: "T2 中转休息舱", price: 0, sub: "免费躺椅 · 6h", redPrice: false },
      { time: "06:50", text: "成都 → 林芝米林", price: 1280, sub: "国航 CA4401 · 高原机型", redPrice: true },
      { time: "09:30", text: "米林 → 南迦巴瓦", price: 200, sub: "包车 · 1h", redPrice: false },
      { time: "15:00", text: "林芝 → 拉萨", price: 980, sub: "司导一价全包 · 4h30m", redPrice: false },
    ],
    fullLegs: [
      { time: "15:38", route: "阿里 望京A座 → 大兴国际机场 国内出发", mode: "打车", duration: "1h22m", price: "¥130", reason: "市内打车更稳" },
      { time: "20:30", route: "大兴 T1 → 成都天府 T2", mode: "飞机", duration: "约3h10m", code: "川航 3U8888", aircraft: "空客 A350", price: "约¥1120", cabin: "经济舱", luggage: "托运行李20公斤 ｜ 手提行李1件，5公斤/件", refundPolicy: "提前 4 小时改期免费", reason: "晚班直达，落地后无需出航站楼" },
      { time: "23:50", route: "成都天府 T2 → 国内中转候机区", mode: "短中转", duration: "6h", price: "¥0", reason: "免费休息舱，省一晚酒店开销" },
      { time: "06:50", route: "成都天府 T2 → 林芝米林机场", mode: "飞机", duration: "约2h10m", code: "国航 CA4401", aircraft: "空客 A319 高原型", price: "约¥1280", cabin: "经济舱", luggage: "托运行李20公斤", reason: "卡日照金山时间窗" },
      { time: "09:30", route: "林芝米林机场 → 南迦巴瓦观景台", mode: "包车", duration: "1h", price: "¥200", reason: "司导直送" },
      { time: "15:00", route: "林芝米林机场 → 拉萨布达拉宫智选假日酒店", mode: "包车", duration: "约4h30m", price: "¥980", reason: "无需自驾，体力更省" },
    ],
    routeMeta: { depart: "15:38", arrive: "次日 19:30", risk: "中高", accent: "green", mapPins: ["北京", "成都", "林芝", "拉萨"], pricePrefix: "预估" },
    segments: skeletonShortLayover,
  },
  {
    id: "low",
    tag: "体验最均衡",
    title: "北京经西安过夜，自驾林芝-拉萨",
    subtitle: "古都过夜，节奏从容；高原段轻量自驾，沿途打卡更多。",
    totalTime: "约 31h（含过夜）",
    totalPrice: 2470,
    perHead: 2470,
    headcount: 1,
    miniTimeline: [
      { time: "13:00", text: "望京A座 → 首都 T3", price: 110, sub: "打车 · 1h10m", redPrice: false },
      { time: "16:00", text: "首都 → 西安咸阳", price: 760, sub: "海航 HU7238 · 经济舱", redPrice: true },
      { time: "19:00", text: "咸阳机场福朋酒店", price: 420, sub: "机场班车 5m · 过夜 11h", redPrice: false },
      { time: "08:30", text: "西安 → 林芝米林", price: 1180, sub: "国航 CA4215 · 高原机型", redPrice: true },
      { time: "12:00", text: "米林 → 鲁朗", price: 0, sub: "自驾 · 1h30m", redPrice: false },
      { time: "15:30", text: "鲁朗 → 拉萨", price: 0, sub: "自驾 · 4h30m", redPrice: false },
    ],
    fullLegs: [
      { time: "13:00", route: "阿里 望京A座 → 首都机场 T3", mode: "打车", duration: "1h10m", price: "¥110", reason: "中午出发避高峰，路况平稳" },
      { time: "16:00", route: "首都 T3 → 西安咸阳 T3", mode: "飞机", duration: "约2h20m", code: "海航 HU7238", aircraft: "波音 737", price: "约¥760", cabin: "经济舱", luggage: "托运行李20公斤", reason: "经西安段票价低，节奏更松" },
      { time: "19:00", route: "西安咸阳 T3 → 咸阳机场福朋喜来登酒店", mode: "酒店中转", duration: "11h", price: "¥420", reason: "免费班车直达，可顺便品尝陕菜" },
      { time: "08:30", route: "西安咸阳 T3 → 林芝米林机场", mode: "飞机", duration: "约3h", code: "国航 CA4215", aircraft: "空客 A319 高原型", price: "约¥1180", cabin: "经济舱", luggage: "托运行李20公斤", reason: "白天班次抵高原，更利于身体适应" },
      { time: "12:00", route: "林芝米林机场 → 鲁朗林海观景台", mode: "自驾 SUV", duration: "1h30m", price: "已含车费", reason: "顺路打卡，下午茶补给" },
      { time: "15:30", route: "鲁朗 → 拉萨布达拉宫智选假日酒店", mode: "自驾 SUV", duration: "约4h30m", price: "已含车费", reason: "米拉山口拍照，节奏从容" },
    ],
    routeMeta: { depart: "13:00", arrive: "次日 20:00", risk: "中", accent: "orange", mapPins: ["北京", "西安", "林芝", "拉萨"], pricePrefix: "预估" },
    segments: skeletonViaXian,
  },
];

// =====================================================================
// 占位导出：以下字段在后续 task 1.3 / 1.4 / 1.5 / 1.6 / 1.7 中填充
// 先用最小可运行结构，确保 import 不报错。
// =====================================================================

// ---------- 需求收敛 Q&A ----------
export const intakeQuestions = [
  {
    id: "q-trigger",
    type: "user-question",
    text: "6月1号下午从望京A座出发去西藏，第二天想在林芝看南迦巴瓦日照金山，可以中转过夜，后面自驾到拉萨，怎么安排？",
  },
  {
    id: "q-intro",
    type: "assistant-text",
    text: "为了更好地给你推荐西藏行程，还需要回答几个问题，告诉我你的诉求：",
  },
  {
    id: "q1",
    type: "qa",
    prompt: "市内交通你希望？",
    hint: "决定你怎么去机场，影响时间和体验",
    options: [
      { id: "metro", label: "地铁/机场快线", sub: "更省钱，但搬运行李更累" },
      { id: "taxi", label: "打车", sub: "下午出发更稳，省心直达", default: true },
    ],
  },
  {
    id: "q2",
    type: "qa",
    prompt: "中转过夜你倾向？",
    hint: "中转地会影响第二天看日照金山的时间窗",
    options: [
      {
        id: "ctu-overnight",
        label: "成都机场过夜",
        sub: "次日早班直飞林芝，赶得上日照金山",
        default: true,
      },
      { id: "any", label: "都可以", sub: "看综合价格和体验" },
    ],
  },
  {
    id: "q3",
    type: "qa",
    prompt: "拉萨段你打算？",
    hint: "影响林芝→拉萨这段的安排",
    options: [
      {
        id: "selfdrive",
        label: "自驾 SUV",
        sub: "林拉高等级公路 · 沿尼洋河 · 已含一价全包",
        default: true,
        userText: "我已选好自驾 SUV，沿 G4218 走",
      },
      { id: "charter", label: "包车送达", sub: "司导一价全包，体力更省" },
    ],
  },
];

// ---------- 首页起手问句 ----------
export const homeSamples = [
  "6 月想带爸妈去西藏，预算紧一点，怎么走最省心？",
  "我在北京，3 天小长假想去林芝看雪山，怎么安排？",
  intakeQuestions[0].text,
];
// ---------- 乘机人 ----------
export const passengers = [
  { id: "p1", name: "李雷", self: true, idNo: "110108 19900909 9999", selected: true },
  { id: "p2", name: "韩梅梅", idNo: "110108 19920202 8888", selected: true },
  { id: "p3", name: "李伯", idNo: "110108 19620707 7777", selected: false },
];

// ---------- 订单 ----------
export const order = {
  contact: "138 1188 6688",
  policy:
    "我已阅读并同意《国内航空运输总条件》、《会员通则》、《购票须知》、《租车一价全包条款》以及个人信息处理相关条款…",
};

// ---------- 行前注意事项（西藏高原向） ----------
export const prepCards = [
  {
    id: "id-card",
    date: `${TRIP_DATE} 出发前`,
    title: "确认身份证有效",
    sub: "国内航班 / 高铁 / 酒店均需身份证原件",
    detail:
      "出发前一周确认身份证未过期。临时身份证、户口本不可登机。建议加扫描件备份至云盘。",
  },
  {
    id: "altitude",
    date: `${TRIP_DATE} 出发前 7 天起`,
    title: "高原反应预防",
    sub: "提前服用红景天 / 携带氧气瓶",
    detail:
      "林芝海拔约 2900m，拉萨约 3650m。建议出发前 7 天开始服用红景天；落地后 24h 内不洗澡、不剧烈运动；随身备小型氧气瓶（民航可托运 1 罐 ≤ 100ml）。",
  },
  {
    id: "weather",
    date: `${TRIP_DATE} 出发前 1 天`,
    title: "南迦巴瓦云开率确认",
    sub: "次日清晨能否看到日照金山取决于云量",
    detail:
      "出发前一天检查林芝米林天气，若云开率 < 30%，AI 会建议你顺延一天或调整观景点（鲁朗 / 索松村备选）。",
  },
  {
    id: "drive",
    date: `${TRIP_DATE} 出发前`,
    title: "自驾资料准备",
    sub: "驾照原件 + 取车码 + 路况预判",
    detail:
      "林芝米林机场租车点已锁定 SUV 一价全包。出发前确认驾照有效、提前在 App 录入证件；G4218 林拉公路全程限速 80，沿途有多处区间测速。",
  },
];
// ---------- 我的行程（中控台卡）----------
// 与国际版对应关系：trip-hkg-airport（香港机场）→ trip-ctu-airport（成都天府机场过夜中转）
// open-trip-card 的特殊路由：DeviceShell.tsx 里硬编码了 trip-hkg-airport → /flipbook，
// 国内版借用同一卡 id 触发同一路由，因此中转管家卡 id 仍保留 "trip-hkg-airport"，
// 但 detail 全部国内化，避免改动 DeviceShell 路由层。
export const myTrips = [
  {
    id: "trip-disruption",
    kind: "disruption",
    short: { topLine: "航变提醒", title: "CA4194 已取消", sub: "可免费改签 / 退款" },
  },
  {
    id: "trip-notice",
    kind: "notice",
    short: { topLine: "行前", title: "高反预防", sub: "红景天 / 氧气瓶" },
    detail: {
      headline: "西藏行前注意事项",
      lead: "出发前 7 天将统一推送提醒，你也可以现在自查。",
      bullets: [
        "身份证有效期确认（国内航班 / 高铁 / 酒店均需）",
        "提前 7 天开始服用红景天，落地后 24h 不洗澡、不剧烈运动",
        "随身备小型氧气瓶（民航可托运 1 罐 ≤ 100ml）",
        "驾照原件 + 取车码：林芝米林机场 SUV 一价全包已锁定",
      ],
    },
  },
  {
    id: "trip-pack",
    kind: "luggage",
    short: { topLine: "出发前一晚", title: "行李清单", sub: "证件 + 高反药" },
    detail: {
      headline: "出发前一晚 · 高原行李检查清单",
      time: "2026/05/31 21:00 提醒",
      lead: "证件、现金、充电宝、防晒、保暖随身。林芝早晚温差大，建议带抓绒。",
      bullets: [
        "身份证 + 驾照 + 一份复印件",
        "红景天 / 葡萄糖 / 一次性氧气瓶 ≤ 100ml",
        "防晒霜 SPF50+ / 墨镜 / 唇膏（高原紫外线强）",
        "抓绒衣 + 冲锋衣（林芝清晨 5–10℃）",
      ],
    },
  },
  {
    id: "trip-day-taxi",
    kind: "taxi",
    short: { topLine: "出发当天", title: "望京A座打车", sub: "→ 大兴机场" },
    detail: {
      headline: "阿里望京A座打车到大兴国际机场",
      time: `${TRIP_DATE} 15:38-17:00`,
      lead:
        "已自动预约打车，司机将在 15:25 联系你。建议提前 10 分钟下楼，避免行李装车时间不够。",
      bullets: [
        "上车点：望京 A 座南门",
        "目的地：大兴国际机场 国内出发 4 号门",
        "用时约 1h22m，¥130",
      ],
    },
  },
  {
    id: "trip-flight-bjs",
    kind: "flight",
    short: { topLine: "19:00", title: "国航 CA4194", sub: "→ 成都" },
    detail: {
      headline: "中国国航 CA4194 北京 → 成都",
      time: `${TRIP_DATE} 19:00-22:10`,
      lead:
        "起飞前 90 分钟具体登机口才会公布。建议 17:30 抵达 T1 国内出发，留充裕安检时间。",
      bullets: [
        "经济舱 6.0 折，约 ¥980",
        "托运行李 20kg × 1，手提 5kg × 1",
        "餐食：晚餐 + 一次饮品",
        "提前 2 小时改期免费",
      ],
    },
  },
  // —— 中转管家卡（成都天府机场过夜版）——
  // id 故意保留 trip-hkg-airport，复用 DeviceShell 的 open-trip-card → /flipbook 路由
  {
    id: "trip-hkg-airport",
    kind: "airport",
    short: { topLine: "22:30", title: "成都天府机场", sub: "T2 过夜中转 6h" },
    detail: {
      headline: "成都天府国际机场",
      sub: "成都机场过夜中转路线如下",
      transit: {
        mode: "family",
        modeLabel: "亲子家庭",
        modeTagline: "少走路、能过夜、卡早班",
        flightArrive: "22:10",
        flightDepart: "06:50",
        layoverText: "约 8h40m（含过夜）",
        layoverFeel: "充裕",
        timeTier: "ample",
        counterGuidance: {
          needCounter: false,
          airlineLine: "国航联程 · 下一程 CA4401（成都 → 林芝米林）",
          summary: "AI 判断为国航联程：电子登机牌已覆盖下一程，无需在中转柜台二次办理。",
          nextStep: "请按「中转 / Transfer」标识进入 T2 国内中转通道，先去机场酒店休息。",
        },
        routeChain: [
          { id: "arrive", label: "T2 抵达 L2", sub: "国内中转", tone: "default" },
          { id: "transfer", label: "国内中转通道", sub: "无需出航站楼", tone: "default" },
          { id: "hotel", label: "天府机场华品酒店", sub: "步行 8 分钟", tone: "default" },
          { id: "gate", label: "次日 06:50 登机口", sub: "C 区 待定", tone: "default" },
        ],
        boardingCountdown: {
          phaseLabel: "次日预计登机开始",
          minutesToBoarding: 480,
          boardingLabel: "次日 06:20 起可能开始登机",
          strategyGuide:
            "当前为「时间充裕」档位：建议先入住机场酒店休息 6h，05:30 叫早，安检后直接登机。",
        },
        anomalies: [
          {
            level: "warn",
            title: "登机口尚未最终锁定",
            detail: "路线按 C 区预估；起飞前 90 分钟请以航显/国航 App 为准，若变更将推送修正动线。",
          },
          {
            level: "info",
            title: "高原航班易受天气影响",
            detail: "林芝米林机场属高原机场，遇大风/低能见度可能延误。建议出发前再次查看航班动态。",
          },
          {
            level: "info",
            title: "次日早起需提前 30 分钟出酒店",
            detail: "酒店到 T2 国内安检步行约 8 分钟，建议 05:50 退房直奔安检口。",
          },
        ],
        boardingPassStatus: {
          ok: true,
          label: "已检测到下一程电子登机牌",
          tip: "国航联程已贯通，可直接走中转通道前往机场酒店",
          actionLine: "结论：你现在可以直接前往天府机场华品酒店休息，无需先到柜台办理。",
        },
        flightStatus: {
          code: "国航 CA4401",
          status: "准点",
          gateNote: "登机口将于起飞前 90 分钟在航显与国航 App 公布。请留意广播信息。",
        },
        familyChecks: [
          {
            label: "机场酒店与叫早",
            tip: "酒店含早班叫醒服务（05:30），可提前在前台确认；建议房间不挨电梯井，便于休息",
          },
          {
            label: "高反预防",
            tip: "成都海拔 500m 不会有高反；但抵林芝后 24h 内不剧烈运动，氧气瓶随身",
          },
          {
            label: "亲子早班登机",
            tip: "携带 2 岁以下儿童可走家庭通道，主动告知地勤即可优先安检",
          },
        ],
        tasks: [
          { id: "arrive",   order: 1, time: "22:10", route: "下机 → T2 L2 国内中转区", mode: "步行", duration: "5m", reason: "已抵达中转区域", mapTarget: "overview" },
          { id: "hotel",    order: 2, time: "22:30", route: "T2 → 天府机场华品酒店", mode: "步行 · 8m", duration: "8m", reason: "机场内步行直达，含叫早", family: true, mapTarget: "checkin" },
          { id: "rest",     order: 3, time: "23:00", route: "酒店休息 6h", mode: "过夜", duration: "6h", reason: "05:30 含早叫醒，05:50 退房", family: true, mapTarget: "security" },
          { id: "boarding", order: 4, time: "06:20", route: "退房 → 国内安检 → 登机口（C 区）", mode: "步行", duration: "30m", reason: "登机口公布后将自动更新路线", mapTarget: "lounge" },
        ],
        services: [
          {
            id: "hotel",
            icon: "stroller",
            family: true,
            title: "天府机场华品酒店",
            sub: "T2 步行 8 分钟 · 含叫早 · 平台已锁定",
            tag: "顺路",
            note: "次日早班最省力的过夜选择",
          },
          {
            id: "lounge",
            icon: "play",
            family: true,
            title: "国航贵宾休息室",
            sub: "T2 国内中转区 · 提供热食与淋浴",
            tag: "时间充裕",
            note: "若不入住酒店，可在此候机休整",
          },
          {
            id: "oxygen",
            icon: "calm",
            family: true,
            title: "便利店购氧气瓶",
            sub: "T2 抵达层便利店 · ≤ 100ml 可托运",
            tag: "建议",
            note: "为林芝高反做准备，提前买好备用",
          },
          {
            id: "nursery",
            icon: "baby",
            family: true,
            title: "T2 母婴室",
            sub: "L2 中转区 · 含尿布台与温奶器",
            tag: "顺路",
            note: "夜间也开放，紧急哺乳可用",
          },
        ],
        tips: [
          "次日早班建议 05:50 退房直奔安检，避免延误",
          "氧气瓶 ≤ 100ml 可托运 1 罐；> 100ml 必须办理特殊行李",
          "携带 2 岁以下儿童可优先登机，登机口前主动告知地勤",
        ],
      },
      // 视觉资源（地图与转场视频）暂时复用 HKG 资源；task 4.3 完善节点文案
      airportFlipbook: {
        rootNodeId: "overview",
        hotspots: [
          { id: "checkin",  target: "checkin",  x: 0.40, y: 0.66, label: "机场酒店 · 步行 8m" },
          { id: "security", target: "security", x: 0.55, y: 0.50, label: "国内中转通道" },
          { id: "spine",    target: "spine",    x: 0.46, y: 0.31, label: "便利店 · 购氧" },
          { id: "lounge",   target: "lounge",   x: 0.64, y: 0.32, label: "次日登机口 · C 区" },
        ],
        nodes: [
          {
            id: "overview",
            image: "/assets/main-demo-v4/airport/overview.png",
            bodyTitle: "机场地图",
            body: "你正在成都天府 T2 国内中转，下方是机场内的过夜中转动线。点击地图上的蓝色光圈可以查看每一步的具体位置与说明。",
          },
          {
            id: "checkin",
            image: "/assets/main-demo-v4/airport/frame_checkin.png",
            bodyTitle: "入住机场酒店",
            body: "从 T2 抵达 L2 出来后跟「酒店 / Hotel」标识，步行约 8 分钟到天府机场华品酒店，平台已锁定房间，前台报姓名即可入住。",
          },
          {
            id: "security",
            image: "/assets/main-demo-v4/airport/frame_security.png",
            bodyTitle: "次日 · 国内中转通道",
            body: "退房后回到 T2 国内安检，携带身份证即可。携带 2 岁以下儿童可走家庭通道，安检时主动告知地勤。",
          },
          {
            id: "spine",
            image: "/assets/main-demo-v4/airport/frame_spine.png",
            bodyTitle: "便利店购氧气瓶",
            body: "T2 抵达层便利店有 100ml 装氧气瓶，可托运 1 罐，为林芝高反做准备。也有热饮与早餐可补给。",
          },
          {
            id: "lounge",
            image: "/assets/main-demo-v4/airport/frame_lounge.png",
            bodyTitle: "次日 06:50 登机口（C 区）",
            body: "下一程登机口预计在 C 区，将于起飞前 90 分钟在航显公布。沿途有自助贩卖机与休息座椅，可顺路歇脚再前往登机口。",
          },
        ],
        edges: [
          { from: "overview", to: "checkin",  video: "/assets/main-demo-v4/airport/transitions/overview_to_checkin.mp4" },
          { from: "overview", to: "security", video: "/assets/main-demo-v4/airport/transitions/overview_to_security.mp4" },
          { from: "overview", to: "spine",    video: "/assets/main-demo-v4/airport/transitions/overview_to_spine.mp4" },
          { from: "overview", to: "lounge",   video: "/assets/main-demo-v4/airport/transitions/overview_to_lounge.mp4" },
        ],
      },
    },
  },
  {
    id: "trip-flight-ctu",
    kind: "flight",
    short: { topLine: "06:50", title: "国航 CA4401", sub: "→ 林芝米林" },
    detail: {
      headline: "中国国航 CA4401 成都 → 林芝米林",
      time: "次日 06:50-09:00",
      lead: "高原机型 A319，落地即可看南迦巴瓦日照金山。建议提前服用葡萄糖。",
      bullets: [
        "经济舱，约 ¥1280",
        "托运行李 20kg × 1，手提 5kg × 1",
        "高原航线，改签需提前 4 小时",
        "落地林芝海拔 2900m，请缓步走出航站楼",
      ],
    },
  },
  {
    id: "trip-arrive",
    kind: "taxi",
    short: { topLine: "14:00", title: "林芝→拉萨", sub: "自驾 · G4218" },
    detail: {
      headline: "林芝米林 → 拉萨自驾",
      time: "次日 14:00-18:30",
      lead:
        "SUV 已在米林机场租车点交付。沿 G4218 林拉高等级公路全程约 4h30m，沿尼洋河风景最佳。",
      bullets: [
        "里程约 410km，全程限速 80",
        "途经米拉山口（5013m）建议短停拍照",
        "酒店：拉萨布达拉宫智选假日酒店",
        "AI 已根据预计抵达时间预留客房",
      ],
    },
  },
];
// ---------- 服务权益（国内版，去掉跨境/签证类）----------
export const perks = {
  title: "服务权益",
  subtitle: "所有方案共享",
  intro: "提供平台服务保障：行程联动、免费退改、高原出行守护",
  items: [
    {
      icon: "delay",
      title: "延误免费改行程",
      sub: "航班延误取消，可免费换为其他时间班次，并联动后续接驳",
    },
    {
      icon: "navigate",
      title: "AI 机场导航",
      sub: "成都天府 / 林芝米林等机场室内导航，快速找到登机口、酒店、租车点",
    },
    {
      icon: "taxi",
      title: "AI 智能预约打车 / 接机",
      sub: "根据航班实际到达时间自动派车，林芝米林落地即走",
    },
    {
      icon: "shield",
      title: "300 万航空意外险 + 高原医疗",
      sub: "每人航空意外险 300 万；高原段附赠 24h 远程医生咨询",
    },
    {
      icon: "gift",
      title: "高原出行礼包",
      sub: "葡萄糖 + 红景天试用装 + 30 元租车券 + 15 元便利店券",
    },
  ],
};

// ---------- 退改：解析价格小工具（与 data.js 实现一致）----------
function parsePrice(value) {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

// ---------- 退改：航变重排数据 ----------
// 国内版航变场景：成都过夜 → 林芝米林 段（CA4401）因高原大风取消，
// 平台保护到次日同公司次班 CA4403，自驾段时间联动顺延。
export function buildDisruption(plan) {
  const legs = plan?.fullLegs || [];
  // 找到「飞机」段中靠后的一段（多为 成都→林芝 / 西安→林芝），把它视为受影响主段
  const flightIdxs = legs.map((l, i) => (l.mode === "飞机" ? i : -1)).filter((i) => i >= 0);
  const flightIndex = flightIdxs.length >= 2 ? flightIdxs[flightIdxs.length - 1] : flightIdxs[0] ?? -1;
  // 「自驾」/「包车」是落地后的接驳段
  const pickupIndex = legs.findIndex((l) => /自驾|包车|接机/.test(l.mode));
  // 「酒店中转」/「短中转」是飞机前的衔接段
  const busIndex = legs.findIndex((l) => /酒店中转|短中转|大巴|高铁|机场快线|机场巴士/.test(l.mode));
  const affectedIds = [busIndex, flightIndex, pickupIndex].filter((i) => i >= 0).map((i) => `s${i + 1}`);
  const flightLeg = legs[flightIndex] || legs.find((l) => l.mode === "飞机");
  const pickupLeg = legs[pickupIndex] || legs.find((l) => /自驾|包车|接机/.test(l.mode));
  const busLeg = legs[busIndex] || legs[1];

  return {
    reason: "高原大风，航司取消航班",
    originalFlight: flightLeg,
    affected: affectedIds,
    impactList: legs.map((leg, index) => {
      const id = `s${index + 1}`;
      const impacted = affectedIds.includes(id);
      let status = "不受影响";
      let detail = "已为你保留原计划";
      if (index === busIndex) {
        status = "需顺延";
        detail = "原中转衔接无法接到新航班，平台将顺延到对应班次";
      } else if (index === flightIndex) {
        status = "航变取消";
        detail = "航司取消原航班，符合免费退改保障";
      } else if (index === pickupIndex) {
        status = "自动调整";
        detail = "落地接驳/自驾交付时间将按新航班落地时间自动顺延";
      }
      return {
        id,
        mode: leg.mode,
        time: leg.time || "",
        route: leg.route,
        price: leg.price || "",
        impacted,
        status,
        detail,
      };
    }),
    alternative: {
      code: "国航 CA4403",
      time: "10:20→12:30",
      priceDelta: 0,
      oldCode: flightLeg?.code || "国航 CA4401",
      oldTime: flightLeg?.time || "06:50",
    },
    replanRows: [
      {
        label: busLeg?.mode || "中转衔接",
        before: busLeg ? `${busLeg.time || ""} ${busLeg.route}` : "原中转方案",
        after: "酒店延住至 09:00，平台已通知前台续房",
      },
      {
        label: "航班",
        before: flightLeg ? `${flightLeg.code || "原航班"} ${flightLeg.time || ""}` : "原航班",
        after: "国航 CA4403 10:20→12:30，舱等和行李额不变",
      },
      {
        label: pickupLeg?.mode || "落地接驳",
        before: pickupLeg ? `${pickupLeg.time || ""} ${pickupLeg.route}` : "原落地方案",
        after: "13:00 林芝米林机场租车点交付 SUV，沿途行程顺延",
      },
    ],
    newPickupTime: "13:00",
    refundTotal: plan?.totalPrice || legs.reduce((sum, leg) => sum + parsePrice(leg.price), 0),
    fee: 0,
  };
}

// ---------- 退改进度文案 ----------
export const replanProcessSteps = [
  "确认航司高原保护规则",
  "锁定替代航班与酒店续住",
  "联动林芝租车交付时间",
  "生成新行程单",
];

export const refundAllProcessSteps = [
  "校验航变免费退权益",
  "取消全链路 6 段订单",
  "提交原路退款",
  "释放酒店、租车与接驳库存",
];
