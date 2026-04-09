const projectList = document.querySelector("[data-project-list]");

fetch("projects.yaml")
  .then((response) => response.text())
  .then((yaml) => {
    projectList.innerHTML = parseProjects(yaml)
      .map(
        (project) => `
          <article class="project-card">
            <div class="project-header">
              <h2 class="project-title">${project.title}</h2>
              <a class="project-link" href="${project.github}" target="_blank" rel="noreferrer" aria-label="View GitHub repository">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
                </svg>
              </a>
            </div>
            <video class="project-video" controls preload="metadata" src="${project.video}"></video>
            <div class="project-body">
              <p class="project-abstract">${project.abstract}</p>
            </div>
          </article>
        `
      )
      .join("");
  });

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
    let value = cleaned.slice(divider + 1).trim();

    if (value === "|") {
      project[key] = "";
      continue;
    }

    project[key] = value.replace(/^["']|["']$/g, "");
  }

  return project;
}
