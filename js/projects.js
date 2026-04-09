async function loadProjects() {
  const container = document.querySelector("[data-project-list]");
  const status = document.querySelector("[data-project-status]");

  if (!container || !status) {
    return;
  }

  try {
    const response = await fetch("projects.yaml", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unable to load projects.yaml (${response.status})`);
    }

    const yamlText = await response.text();
    const projects = parseProjectsYaml(yamlText);

    renderProjects(container, status, projects);
  } catch (error) {
    status.textContent =
      "Projects could not be loaded. If you opened the page directly from your files, try serving the site through a local web server.";
    status.hidden = false;
    console.error(error);
  }
}

function parseProjectsYaml(yamlText) {
  const lines = yamlText.replace(/\r\n/g, "\n").split("\n");
  const projects = [];
  let currentProject = null;
  let currentMultilineKey = null;

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (trimmed === "projects:") {
      continue;
    }

    if (rawLine.startsWith("  - ")) {
      if (currentProject) {
        projects.push(normalizeProject(currentProject));
      }

      currentProject = {};
      currentMultilineKey = null;

      const remainder = rawLine.slice(4).trim();
      if (remainder) {
        assignProjectValue(currentProject, remainder);
      }
      continue;
    }

    if (!currentProject) {
      throw new Error("Each project entry must appear under the 'projects:' list.");
    }

    if (currentMultilineKey && rawLine.startsWith("      ")) {
      const contentLine = rawLine.slice(6);
      const existingValue = currentProject[currentMultilineKey];
      currentProject[currentMultilineKey] = existingValue
        ? `${existingValue}\n${contentLine}`
        : contentLine;
      continue;
    }

    currentMultilineKey = null;

    if (rawLine.startsWith("    ")) {
      const entry = rawLine.slice(4);
      const key = assignProjectValue(currentProject, entry);

      if (entry.endsWith(": |")) {
        currentMultilineKey = key;
        currentProject[currentMultilineKey] = "";
      }
      continue;
    }

    throw new Error(`Unexpected YAML structure on line ${index + 1}.`);
  }

  if (currentProject) {
    projects.push(normalizeProject(currentProject));
  }

  return projects;
}

function assignProjectValue(project, line) {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    throw new Error(`Invalid field: '${line}'`);
  }

  const key = line.slice(0, separatorIndex).trim();
  let value = line.slice(separatorIndex + 1).trim();

  if (value === "|") {
    return key;
  }

  value = stripWrappingQuotes(value);
  project[key] = value;
  return key;
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeProject(project) {
  const normalized = {
    title: project.title || "Untitled Project",
    video: project.video || "",
    abstract: (project.abstract || "").trim(),
    github: project.github || ""
  };

  if (!normalized.video || !normalized.github) {
    throw new Error(
      `Project '${normalized.title}' is missing a required 'video' or 'github' field.`
    );
  }

  return normalized;
}

function renderProjects(container, status, projects) {
  container.innerHTML = "";

  if (!projects.length) {
    status.textContent = "No projects yet. Add your first entry to projects.yaml.";
    status.hidden = false;
    return;
  }

  status.hidden = true;

  for (const project of projects) {
    const article = document.createElement("article");
    article.className = "project-card";

    const video = document.createElement("video");
    video.className = "project-video";
    video.controls = true;
    video.preload = "metadata";
    video.src = project.video;

    const body = document.createElement("div");
    body.className = "project-body";

    const title = document.createElement("h2");
    title.textContent = project.title;

    const abstract = document.createElement("p");
    abstract.className = "project-abstract";
    abstract.textContent = project.abstract;

    const repoLink = document.createElement("a");
    repoLink.className = "project-link";
    repoLink.href = project.github;
    repoLink.target = "_blank";
    repoLink.rel = "noreferrer";
    repoLink.textContent = "View GitHub repository";

    body.append(title, abstract, repoLink);
    article.append(video, body);
    container.append(article);
  }
}

loadProjects();
