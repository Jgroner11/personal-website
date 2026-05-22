const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function readSiteFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function writeSiteFile(relativePath, content) {
  fs.writeFileSync(path.join(ROOT, relativePath), `${content.trimEnd()}\n`, "utf8");
}

function main() {
  const pages = getPages();
  const sections = [
    "# Jacob Groner",
    "",
    "> Personal website text for Jacob Groner, formatted for LLMs and agents.",
    "",
    "## Pages",
    "",
    ...pages.map((page) => `- [${page.title}](${page.href})`),
    "",
  ];

  for (const page of pages) {
    sections.push(`## ${page.title}`, "");
    sections.push(page.type === "projects" ? renderProjects() : renderHtmlPage(page.href));
    sections.push("");
  }

  sections.push(renderContact());

  writeSiteFile("llms.txt", normalizeMarkdown(sections.join("\n")));
}

function renderHtmlPage(relativePath) {
  const html = readSiteFile(relativePath);
  const main = extractTagContents(html, "main") || html;
  return htmlToMarkdown(main, 3);
}

function getPages() {
  const siteJs = readSiteFile("js/site.js");
  const navPages = parseJsArrayTuples(siteJs, "navLinks")
    .map(([href, title]) => ({ title, href, type: href === "projects.html" ? "projects" : "html" }));

  return [{ title: "Home", href: "index.html", type: "html" }, ...navPages];
}

function renderProjects() {
  const yaml = readSiteFile("projects.yaml");
  const projects = parseProjectsYaml(yaml);

  return projects
    .map((project) => {
      const lines = [`### ${project.title}`];

      if (project.abstract) {
        lines.push("", inlineHtmlToMarkdown(project.abstract));
      }

      if (project.paper) {
        lines.push("", `[Paper](${project.paper})`);
      }

      if (project.github) {
        lines.push("", `[GitHub](${project.github})`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function renderContact() {
  const siteJs = readSiteFile("js/site.js");
  const email = siteJs.match(/<p class="footer-email">([^<]+)<\/p>/)?.[1]?.trim();
  const contactLinks = parseJsArrayTuples(siteJs, "contactLinks");

  const lines = ["## Contact", ""];

  if (email) {
    lines.push(email, "");
  }

  lines.push(...contactLinks.map(([label, , href]) => `[${label}](${href})`));

  return lines.join("\n");
}

function htmlToMarkdown(html, headingBaseLevel) {
  let content = html;

  content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
  content = content.replace(/<style[\s\S]*?<\/style>/gi, "");
  content = content.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  content = content.replace(/<aside[\s\S]*?<\/aside>/gi, "");
  content = content.replace(/<a\b[^>]*href=["']llms\.txt["'][^>]*>[\s\S]*?<\/a>/gi, "");
  content = content.replace(
    /<p\b[^>]*class=["'][^"']*\beyebrow\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
    (_match, text) => `<h2>${cleanInline(text)}</h2>`,
  );
  content = content.replace(
    /<li\b[^>]*class=["'][^"']*\bcv-expand-pill\b[^"']*["'][^>]*>\s*<span\b[^>]*class=["'][^"']*\bcv-pill-short\b[^"']*["'][^>]*>([\s\S]*?)<\/span>\s*<span\b[^>]*class=["'][^"']*\bcv-pill-full\b[^"']*["'][^>]*>([\s\S]*?)<\/span>\s*<\/li>/gi,
    (_match, shortText, fullText) => `<li>${cleanInline(shortText)} (${cleanInline(fullText)})</li>`,
  );

  content = content.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attrs, text) => {
    const href = getAttribute(attrs, "href");
    const label = stripTags(text).trim() || getAttribute(attrs, "aria-label") || href;

    if (!href || !label || href.startsWith("#")) {
      return label;
    }

    return `[${decodeHtml(label)}](${href})`;
  });

  content = content.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, rawLevel, text) => {
    const level = headingBaseLevel + Math.max(0, Number(rawLevel) - 2);
    return `\n\n${"#".repeat(level)} ${cleanInline(text)}\n\n`;
  });

  content = content.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_match, text) => {
    return `\n\n${cleanInline(text)}\n\n`;
  });

  content = content.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_match, text) => {
    return `\n- ${cleanInline(text)}`;
  });

  content = content.replace(/<br\s*\/?>/gi, "\n");
  content = stripTags(content);

  return normalizeMarkdown(decodeHtml(content));
}

function inlineHtmlToMarkdown(html) {
  let content = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attrs, text) => {
    const href = getAttribute(attrs, "href");
    const label = cleanInline(text);
    return href ? `[${label}](${href})` : label;
  });

  content = stripTags(content);
  return decodeHtml(content).trim();
}

function parseProjectsYaml(yaml) {
  return yaml
    .trim()
    .split("\n  - ")
    .slice(1)
    .map(parseProjectBlock);
}

function parseProjectBlock(block) {
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

    project[key] = value === "|" ? "" : trimYamlQuotes(value);
  }

  return project;
}

function parseJsArrayTuples(js, variableName) {
  const match = js.match(new RegExp(`const\\s+${variableName}\\s*=\\s*\\[([\\s\\S]*?)\\];`));

  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/\[([^\]]+)\]/g)].map((tuple) => {
    return [...tuple[1].matchAll(/"([^"]*)"/g)].map((value) => value[1]);
  });
}

function extractTagContents(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))?.[1] || "";
}

function getAttribute(attributes, name) {
  const match = attributes.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function cleanInline(html) {
  return decodeHtml(stripTags(html))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ");
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function trimYamlQuotes(value) {
  const quote = value[0];

  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeMarkdown(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(\n- [^\n]+)\n\n(?=- )/g, "$1\n")
    .trim();
}

main();
