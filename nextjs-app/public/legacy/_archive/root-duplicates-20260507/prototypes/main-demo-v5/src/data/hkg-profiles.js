export const DEFAULT_HKG_PROFILE = "family";

export const HKG_PROFILE_KEYS = ["family", "business", "transfer"];

const ASSET_BASE = "/legacy/public/assets/main-demo-v5/airport";
const FAMILY_TRANSITION_BASE = `${ASSET_BASE}/family/transitions`;
const BUSINESS_ASSET_BASE = `${ASSET_BASE}/business`;
const BUSINESS_TRANSITION_BASE = `${BUSINESS_ASSET_BASE}/transitions`;
const TRANSFER_ASSET_BASE = `${ASSET_BASE}/transfer`;
const TRANSFER_TRANSITION_BASE = `${TRANSFER_ASSET_BASE}/transitions`;

const commonLegend = [
  { icon: "i", label: "Information" },
  { icon: "↕", label: "Escalator / Stairs" },
  { icon: "⇅", label: "Elevator" },
  { icon: "WC", label: "Restroom" },
  { icon: "L", label: "Lounge" },
  { icon: "盾", label: "Security" },
  { icon: "证", label: "Immigration" },
  { icon: "APM", label: "APM" },
];

export const hkgProfiles = {
  family: {
    id: "family",
    tabLabel: "亲子",
    title: "香港国际机场 · 亲子管家",
    accent: "#c47b3a",
    accentSoft: "#faece0",
    push: "出行助手 · 09:40 推送",
    badge: "带娃顺路走 · 4 段路线都帮你想好了",
    time: "今天 12:40 起飞 · 国泰 CX725",
    sub: "T1 出发 · 停留 3 小时 20 分",
    lead:
      "和娃出门最怕走冤枉路。已为你把育婴室、免费婴儿车、休闲区和登机口连成一条最顺的路线，每段大概用多久也都标好了。需要协助通道可以提前在国泰 App 申请。",
    cta: "查看详情",
    routeLabel: "亲子路线",
    map: {
      base: `${ASSET_BASE}/family/overview.png?v=20260506-4`,
      overview: `${ASSET_BASE}/family/overview.png?v=20260506-4`,
      alt: "香港机场亲子路书总览",
    },
    chips: ["育婴室", "免费婴儿车", "可休整", "少折返"],
    overview:
      "**带娃 4 步走**：值机交大件 → 安检走协助通道 → L6 中庭休整（育婴室 + 婴儿车）→ 登机口。",
    sources: ["O2", "O8", "W.S14"],
    nodes: [
      {
        id: "family-checkin",
        num: "01",
        label: "Check-in / Bag Drop",
        shortLabel: "值机托运",
        floor: "L7",
        x: 0.44,
        y: 0.71,
        image: `${ASSET_BASE}/family/checkin.png`,
        title: "值机和托运行李",
        summary:
          "在 **Aisle A 或 C** 柜台办理。婴儿推车可以一直推到登机口再托运。",
        detail:
          "经济舱柜台在 Aisle A 或 C，约 09:40 开放、11:40 截止。把推车托运牌、安全座椅标贴让柜台一次贴齐；婴儿坐推车一直走到登机口再托运也可以。带 6 个月内婴儿可以问问能不能用婴儿摇篮。",
        estimatedTime: "09:30-10:00",
        sourceNote: "来源 O7 / W.S7 / W.S8 / C",
      },
      {
        id: "family-assist",
        num: "02",
        label: "Special Assistance",
        shortLabel: "协助安检",
        floor: "L7",
        x: 0.40,
        y: 0.54,
        image: `${ASSET_BASE}/family/security.png`,
        title: "走「协助通道」过安检",
        summary:
          "推童车、抱小孩、同行老人都能走 **协助通道**。婴儿奶粉、果泥、药品申报后可以多带。",
        detail:
          "安检处有专门的协助通道，到口告诉工作人员你需要协助即可，不用提前申请。婴儿配方奶、果泥、药品按要求申报后可以超量带；登机牌和护照放在最外层方便取。",
        estimatedTime: "10:00-10:15",
        sourceNote: "来源 O2 / O4",
      },
      {
        id: "family-leisure",
        num: "03",
        label: "Nursing + Leisure",
        shortLabel: "机场遛娃",
        floor: "L6",
        x: 0.42,
        y: 0.34,
        image: `${ASSET_BASE}/family/leisure.png`,
        video: `${FAMILY_TRANSITION_BASE}/overview_to_leisure.mp4`,
        title: "L6 中庭 · 育婴室 + 免费婴儿车",
        summary:
          "L6 中庭一带顺路就能找到 **育婴室** 和 **免费婴儿车点**，娃想放风可以去旁边的互动区。",
        detail:
          "L6 中庭一带集中了多个育婴室（换尿布、喂奶、接热水），禁区里还有免费婴儿车可以免预约取用。同侧的 Wonder Eggshell 互动区适合 6-12 岁孩子放风；时间紧就跳过游乐直奔登机口。",
        estimatedTime: "10:15-11:30",
        sourceNote: "来源 O8 / W.S14",
      },
      {
        id: "family-gate",
        num: "04",
        label: "Boarding Gate",
        shortLabel: "登机口",
        floor: "L6 / L7",
        x: 0.77,
        y: 0.12,
        image: `${ASSET_BASE}/family/gate.png`,
        title: "登机口",
        summary:
          "登机口大约起飞前 **90 分钟** 才公布，别太早赶过去。",
        detail:
          "登机口起飞前约 90 分钟才会显示在大屏上，可以打开 HKIA 或国泰 App 看实时状态。如果娃对声光敏感，附近有 Sensory Corner 低刺激空间可以歇一会再上飞机。",
        estimatedTime: "12:00",
        sourceNote: "来源 W.S10 / O8",
      },
    ],
    edges: [
      {
        from: "overview",
        to: "family-checkin",
        video: `${FAMILY_TRANSITION_BASE}/overview_to_checkin.mp4`,
        required: true,
      },
      {
        from: "overview",
        to: "family-assist",
        video: `${FAMILY_TRANSITION_BASE}/overview_to_security.mp4`,
        required: true,
      },
      {
        from: "overview",
        to: "family-leisure",
        video: `${FAMILY_TRANSITION_BASE}/overview_to_leisure.mp4`,
        required: true,
      },
      {
        from: "overview",
        to: "family-gate",
        video: `${FAMILY_TRANSITION_BASE}/overview_to_gate.mp4`,
        required: true,
      },
      // 节点间链式（misfires 视频复用，仅 family 有）
      {
        from: "family-checkin",
        to: "family-assist",
        video: `${FAMILY_TRANSITION_BASE}/misfires/checkin_to_security.mp4`,
      },
      {
        from: "family-assist",
        to: "family-leisure",
        video: `${FAMILY_TRANSITION_BASE}/misfires/security_to_leisure.mp4`,
      },
      {
        from: "family-leisure",
        to: "family-gate",
        video: `${FAMILY_TRANSITION_BASE}/misfires/leisure_to_gate.mp4`,
      },
    ],
  },

  business: {
    id: "business",
    tabLabel: "商务",
    title: "香港国际机场 · 商务管家",
    accent: "#0011ff",
    accentSoft: "#e5ecff",
    push: "出行助手 · 09:40 推送",
    badge: "4 个快速通道 · The Pier 贵宾厅都标好了",
    time: "今天 12:40 起飞 · 国泰 CX725",
    sub: "T1 出发 · 停留 3 小时 20 分",
    lead:
      "你的舱位和会员可以解锁 4 个快速点：商务值机、礼遇出境、贵宾厅深度使用、优先登机。能省下来的时间都进了贵宾厅。需要专人陪同也可以提前申请 Meet & Assist。",
    cta: "查看详情",
    routeLabel: "商务路线",
    map: {
      base: `${BUSINESS_ASSET_BASE}/overview.png?v=20260506-4`,
      overview: `${BUSINESS_ASSET_BASE}/overview.png?v=20260506-4`,
      alt: "香港机场商务路书总览",
    },
    chips: ["商务值机", "礼遇出境", "贵宾厅", "优先登机"],
    overview:
      "**商务 4 步**：商务值机 → 礼遇 + 自助出境 → 贵宾厅 The Pier → 优先登机。",
    sources: ["O1", "O5", "O7", "O9"],
    nodes: [
      {
        id: "business-checkin",
        num: "01",
        label: "Aisle B · F / J Check-in",
        shortLabel: "商务值机",
        floor: "L7",
        x: 0.43,
        y: 0.72,
        image: `${BUSINESS_ASSET_BASE}/checkin.png`,
        video: `${BUSINESS_TRANSITION_BASE}/overview_to_checkin.mp4`,
        title: "Aisle B · 商务值机",
        summary:
          "**Aisle B** 是头等 / 商务舱专属柜台。**约 09:40 开柜、11:40 截止**。",
        detail:
          "国泰头等舱与商务舱值机集中在 Aisle B，柜台一般起飞前 3 小时开放、起飞前 1 小时关闭。资格看你当日的舱位或会员等级，国泰银卡及以上都可用。",
        estimatedTime: "09:30-09:50",
        sourceNote: "来源 O7",
      },
      {
        id: "business-fast",
        num: "02",
        label: "Courtesy + Smart Departure",
        shortLabel: "自助通道",
        floor: "L7",
        x: 0.39,
        y: 0.55,
        image: `${BUSINESS_ASSET_BASE}/security.png`,
        video: `${BUSINESS_TRANSITION_BASE}/overview_to_security.mp4`,
        title: "礼遇通道 + 自助出境",
        summary:
          "走 **礼遇通道** 过安检，**自助闸口** 出境，比常规通道快不少。",
        detail:
          "礼遇通道（Courtesy Channel）是机场为商务旅客开通的优先安检通道；自助出境（Smart Departure）是人脸识别闸口。能不能用要看你当日舱位、会员等级和证件类型，建议到现场确认。",
        estimatedTime: "09:50-10:05",
        sourceNote: "来源 O9 / O2",
      },
      {
        id: "business-pier",
        num: "03",
        label: "The Pier Business",
        shortLabel: "贵宾厅",
        floor: "L6",
        x: 0.65,
        y: 0.32,
        image: `${BUSINESS_ASSET_BASE}/lounge.png`,
        video: `${BUSINESS_TRANSITION_BASE}/overview_to_lounge.mp4`,
        title: "The Pier · 国泰商务贵宾厅",
        summary:
          "**The Pier 商务贵宾厅** 在 L6 靠近 65 号登机口。可以用餐、淋浴、办公或休息。",
        detail:
          "The Pier 商务贵宾厅在 T1 L6 近 65 号登机口，提供用餐、淋浴、休息和办公位。如果不在国泰资格内，可以试试同区的 Plaza Premium 付费贵宾厅，24 小时开放。",
        estimatedTime: "10:05-11:55",
        sourceNote: "来源 O5 / O7",
      },
      {
        id: "business-boarding",
        num: "04",
        label: "Priority Boarding",
        shortLabel: "优先登机",
        floor: "Gate",
        x: 0.74,
        y: 0.16,
        image: `${BUSINESS_ASSET_BASE}/gate.png`,
        video: `${BUSINESS_TRANSITION_BASE}/overview_to_gate.mp4`,
        title: "优先登机",
        summary:
          "登机牌上有 **Group 号**，靠前组别可以先上飞机，**不用排队**。",
        detail:
          "国泰商务舱、头等舱和银卡及以上会员通常可以走前几组优先登机。具体看登机牌上的 Group 号或现场广播；当天规则可能会调整，按 Gate 工作人员安排即可。",
        estimatedTime: "12:10",
        sourceNote: "来源 O7 / C",
      },
    ],
    edges: [
      // overview → 节点（hub）
      { from: "overview", to: "business-checkin",  video: `${BUSINESS_TRANSITION_BASE}/overview_to_checkin.mp4` },
      { from: "overview", to: "business-fast",     video: `${BUSINESS_TRANSITION_BASE}/overview_to_security.mp4` },
      { from: "overview", to: "business-pier",     video: `${BUSINESS_TRANSITION_BASE}/overview_to_lounge.mp4` },
      { from: "overview", to: "business-boarding", video: `${BUSINESS_TRANSITION_BASE}/overview_to_gate.mp4` },
      // 节点间链式（chain transitions）
      { from: "business-checkin",  to: "business-fast",     video: `${BUSINESS_TRANSITION_BASE}/checkin_to_security.mp4` },
      { from: "business-fast",     to: "business-pier",     video: `${BUSINESS_TRANSITION_BASE}/security_to_lounge.mp4` },
      { from: "business-pier",     to: "business-boarding", video: `${BUSINESS_TRANSITION_BASE}/lounge_to_gate.mp4` },
    ],
  },

  transfer: {
    id: "transfer",
    tabLabel: "中转",
    title: "香港国际机场 · 中转管家",
    accent: "#0011ff",
    accentSoft: "#e5ecff",
    push: "出行助手 · 13:05 抵港后推送",
    badge: "全程不入境 · 跟着 Transfer 标识走就行",
    time: "14:35 起飞 · 马航 MH073 · 距起飞 1h30m",
    sub: "T1 中转 · 停留 1 小时 35 分",
    lead:
      "时间不算多但够走完。先看看你下一程登机牌是不是已经有了——有就直接去转机安检，没有先到取牌柜台。万一走不通，下方有英文话术可以直接用。",
    cta: "查看详情",
    routeLabel: "中转路线",
    map: {
      base: `${TRANSFER_ASSET_BASE}/overview.png?v=20260506-4`,
      overview: `${TRANSFER_ASSET_BASE}/overview.png?v=20260506-4`,
      alt: "香港机场中转路书总览",
    },
    chips: ["不用入境", "跟 Transfer 走", "登机牌核对", "英文话术"],
    overview:
      "**1 小时 35 分够用**：① 跟绿色 Transfer 标识走 → ② 没登机牌就到对应航司柜台拿（有就跳过）→ ③ 过转机安检 → ④ 看大屏找登机口。**中国旅客全程不用入境、不用签证**。",
    sources: ["O3", "O4", "L"],
    talkTracks: [
      "I have a tight connection.",
      "I have a tight connection. MH073 to Kuala Lumpur at 14:35. Can you help me with priority?",
      "I'm transferring to MH073 at 14:35. I need a boarding pass.",
    ],
    nodes: [
      {
        id: "transfer-arrival",
        num: "01",
        label: "Follow Transfer Sign",
        shortLabel: "找 Transfer 标识",
        floor: "Airside",
        x: 0.29,
        y: 0.70,
        image: `${TRANSFER_ASSET_BASE}/arrival.png`,
        video: `${TRANSFER_TRANSITION_BASE}/overview_to_arrival.mp4`,
        title: "下机找「Transfer / 转机」标识",
        summary:
          "看头顶 **绿色「Transfer / 转机」** 标识走，**别跟人群去入境**。",
        detail:
          "下飞机后抬头找绿色的「Transfer / Departures」指示牌跟着走，全程不用过入境。中国旅客在香港做国际转国际不需要签证，但要走 Transfer 通道而不是 Immigration（入境）。",
        estimatedTime: "13:05-13:15",
        sourceNote: "来源 O3 / W.S10",
      },
      {
        id: "transfer-desk",
        num: "02",
        label: "Transit Desk · Boarding Pass",
        shortLabel: "取登机牌",
        floor: "Airside",
        x: 0.28,
        y: 0.65,
        image: `${TRANSFER_ASSET_BASE}/desk.png`,
        video: `${TRANSFER_TRANSITION_BASE}/overview_to_desk.mp4`,
        title: "取下一程登机牌",
        summary:
          "**已经有 MH073 登机牌？直接跳过**。没有就到 **对应航司柜台** 拿，**3-5 分钟**。",
        detail:
          "如果上一程值机时已经一起拿到了 MH073 登机牌（背面通常贴着第二张），可以跳过这一步。如果没有，跟着 Transit / Transfer 标识到对应航司柜台补办。话术：「I'm transferring to MH073 at 14:35. I need a boarding pass.」",
        estimatedTime: "13:15-13:25",
        sourceNote: "来源 W.S15 / O3 / O6",
      },
      {
        id: "transfer-security",
        num: "03",
        label: "Transfer Security",
        shortLabel: "转机安检",
        floor: "Transfer",
        x: 0.44,
        y: 0.56,
        image: `${TRANSFER_ASSET_BASE}/security.png`,
        video: `${TRANSFER_TRANSITION_BASE}/overview_to_security.mp4`,
        title: "再过一次安检",
        summary:
          "**所有转机的人都要再过一次安检**。液体仍然 100ml + 1 升透明袋。",
        detail:
          "拿到登机牌后跟着 Transfer / Departures 标识到转机安检。液体规则和值机时一样，超过 100ml 的会被丢；上一程在大陆机场买的瓶装水建议这之前喝完。笔电、相机、充电宝单独取出，过得快。",
        estimatedTime: "13:25-13:40",
        sourceNote: "来源 O3 / O4",
      },
      {
        id: "transfer-gate",
        num: "04",
        label: "Onward Boarding Gate",
        shortLabel: "找登机口",
        floor: "Gate",
        x: 0.69,
        y: 0.16,
        image: `${TRANSFER_ASSET_BASE}/gate.png`,
        video: `${TRANSFER_TRANSITION_BASE}/overview_to_gate.mp4`,
        title: "看大屏找登机口",
        summary:
          "**进空侧第一件事看大屏**找当日真实登机口（别看登机牌印的初始号）。",
        detail:
          "登机口大约起飞前 90 分钟才稳定，最好以航显大屏或马航 App 为准。HKG 比较大，最远的登机口要走 10-15 分钟，所以先确认位置再决定要不要绕去贵宾厅或买东西。",
        estimatedTime: "13:45",
        sourceNote: "来源 O3 / W.S14",
      },
    ],
    edges: [
      // overview → 节点（hub）
      { from: "overview", to: "transfer-arrival",  video: `${TRANSFER_TRANSITION_BASE}/overview_to_arrival.mp4` },
      { from: "overview", to: "transfer-desk",     video: `${TRANSFER_TRANSITION_BASE}/overview_to_desk.mp4` },
      { from: "overview", to: "transfer-security", video: `${TRANSFER_TRANSITION_BASE}/overview_to_security.mp4` },
      { from: "overview", to: "transfer-gate",     video: `${TRANSFER_TRANSITION_BASE}/overview_to_gate.mp4` },
      // 节点间链式（chain transitions）
      { from: "transfer-arrival",  to: "transfer-desk",     video: `${TRANSFER_TRANSITION_BASE}/arrival_to_desk.mp4` },
      { from: "transfer-desk",     to: "transfer-security", video: `${TRANSFER_TRANSITION_BASE}/desk_to_security.mp4` },
      { from: "transfer-security", to: "transfer-gate",     video: `${TRANSFER_TRANSITION_BASE}/security_to_gate.mp4` },
    ],
  },
};

Object.values(hkgProfiles).forEach((profile) => {
  profile.legend = commonLegend;
});

export function getHkgProfile(profileId = DEFAULT_HKG_PROFILE) {
  return hkgProfiles[profileId] || hkgProfiles[DEFAULT_HKG_PROFILE];
}
