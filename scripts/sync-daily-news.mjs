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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPositiveIntegerEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function sanitizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return "[invalid url]";
  }
}

function previewText(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, 500);
}

function resolveAgentUrl(baseUrl, maybeRelativeUrl) {
  try {
    return new URL(maybeRelativeUrl, baseUrl).toString();
  } catch {
    throw new Error(`Agent returned an invalid URL: ${maybeRelativeUrl}`);
  }
}

async function readResponse(response, label) {
  const text = await response.text();
  const preview = previewText(text);
  let json = null;

  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new Error(`${label} returned non-JSON response: ${preview}`);
      }
    }
  }

  return { text, preview, json };
}

function getUtcMinus8Date() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Etc/GMT+8",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getNewsDate() {
  return getEnv("NEWS_DATE", getUtcMinus8Date());
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

function validateDigest(rawDigest, newsDate) {
  rawDigest = normalizeAgentPayload(rawDigest);

  if (!rawDigest || typeof rawDigest !== "object") {
    throw new Error("Agent response must be a JSON object");
  }

  if (!Array.isArray(rawDigest.sections) || rawDigest.sections.length === 0) {
    throw new Error("Agent response must include at least one section");
  }

  const date = assertString(newsDate || rawDigest.date || getNewsDate(), "date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`date must use YYYY-MM-DD format, got ${date}`);
  }
  if (typeof rawDigest.date === "string" && rawDigest.date.trim() && rawDigest.date.trim() !== date) {
    console.warn(`Agent digest date ${rawDigest.date.trim()} was normalized to ${date}.`);
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

async function fetchDigest(newsDate) {
  const responseFile = getEnv("AGENT_RESPONSE_FILE");
  if (responseFile) {
    return JSON.parse(await readFile(responseFile, "utf8"));
  }

  const agentUrl = assertString(getEnv("AGENT_SERVER_URL"), "AGENT_SERVER_URL");
  const token = getEnv("AGENT_SERVER_TOKEN");
  const body = JSON.stringify({ date: newsDate });
  const timeoutMs = getPositiveIntegerEnv("AGENT_JOB_TIMEOUT_MS", 900000);
  const pollIntervalMs = getPositiveIntegerEnv("AGENT_POLL_INTERVAL_MS", 15000);
  const maxRetryAfterMs = getPositiveIntegerEnv("AGENT_MAX_RETRY_AFTER_MS", 60000);
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log("::group::Agent request");
  console.log(`URL: ${sanitizeUrl(agentUrl)}`);
  console.log("Method: POST");
  console.log(`Authorization header: ${token ? "present" : "missing"}`);
  console.log("Default date timezone: UTC-8");
  console.log(`Body: ${body}`);
  console.log(`Job timeout: ${timeoutMs}ms`);
  console.log(`Poll interval: ${pollIntervalMs}ms`);
  console.log("::endgroup::");

  const startedAt = Date.now();
  const startResponse = await fetch(agentUrl, {
    method: "POST",
    headers,
    body,
  });
  const startElapsedMs = Date.now() - startedAt;
  const startBody = await readResponse(startResponse, "Agent start response");

  console.log("::group::Agent start response");
  console.log(`Status: ${startResponse.status} ${startResponse.statusText}`);
  console.log(`Elapsed: ${startElapsedMs}ms`);
  console.log(`Content-Type: ${startResponse.headers.get("content-type") || "unknown"}`);
  console.log(`Body preview: ${startBody.preview || "<empty>"}`);
  console.log("::endgroup::");

  if (startResponse.status !== 202) {
    if (startResponse.ok && startBody.json) {
      console.warn("Agent returned a digest directly; using direct response.");
      return startBody.json;
    }

    throw new Error(
      `Agent job start failed with ${startResponse.status}: ${startBody.preview || "<empty>"}`
    );
  }

  const job = startBody.json;
  const jobId = assertString(job?.jobId, "jobId");
  const statusUrl = job?.statusUrl
    ? resolveAgentUrl(agentUrl, job.statusUrl)
    : resolveAgentUrl(agentUrl, `./${jobId}`);
  const resultUrl = job?.resultUrl
    ? resolveAgentUrl(agentUrl, job.resultUrl)
    : resolveAgentUrl(agentUrl, `./${jobId}/result.json`);

  console.log("::group::Agent job");
  console.log(`Job ID: ${jobId}`);
  console.log(`Initial status: ${job?.status || "unknown"}`);
  console.log(`Status URL: ${sanitizeUrl(statusUrl)}`);
  console.log(`Result URL: ${sanitizeUrl(resultUrl)}`);
  console.log("::endgroup::");

  let pollCount = 0;
  while (Date.now() - startedAt < timeoutMs) {
    pollCount += 1;
    const pollStartedAt = Date.now();
    const resultResponse = await fetch(resultUrl, { headers });
    const resultElapsedMs = Date.now() - pollStartedAt;
    const resultBody = await readResponse(resultResponse, "Agent result response");

    console.log("::group::Agent result poll");
    console.log(`Poll: ${pollCount}`);
    console.log(`Status: ${resultResponse.status} ${resultResponse.statusText}`);
    console.log(`Elapsed: ${resultElapsedMs}ms`);
    console.log(`Content-Type: ${resultResponse.headers.get("content-type") || "unknown"}`);
    console.log(`Body preview: ${resultBody.preview || "<empty>"}`);
    console.log("::endgroup::");

    if (resultResponse.status === 202) {
      const status = await logAgentStatus(statusUrl, headers, pollCount);
      const statusValue = String(status?.status || "").toLowerCase();
      if (["failed", "failure", "error"].includes(statusValue)) {
        throw new Error(
          `Agent job ${jobId} failed: ${status?.error || status?.message || "unknown error"}`
        );
      }

      const retryAfterHeader = Number(resultResponse.headers.get("retry-after"));
      const retryAfterSeconds = Number(resultBody.json?.retryAfterSeconds);
      const requestedDelayMs =
        Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
          ? retryAfterHeader * 1000
          : Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
            ? retryAfterSeconds * 1000
            : pollIntervalMs;
      const delayMs = Math.min(Math.max(requestedDelayMs, 1000), maxRetryAfterMs);

      console.log(`Agent job ${jobId} is still running; polling again in ${Math.round(delayMs / 1000)}s.`);
      await sleep(delayMs);
      continue;
    }

    if (resultResponse.ok) {
      if (!resultBody.json) {
        throw new Error("Agent result response did not include JSON");
      }
      return resultBody.json;
    }

    throw new Error(
      `Agent result failed with ${resultResponse.status}: ${resultBody.preview || "<empty>"}`
    );
  }

  throw new Error(`Agent job ${jobId} did not finish within ${Math.round(timeoutMs / 1000)}s`);
}

async function logAgentStatus(statusUrl, headers, pollCount) {
  const startedAt = Date.now();
  const response = await fetch(statusUrl, { headers });
  const elapsedMs = Date.now() - startedAt;
  const body = await readResponse(response, "Agent status response");

  console.log("::group::Agent status poll");
  console.log(`Poll: ${pollCount}`);
  console.log(`Status: ${response.status} ${response.statusText}`);
  console.log(`Elapsed: ${elapsedMs}ms`);
  console.log(`Content-Type: ${response.headers.get("content-type") || "unknown"}`);
  console.log(`Body preview: ${body.preview || "<empty>"}`);
  console.log("::endgroup::");

  if (!response.ok) {
    console.warn(`Agent status endpoint returned ${response.status}; continuing to poll result URL.`);
  }

  return body.json;
}

const newsDate = getNewsDate();
const digest = validateDigest(await fetchDigest(newsDate), newsDate);
const markdown = renderMarkdown(digest);
const outputDir = path.join(process.cwd(), "content", "news");
const outputPath = path.join(outputDir, `${digest.date}.md`);

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, markdown, "utf8");
console.log(`Wrote ${outputPath}`);
