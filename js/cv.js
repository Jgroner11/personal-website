const pills = [...document.querySelectorAll(".cv-expand-pill")];
const skillCard = pills[0]?.closest(".cv-skill-card");
const collapseTimers = [];
const COLLAPSE_STAGGER_MS = 750;

function clearCollapseTimers() {
  collapseTimers.forEach(clearTimeout);
  collapseTimers.length = 0;
}

for (const pill of pills) {
  const shortLabel = pill.querySelector(".cv-pill-short");
  const fullLabel = pill.querySelector(".cv-pill-full");

  pill.style.setProperty("--pill-short-width", `${Math.ceil(shortLabel.getBoundingClientRect().width)}px`);
  pill.style.setProperty("--pill-full-width", `${Math.ceil(fullLabel.getBoundingClientRect().width)}px`);

  pill.addEventListener("mouseenter", () => {
    clearCollapseTimers();
    pill.classList.add("is-active");
  });
}

skillCard?.addEventListener("mouseenter", clearCollapseTimers);

skillCard?.addEventListener("mouseleave", () => {
  const activePills = pills.filter((pill) => pill.classList.contains("is-active")).reverse();

  activePills.forEach((pill, index) => {
    const timer = setTimeout(() => {
      pill.classList.remove("is-active");
    }, index * COLLAPSE_STAGGER_MS);

    collapseTimers.push(timer);
  });
});
