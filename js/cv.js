const skillCard = document.querySelector(".cv-skill-card");
const pills = document.querySelectorAll(".cv-expand-pill");
const collapseTimers = [];
const COLLAPSE_STAGGER_MS = 750;

function clearCollapseTimers() {
  while (collapseTimers.length) {
    clearTimeout(collapseTimers.pop());
  }
}

pills.forEach((pill) => {
  const shortLabel = pill.querySelector(".cv-pill-short");
  const fullLabel = pill.querySelector(".cv-pill-full");

  const shortWidth = Math.ceil(shortLabel.getBoundingClientRect().width);
  const fullWidth = Math.ceil(fullLabel.getBoundingClientRect().width);

  pill.style.setProperty("--pill-short-width", `${shortWidth}px`);
  pill.style.setProperty("--pill-full-width", `${fullWidth}px`);

  pill.addEventListener("mouseenter", () => {
    clearCollapseTimers();
    pill.classList.add("is-active");
  });
});

if (skillCard) {
  skillCard.addEventListener("mouseenter", () => {
    clearCollapseTimers();
  });

  skillCard.addEventListener("mouseleave", () => {
    const activePills = Array.from(pills)
      .filter((pill) => pill.classList.contains("is-active"))
      .reverse();

    activePills.forEach((pill, index) => {
      const timer = setTimeout(() => {
        pill.classList.remove("is-active");
      }, index * COLLAPSE_STAGGER_MS);

      collapseTimers.push(timer);
    });
  });
}
