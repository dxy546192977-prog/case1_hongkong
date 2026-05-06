import { getHkgProfile } from "../data/hkg-profiles.js";

export function renderHkgProfileCard(state) {
  const profile = getHkgProfile(state.airportProfile);

  return `
    <article
      class="hkg-profile-card"
      data-profile="${profile.id}"
      style="--hkg-accent: ${profile.accent}; --hkg-accent-soft: ${profile.accentSoft}"
    >
      <div class="hkg-profile-card__push">
        <span class="hkg-profile-card__push-dot" aria-hidden="true"></span>
        ${profile.push}
      </div>
      <div class="hkg-profile-card__badge">${profile.badge}</div>
      <div class="hkg-profile-card__time">${profile.time}</div>
      <h2 class="hkg-profile-card__title">${profile.title}</h2>
      <p class="hkg-profile-card__sub">${profile.sub}</p>
      <p class="hkg-profile-card__lead">${profile.lead}</p>
      <div class="hkg-profile-card__chips" aria-label="${profile.tabLabel}重点">
        ${profile.chips.map((chip) => `<span>${chip}</span>`).join("")}
      </div>
      <button class="hkg-profile-card__cta" type="button" data-action="expand-trip-card">
        ${profile.cta}
      </button>
    </article>
  `;
}
