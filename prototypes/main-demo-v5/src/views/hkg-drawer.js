export function renderHkgDrawer(profile) {
  return `
    <section class="hkg-drawer" data-hkg-drawer data-state="collapsed">
      <button class="hkg-drawer__handle" type="button" data-hkg-drawer-handle aria-label="拖动路书面板"></button>
      <div class="hkg-drawer__content">
        <div class="hkg-drawer__eyebrow" data-hkg-drawer-eyebrow>${profile.routeLabel}</div>
        <h2 class="hkg-drawer__title" data-hkg-drawer-title>入境登机路线如下：</h2>
        <p class="hkg-drawer__body" data-hkg-drawer-body>${profile.overview}</p>
        ${renderTalkTracks(profile)}
        <div class="hkg-drawer__sources" data-hkg-drawer-source>
          ${profile.sources.map((s) => `<span>${s}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderTalkTracks(profile) {
  if (!profile.talkTracks?.length) return "";
  return `
    <div class="hkg-talktracks" aria-label="加急话术">
      ${profile.talkTracks
        .map((text) => `<button type="button" data-hkg-copy="${text}">${text}</button>`)
        .join("")}
    </div>
  `;
}

export function setHkgDrawerContent(rootEl, profile, node = null) {
  const drawer = rootEl.querySelector("[data-hkg-drawer]");
  if (!drawer) return;

  const eyebrow = drawer.querySelector("[data-hkg-drawer-eyebrow]");
  const title = drawer.querySelector("[data-hkg-drawer-title]");
  const body = drawer.querySelector("[data-hkg-drawer-body]");
  const source = drawer.querySelector("[data-hkg-drawer-source]");

  if (eyebrow) eyebrow.textContent = node ? `${profile.routeLabel} · ${node.num}` : profile.routeLabel;
  if (title) title.textContent = node ? node.title : "入境登机路线如下：";
  if (body) body.textContent = node ? node.detail : profile.overview;
  if (source) {
    const sourceItems = node?.sourceNote ? [node.sourceNote] : profile.sources;
    source.innerHTML = sourceItems.map((item) => `<span>${item}</span>`).join("");
  }
}

export function attachHkgDrawer(rootEl) {
  const drawer = rootEl.querySelector("[data-hkg-drawer]");
  const handle = rootEl.querySelector("[data-hkg-drawer-handle]");
  if (!drawer || !handle || drawer.dataset.bound === "true") return;
  drawer.dataset.bound = "true";

  const states = ["collapsed", "mid", "expanded"];
  let startY = 0;
  let startIndex = 1;
  let dragging = false;

  const setState = (state) => {
    drawer.dataset.state = state;
  };

  const setCollapsed = () => {
    setState("collapsed");
  };

  const currentIndex = () => {
    const idx = states.indexOf(drawer.dataset.state);
    return idx >= 0 ? idx : 1;
  };

  const onDown = (event) => {
    dragging = true;
    startY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;
    startIndex = currentIndex();
    drawer.dataset.dragging = "true";
    handle.setPointerCapture?.(event.pointerId);
  };

  const onMove = (event) => {
    if (!dragging) return;
    const y = event.clientY ?? event.touches?.[0]?.clientY ?? startY;
    const dy = y - startY;
    if (Math.abs(dy) < 24) return;
    const nextIndex = Math.max(0, Math.min(states.length - 1, startIndex + (dy > 0 ? -1 : 1)));
    setState(states[nextIndex]);
  };

  const onUp = () => {
    dragging = false;
    drawer.dataset.dragging = "false";
  };

  handle.addEventListener("pointerdown", onDown);
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onUp);
  handle.addEventListener("pointercancel", onUp);
  handle.addEventListener("click", () => {
    const idx = currentIndex();
    setState(states[idx === 1 ? 2 : 1]);
  });

  drawer.addEventListener("hkg:collapse", setCollapsed);

  drawer.querySelectorAll("[data-hkg-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.hkgCopy || "";
      try {
        await navigator.clipboard?.writeText(text);
        btn.dataset.copied = "true";
        window.setTimeout(() => {
          btn.dataset.copied = "false";
        }, 900);
      } catch {
        btn.dataset.copied = "false";
      }
    });
  });
}
