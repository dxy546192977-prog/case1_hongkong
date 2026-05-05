// v4 机场卡 flipbook：参考 chat-demo2-legacy 的 focus 模式，
// 在 overview 静态图上点击光圈 → 预生成 mp4 平滑切到目标 frame。
//
// 渲染：renderAirportFlipbook(flipbook) 返回 HTML 字符串（含初始 overview 图层、4 个光圈、底部正文）。
// 行为：attachAirportFlipbook(root, flipbook) 在 render 之后挂上 vanilla DOM 控制器，
// 自管 state（current/busy），点击不走 store，避免视频被全屏 re-render 打断。
//
// 视频缺失时回退：图层 crossfade（incoming 图渐显），不阻塞演示。

const edgeKey = (from, to) => `${from}->${to}`;

// 视频播放速率：5s 原片 → 1.5x ≈ 3.3s，更接近 Doha 体验
const VIDEO_RATE = 1.5;

export function renderAirportFlipbook(flipbook) {
  const root = flipbook.nodes.find((n) => n.id === flipbook.rootNodeId) || flipbook.nodes[0];
  const hotspotsHtml = (flipbook.hotspots || [])
    .map(
      (h) => `
        <button
          type="button"
          class="afp-hotspot"
          data-afp-hotspot
          data-target="${h.target}"
          data-x="${h.x}"
          data-y="${h.y}"
          style="--hx: ${h.x * 100}%; --hy: ${h.y * 100}%"
          aria-label="演示：${h.label}"
        >
          <span class="afp-ring" aria-hidden="true"></span>
          <span class="afp-ring afp-ring--outer" aria-hidden="true"></span>
          <span class="afp-dot" aria-hidden="true"></span>
          <span class="afp-tag">${h.label}</span>
        </button>
      `,
    )
    .join("");

  return `
    <div
      class="airport-flipbook"
      data-airport-flipbook
      data-current="${root.id}"
      data-busy="false"
    >
      <figure class="afp-stage">
        <img class="afp-image" data-afp-image src="${root.image}" alt="${root.bodyTitle || ""}" />
        <img class="afp-incoming" data-afp-incoming alt="" aria-hidden="true" />
        <video
          class="afp-video"
          data-afp-video
          muted
          playsinline
          preload="auto"
        ></video>
        <!-- 水波纹层：3 个同心环，由 --tap-x/--tap-y 定位，--rippling 类触发 -->
        <span class="afp-ripple" style="--d: 0ms"   aria-hidden="true"></span>
        <span class="afp-ripple" style="--d: 140ms" aria-hidden="true"></span>
        <span class="afp-ripple" style="--d: 280ms" aria-hidden="true"></span>
        <div class="afp-hotspots" data-afp-hotspots data-show="true">
          ${hotspotsHtml}
        </div>
        <button
          type="button"
          class="afp-reset"
          data-afp-reset
          aria-label="回到总览"
          hidden
        >
          <span class="afp-reset__chev" aria-hidden="true"></span>
          回到总览
        </button>
      </figure>

      <div class="airport-card__body-section" data-afp-body>
        <h2 class="airport-card__body-title" data-afp-body-title>${root.bodyTitle || ""}</h2>
        <p class="airport-card__body" data-afp-body-text>${root.body || ""}</p>
      </div>
    </div>
  `;
}

export function attachAirportFlipbook(rootEl, flipbook) {
  if (!rootEl || rootEl.dataset.afpBound === "true") return;
  rootEl.dataset.afpBound = "true";

  const nodesById = new Map(flipbook.nodes.map((n) => [n.id, n]));
  const edgesByKey = new Map((flipbook.edges || []).map((e) => [edgeKey(e.from, e.to), e]));
  const rootId = flipbook.rootNodeId;

  const refs = {
    image: rootEl.querySelector("[data-afp-image]"),
    incoming: rootEl.querySelector("[data-afp-incoming]"),
    video: rootEl.querySelector("[data-afp-video]"),
    hotspots: rootEl.querySelector("[data-afp-hotspots]"),
    reset: rootEl.querySelector("[data-afp-reset]"),
    bodyTitle: rootEl.querySelector("[data-afp-body-title]"),
    bodyText: rootEl.querySelector("[data-afp-body-text]"),
    stage: rootEl.querySelector(".afp-stage"),
  };

  const state = {
    currentId: rootId,
    busy: false,
  };

  const setBusy = (v) => {
    state.busy = v;
    rootEl.dataset.busy = v ? "true" : "false";
  };

  const setHotspotsVisible = (v) => {
    if (refs.hotspots) refs.hotspots.dataset.show = v ? "true" : "false";
  };

  const setResetVisible = (v) => {
    if (refs.reset) {
      if (v) refs.reset.removeAttribute("hidden");
      else refs.reset.setAttribute("hidden", "");
    }
  };

  const setBodyForNode = (nodeId) => {
    const node = nodesById.get(nodeId);
    if (!node) return;
    if (refs.bodyTitle) refs.bodyTitle.textContent = node.bodyTitle || "";
    if (refs.bodyText) refs.bodyText.textContent = node.body || "";
  };

  const preload = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve();
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });

  const setTapVars = (x, y) => {
    if (!refs.stage) return;
    refs.stage.style.setProperty("--tap-x", `${x * 100}%`);
    refs.stage.style.setProperty("--tap-y", `${y * 100}%`);
  };

  // 触发水波纹动画（3 同心环，CSS 关键帧 + 时序错开）
  const triggerRipple = (x, y) => {
    setTapVars(x, y);
    refs.stage.classList.remove("afp-stage--rippling");
    void refs.stage.offsetWidth; // 强制 reflow，重启动画
    refs.stage.classList.add("afp-stage--rippling");
    window.setTimeout(() => {
      refs.stage.classList.remove("afp-stage--rippling");
    }, 1400);
  };

  // 等待 image 加载并经过一帧绘制（保证底图在视频淡出前已经就绪）
  const waitImagePainted = (src) =>
    new Promise((resolve) => {
      const img = refs.image;
      const done = () => {
        // 双 RAF 保证浏览器已经把新图片画到屏幕上
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      };
      // 已经设置了正确 src 且加载完毕
      if (img.src.endsWith(src.split("/").pop()) && img.complete && img.naturalWidth > 0) {
        return done();
      }
      const cleanup = () => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onErr);
      };
      const onLoad = () => { cleanup(); done(); };
      const onErr  = () => { cleanup(); done(); };
      img.addEventListener("load", onLoad, { once: true });
      img.addEventListener("error", onErr, { once: true });
      img.src = src;
    });

  // 视频转场：先把底图换成 toSrc（仍被 video 覆盖），再淡出 video，避免闪屏
  const playVideo = (videoUrl, toSrc) =>
    new Promise((resolve, reject) => {
      let settled = false;

      const finish = async (err) => {
        if (settled) return;
        settled = true;
        // 1. 视频还盖着的时候，先把底图换成下一帧并等它真正画上屏
        if (!err && toSrc) {
          try {
            await waitImagePainted(toSrc);
          } catch {}
        }
        // 2. 视频淡出（CSS 过渡），底下已经是新图，无闪
        refs.stage.classList.remove("afp-stage--videoing");
        // 3. 清理 video 元素
        try { refs.video.pause(); } catch {}
        refs.video.removeAttribute("src");
        refs.video.load();
        if (err) reject(err); else resolve();
      };

      refs.video.onended = () => { finish(); };
      refs.video.onerror = () => { finish(new Error("video error")); };
      refs.video.src = videoUrl;
      refs.video.playbackRate = VIDEO_RATE;
      refs.stage.classList.add("afp-stage--videoing");
      const playPromise = refs.video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(() => {
          // 部分浏览器在 play() 之后 playbackRate 才会真正生效
          refs.video.playbackRate = VIDEO_RATE;
        }).catch(() => finish(new Error("video play rejected")));
      }
      // 安全兜底：5s 原片 / 1.5x ≈ 3.4s，给到 5s 留余量
      window.setTimeout(() => finish(), 5000);
    });

  // 无视频时的兜底：incoming 图层 crossfade 进来
  const crossfade = async (toSrc) => {
    refs.incoming.src = toSrc;
    await new Promise((r) => requestAnimationFrame(r));
    void refs.stage.offsetWidth;
    refs.stage.classList.add("afp-stage--fading");
    await new Promise((r) => setTimeout(r, 720));
    refs.image.src = toSrc;
    refs.incoming.removeAttribute("src");
    refs.stage.classList.remove("afp-stage--fading");
  };

  const goTo = async (targetId, tap) => {
    if (state.busy || targetId === state.currentId) return;
    const fromId = state.currentId;
    const toNode = nodesById.get(targetId);
    if (!toNode) return;
    const edge = edgesByKey.get(edgeKey(fromId, targetId));

    setBusy(true);
    if (tap) triggerRipple(tap.x, tap.y);
    setHotspotsVisible(false);

    try {
      await preload(toNode.image);

      if (edge?.video) {
        try {
          await playVideo(edge.video, toNode.image);
        } catch {
          await crossfade(toNode.image);
        }
      } else {
        await crossfade(toNode.image);
      }

      state.currentId = targetId;
      rootEl.dataset.current = targetId;
      setBodyForNode(targetId);
      setResetVisible(targetId !== rootId);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (state.busy || state.currentId === rootId) return;
    const rootNode = nodesById.get(rootId);
    if (!rootNode) return;
    refs.image.src = rootNode.image;
    state.currentId = rootId;
    rootEl.dataset.current = rootId;
    setBodyForNode(rootId);
    setHotspotsVisible(true);
    setResetVisible(false);
  };

  // 光圈点击
  rootEl.querySelectorAll("[data-afp-hotspot]").forEach((btn) => {
    btn.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.currentId !== rootId || state.busy) return;
        const targetId = btn.dataset.target;
        const tap = { x: parseFloat(btn.dataset.x) || 0.5, y: parseFloat(btn.dataset.y) || 0.5 };
        goTo(targetId, tap);
      },
      { passive: false },
    );
  });

  if (refs.reset) {
    refs.reset.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        reset();
      },
      { passive: false },
    );
  }

  // 初始：写一次 body 文案，确保和 currentId 一致
  setBodyForNode(state.currentId);
}
