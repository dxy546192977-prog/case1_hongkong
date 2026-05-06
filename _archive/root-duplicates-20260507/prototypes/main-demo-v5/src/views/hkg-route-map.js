import { setHkgDrawerContent } from "./hkg-drawer.js";

const VIDEO_RATE = 1.5;

export function renderHkgRouteMap(profile) {
  return `
    <figure class="hkg-route-map" data-hkg-route-map data-current="overview">
      <div class="hkg-route-map__stage" data-hkg-stage>
        <img
          class="hkg-route-map__image"
          data-hkg-image
          src="${profile.map.overview}"
          alt="${profile.map.alt}"
        />
        <img class="hkg-route-map__incoming" data-hkg-incoming alt="" aria-hidden="true" />
        <video class="hkg-route-map__video" data-hkg-video muted playsinline preload="auto"></video>
        <div class="hkg-route-map__overlay" data-hkg-overlay>
          ${profile.nodes.map(renderNodeButton).join("")}
        </div>
        <button class="hkg-route-map__reset" type="button" data-hkg-reset hidden>
          回到总览
        </button>
      </div>
    </figure>
  `;
}

function renderNodeButton(node) {
  return `
    <button
      class="hkg-route-node"
      type="button"
      data-hkg-node="${node.id}"
      style="--node-x: ${node.x * 100}%; --node-y: ${node.y * 100}%"
      aria-label="${node.num} ${node.label}"
    >
      <span class="hkg-route-node__ring" aria-hidden="true"></span>
      <span class="hkg-route-node__ring hkg-route-node__ring--outer" aria-hidden="true"></span>
      <span class="hkg-route-node__dot" aria-hidden="true"></span>
      <span class="hkg-route-node__tag">${node.shortLabel}</span>
    </button>
  `;
}

export function attachHkgRouteMap(rootEl, profile) {
  const mapEl = rootEl.querySelector("[data-hkg-route-map]");
  if (!mapEl || mapEl.dataset.bound === "true") return;
  mapEl.dataset.bound = "true";

  const nodesById = new Map(profile.nodes.map((node) => [node.id, node]));
  const edgesByKey = new Map((profile.edges || []).map((edge) => [`${edge.from}->${edge.to}`, edge]));
  const refs = {
    stage: mapEl.querySelector("[data-hkg-stage]"),
    image: mapEl.querySelector("[data-hkg-image]"),
    incoming: mapEl.querySelector("[data-hkg-incoming]"),
    video: mapEl.querySelector("[data-hkg-video]"),
    overlay: mapEl.querySelector("[data-hkg-overlay]"),
    reset: mapEl.querySelector("[data-hkg-reset]"),
  };

  const state = {
    currentId: "overview",
    busy: false,
  };

  const setBusy = (value) => {
    state.busy = value;
    mapEl.dataset.busy = value ? "true" : "false";
  };

  const setOverlayVisible = (value) => {
    if (refs.overlay) refs.overlay.dataset.show = value ? "true" : "false";
  };

  const setResetVisible = (value) => {
    if (!refs.reset) return;
    if (value) refs.reset.removeAttribute("hidden");
    else refs.reset.setAttribute("hidden", "");
  };

  const syncImageRatio = () => {
    const width = refs.image?.naturalWidth || 0;
    const height = refs.image?.naturalHeight || 0;
    if (width > 0 && height > 0) {
      refs.stage.style.setProperty("--hkg-media-ratio", `${width} / ${height}`);
    }
  };

  const preload = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve();
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });

  const waitImagePainted = (src) =>
    new Promise((resolve) => {
      const done = () => requestAnimationFrame(() => requestAnimationFrame(resolve));
      const cleanup = () => {
        refs.image.removeEventListener("load", onLoad);
        refs.image.removeEventListener("error", onError);
      };
      const onLoad = () => {
        syncImageRatio();
        cleanup();
        done();
      };
      const onError = () => {
        cleanup();
        done();
      };
      refs.image.addEventListener("load", onLoad, { once: true });
      refs.image.addEventListener("error", onError, { once: true });
      refs.image.src = src;
      if (refs.image.complete && refs.image.naturalWidth > 0) {
        syncImageRatio();
        cleanup();
        done();
      }
    });

  const playVideo = (videoUrl, toSrc) =>
    new Promise((resolve, reject) => {
      let settled = false;
      const finish = async (err) => {
        if (settled) return;
        settled = true;
        if (!err && toSrc) await waitImagePainted(toSrc);
        refs.stage.classList.remove("hkg-route-map__stage--videoing");
        try {
          refs.video.pause();
        } catch {}
        refs.video.removeAttribute("src");
        refs.video.load();
        if (err) reject(err);
        else resolve();
      };

      refs.video.onended = () => finish();
      refs.video.onerror = () => finish(new Error("video error"));
      refs.video.src = videoUrl;
      refs.video.playbackRate = VIDEO_RATE;
      refs.stage.classList.add("hkg-route-map__stage--videoing");
      const promise = refs.video.play();
      if (promise?.then) {
        promise.then(() => {
          refs.video.playbackRate = VIDEO_RATE;
        }).catch(() => finish(new Error("video play rejected")));
      }
      window.setTimeout(() => finish(), 5200);
    });

  const crossfade = async (toSrc) => {
    refs.incoming.src = toSrc;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    void refs.stage.offsetWidth;
    refs.stage.classList.add("hkg-route-map__stage--fading");
    await new Promise((resolve) => window.setTimeout(resolve, 680));
    refs.image.src = toSrc;
    refs.incoming.removeAttribute("src");
    refs.stage.classList.remove("hkg-route-map__stage--fading");
  };

  const resolveEdge = (nodeId) => {
    const exact = edgesByKey.get(`${state.currentId}->${nodeId}`);
    if (exact) return exact;
    const overviewEdge = edgesByKey.get(`overview->${nodeId}`);
    if (state.currentId === "overview" && overviewEdge) return overviewEdge;
    const node = nodesById.get(nodeId);
    return node?.video ? { from: state.currentId, to: nodeId, video: node.video } : null;
  };

  const collapseDrawer = () => {
    rootEl.querySelector("[data-hkg-drawer]")?.dispatchEvent(new CustomEvent("hkg:collapse"));
  };

  const goToNode = async (nodeId) => {
    if (state.busy || state.currentId === nodeId) return;
    const node = nodesById.get(nodeId);
    if (!node) return;
    const edge = resolveEdge(nodeId);

    setBusy(true);
    setOverlayVisible(false);
    collapseDrawer();
    try {
      await preload(node.image);
      if (edge?.mode === "instant" || refs.image.getAttribute("src") === node.image) {
        await waitImagePainted(node.image);
      } else if (edge?.video) {
        try {
          await playVideo(edge.video, node.image);
        } catch {
          await crossfade(node.image);
        }
      } else {
        await crossfade(node.image);
      }
      state.currentId = node.id;
      mapEl.dataset.current = node.id;
      setResetVisible(true);
      setHkgDrawerContent(rootEl, profile, node);
      mapEl.dispatchEvent(new CustomEvent("hkg:node-change", { bubbles: true, detail: { nodeId: node.id, profileId: profile.id } }));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (state.busy) return;
    refs.image.src = profile.map.overview;
    refs.incoming.removeAttribute("src");
    state.currentId = "overview";
    mapEl.dataset.current = "overview";
    setOverlayVisible(true);
    setResetVisible(false);
    setHkgDrawerContent(rootEl, profile, null);
    collapseDrawer();
    mapEl.dispatchEvent(new CustomEvent("hkg:node-change", { bubbles: true, detail: { nodeId: "overview", profileId: profile.id } }));
  };

  // 外部触发 goto（sheet 卡片点击联动）
  mapEl.addEventListener("hkg:goto", (event) => {
    const target = event.detail?.nodeId;
    if (!target) return;
    if (target === "overview") return reset();
    goToNode(target);
  });

  mapEl.querySelectorAll("[data-hkg-node]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      goToNode(button.dataset.hkgNode);
    });
  });

  refs.reset?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    reset();
  });

  refs.image?.addEventListener("load", syncImageRatio);
  syncImageRatio();
  setOverlayVisible(true);
  setHkgDrawerContent(rootEl, profile, null);
}
