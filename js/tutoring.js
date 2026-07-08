const openButton = document.querySelector("[data-tutoring-open]");
const closeButton = document.querySelector("[data-tutoring-close]");
const backdrop = document.querySelector("[data-tutoring-backdrop]");
const panel = document.querySelector("[data-tutoring-panel]");
const form = document.querySelector("[data-tutoring-form]");
const status = document.querySelector("[data-tutoring-status]");
const targetFrame = document.querySelector("[data-tutoring-target]");

let submitted = false;

function openPanel() {
  panel.classList.add("is-open");
  backdrop.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("tutoring-panel-locked");
  panel.querySelector("input, select, textarea")?.focus();
}

function closePanel() {
  panel.classList.remove("is-open");
  backdrop.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("tutoring-panel-locked");
}

openButton?.addEventListener("click", openPanel);
closeButton?.addEventListener("click", closePanel);
backdrop?.addEventListener("click", closePanel);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && panel?.classList.contains("is-open")) {
    closePanel();
  }
});

form?.addEventListener("submit", () => {
  submitted = true;
});

targetFrame?.addEventListener("load", () => {
  if (!submitted) {
    return;
  }

  submitted = false;
  form.hidden = true;
  status.textContent = "Thanks! Your request has been sent. I'll be in touch soon.";
});
