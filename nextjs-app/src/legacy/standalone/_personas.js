// ============================================================
// 3 类人群差异化补丁（standalone 层）
// ------------------------------------------------------------
// 目的：同一套折叠卡 + 全屏管家屏，依据人群切换文案 + 数据 + 视觉。
// 不修改主项目 src/data.js；在独立壳里以"基础 detail + persona 补丁"
// 的方式合成最终渲染数据。后续若要落入主项目，把 PERSONAS 直接搬进
// data.js 即可。
//
// 视觉差异：靠 CSS 变量。HTML 根节点会带 [data-persona="<key>"]，
// styles/personas.css 内对应选择器把 --persona-* token 重置为对应配色，
// transit-card.css / transit-assistant.css 里走 var(--persona-*) 的属性
// 自动跟随。
//
// 文案 / 数据差异：靠下面 PERSONAS[key].patch(detail) 函数返回新 detail。
// 任何字段命中规则：
//   - 顶层（headline/sub）按需覆写；不写则沿用基础值
//   - transit.* 字段深合并（modeLabel / modeTagline / boardingPassStatus
//     / flightStatus / tasks / services / tips 全部允许整段替换）
// ============================================================

import { mockHkDetail } from "./_mock-data.js";

// ------------------------------------------------------------
// 公共：把基础 detail 与人群 patch 合并出最终渲染数据
// ------------------------------------------------------------
export function buildPersonaDetail(personaKey) {
  const persona = PERSONAS[personaKey] || PERSONAS.default;
  // 深拷贝基础数据，避免不同 persona 之间互相污染
  const base = structuredClone(mockHkDetail);
  return persona.patch(base);
}

/** 对主项目 myTrips 等资源里的 detail 做人群补丁（结构与 mockHkDetail 一致时使用） */
export function applyPersonaToDetail(personaKey, detail) {
  const persona = PERSONAS[personaKey] || PERSONAS.default;
  const d = structuredClone(detail);
  return persona.patch(d);
}

export function getPersonaMeta(personaKey) {
  const persona = PERSONAS[personaKey] || PERSONAS.default;
  return { key: persona.key, label: persona.label, tagline: persona.tagline };
}

export const PERSONA_ORDER = ["default", "family", "business"];

// ============================================================
// PERSONAS
// ============================================================
export const PERSONAS = {
  // ----------------------------------------------------------
  // 默认：单人 / 普通商务 / 自由行（不带娃、不要 VIP），强调"高效顺畅"
  // ----------------------------------------------------------
  default: {
    key: "default",
    label: "默认",
    tagline: "高效顺畅 · 信息齐全",
    patch: (d) => {
      const t = d.transit;
      t.mode = "standard";
      t.modeLabel = "标准中转";
      t.modeTagline = "动线清晰 · 时间充裕";

      t.boardingInfo = {
        boardingTime: "15:25",
        terminal: "4",
        gate: "479",
        group: "5",
        seat: "55G",
      };

      t.boardingPassStatus = {
        ok: true,
        label: "已检测到下一程电子登机牌",
        tip: "先按 Transfer 指示去中转安检，无需绕行柜台",
        actionLine:
          "现在直接前往中转安检；仅在证件或行李异常时再去柜台处理。",
      };

      t.timeTier = "normal";
      t.counterGuidance = {
        needCounter: false,
        airlineLine: "港航 HX · 下一程 CA857（香港 → 吉隆坡）",
        summary:
          "AI 匹配到联程电子登机牌；一般无需在中转柜台二次办理，除非承运人要求复核。",
        nextStep: "沿「Transfer / 中转」标识直行到安检；仅异常时改去 G 区柜台。",
      };
      t.routeChain = [
        { label: "免柜台", sub: "标准中转", tone: "skip" },
        { label: "中转安检", sub: "Transfer 标识", tone: "default" },
        { label: "中央动线", sub: "步行约 6 分钟", tone: "default" },
        { label: "登机口", sub: "航显公布", tone: "default" },
      ];
      t.boardingCountdown = {
        phaseLabel: "预计开始登机",
        minutesToBoarding: 100,
        strategyGuide:
          "「正常中转」：可按步骤执行；登机口未定前可短时停留商业区，但请预留安检后主脊步行。",
      };
      t.anomalies = [
        {
          level: "info",
          title: "登机口与登机时间以航显为准",
          detail:
            "航司 App、短信与机场屏幕偶有不一致，请在起飞前 90 分钟内二次确认登机口。",
        },
        {
          level: "warn",
          title: "时间紧张时将自动收紧动线",
          detail:
            "若检测到登机将开始或步行过长，会切换为「最短路径」策略并减少顺路推荐。",
        },
      ];

      t.familyChecks = [];

      t.flightStatus = {
        ...t.flightStatus,
        gateNote: "登机口将于起飞前 90 分钟在航显与港航 App 公布",
      };

      t.tasks = [
        { id: "arrive",   order: 1, time: "10:30", route: "下机 → T1 L6 中转主通道", mode: "步行", duration: "5m", reason: "已检测到电子登机牌，可直接进入中转动线", mapTarget: "checkin" },
        { id: "counter",  order: 2, time: "10:35", route: "中转主通道 → 港航中转柜台 G 区（如需）", mode: "步行 · 可选", duration: "3m", reason: "仅改签或确认直挂行李时前往；无需求可跳过", mapTarget: "checkin" },
        { id: "security", order: 3, time: "10:40", route: "Transfer 标识 → 中转安检通道", mode: "步行", duration: "4m", reason: "保持主通道直行，可更快进入安检", mapTarget: "security" },
        { id: "boarding", order: 4, time: "12:10", route: "安检后主脊 → 登机口", mode: "步行", duration: "6m", reason: "登机口公布后自动改写路径并给出最新用时", mapTarget: "lounge" },
      ];

      t.services = [
        { id: "lounge",   icon: "info", title: "港航贵宾室 The Bridge", sub: "T1 安检后 · 步行约 6 分钟", tag: "推荐", note: "持港航金卡 / 公务舱可用，含简餐与 Wi-Fi" },
        { id: "duty",     icon: "info", title: "DFS 免税商业街", sub: "中央商业区 · 步行约 5 分钟", tag: "顺路", note: "中转 >2h 时建议预留 30 分钟逛免税" },
        { id: "charge",   icon: "info", title: "充电与办公区", sub: "登机口 W 区附近 · 含独立桌面 + 插座", tag: "顺路", note: "适合处理邮件 / 远程会议" },
      ];

      t.tips = [
        "充电宝 ≤ 20000mAh 必须随身，禁止托运",
        "登机口公布后建议提前 30 分钟到达",
        "持港航 App 可在线值机并实时跟踪登机口变更",
      ];

      return d;
    },
  },

  // ----------------------------------------------------------
  // 亲子家庭：少走路、有照护、能放电（与 plan_港航出行_3类人群.md 对齐）
  // ----------------------------------------------------------
  family: {
    key: "family",
    label: "亲子",
    tagline: "少走路 · 有照护 · 能放电",
    patch: (d) => {
      // 亲子人群的现有数据基本可用；这里仅做语气强化与字段补齐
      const t = d.transit;
      t.mode = "family";
      t.modeLabel = "亲子家庭";
      t.modeTagline = "少走路 · 有照护 · 能放电";

      t.boardingInfo = {
        boardingTime: "15:25",
        terminal: "4",
        gate: "479",
        group: "5",
        seat: "55G",
      };

      t.boardingPassStatus = {
        ok: true,
        label: "已检测到下一程电子登机牌",
        tip: "先去中转安检家庭通道，再按路线前往登机口",
        actionLine:
          "现在从 T1 L6 沿 Transfer 指示前行；若闸机报码异常，再到就近柜台处理。",
      };

      t.timeTier = "ample";

      t.flightStatus = {
        ...t.flightStatus,
        gateNote: "登机口将于起飞前 90 分钟在航显与港航 App 公布。请留意机场广播信息",
      };

      // tasks 沿用基础数据（亲子专属任务已挂 family: true 修饰）+ mapTarget 联动
      t.tasks = [
        { id: "arrive",   order: 1, time: "10:30", route: "下机 → T1 L6 中转主通道", mode: "步行", duration: "5m", reason: "先并入主通道，后续去婴儿车点更顺路", mapTarget: "overview" },
        { id: "stroller", order: 2, time: "10:35", route: "中转主通道 → L6 婴儿车租借点", mode: "步行 · 60m", duration: "3m", reason: "先借车再走后续路段更省力；可在登机口归还", family: true, mapTarget: "checkin" },
        { id: "security", order: 3, time: "10:40", route: "租借点 → 中转安检家庭通道", mode: "步行", duration: "4m", reason: "家庭通道在右侧，携婴幼儿可优先通过", family: true, mapTarget: "security" },
        { id: "boarding", order: 4, time: "12:10", route: "安检后主脊 → 登机口（途经儿童区）", mode: "步行", duration: "8m", reason: "登机口公布后自动校正路线；时间充裕可短暂停留儿童区", mapTarget: "lounge" },
      ];

      t.services = [
        { id: "stroller", icon: "stroller", family: true, title: "免费婴儿车", sub: "L6 / L7 多点可借还 · 无需预约", tag: "顺路", note: "先借后走可减少抱娃距离；离机前在登机口附近归还" },
        { id: "nursery",  icon: "baby",     family: true, title: "最近的育婴室", sub: "距当前位置约 80m · 含尿布台 / 哺乳室 / 温奶器", tag: "顺路", note: "如需换尿布或温奶，先停留 10 分钟再继续前往安检" },
        { id: "playroom", icon: "play",     family: true, title: "儿童游乐区", sub: "顺路 · 距登机口步行约 5 分钟", tag: "时间充裕", note: "若剩余时间 > 2h，可先放电 15-20 分钟再去登机口" },
        { id: "sensory",  icon: "calm",     family: true, title: "Sensory Corner 感官友好空间", sub: "T1 安静区 · 低刺激环境", tag: "可选", note: "孩子烦躁时可先安静 5-10 分钟，再继续行进" },
      ];

      t.tips = [
        "安检前把婴儿食品、母乳和液态药品单独拿出并主动说明",
        "充电宝随身携带（≤ 20000mAh），过检前提前放在易取位置",
        "到登机口先报备 2 岁以下儿童，可申请优先登机",
      ];

      return d;
    },
  },

  // ----------------------------------------------------------
  // 商旅：极致效率 / 贵宾通道 / 办公续航（信息密度高、装饰最少）
  // ----------------------------------------------------------
  business: {
    key: "business",
    label: "商旅",
    tagline: "极致效率 · 贵宾通道 · 续航办公",
    patch: (d) => {
      const t = d.transit;
      t.mode = "business";
      t.modeLabel = "商旅高效";
      t.modeTagline = "贵宾通道 · 工位续航";

      t.boardingInfo = {
        boardingTime: "14:50",
        terminal: "4",
        gate: "W17",
        group: "1",
        seat: "2A",
      };

      t.boardingPassStatus = {
        ok: true,
        label: "已自动检入下一程 · 座位 2A",
        tip: "下机后直走 Premium / Fast Track 中转通道",
        actionLine:
          "当前礼遇已生效：先过 Fast Track，再按最新登机口提示前往贵宾室或登机口。",
      };

      t.timeTier = "normal";
      t.counterGuidance = {
        needCounter: false,
        airlineLine: "港航贵宾礼遇 · 下一程吉隆坡（CA857 代码共享段）",
        summary:
          "电子登机牌与礼遇到账，通常无须柜台；若需升舱票据或报销凭证再走服务台。",
        nextStep: "现在前往 Fast Track 中转安检，过检后再进入贵宾室。",
      };
      t.routeChain = [
        { label: "免柜台", sub: "礼遇检入", tone: "skip" },
        { label: "Fast Track", sub: "中转安检", tone: "default" },
        { label: "主脊步行", sub: "约 5 分钟", tone: "default" },
        { label: "贵宾室 / 登机口", sub: "W 区", tone: "default" },
      ];
      t.boardingCountdown = {
        phaseLabel: "登机开始前",
        minutesToBoarding: 85,
        strategyGuide:
          "「正常中转」：可先完成安检与贵宾室短时办公，起飞前约 25 分钟往登机口机动。",
      };
      t.anomalies = [
        {
          level: "info",
          title: "卫星厅登机口与 APM",
          detail: "若登机口调往卫星厅，需乘旅客捷运 APM；系统将压缩贵宾室停留并提醒提前下楼。",
        },
        {
          level: "warn",
          title: "远机位登机口",
          detail: "W 区部分班次为摆渡车登机，听到广播后请立即下楼，避免按步行路径误判。",
        },
      ];

      t.familyChecks = [];

      t.flightStatus = {
        ...t.flightStatus,
        gateNote: "登机口预计 W17（暂定，起飞前 90 分钟最终公布）",
      };

      t.tasks = [
        { id: "arrive",   order: 1, time: "10:30", route: "下机 → T1 L6 中转主通道", mode: "步行", duration: "5m", reason: "并入主通道后可直接衔接 Fast Track", mapTarget: "overview" },
        { id: "fast",     order: 2, time: "10:35", route: "中转主通道 → Fast Track 中转通道", mode: "贵宾通道", duration: "3m", reason: "公务舱/金卡可直通，平均节省约 12 分钟", mapTarget: "security" },
        { id: "lounge",   order: 3, time: "10:40", route: "安检后 → 港航贵宾室 The Bridge", mode: "步行", duration: "6m", reason: "先完成办公与补给，再根据登机口变化机动出发", mapTarget: "lounge" },
        { id: "boarding", order: 4, time: "14:20", route: "贵宾室 → 登机口 W17", mode: "步行", duration: "4m", reason: "建议在起飞前 30 分钟离开贵宾室并到达登机口", mapTarget: "lounge" },
      ];

      t.services = [
        { id: "lounge",   icon: "info", title: "港航贵宾室 The Bridge", sub: "工位 / 淋浴 / 简餐 / 高速 Wi-Fi", tag: "贵宾", note: "持公务舱 / 金卡 / Priority Pass 可用" },
        { id: "fast",     icon: "info", title: "Fast Track 中转专用通道", sub: "T1 中转区 · 平均排队 < 3 分钟", tag: "高效", note: "比普通通道节省约 12 分钟" },
        { id: "wifi",     icon: "info", title: "全场免费 Wi-Fi · #HKAirport", sub: "贵宾室提供独立高速线路", tag: "顺路", note: "适合远程会议 / 处理邮件" },
        { id: "shower",   icon: "info", title: "淋浴间 · 贵宾室内", sub: "建议落地后第一站", tag: "推荐", note: "长航段 / 跨时区出差恢复状态" },
      ];

      t.tips = [
        "充电宝 ≤ 20000mAh 必须随身，禁止托运",
        "贵宾室一般在登机前 30 分钟自动广播提醒",
        "若需打印行程单 / 发票，可在贵宾室前台办理",
      ];

      return d;
    },
  },
};
