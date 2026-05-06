// JourneyKit legacy prototype script. Playback data is static so this prototype has no old backend dependency.
/* ============================================================
 * JourneyKit Legacy Prototype · chat-demo2 (light variant)
 * - Expandable big/small transit cards (grid-template-rows)
 * - FLIP shared-element open/close for the free-transit card
 * - Reuses playback2 DNA (portal / beam / travelers / video)
 * ============================================================ */

const FALLBACK_PLAYBACK = {
  root_node_id: "node_afa1d723e55448838acd7fcf14aba732",
  nodes: [
    {
      node_id: "node_afa1d723e55448838acd7fcf14aba732",
      title: "T1 → T3 换乘总览",
      image_urls: { landscape: "../../public/assets/prototype-legacy/node_afa1d723e55448838acd7fcf14aba732.jpg" },
    },
    {
      node_id: "node_49175859a0aa4963bc68a36620319ccc",
      title: "行李直挂判断",
      image_urls: { landscape: "../../public/assets/prototype-legacy/node_49175859a0aa4963bc68a36620319ccc.jpg" },
    },
    {
      node_id: "node_76a6a7a3a3a14dfd96637f047678f881",
      title: "Transfer 动线",
      image_urls: { landscape: "../../public/assets/prototype-legacy/node_76a6a7a3a3a14dfd96637f047678f881.jpg" },
    },
    {
      node_id: "node_c57b2ed233d9444bbe0141c0fc6231cb",
      title: "登机口路线",
      image_urls: { landscape: "../../public/assets/prototype-legacy/node_c57b2ed233d9444bbe0141c0fc6231cb.jpg" },
    },
  ],
  edges: [
    {
      from: "node_afa1d723e55448838acd7fcf14aba732",
      to: "node_49175859a0aa4963bc68a36620319ccc",
      tap_point: { x: 0.24, y: 0.66 },
      transition: { video_url: "../../public/assets/prototype-legacy/transition_9f45b4935033ab2bd0911038.mp4" },
    },
    {
      from: "node_afa1d723e55448838acd7fcf14aba732",
      to: "node_76a6a7a3a3a14dfd96637f047678f881",
      tap_point: { x: 0.52, y: 0.58 },
      transition: { video_url: "../../public/assets/prototype-legacy/transition_e53ba2c54fbca54677e9eef3.mp4" },
    },
    {
      from: "node_afa1d723e55448838acd7fcf14aba732",
      to: "node_c57b2ed233d9444bbe0141c0fc6231cb",
      tap_point: { x: 0.78, y: 0.48 },
      transition: { video_url: "../../public/assets/prototype-legacy/transition_bca82e79ca47254bc9c1a4b1.mp4" },
    },
  ],
};

const TOPIC_COPY = {
  overview: {
    kicker: "新加坡樟宜机场 · 现场演示",
    title: "先把这 2 小时拆成三件事",
    heading: "先把这 2 小时拆成三件事",
    body: "新加坡樟宜机场很大，但流程其实很简单：<b>先搞清楚行李、再跟着指示牌换航站楼、最后锁定登机口</b>。点上面图里的三个光圈，我会一个一个演示给你看。",
    items: [
      "看行李小票最后是不是写到 <b>DPS</b>（巴厘岛），是就不用管",
      "认准 <b>Transfer / 转机</b> 指示，不要跟着人群去\"入境\"",
      "进 T3 出发层第一件事：抬头看大屏找你的登机口",
    ],
  },
  baggage: {
    kicker: "第 1 步 · 行李直挂判断",
    title: "先看你的行李要不要再托一次",
    heading: "翻出行李小票，看最后那段三字代码",
    body: "登机时贴在你票根背面的<b>纸质行李牌</b>，最后一段三字代码如果是 <b>DPS</b>（巴厘岛），就说明行李已经直挂到底，<b>你啥也不用干</b>。只要是 <b>SIN</b> 结尾，才需要在新加坡取出来重托。",
    items: [
      "找到贴在登机牌上的那张长条纸质行李牌",
      "看最末一段的三字代码：<b>DPS</b> 就直挂、<b>SIN</b> 要重托",
      "拿不准？直接去 <b>Transfer Desk 转机柜台</b>问工作人员",
    ],
  },
  security: {
    kicker: "第 2 步 · 跟着换航站楼",
    title: "跟着 Transfer 指示牌走就行",
    heading: "认准「Transfer / 转机」，别跟着人群排入境",
    body: "下机后抬头找绿色/黄色的 <b>Transfer</b>（转机）指示牌，跟着走会带你坐 <b>Skytrain 小火车</b> 到 T3，全程不用出境。这段 2 小时走得过来，<b>别一下飞机就先去买咖啡</b>，先把路走完。",
    items: [
      "下机先看头顶指示，找 <b>Transfer to T3</b>",
      "Skytrain 小火车 2 分钟直达 T3，免费",
      "到 T3 可能要再过一次安检，排队 5–10 分钟",
    ],
  },
  gate: {
    kicker: "第 3 步 · 锁定登机口",
    title: "进 T3 第一件事抬头看大屏",
    heading: "登机口临近起飞才稳定，别走太远",
    body: "到 T3 出发层后，<b>先看航班信息大屏</b>找你的登机口编号（SV856）。新加坡的登机口常常起飞前 40 分钟才最终确定，<b>选个离大屏近的座位等</b>，别跑去尽头的免税店。",
    items: [
      "登机口一般起飞前 <b>40 分钟</b>才最终稳定",
      "找个离登机口步行 <b>3 分钟内</b>的座位坐下",
      "护照和登机牌全程放在随手能摸到的地方",
    ],
  },
};

const TOPIC_TO_TITLE_PART = {
  baggage: "行李",
  security: "Transfer",
  gate: "登机",
};

/* ---------- state + element refs ---------- */

const state = {
  playback: FALLBACK_PLAYBACK,
  nodes: FALLBACK_PLAYBACK.nodes,
  rootIndex: 0,
  currentIndex: 0,
  busy: false,
  open: false,
  edgeMap: new Map(),
};

const el = {
  phoneBody: document.querySelector(".phone-body"),
  freeFocus: document.getElementById("freeFocus"),
  openBtn: document.getElementById("openFreeFocus"),
  closeBtn: document.getElementById("closeFreeFocus"),
  backdrop: document.getElementById("closeBackdrop"),
  resetBtn: document.getElementById("resetFocus"),
  freePreview: document.getElementById("freePreviewImage"),
  focusTitle: document.getElementById("focusTitle"),
  focusVisual: document.getElementById("focusVisual"),
  focusImage: document.getElementById("focusImage"),
  focusIncoming: document.getElementById("focusIncoming"),
  focusVideo: document.getElementById("focusVideo"),
  focusCopy: document.getElementById("focusCopy"),
  focusTravelers: document.getElementById("focusTravelers"),
  focusSheet: document.querySelector(".focus-sheet"),
  focusHotspots: document.getElementById("focusHotspots"),
  hotspots: [...document.querySelectorAll(".focus-hotspots .hotspot")],
  kicker: document.querySelector(".focus-kicker"),
  expandables: [...document.querySelectorAll('.leg-card[data-expandable="true"]')],
};

/* ---------- helpers ---------- */

const edgeKey = (from, to) => `${from}->${to}`;

const buildEdgeMap = (pb) =>
  new Map((pb.edges || []).map((edge) => [edgeKey(edge.from, edge.to), edge]));

const nodeImage = (node) => node?.image_urls?.landscape || "";

function preload(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
}

function indexByTitlePart(part) {
  return state.nodes.findIndex((node) => (node.title || "").includes(part));
}

function indexForTopic(topic) {
  if (topic === "overview") return state.rootIndex;
  const part = TOPIC_TO_TITLE_PART[topic];
  if (!part) return state.rootIndex;
  const found = indexByTitlePart(part);
  return found >= 0 ? found : state.rootIndex;
}

function topicFromIndex(index) {
  const title = state.nodes[index]?.title || "";
  if (title.includes("行李")) return "baggage";
  if (title.includes("Transfer") || title.includes("安检") || title.includes("动线"))
    return "security";
  if (title.includes("登机")) return "gate";
  return "overview";
}

function topicFromPoint(x, y) {
  if (x < 0.34) return "baggage";
  if (x > 0.66) return "gate";
  if (y > 0.42) return "security";
  return "overview";
}

function setTapVars(x, y) {
  el.focusVisual.style.setProperty("--tap-x", `${x * 100}%`);
  el.focusVisual.style.setProperty("--tap-y", `${y * 100}%`);
}

function setHotspotsVisible(visible) {
  if (!el.focusHotspots) return;
  el.focusHotspots.dataset.show = visible ? "true" : "false";
}

function setResetEnabled(enabled) {
  if (!el.resetBtn) return;
  if (enabled) el.resetBtn.removeAttribute("disabled");
  else el.resetBtn.setAttribute("disabled", "");
}

function renderCopy(topic) {
  const copy = TOPIC_COPY[topic] || TOPIC_COPY.overview;
  if (el.kicker) el.kicker.textContent = copy.kicker;
  el.focusTitle.textContent = copy.title;
  const items = (copy.items || []).map((item) => `<li>${item}</li>`).join("");
  el.focusCopy.innerHTML = `
    <h3>${copy.heading}</h3>
    <p>${copy.body}</p>
    ${items ? `<ul>${items}</ul>` : ""}
  `;
  const isOverview = topic === "overview";
  setHotspotsVisible(isOverview);
  setResetEnabled(!isOverview);
}

/* ---------- travellers ---------- */

function seedTravelers(xPct, yPct) {
  if (!el.focusTravelers) return;
  el.focusTravelers.replaceChildren();
  for (let i = 0; i < 9; i += 1) {
    const dot = document.createElement("span");
    dot.className = "focus-traveler-dot";
    const jitterX = (Math.random() - 0.5) * 16;
    const jitterY = (Math.random() - 0.5) * 14;
    dot.style.setProperty("--dot-x", `${xPct + jitterX}%`);
    dot.style.setProperty("--dot-y", `${yPct + jitterY}%`);
    dot.style.setProperty("--move-x", `${68 + i * 11}px`);
    dot.style.setProperty("--move-y", `${-20 + (i % 3) * 14}px`);
    dot.style.setProperty("--delay", `${i * 60}ms`);
    el.focusTravelers.appendChild(dot);
  }
}

/* ---------- expandable big/small cards ---------- */

function bindExpandables() {
  el.expandables.forEach((card) => {
    const header = card.querySelector(".leg-header");
    if (!header) return;
    header.addEventListener("click", () => {
      const open = card.getAttribute("data-open") === "true";
      // Single-open policy only collapses siblings in the same timeline group.
      const siblings = card
        .closest(".timeline")
        ?.querySelectorAll('.leg-card[data-expandable="true"][data-open="true"]');
      siblings?.forEach((other) => {
        if (other !== card) {
          other.setAttribute("data-open", "false");
          other.querySelector(".leg-header")?.setAttribute("aria-expanded", "false");
        }
      });
      card.setAttribute("data-open", open ? "false" : "true");
      header.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });
}

/* ---------- transitions (playback2 DNA) ---------- */

async function renderRoot() {
  const node = state.nodes[state.rootIndex];
  const src = nodeImage(node);
  if (src) el.focusImage.src = src;
  el.focusIncoming.removeAttribute("src");
  el.focusVisual.classList.remove("morphing", "videoing");
  state.currentIndex = state.rootIndex;
  renderCopy("overview");
}

async function proceduralTransition(toNode, tap) {
  const src = nodeImage(toNode);
  if (!src) return;
  await preload(src);
  setTapVars(tap.x, tap.y);
  seedTravelers(tap.x * 100, tap.y * 100);
  el.focusIncoming.src = src;
  void el.focusVisual.offsetWidth;
  el.focusVisual.classList.add("motioning");
  await new Promise((resolve) => window.setTimeout(resolve, 1750));
  el.focusImage.src = src;
  el.focusIncoming.removeAttribute("src");
  el.focusVisual.classList.remove("motioning");
  if (el.focusTravelers) el.focusTravelers.replaceChildren();
}

async function videoTransition(edge, toNode, tap) {
  const src = nodeImage(toNode);
  if (!src) return;
  await preload(src);
  setTapVars(tap.x, tap.y);
  await new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      el.focusImage.src = src;
      el.focusVideo.pause();
      el.focusVideo.removeAttribute("src");
      el.focusVisual.classList.remove("videoing");
      resolve();
    };
    el.focusVideo.onended = finish;
    el.focusVideo.onerror = () => {
      el.focusVisual.classList.remove("videoing");
      reject(new Error("video transition failed"));
    };
    el.focusVideo.src = edge.transition.video_url;
    el.focusVisual.classList.add("videoing");
    el.focusVideo.play().catch(reject);
    window.setTimeout(finish, 7200);
  });
}

async function goTo(index, tap = { x: 0.5, y: 0.5 }, useMotion = true) {
  if (state.busy || index < 0 || index >= state.nodes.length) return;
  const fromNode = state.nodes[state.currentIndex];
  const toNode = state.nodes[index];
  const targetTopic = topicFromIndex(index);
  state.busy = true;
  try {
    if (!useMotion || index === state.currentIndex) {
      const src = nodeImage(toNode);
      if (src) {
        await preload(src);
        el.focusImage.src = src;
      }
      state.currentIndex = index;
      renderCopy(targetTopic);
      return;
    }
    // Hide hotspots immediately once motion starts.
    setHotspotsVisible(false);
    if (el.kicker) {
      el.kicker.textContent = (TOPIC_COPY[targetTopic] || TOPIC_COPY.overview).kicker;
    }
    el.focusTitle.textContent = "正在推进…";
    const edge = state.edgeMap.get(edgeKey(fromNode.node_id, toNode.node_id));
    if (edge?.transition?.video_url) {
      try {
        await videoTransition(edge, toNode, tap);
      } catch (_videoError) {
        await proceduralTransition(toNode, tap);
      }
    } else {
      await proceduralTransition(toNode, tap);
    }
    state.currentIndex = index;
    renderCopy(targetTopic);
  } finally {
    state.busy = false;
  }
}

/* ---------- FLIP open / close ---------- */

async function openFocus() {
  if (state.open) return;
  state.open = true;
  await renderRoot();

  const heroRect = el.openBtn.getBoundingClientRect();
  const sheet = el.focusSheet;

  el.freeFocus.classList.remove("open");
  el.freeFocus.setAttribute("aria-hidden", "false");

  // Measure target rect with a temporary open state.
  sheet.style.transition = "none";
  sheet.style.opacity = "1";
  sheet.style.transform = "translateY(0) scale(1)";
  const targetRect = sheet.getBoundingClientRect();
  sheet.style.opacity = "";
  sheet.style.transform = "";

  const dx = heroRect.left - targetRect.left;
  const dy = heroRect.top - targetRect.top;
  const sx = Math.max(0.2, heroRect.width / targetRect.width);
  const sy = Math.max(0.2, heroRect.height / targetRect.height);

  sheet.style.transition = "none";
  sheet.style.transformOrigin = "top left";
  sheet.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  sheet.style.opacity = "0.01";
  sheet.style.borderRadius = "var(--r-xl)";
  void sheet.offsetWidth;

  sheet.style.transition =
    "transform 620ms var(--ease-expo), opacity 420ms var(--ease-expo), border-radius 620ms var(--ease-expo)";
  sheet.style.transform = "translate(0, 0) scale(1, 1)";
  sheet.style.opacity = "1";

  el.freeFocus.classList.add("open");

  const cleanup = () => {
    sheet.style.transition = "";
    sheet.style.transform = "";
    sheet.style.opacity = "";
    sheet.style.transformOrigin = "";
    sheet.style.borderRadius = "";
    sheet.removeEventListener("transitionend", cleanup);
  };
  sheet.addEventListener("transitionend", cleanup, { once: true });

  document.body.style.overflow = "hidden";
}

function closeFocus() {
  if (!state.open) return;
  state.open = false;

  const heroRect = el.openBtn.getBoundingClientRect();
  const sheet = el.focusSheet;
  const sheetRect = sheet.getBoundingClientRect();

  const dx = heroRect.left - sheetRect.left;
  const dy = heroRect.top - sheetRect.top;
  const sx = Math.max(0.2, heroRect.width / sheetRect.width);
  const sy = Math.max(0.2, heroRect.height / sheetRect.height);

  sheet.style.transition =
    "transform 520ms var(--ease-expo), opacity 360ms var(--ease-expo), border-radius 520ms var(--ease-expo)";
  sheet.style.transformOrigin = "top left";
  sheet.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  sheet.style.opacity = "0";
  sheet.style.borderRadius = "var(--r-xl)";

  el.freeFocus.classList.remove("open");
  el.freeFocus.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  const cleanup = () => {
    sheet.style.transition = "";
    sheet.style.transform = "";
    sheet.style.opacity = "";
    sheet.style.transformOrigin = "";
    sheet.style.borderRadius = "";
    sheet.removeEventListener("transitionend", cleanup);
  };
  sheet.addEventListener("transitionend", cleanup, { once: true });
}

/* ---------- free-hero portal cursor follow ---------- */

function updateHeroPortalPosition(event) {
  if (!el.openBtn) return;
  const rect = el.openBtn.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  el.openBtn.style.setProperty("--portal-x", `${Math.max(8, Math.min(92, x))}%`);
  el.openBtn.style.setProperty("--portal-y", `${Math.max(16, Math.min(88, y))}%`);
}

/* ---------- data ---------- */

async function loadPlayback() {
  try {
    const response = await fetch("./playback2-latest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("playback unavailable");
    const data = await response.json();
    if (data?.nodes?.length) state.playback = data;
  } catch (_err) {
    state.playback = FALLBACK_PLAYBACK;
  }
  state.nodes = state.playback.nodes?.length ? state.playback.nodes : FALLBACK_PLAYBACK.nodes;
  state.rootIndex = Math.max(
    0,
    state.nodes.findIndex((node) => node.node_id === state.playback.root_node_id),
  );
  state.currentIndex = state.rootIndex;
  state.edgeMap = buildEdgeMap(state.playback.edges?.length ? state.playback : FALLBACK_PLAYBACK);

  const root = state.nodes[state.rootIndex];
  const rootSrc = nodeImage(root);
  if (rootSrc) {
    if (el.freePreview) el.freePreview.src = rootSrc;
    el.focusImage.src = rootSrc;
  }
  renderCopy("overview");
}

/* ---------- bindings ---------- */

bindExpandables();

el.openBtn?.addEventListener("click", openFocus);
el.closeBtn?.addEventListener("click", closeFocus);
el.backdrop?.addEventListener("click", closeFocus);
el.resetBtn?.addEventListener("click", () => {
  if (state.busy) return;
  goTo(state.rootIndex, { x: 0.5, y: 0.5 }, false);
});

// Hotspots: each ring deterministically routes to its topic's edge.
el.hotspots.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.busy || state.currentIndex !== state.rootIndex) return;
    const topic = button.dataset.topic;
    const nextIndex = indexForTopic(topic);
    if (nextIndex <= 0 || nextIndex === state.currentIndex) return;
    const edge = [...state.edgeMap.values()].find(
      (item) => item.to === state.nodes[nextIndex]?.node_id,
    );
    const tap = edge?.tap_point || { x: 0.5, y: 0.5 };
    goTo(nextIndex, tap, true);
  });
});

// Free-form tap on the stage (fallback if user ignores hotspots).
el.focusVisual?.addEventListener("click", (event) => {
  if (state.busy || state.currentIndex !== state.rootIndex) return;
  // Ignore clicks that started on a hotspot (those are handled above).
  if (event.target.closest(".hotspot")) return;
  const rect = el.focusVisual.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  const nextIndex = indexForTopic(topicFromPoint(x, y));
  if (nextIndex > 0 && nextIndex !== state.currentIndex) {
    goTo(nextIndex, { x, y }, true);
  }
});

el.openBtn?.addEventListener("pointermove", updateHeroPortalPosition);
el.openBtn?.addEventListener("pointerleave", () => {
  el.openBtn.style.removeProperty("--portal-x");
  el.openBtn.style.removeProperty("--portal-y");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.open) closeFocus();
});

loadPlayback();
