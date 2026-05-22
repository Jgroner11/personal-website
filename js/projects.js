const projectList = document.querySelector("[data-project-list]");

initProjects();

async function initProjects() {
  const yaml = await fetch("projects.yaml").then((response) => response.text());
  const projects = parseProjects(yaml);

  projectList.innerHTML = projects.map(renderProject).join("");

  const videos = document.querySelectorAll("video.project-video");

  videos.forEach((video) => {
    video.addEventListener("play", () => {
      videos.forEach((otherVideo) => {
        if (otherVideo !== video) {
          otherVideo.pause();
        }
      });
    });
  });

  document.querySelectorAll(".project-video-mask").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("is-hidden");
      button.previousElementSibling.play();
    });
  });
}

function renderProject(project) {
  const media = renderProjectMedia(project);
  const actions = renderProjectActions(project);
  const abstract = project.abstract || "";

  return `
    <article class="project-card">
      <div class="project-header">
        <h2 class="project-title">${project.title}</h2>
        ${actions}
      </div>
      ${media}
      <p class="project-abstract">${abstract}</p>
    </article>
  `;
}

function renderProjectActions(project) {
  return `
    <div class="project-actions">
      ${project.paper ? renderProjectLink(project.paper, "paper", "View paper") : ""}
      ${renderProjectLink(project.github, "github", "View GitHub repository")}
    </div>
  `;
}

function renderProjectLink(href, icon, label) {
  return `
    <a class="project-link" href="${href}" target="_blank" rel="noreferrer" aria-label="${label}">
      ${window.siteIcon(icon)}
    </a>
  `;
}

function renderProjectMedia(project) {
  if (project.video) {
    return `
      <div class="project-video-shell">
        <video class="project-video" controls preload="metadata" poster="${project.thumbnail}" src="${project.video}"></video>
        <button class="project-video-mask" type="button" style="background-image: url('${project.thumbnail}')" aria-label="Play ${project.title}">
          <span class="project-video-play"></span>
        </button>
      </div>
    `;
  }

  if (project.thumbnail) {
    return `
      <div class="project-video-shell">
        <img class="project-video project-thumbnail" src="${project.thumbnail}" alt="${project.title} preview">
      </div>
    `;
  }

  return "";
}

function parseProjects(yaml) {
  return yaml
    .trim()
    .split("\n  - ")
    .slice(1)
    .map(parseProject);
}

function parseProject(block) {
  const project = {};
  let key = "";

  for (const line of block.split("\n")) {
    if (line.startsWith("      ")) {
      project[key] += `${project[key] ? "\n" : ""}${line.slice(6)}`;
      continue;
    }

    const cleaned = line.replace(/^- /, "");
    const divider = cleaned.indexOf(":");
    key = cleaned.slice(0, divider).trim();
    const value = cleaned.slice(divider + 1).trim();

    project[key] = value === "|" ? "" : value.replace(/^["']|["']$/g, "");
  }

  return project;
}
