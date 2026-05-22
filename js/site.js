const SITE_TITLE = "Jacob Groner";

const icons = {
  github: `
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49C4 14.09 3.48 13.22 3.32 12.77c-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.52 7.52 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
    </svg>
  `,
  linkedin: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.32 8.02h4.36V23H.32V8.02ZM7.6 8.02h4.18v2.05h.06c.58-1.1 2.01-2.26 4.14-2.26 4.43 0 5.25 2.92 5.25 6.71V23h-4.36v-7.52c0-1.79-.03-4.1-2.5-4.1-2.5 0-2.88 1.95-2.88 3.97V23H7.6V8.02Z"></path>
    </svg>
  `,
  paper: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2.75A2.25 2.25 0 0 0 3.75 5v14A2.25 2.25 0 0 0 6 21.25h12A2.25 2.25 0 0 0 20.25 19V8.8a2.25 2.25 0 0 0-.66-1.59l-3.8-3.8a2.25 2.25 0 0 0-1.59-.66H6Zm0 1.5h7.75V8c0 1.24 1.01 2.25 2.25 2.25h2.75V19a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V5A.75.75 0 0 1 6 4.25Zm9.25 1.06 2.44 2.44H16a.75.75 0 0 1-.75-.75V5.31ZM8 12.25a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H8Zm0 3a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5H8Z"></path>
    </svg>
  `,
  twitter: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2h3.68l-8.04 9.19L24 22h-7.42l-5.81-7.6L4.12 22H.44l8.6-9.83L0 2h7.62l5.25 6.94L18.9 2Zm-1.29 18.1h2.04L6.52 3.8H4.33L17.61 20.1Z"></path>
    </svg>
  `,
};

const navLinks = [
  ["purpose.html", "Purpose"],
  ["projects.html", "Projects"],
  ["cv.html", "CV"],
];

const contactLinks = [
  ["LinkedIn", "linkedin", "https://www.linkedin.com/in/jacob-groner-a591721b5/"],
  ["GitHub", "github", "https://github.com/Jgroner11"],
  ["Twitter", "twitter", "https://twitter.com/groner66082"],
];

window.siteIcon = (name) => icons[name] || "";

function currentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function renderHeader() {
  const header = document.querySelector("[data-site-header]");

  if (!header) {
    return;
  }

  header.innerHTML = `
    <a class="site-title" href="index.html">${SITE_TITLE}</a>
    <nav class="site-nav" aria-label="Primary">
      ${navLinks.map(renderNavLink).join("")}
    </nav>
  `;
}

function renderNavLink([href, label]) {
  const current = href === currentPage() ? ' aria-current="page"' : "";
  return `<a href="${href}"${current}>${label}</a>`;
}

function renderFooter() {
  const footer = document.querySelector("[data-site-footer]");

  if (!footer) {
    return;
  }

  footer.innerHTML = `
    <div class="site-footer-inner">
      <div>
        <h2 class="footer-kicker" id="contact-heading">Contact</h2>
        <p class="footer-email">jacobgroner@gmail.com</p>
      </div>
      <address class="contact-list">
        ${contactLinks.map(renderContactLink).join("")}
      </address>
    </div>
  `;
}

function renderContactLink([label, icon, href]) {
  return `
    <a href="${href}" target="_blank" rel="noreferrer" aria-label="${label}">
      ${window.siteIcon(icon)}
    </a>
  `;
}

function initExpandableItems() {
  const items = [...document.querySelectorAll(".purpose-future-item")]
    .map((item) => ({
      item,
      toggle: item.querySelector(".purpose-expand-toggle"),
      panel: item.querySelector(".purpose-expand-panel"),
    }))
    .filter(({ toggle, panel }) => toggle && panel);

  items.forEach(({ item, toggle, panel }) => {
    panel.style.maxHeight = "0px";

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!isOpen));
      item.classList.toggle("is-open", !isOpen);
      panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
    });
  });

  window.addEventListener("resize", () => {
    items.forEach(({ toggle, panel }) => {
      if (toggle.getAttribute("aria-expanded") === "true") {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.title.trim()) {
    document.title = SITE_TITLE;
  }

  renderHeader();
  renderFooter();
  initExpandableItems();
});
