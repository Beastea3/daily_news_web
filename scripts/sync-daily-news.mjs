import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SECTION_CATEGORY_MAP = new Map([
  ["🤖 AI / ML", "AI"],
  ["💼 Business & Startups", "Startups"],
  ["🌐 Tech Industry", "Technology"],
  ["🔬 Research & Science", "Research"],
  ["📊 Other", "Other"],
]);

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function getShanghaiDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function assertString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function normalizeImportance(value) {
  const importance = Number(value);
  if (!Number.isFinite(importance)) {
    return 0;
  }
  return Math.max(0, Math.min(5, Math.round(importance)));
}

function parseMaybeJson(value, label = "value") {
  if (typeof value !== "string") {
    return value;
  }

  let text = value.trim();
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} must be valid JSON: ${error.message}`);
  }
}

function normalizeAgentPayload(payload) {
  const unwrappedPayload = parseMaybeJson(payload, "agent response");
  const candidate =
    unwrappedPayload?.digest ?? unwrappedPayload?.output ?? unwrappedPayload?.data ?? unwrappedPayload;

  return parseMaybeJson(candidate, "agent digest");
}

function validateDigest(rawDigest) {
  rawDigest = normalizeAgentPayload(rawDigest);

  if (!rawDigest || typeof rawDigest !== "object") {
    throw new Error("Agent response must be a JSON object");
  }

  if (!Array.isArray(rawDigest.sections) || rawDigest.sections.length === 0) {
    throw new Error("Agent response must include at least one section");
  }

  const date = assertString(rawDigest.date || getEnv("NEWS_DATE", getShanghaiDate()), "date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`date must use YYYY-MM-DD format, got ${date}`);
  }

  const sections = rawDigest.sections.map((section, sectionIndex) => {
    const name = assertString(section?.name, `sections[${sectionIndex}].name`);
    if (!Array.isArray(section.articles)) {
      throw new Error(`sections[${sectionIndex}].articles must be an array`);
    }

    const articles = section.articles.map((article, articleIndex) => ({
      title: assertString(
        article?.title,
        `sections[${sectionIndex}].articles[${articleIndex}].title`
      ),
      url: assertString(
        article?.url,
        `sections[${sectionIndex}].articles[${articleIndex}].url`
      ),
      summary: assertString(
        article?.summary,
        `sections[${sectionIndex}].articles[${articleIndex}].summary`
      ),
      source: assertString(
        article?.source,
        `sections[${sectionIndex}].articles[${articleIndex}].source`
      ),
      importance: normalizeImportance(article?.importance),
    }));

    return { name, articles };
  });

  const sourceList = Array.isArray(rawDigest.sources)
    ? rawDigest.sources.map((source) => String(source).trim()).filter(Boolean)
    : [];
  const source =
    typeof rawDigest.source === "string" && rawDigest.source.trim()
      ? rawDigest.source.trim()
      : sourceList.length > 0
        ? sourceList.join(", ")
      : inferSources(sections).join(", ");
  const category =
    typeof rawDigest.category === "string" && rawDigest.category.trim()
      ? rawDigest.category.trim()
      : inferCategory(sections);
  const totalScanned =
    Number.isFinite(Number(rawDigest.totalScanned)) && Number(rawDigest.totalScanned) > 0
      ? Math.round(Number(rawDigest.totalScanned))
      : Number.isFinite(Number(rawDigest.total_articles_scanned)) &&
          Number(rawDigest.total_articles_scanned) > 0
        ? Math.round(Number(rawDigest.total_articles_scanned))
      : sections.reduce((count, section) => count + section.articles.length, 0);

  return {
    title:
      typeof rawDigest.title === "string" && rawDigest.title.trim()
        ? rawDigest.title.trim()
        : "Daily Tech News",
    date,
    category,
    source,
    summary:
      typeof rawDigest.summary === "string" && rawDigest.summary.trim()
        ? rawDigest.summary.trim()
        : `Scanned ${totalScanned} articles and selected the most relevant stories.`,
    totalScanned,
    sections,
  };
}

function inferSources(sections) {
  return [
    ...new Set(
      sections.flatMap((section) => section.articles.map((article) => article.source))
    ),
  ].sort((a, b) => a.localeCompare(b));
}

function inferCategory(sections) {
  const firstSection = sections.find((section) => section.articles.length > 0);
  if (!firstSection) {
    return "Briefing";
  }
  return SECTION_CATEGORY_MAP.get(firstSection.name) || firstSection.name;
}

function stars(importance) {
  return "★".repeat(importance) + "☆".repeat(5 - importance);
}

function escapeFrontmatter(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}

function escapeMarkdownLinkText(value) {
  return value.replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function renderMarkdown(digest) {
  const body = digest.sections
    .map((section) => {
      const articles = section.articles
        .map(
          (article) => `- [${escapeMarkdownLinkText(article.title)}](${article.url})
  - 摘要：${article.summary}
  - 来源：${article.source} · 重要性：${stars(article.importance)}`
        )
        .join("\n\n");

      return `## ${section.name}\n\n${articles}`;
    })
    .join("\n\n");

  return `---
title: "${escapeFrontmatter(digest.title)}"
date: "${escapeFrontmatter(digest.date)}"
category: "${escapeFrontmatter(digest.category)}"
source: "${escapeFrontmatter(digest.source)}"
summary: "${escapeFrontmatter(digest.summary)}"
---

Scanned **${digest.totalScanned}** articles from ${digest.source}.

${body}
`;
}

async function fetchDigest() {
  const responseFile = getEnv("AGENT_RESPONSE_FILE");
  if (responseFile) {
    return JSON.parse(await readFile(responseFile, "utf8"));
  }

  const agentUrl = assertString(getEnv("AGENT_SERVER_URL"), "AGENT_SERVER_URL");
  const token = getEnv("AGENT_SERVER_TOKEN");
  const date = getEnv("NEWS_DATE");
  const body = date ? JSON.stringify({ date }) : undefined;

  const response = await fetch(agentUrl, {
    method: "POST",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agent server returned ${response.status}: ${text}`);
  }

  const payload = await response.json();
  return payload;
}

const digest = validateDigest(await fetchDigest());
const markdown = renderMarkdown(digest);
const outputDir = path.join(process.cwd(), "content", "news");
const outputPath = path.join(outputDir, `${digest.date}.md`);

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, markdown, "utf8");
console.log(`Wrote ${outputPath}`);
