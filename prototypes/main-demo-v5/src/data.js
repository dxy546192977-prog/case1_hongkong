// 数据来源：Figma 串联（POSvyVpttmrGQII4L7wnIl, 2026-05-04 lastModified）+
// 综合交通行程_香港机场.png（6 段骨架）。
// 3 个方案都基于 6 段骨架，差别只在「广州→香港」段的交通方式与价格。
// 方案 3（直飞）压缩为 4 段：跳过香港中转。

const ORIGIN = "东莞 联丰苑";
const HOTEL = "雪邦黄金海岸安凡尼度假酒店";
const TRIP_DATE = "2026/06/01";

// ---------- 6 段骨架（轮渡版本，对应方案 2，也是「综合交通行程_香港机场」原表）----------

const skeletonFerry = [
  {
    id: "s1",
    cat: "small",
    catLabel: "小交通",
    mode: "打车",
    cityFromTo: "东莞 - 广州",
    from: ORIGIN,
    to: "虎门港澳客运码头",
    timeStart: "5:20",
    timeEnd: "5:30",
    duration: "10m",
    price: 30,
    note: "打车 10 分钟到虎门客运码头",
  },
  {
    id: "s2",
    cat: "major",
    catLabel: "大交通",
    mode: "轮渡",
    cityFromTo: "广州 - 香港",
    from: "虎门港澳客运码头",
    to: "香港国际机场 T1",
    timeStart: "7:50",
    timeEnd: "9:20",
    duration: "1h30m",
    price: 380,
    note: "轮渡跨境 · 一次出入境",
  },
  {
    id: "s3",
    cat: "free",
    catLabel: "自由交通",
    mode: "步行",
    cityFromTo: "香港 - 香港",
    from: "香港国际机场 T1",
    to: "香港国际机场 T1",
    duration: "中转停留 3h20m",
    price: 0,
    note: "步行 · 逛免税店",
  },
  {
    id: "s4",
    cat: "major",
    catLabel: "大交通",
    mode: "飞机",
    cityFromTo: "香港 - 吉隆坡",
    from: "香港国际机场 T1",
    to: "吉隆坡国际 T1",
    timeStart: "12:40",
    timeEnd: "16:40",
    duration: "4h",
    price: 624,
    discount: 80,
    flight: { airline: "中国国航", number: "CA857", aircraft: "空客 320 中" },
    classNote: "经济舱 5.2 折 · 托运行李 25 公斤 · 退改 ¥80 起",
  },
  {
    id: "s5",
    cat: "free",
    catLabel: "自由交通",
    mode: "步行",
    cityFromTo: "吉隆坡 - 吉隆坡",
    from: "吉隆坡国际 T1",
    to: "吉隆坡国际 T1 打车点",
    duration: "10m",
    price: 0,
    note: "步行约 1.2km",
  },
  {
    id: "s6",
    cat: "small",
    catLabel: "小交通",
    mode: "打车",
    cityFromTo: "吉隆坡 - 吉隆坡",
    from: "吉隆坡国际 T1",
    to: HOTEL,
    timeStart: "17:00",
    timeEnd: "17:44",
    duration: "44m",
    price: 30,
    note: "打车 30km",
  },
];

// 大巴变体：段 2 改为大巴（更便宜，但通关 2 次）
const skeletonBus = skeletonFerry.map((s) =>
  s.id === "s2"
    ? {
        ...s,
        mode: "大巴",
        from: "广州客运站",
        to: "香港国际机场 T1",
        timeStart: "7:30",
        timeEnd: "10:30",
        duration: "3h",
        price: 200,
        note: "大巴跨境 · 两次出入境",
      }
    : s.id === "s1"
    ? {
        ...s,
        from: ORIGIN,
        to: "广州客运站",
        timeStart: "5:20",
        timeEnd: "6:00",
        duration: "40m",
        note: "打车 40 分钟到广州客运站",
      }
    : s,
);

// 直飞变体：跳过香港中转 → 4 段
const skeletonDirect = [
  {
    id: "s1",
    cat: "small",
    catLabel: "小交通",
    mode: "打车",
    cityFromTo: "东莞 - 广州",
    from: ORIGIN,
    to: "广州白云国际机场 T2",
    timeStart: "8:30",
    timeEnd: "10:30",
    duration: "2h",
    price: 220,
    note: "打车 120 公里到广州白云机场",
  },
  {
    id: "s2",
    cat: "major",
    catLabel: "大交通",
    mode: "飞机",
    cityFromTo: "广州 - 吉隆坡",
    from: "广州白云国际机场 T2",
    to: "吉隆坡国际 T1",
    timeStart: "13:35",
    timeEnd: "17:55",
    duration: "4h20m",
    price: 2303,
    flight: { airline: "南方航空", number: "CZ357", aircraft: "波音 738" },
    classNote: "经济舱 · 直飞 · 含 23kg 行李",
  },
  {
    id: "s3",
    cat: "free",
    catLabel: "自由交通",
    mode: "步行",
    cityFromTo: "吉隆坡 - 吉隆坡",
    from: "吉隆坡国际 T1",
    to: "吉隆坡国际 T1 打车点",
    duration: "10m",
    price: 0,
    note: "步行约 1.2km",
  },
  {
    id: "s4",
    cat: "small",
    catLabel: "小交通",
    mode: "打车",
    cityFromTo: "吉隆坡 - 吉隆坡",
    from: "吉隆坡国际 T1",
    to: HOTEL,
    timeStart: "18:30",
    timeEnd: "19:14",
    duration: "44m",
    price: 30,
    note: "打车 30km",
  },
];

// ---------- 3 方案（横向轮播）----------
// v3 step 2：方案数据来源切换到分支 demo (chat-demo2-legacy/script.js)。
// 卡片皮 (plan-cards.js 的 render 模板) 保持 v2 不变。
// 路线策略：东莞 → 经香港 / 经深圳 / 经广州 → 吉隆坡，3 条对称中转方案。
// fullLegs 保留分支完整段数据 (含航班号/舱位/行李/退改/reason)，留给 step 4 路线地图页使用。
// segments 字段暂时映射到既有 skeleton (内容不对应)，step 4 路线地图页落地后会替换掉 itinerary-detail。

export const plans = [
  {
    id: "balanced",
    tag: "价格最实惠",
    primary: true,
    title: "东莞经香港，飞吉隆坡",
    subtitle: "跨境机场大巴直达香港机场，整体成本最低。",
    totalTime: "12h40m",
    totalPrice: 1545,
    perHead: 1545,
    headcount: 1,
    miniTimeline: [
      { time: "06:20", text: "金域名苑 → 南城候机楼", price: 40, sub: "打车 · 25-40m", redPrice: false },
      { time: "07:10", text: "南城候机楼 → 香港 T1", price: 199, sub: "跨城机场大巴 · 2h30m", redPrice: false },
      { time: "12:40", text: "香港 T1 → 吉隆坡 T1", price: 1211, sub: "国泰 CX725 · 经济舱", redPrice: true },
      { time: "18:00", text: "吉隆坡 T1 → 雪邦酒店", price: 95, sub: "接机 · 45-60m", redPrice: false },
    ],
    fullLegs: [
      { time: "06:20", route: "东莞金域名苑 → 东莞南城候机楼", mode: "打车", duration: "25-40m", price: "¥40", reason: "最省时，避免拖箱换乘" },
      { time: "07:10", route: "东莞南城候机楼 → 香港国际机场 T1", mode: "跨城机场大巴", duration: "约2h30m", price: "¥199", reason: "直达机场，跨境最稳" },
      { time: "09:40", route: "到达香港国际机场 T1", mode: "值机 / 托运 / 安检", duration: "预留约3h", reason: "规避口岸与排队不确定性" },
      { time: "12:40", route: "香港机场 T1 → 吉隆坡 KUL T1", mode: "飞机", duration: "约4h", code: "国泰 CX725", aircraft: "777-300", price: "约¥1211", cabin: "经济舱", luggage: "托运行李20公斤 ｜ 手提行李1件，8公斤/件", refundPolicy: "提前改期免费，退票按航司规则", reason: "时间段最佳，直飞性价比高" },
      { time: "16:40", route: "到达吉隆坡 KUL T1", mode: "入境 / 取行李", duration: "预留50-80m", reason: "国际入境常规缓冲" },
      { time: "18:00", route: "吉隆坡 KUL T1 → 雪邦黄金海岸安凡尼度假酒店", mode: "接机", duration: "45-60m", price: "¥95", reason: "最便宜直达酒店" },
    ],
    routeMeta: { depart: "06:20", arrive: "19:00", risk: "低", accent: "blue", mapPins: ["东莞", "香港", "吉隆坡"], pricePrefix: "预估" },
    segments: skeletonBus,
  },
  {
    id: "comfort",
    tag: "耗时最短",
    title: "东莞经深圳，飞吉隆坡",
    subtitle: "深圳直飞，门到门时间最短。",
    totalTime: "8h35m",
    totalPrice: 1660,
    perHead: 1660,
    headcount: 1,
    miniTimeline: [
      { time: "11:20", text: "金域名苑 → 南城候机楼", price: 45, sub: "打车 · 25-35m", redPrice: false },
      { time: "12:10", text: "南城候机楼 → 深圳 T3", price: 45, sub: "机场巴士 · 60m", redPrice: false },
      { time: "14:40", text: "深圳 T3 → 吉隆坡 T1", price: 1475, sub: "深航 ZH329 · 经济舱", redPrice: true },
      { time: "19:10", text: "吉隆坡 T1 → 雪邦酒店", price: 95, sub: "接机 · 45-60m", redPrice: false },
    ],
    fullLegs: [
      { time: "11:20", route: "东莞金域名苑 → 东莞南城CBD候机楼", mode: "打车", duration: "25-35m", price: "¥45", reason: "先到候机楼办接驳，带行李更省心" },
      { time: "12:10", route: "东莞南城CBD候机楼 → 深圳宝安机场 T3", mode: "机场巴士", duration: "约60m", price: "¥45", reason: "深圳机场官方城市候机楼直连，时间更可控" },
      { time: "13:20", route: "到达深圳宝安机场 T3", mode: "值机 / 托运 / 安检", duration: "预留约1h20m", reason: "直飞方案只保留必要缓冲，尽量压缩门到门时间" },
      { time: "14:40", route: "深圳宝安 T3 → 吉隆坡 KUL T1", mode: "飞机", duration: "约4h05m", code: "深航 ZH329", aircraft: "A320", price: "约¥1475", cabin: "经济舱", luggage: "托运行李20公斤 ｜ 手提行李1件，8公斤/件", refundPolicy: "提前改期免费，退票按航司规则", reason: "参考近期公开班期，深圳直飞里兼顾效率和稳定性" },
      { time: "18:45", route: "到达吉隆坡 KUL T1", mode: "入境 / 取行李", duration: "预留25-40m", reason: "下午落地，通关后还能留出接驳余量" },
      { time: "19:10", route: "吉隆坡 KUL T1 → 雪邦黄金海岸安凡尼度假酒店", mode: "接机", duration: "45-60m", price: "¥95", reason: "落地后直达酒店，全程不再二次换乘" },
    ],
    routeMeta: { depart: "11:20", arrive: "19:55", risk: "很低", accent: "green", mapPins: ["东莞", "深圳", "吉隆坡"], pricePrefix: "预估" },
    segments: skeletonDirect,
  },
  {
    id: "low",
    tag: "体验最均衡",
    title: "东莞经广州，飞吉隆坡",
    subtitle: "高铁衔接直飞，节奏从容更均衡。",
    totalTime: "10h50m",
    totalPrice: 1592,
    perHead: 1592,
    headcount: 1,
    miniTimeline: [
      { time: "06:10", text: "金域名苑 → 虎门站", price: 55, sub: "打车 · 30-40m", redPrice: false },
      { time: "06:58", text: "虎门站 → 广州南站", price: 39.5, sub: "高铁 · 18m", redPrice: false },
      { time: "07:30", text: "广州南站 → 白云 T2", price: 35, sub: "机场快线 · 1h10m", redPrice: false },
      { time: "10:20", text: "白云 T2 → 吉隆坡 T2", price: 1368, sub: "亚航 AK113 · 经济舱", redPrice: true },
      { time: "15:55", text: "吉隆坡 T2 → 雪邦酒店", price: 95, sub: "接机 · 45-60m", redPrice: false },
    ],
    fullLegs: [
      { time: "06:10", route: "东莞金域名苑 → 虎门站", mode: "打车", duration: "30-40m", price: "¥55", reason: "先打车到高铁站，避免长距离公路拥堵" },
      { time: "06:58", route: "虎门站 → 广州南站", mode: "高铁", duration: "约18m", price: "¥39.5", reason: "班次密，误差小，衔接广州机场更稳" },
      { time: "07:30", route: "广州南站 → 广州白云机场 T2", mode: "机场快线", duration: "约1h10m", price: "¥35", reason: "换乘链路成熟，成本和稳定性都比较均衡" },
      { time: "08:45", route: "到达广州白云机场 T2", mode: "值机 / 托运 / 安检", duration: "预留约1h35m", reason: "白天直飞班期更友好，机场内节奏更从容" },
      { time: "10:20", route: "广州白云 T2 → 吉隆坡 KUL T2", mode: "飞机", duration: "约4h20m", code: "亚航 AK113", aircraft: "A320", price: "约¥1368", cabin: "经济舱", luggage: "托运行李20公斤 ｜ 手提行李1件，8公斤/件", refundPolicy: "提前改期免费，退票按航司规则", reason: "参考6月初公开票价与直飞班期，价格和体验更平衡" },
      { time: "14:40", route: "到达吉隆坡 KUL T2", mode: "入境 / 取行李", duration: "预留50-80m", reason: "下午落地后去酒店的余量更宽松" },
      { time: "15:55", route: "吉隆坡 KUL T2 → 雪邦黄金海岸安凡尼度假酒店", mode: "接机", duration: "45-60m", price: "¥95", reason: "落地后直接去酒店，整体体验更顺手" },
    ],
    routeMeta: { depart: "06:10", arrive: "17:00", risk: "中", accent: "orange", mapPins: ["东莞", "广州", "吉隆坡"], pricePrefix: "预估" },
    segments: skeletonDirect,
  },
];

// 服务权益（卡片化展示，替代 image 473 的纯图片）
export const perks = {
  title: "服务权益",
  subtitle: "所有方案共享",
  intro: "提供平台服务保障：行程及免费退改，出行保障服务",
  items: [
    {
      icon: "delay",
      title: "延误免费改行程",
      sub: "飞机延误取消，可免费换为当前航班，和其他时间赶不上的行程",
    },
    {
      icon: "navigate",
      title: "AI 机场 / 车站导航",
      sub: "帮你快速找到登机口、网约车上车点",
    },
    {
      icon: "taxi",
      title: "AI 智能预约打车",
      sub: "根据航班、火车实际到达时间，自动预约打车",
    },
    {
      icon: "shield",
      title: "300 万航空意外险",
      sub: "额度 300 万的航空意外险，每个人均投保一份",
    },
    {
      icon: "gift",
      title: "优惠券大礼包",
      sub: "15 元通讯券 + 30 元签证券 + 15 元淘宝闪购券",
    },
  ],
};

// ---------- 需求收敛 Q&A ----------

export const intakeQuestions = [
  {
    id: "q-trigger",
    type: "user-question",
    text: "6月1号一早从东莞出发，怎么飞吉隆坡最便宜？可以考虑中转。",
  },
  {
    id: "q-intro",
    type: "assistant-text",
    text: "为了更好的给你推荐行程方案，还需要回答几个问题，告诉我你的诉求：",
  },
  {
    id: "q1",
    type: "qa",
    prompt: "城市内交通你希望？",
    hint: "决定你怎么去机场/车站，影响时间和成本",
    options: [
      { id: "metro", label: "地铁或者公交", sub: "更省钱，但搬运行李更累" },
      { id: "taxi", label: "打车", sub: "更省心，适合赶早班高铁", default: true },
    ],
  },
  {
    id: "q2",
    type: "qa",
    prompt: "如果需要中转，你希望尽可能",
    hint: "证件、沟通和费用上的偏好",
    options: [
      {
        id: "domestic",
        label: "国内中转",
        sub: "无语言障碍，更方便沟通",
        default: true,
      },
      { id: "any", label: "都可以", sub: "优先综合价格和时间" },
    ],
  },
  {
    id: "q3",
    type: "qa",
    prompt: "你已经预订好酒店了吗？",
    hint: "酒店地点会影响接驳推荐",
    options: [
      {
        id: "yes",
        label: "我已经预订完成",
        sub: "请告诉我具体的酒店名称",
        default: true,
        userText: HOTEL,
      },
      { id: "rec", label: "帮我推荐", sub: "我为你比较酒店和接驳方案" },
    ],
  },
];

// ---------- 首页起手问句 ----------

export const homeSamples = [
  "6月想带爸妈去吉隆坡，预算紧但不想转机太赶，帮我看看路线。",
  "我在东莞，4 天假想去东南亚海岛玩，5000 以内人均，怎么安排？",
  intakeQuestions[0].text,
];

// ---------- 乘机人 ----------

export const passengers = [
  {
    id: "p1",
    name: "李雷",
    self: true,
    idNo: "310107 19990909 9999",
    selected: true,
  },
  {
    id: "p2",
    name: "张三",
    idNo: "310107 19990909 9999",
    selected: true,
  },
  {
    id: "p3",
    name: "李四",
    idNo: "310107 19990909 9999",
    selected: false,
  },
];

// ---------- 订单 ----------

export const order = {
  contact: "153 8866 6688",
  policy:
    "我已阅读并同意《个人信息跨境传输同意函》、《中国联合航空运输总条件》、《会员通则》、《中国联合航空购票须知》、中…",
  // 注：支付弹层金额改为读 plan.totalPrice（v3 step 3），不再硬编码。
};

// ---------- 行前注意事项 ----------

export const prepCards = [
  {
    id: "passport",
    date: `${TRIP_DATE} 出发前`,
    title: "建议确认护照有效期",
    sub: "保证入境所需的证件信息可用",
    detail:
      "马来西亚要求入境时护照有效期 ≥ 6 个月。建议出发前一周内确认护照剩余期限并扫描备份至云盘。",
  },
  {
    id: "visa",
    date: `${TRIP_DATE} 出发前`,
    title: "建议确认签证状态",
    sub: "保证入境所需的证件信息可用",
    detail:
      "马来西亚对中国护照实施 30 天免签政策。无需签证，但需在出发前确认护照同意页可用。",
  },
  {
    id: "mdac",
    date: `${TRIP_DATE} 出发前`,
    title: "入境卡填写",
    sub: "建议提前准备好相关信息，当天一键填写",
    detail:
      "马来西亚 MDAC（数字入境卡）需在抵马前 3 天内填写。我可以帮你预填资料，到达前一键提交。",
  },
  {
    id: "luggage",
    date: `${TRIP_DATE} 出发前`,
    title: "行李建议",
    sub: "随身包放证件、药品和充电线",
    detail:
      "国航 CA857 经济舱：托运 25kg × 1，手提 7kg × 1。充电宝 ≤ 20000mAh 必须随身、严禁托运。",
  },
];

// ---------- 我的行程（中控台卡）----------
// 折叠态显示 pill；展开态显示横向卡组；点击单卡进 detail（trip-detail screen）。
// 覆盖整条行程的关键节点：行前 + 出发当天逐段 + 抵达。

export const myTrips = [
  {
    id: "trip-notice",
    kind: "notice",
    short: { topLine: "行前", title: "注意事项", sub: "签证 / 入境卡" },
    detail: {
      headline: "行前注意事项",
      lead: "出发前 7 天将统一推送提醒，你也可以现在自查。",
      bullets: [
        "护照有效期 ≥ 6 个月（你的护照到 2030-08，无问题）",
        "马来西亚 30 天免签，无需签证",
        "MDAC 数字入境卡需在抵马前 3 天内填写",
        "国航 CA857 经济舱：托运 25kg × 1，手提 7kg × 1",
      ],
    },
  },
  {
    id: "trip-pack",
    kind: "luggage",
    short: { topLine: "出发前一晚", title: "行李清单", sub: "证件 + 充电" },
    detail: {
      headline: "出发前一晚 · 行李检查清单",
      time: "2026/05/31 21:00 提醒",
      lead:
        "建议睡前完成所有清单。证件、现金、充电宝、转换插头随身，托运箱锁好密码。",
      bullets: [
        "护照 + 一份复印件 + 电子备份",
        "充电宝 ≤ 20000mAh 必须随身（禁止托运）",
        "马来西亚为 G 型转换插头",
        "托运行李重量自测 ≤ 25kg",
      ],
    },
  },
  {
    id: "trip-day-taxi",
    kind: "taxi",
    short: { topLine: "出发当天", title: "联丰苑打车", sub: "→ 广州客运站" },
    detail: {
      headline: "联丰苑打车到广州客运站",
      time: `${TRIP_DATE} 05:20-06:00`,
      lead:
        "已自动预约打车，司机将在 04:50 联系你。建议提前 15 分钟下楼，避免行李装车时间不够。",
      bullets: [
        "上车点：联丰苑 1 号楼东门",
        "目的地：广州客运站 西门",
        "用时约 40 分钟，¥30",
      ],
    },
  },
  {
    id: "trip-bus",
    kind: "bus",
    short: { topLine: "07:30", title: "广州大巴", sub: "→ 香港 T1" },
    detail: {
      headline: "广州客运站乘坐大巴到香港机场 T1",
      time: `${TRIP_DATE} 07:30-10:30`,
      lead:
        "出发前 30 分钟到达客运站换票安检。全程 3 小时，过境关口下车带证件随行李。",
      bullets: [
        "深圳湾口岸通关，需要随身携带护照",
        "中途服务区停 10 分钟",
        "终点：香港国际机场 T1 大巴站台 B2",
      ],
    },
  },
  {
    id: "trip-hkg-airport",
    kind: "airport",
    short: { topLine: "10:30", title: "香港机场", sub: "T1 中转 3h20m" },
    detail: {
      headline: "香港国际机场",
      sub: "香港机场出发登机路线如下",
      // v4-flipbook：可点击 4 个光圈 → 预生成 mp4 平滑切到对应 frame
      airportFlipbook: {
        rootNodeId: "overview",
        // 总览图上的可点击光圈（x/y 为 overview 图的 0–1 坐标，对应路线步骤圆点位置）
        // 02 值机 / 04 安检 / 05 商业免税区 / 06A·06B 商务贵宾厅
        hotspots: [
          { id: "checkin",  target: "checkin",  x: 0.40, y: 0.66, label: "值机" },
          { id: "security", target: "security", x: 0.55, y: 0.50, label: "安检 / 出境" },
          { id: "spine",    target: "spine",    x: 0.46, y: 0.31, label: "商业免税区" },
          { id: "lounge",   target: "lounge",   x: 0.64, y: 0.32, label: "商务贵宾厅" },
        ],
        nodes: [
          {
            id: "overview",
            image: "../../public/assets/main-demo-v4/airport/overview.png",
            bodyTitle: "机场地图",
            body:
              "乘坐国泰航空 CX725 从香港国际机场出发的旅客，请先前往 1 号航站楼 7 层出发大厅 / T1 Departures L7。CX725 当前公开计划为 6 月 1 日 12:40 从 HKG T1 出发，16:40 抵达 KUL T1；登机口、登机时间和实时航班状态需在出发当天通过国泰 App、HKIA 航显或机场广播确认。",
          },
          {
            id: "checkin",
            image: "../../public/assets/main-demo-v4/airport/frame_checkin.png",
            bodyTitle: "值机",
            body:
              "国泰航空香港机场值机位于 T1 Aisle A / B / C。头等舱及商务舱值机位于 Aisle B，优选经济舱位于 Aisle C，经济舱位于 Aisle A / C。柜台通常在计划起飞前 180 分钟开放，并在起飞前 60 分钟准时关闭；CX725 12:40 计划起飞时，可按约 09:40 开柜、11:40 截止值机处理。已网上值机的旅客可使用自助机打印行李牌并前往自助或人工 Bag Drop。",
          },
          {
            id: "security",
            image: "../../public/assets/main-demo-v4/airport/frame_security.png",
            bodyTitle: "安检与出境检查",
            body:
              "完成值机和托运行李后，请携带护照、登机牌和必要签证文件前往安检与出境检查区域。HKIA 官方出发流程为 Check-in / Baggage、Security Check、Immigration、Boarding；过安检和出境检查后进入空侧区域。",
          },
          {
            id: "spine",
            image: "../../public/assets/main-demo-v4/airport/frame_spine.png",
            bodyTitle: "商业免税区",
            body:
              "过安检和出境检查后即进入空侧。沿 L6 主脊一带集中了较多免税店、餐饮和购物便利设施，可在前往登机口途中停留消费或休息。具体品牌、餐厅、营业时间和促销活动以 HKIA 与各商户公开信息为准。",
          },
          {
            id: "lounge",
            image: "../../public/assets/main-demo-v4/airport/frame_lounge.png",
            bodyTitle: "商务贵宾厅",
            body:
              "合资格国泰旅客可按资格和当日登机口选择国泰贵宾厅：The Deck 位于 T1 L7 近 Gate 6，The Bridge 位于 T1 L6 近 Gate 35，The Pier First / Business 分别位于 T1 L6 近 Gate 63 / 65，The Wing First 位于 T1 L7 出境后南面，The Wing Business 目前为暂时关闭状态。若使用付费或合作贵宾厅，可将 Plaza Premium Lounge West Hall 作为通用示意点位：它位于 T1 L7 近 Gate 60，24 小时开放。",
          },
        ],
        edges: [
          { from: "overview", to: "checkin",  video: "../../public/assets/main-demo-v4/airport/transitions/overview_to_checkin.mp4" },
          { from: "overview", to: "security", video: "../../public/assets/main-demo-v4/airport/transitions/overview_to_security.mp4" },
          { from: "overview", to: "spine",    video: "../../public/assets/main-demo-v4/airport/transitions/overview_to_spine.mp4" },
          { from: "overview", to: "lounge",   video: "../../public/assets/main-demo-v4/airport/transitions/overview_to_lounge.mp4" },
        ],
      },
    },
  },
  {
    id: "trip-flight",
    kind: "flight",
    short: { topLine: "12:40", title: "国航 CA857", sub: "→ 吉隆坡" },
    detail: {
      headline: "中国国航 CA857 香港 → 吉隆坡",
      time: `${TRIP_DATE} 12:40-16:40`,
      lead:
        "起飞前 90 分钟具体登机口才会公布。建议 11:00 抵达 T1 出境，留充裕安检时间。",
      bullets: [
        "经济舱 5.2 折，¥624（千问优惠 ¥80 已扣减）",
        "托运行李 25kg × 1，手提 7kg × 1",
        "餐食：午餐 + 一次饮品",
        "退改 ¥80 起，提前 2 小时改期免费",
      ],
    },
  },
  {
    id: "trip-kul-walk",
    kind: "walk",
    short: { topLine: "16:50", title: "吉隆坡 T1", sub: "步行 → 打车点" },
    detail: {
      headline: "吉隆坡国际 T1 步行到打车点",
      time: `${TRIP_DATE} 16:50-17:00`,
      lead:
        "落地后跟着「Taxi / Grab」指示牌出 D 出口即到打车点，全程约 1.2km，平地 + 自动步道，正常 10 分钟。",
      bullets: [
        "出口：T1 入境大厅 D 出口",
        "距离：约 1.2km · 10 分钟",
        "AI 已根据航班实际到达时间自动预约打车",
      ],
    },
  },
  {
    id: "trip-arrive",
    kind: "taxi",
    short: { topLine: "17:00", title: "吉隆坡打车", sub: "→ 黄金海岸酒店" },
    detail: {
      headline: "吉隆坡打车到黄金海岸酒店",
      time: `${TRIP_DATE} 17:00-17:44`,
      lead:
        "AI 智能预约打车已根据航班实际抵达时间自动调度。建议落地后开机即可看到司机信息。",
      bullets: [
        "上车点：吉隆坡国际机场 T1 出口 D",
        "目的地：雪邦黄金海岸安凡尼度假酒店",
        "30km · 44 分钟 · ¥30（已含过路费）",
      ],
    },
  },
  {
    id: "trip-checkin",
    kind: "hotel",
    short: { topLine: "18:00", title: "酒店入住", sub: "黄金海岸" },
    detail: {
      headline: "雪邦黄金海岸安凡尼度假酒店 · 入住",
      time: `${TRIP_DATE} 18:00 之后`,
      lead:
        "酒店已确认你的预订。前台 3 楼，护照原件 + 信用卡押金。免费 wifi 密码：avani2026。",
      bullets: [
        "Check-in：3 楼前台 / 24h 服务",
        "房间：海景双床 · 楼层 18 · 房号到店分配",
        "早餐：次日 6:30-10:30 在 2 楼 Soleil 餐厅",
      ],
    },
  },
];

// ---------- 摘要导出（被 view 用）----------

export const trip = {
  origin: ORIGIN,
  hotel: HOTEL,
  date: TRIP_DATE,
};
