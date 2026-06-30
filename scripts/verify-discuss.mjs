/**
 * Lightweight verification for discuss prompt helpers.
 * Run with: node scripts/verify-discuss.mjs
 */

function buildDiscussPrompt(story) {
  const title = story.title?.trim() || "Untitled story";
  const source = story.source?.trim() || "Unknown";
  const category = story.category?.trim() || "Unknown";
  const publishedAt = story.publishedAt?.trim() || "Unknown";
  const url = story.url?.trim() || "Unknown";
  const summary = story.summary?.trim() || "No summary available.";

  return `I am reading a daily news brief and want to discuss this story further.
Title:
${title}
Source:
${source}
Category:
${category}
Published at:
${publishedAt}
Original link:
${url}
Brief summary:
${summary}
Please help me analyze this story:
1. What are the core facts?
2. What background context should I know?
3. What is confirmed vs speculative?
4. Why does this matter?
5. What could happen next?
6. Give me 5 good follow-up questions I can ask.
Please answer in the same language I use next.`.trim();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const fullStory = {
  title: "OpenAI ships a new model",
  summary: "A short summary.",
  url: "https://example.com/story",
  source: "TechCrunch",
  category: "AI",
  publishedAt: "2026-06-29",
};

const fullPrompt = buildDiscussPrompt(fullStory);
assert(fullPrompt.includes("OpenAI ships a new model"), "prompt should include title");
assert(fullPrompt.includes("A short summary."), "prompt should include summary");
assert(fullPrompt.includes("https://example.com/story"), "prompt should include url");
assert(fullPrompt.includes("TechCrunch"), "prompt should include source");
assert(fullPrompt.includes("AI"), "prompt should include category");
assert(fullPrompt.includes("2026-06-29"), "prompt should include publishedAt");
assert(!fullPrompt.startsWith("\n") && !fullPrompt.endsWith("\n"), "prompt should be trimmed");

const fallbackPrompt = buildDiscussPrompt({ title: "" });
assert(fallbackPrompt.includes("Untitled story"), "missing title should fallback");
assert(fallbackPrompt.includes("Unknown"), "missing fields should fallback to Unknown");
assert(
  fallbackPrompt.includes("No summary available."),
  "missing summary should fallback"
);

function buildChatGptUrl(prompt, mobile = false) {
  const encoded = encodeURIComponent(prompt);

  if (mobile) {
    return `https://chatgpt.com/?q=${encoded}`;
  }

  if (prompt.includes("\n") || encoded.length > 240) {
    return `https://chatgpt.com/#?prompt=${encoded}`;
  }

  return `https://chatgpt.com/?prompt=${encoded}`;
}

const encoded = encodeURIComponent(fullPrompt);
assert(
  encoded.includes("OpenAI%20ships%20a%20new%20model"),
  "chatgpt url encoding should work"
);

const chatgptUrl = buildChatGptUrl(fullPrompt, false);
assert(
  chatgptUrl.startsWith("https://chatgpt.com/#?prompt="),
  "desktop multiline prompts should use hash prompt url"
);
assert(chatgptUrl.includes("OpenAI%20ships%20a%20new%20model"), "chatgpt url should include title");

const mobileUrl = buildChatGptUrl(fullPrompt, true);
assert(
  mobileUrl.startsWith("https://chatgpt.com/?q="),
  "mobile prompts should use q query param for app handoff"
);
assert(!mobileUrl.includes("#"), "mobile url should not use hash");

const shortUrl = buildChatGptUrl("Hello", false);
assert(shortUrl === "https://chatgpt.com/?prompt=Hello", "short desktop prompts use query param");

console.log("verify-discuss: all checks passed");
