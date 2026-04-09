const projectList = document.querySelector("[data-project-list]");

fetch("projects.yaml")
  .then((response) => response.text())
  .then((yaml) => {
    projectList.innerHTML = parseProjects(yaml)
      .map(
        (project) => `
          <article class="project-card">
            <h2 class="project-title">${project.title}</h2>
            <video class="project-video" controls preload="metadata" src="${project.video}"></video>
            <div class="project-body">
              <p class="project-abstract">${project.abstract}</p>
              <a class="project-link" href="${project.github}" target="_blank" rel="noreferrer">View GitHub repository</a>
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
