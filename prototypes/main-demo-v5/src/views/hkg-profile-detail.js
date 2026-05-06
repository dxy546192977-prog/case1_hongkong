import { getHkgProfile } from "../data/hkg-profiles.js";
import { ICON } from "../icons.js";
import { renderComposer } from "./chat.js";
import { renderHkgDrawer } from "./hkg-drawer.js";
import { renderHkgRouteMap } from "./hkg-route-map.js";

export function renderHkgProfileDetail(state) {
  const profile = getHkgProfile(state.airportProfile);
  const view = state.hkgView || "route";

  return `
    <div
      class="hkg-profile-detail"
      data-hkg-profile-detail
      data-profile="${profile.id}"
      style="--hkg-accent: ${profile.accent}; --hkg-accent-soft: ${profile.accentSoft}"
    >
      <header class="hkg-profile-detail__appbar">
        <button class="hkg-profile-detail__back" type="button" data-action="collapse-trip-card" aria-label="返回">
          ${ICON.back(22)}
        </button>
        <div class="hkg-profile-detail__tabs" role="tablist" aria-label="香港机场视图">
          <button
            type="button"
            data-action="set-hkg-view"
            data-hkg-view="itinerary"
            class="${view === "itinerary" ? "is-active" : ""}"
          >行程图</button>
          <button
            type="button"
            data-action="set-hkg-view"
            data-hkg-view="route"
            class="${view === "route" ? "is-active" : ""}"
          >线路图</button>
        </div>
      </header>

      <main class="hkg-profile-detail__main">
        ${view === "itinerary" ? renderHkgItinerary(profile) : renderHkgRouteMap(profile)}
      </main>

      ${view === "route" ? renderHkgDrawer(profile) : ""}
      ${renderComposer({ placeholder: "想去哪里", interactive: true, state, chips: false })}
    </div>
  `;
}

function renderHkgItinerary(profile) {
  return `
    <section class="hkg-itinerary-view">
      <div class="hkg-itinerary-view__head">
        <span>${profile.push}</span>
        <h1>${profile.title}</h1>
        <p>${profile.sub}</p>
      </div>
      <ol class="hkg-itinerary-steps">
        ${profile.nodes
          .map(
            (node) => `
              <li>
                <span class="hkg-itinerary-steps__num">${node.num}</span>
                <div>
                  <strong>${node.title}</strong>
                  <p>${node.detail}</p>
                  <em>${node.sourceNote}</em>
                </div>
              </li>
            `,
          )
          .join("")}
      </ol>
    </section>
  `;
}
