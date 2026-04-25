document.title = "Jacob Groner";

document.addEventListener("DOMContentLoaded", () => {
  const expandableItems = document.querySelectorAll(".purpose-future-item");

  expandableItems.forEach((item) => {
    const toggle = item.querySelector(".purpose-expand-toggle");
    const panel = item.querySelector(".purpose-expand-panel");

    if (!toggle || !panel) {
      return;
    }

    panel.style.maxHeight = "0px";

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!isOpen));
      item.classList.toggle("is-open", !isOpen);
      panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
    });
  });

  window.addEventListener("resize", () => {
    expandableItems.forEach((item) => {
      const toggle = item.querySelector(".purpose-expand-toggle");
      const panel = item.querySelector(".purpose-expand-panel");

      if (toggle?.getAttribute("aria-expanded") === "true" && panel) {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
});
