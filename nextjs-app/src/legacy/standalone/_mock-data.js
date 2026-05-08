// 独立预览壳的最小 mock 数据：只取一份 HK 中转 detail，
// 字段与主项目 src/data.js 里 myTrips → trip-hkg-airport.detail 完全一致。
// 任何字段调整请同步主项目 data.js（结构）+ 模块（渲染）。

export const mockHkDetail = {
  headline: "香港国际机场",
  sub: "香港机场出发登机路线如下",

  transit: {
    mode: "family",
    modeLabel: "亲子家庭",
    modeTagline: "少走路、有照护、能放电",
    flightArrive: "10:30",
    flightDepart: "12:40",
    layoverText: "3h20m",
    layoverFeel: "充裕",
    timeTier: "ample",
    boardingInfo: {
      boardingTime: "15:25",
      terminal: "4",
      gate: "479",
      group: "5",
      seat: "55G",
    },
    counterGuidance: {
      needCounter: false,
      airlineLine: "港航衔接 · 下一程 CA857（香港 → 吉隆坡）",
      summary:
        "AI 判断为标准联程：电子登机牌已覆盖下一程，无须在中转柜台二次办理。",
      nextStep: "请按「Transfer / 中转」标识直行，准备进入中转安检。",
    },
    routeChain: [
      { id: "airside", label: "Airside 中转区", sub: "免入境", tone: "default" },
      { id: "sec", label: "中转安检", sub: "家庭通道", tone: "default" },
      { id: "walk", label: "主脊步行", sub: "约 8 分钟", tone: "default" },
      { id: "gate", label: "登机口区", sub: "07/08 区域（待定）", tone: "default" },
    ],
    boardingCountdown: {
      phaseLabel: "预计登机开始",
      minutesToBoarding: 100,
      boardingLabel: "约 12:10 起可能开始登机",
      strategyGuide:
        "当前为「时间充裕」档位：可先借婴儿车、顺路育婴室，再经儿童区放电后前往登机口。",
    },
    anomalies: [
      {
        level: "warn",
        title: "登机口尚未最终锁定",
        detail:
          "路线按 Gate 07/08 区域预估；起飞前 90 分钟请以航显/航司 App 为准，若变更将推送修正动线。",
      },
      {
        level: "info",
        title: "动线较长与婴儿车转弯",
        detail:
          "安检后至登机口区步行约 12 分钟，通道弯道多，推车请预留额外 3～5 分钟。",
      },
      {
        level: "info",
        title: "若登机口改至卫星厅",
        detail:
          "需搭乘机场旅客捷运 APM，站间约 2～3 分钟；听到广播变更时请优先跟随时效策略缩短顺路停留。",
      },
    ],
    boardingPassStatus: {
      ok: true,
      label: "已检测到下一程电子登机牌",
      tip: "无需前往中转柜台，可直接走中转安检",
      actionLine:
        "结论：你现在可以直接前往中转安检，无需先到登机口补办登机牌或纸质凭证。",
    },
    flightStatus: {
      code: "港航 下一程",
      status: "准点",
      gateNote: "登机口将于起飞前 90 分钟在航显与港航 App 公布。请留意机场广播信息。",
    },
    tasks: [
      { id: "arrive",    order: 1, time: "10:30", route: "下机 → T1 L6 中转区", mode: "步行", duration: "5m", reason: "已抵达中转区域", mapTarget: "overview" },
      { id: "stroller",  order: 2, time: "10:35", route: "T1 L6 → 婴儿车租借点", mode: "步行 · 60m", duration: "3m", reason: "禁区内全程免费，可在登机口归还", family: true, mapTarget: "checkin" },
      { id: "security",  order: 3, time: "10:40", route: "租借点 → 中转安检（家庭通道）", mode: "步行", duration: "4m", reason: "带 2 岁以下可走家庭通道", family: true, mapTarget: "security" },
      { id: "boarding",  order: 4, time: "12:10", route: "安检后 → 登机口（途经儿童游乐区）", mode: "步行", duration: "8m", reason: "登机口公布后将自动更新路线", mapTarget: "lounge" },
    ],
    services: [
      { id: "stroller", icon: "stroller", family: true, title: "免费婴儿车", sub: "L6 / L7 多点可借还 · 无需预约", tag: "顺路", note: "抱娃距离长，建议先借再过安检" },
      { id: "nursery",  icon: "baby",     family: true, title: "最近的育婴室", sub: "距当前位置约 80m · 含尿布台 / 哺乳室 / 温奶器", tag: "顺路", note: "登机前最后一次换尿布的好时机" },
      { id: "playroom", icon: "play",     family: true, title: "儿童游乐区", sub: "顺路 · 距登机口步行约 5 分钟", tag: "时间充裕", note: "中转 >2h，孩子可在此放电再登机" },
      { id: "sensory",  icon: "calm",     family: true, title: "Sensory Corner 感官友好空间", sub: "T1 安静区 · 低刺激环境", tag: "可选", note: "适合对声光敏感或需要安静休息的儿童" },
    ],
    tips: [
      "婴儿食品、母乳、液态药品可超过 100ml 随身携带，安检时主动出示",
      "充电宝 ≤ 20000mAh 必须随身，禁止托运",
      "带 2 岁以下儿童可优先登机，登机口前主动告知地勤",
    ],
  },

  airportFlipbook: {
    rootNodeId: "overview",
    hotspots: [
      { id: "checkin",  target: "checkin",  x: 0.40, y: 0.66, label: "值机" },
      { id: "security", target: "security", x: 0.55, y: 0.50, label: "安检 / 出境" },
      { id: "spine",    target: "spine",    x: 0.46, y: 0.31, label: "商业免税区" },
      { id: "lounge",   target: "lounge",   x: 0.64, y: 0.32, label: "商务贵宾厅" },
    ],
    nodes: [
      { id: "overview",  image: "..//assets/main-demo-v4/airport/overview.png", bodyTitle: "机场总览", body: "香港国际机场 T1 全景，可点击下方步骤查看对应区域" },
      { id: "checkin",   image: "..//assets/main-demo-v4/airport/overview.png", bodyTitle: "值机 / 中转柜台", body: "T1 L6 值机岛 · 港航中转柜台位于 G 区" },
      { id: "security",  image: "..//assets/main-demo-v4/airport/overview.png", bodyTitle: "安检 / 出境", body: "中转安检通道 · 家庭通道在右侧" },
      { id: "spine",     image: "..//assets/main-demo-v4/airport/overview.png", bodyTitle: "商业免税区", body: "中央商业街 · DFS 免税 · 便利店 · 餐饮" },
      { id: "lounge",    image: "..//assets/main-demo-v4/airport/overview.png", bodyTitle: "登机口 / 贵宾厅", body: "W 区登机口 · The Bridge 贵宾室" },
    ],
    edges: [],
  },
};
