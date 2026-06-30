export type StoryForPrompt = {
  title: string;
  summary?: string;
  url?: string;
  source?: string;
  category?: string;
  publishedAt?: string;
};

export type AgentProvider = "chatgpt" | "claude" | "kimi" | "copy";

export type AgentActionResult = {
  message: string;
  showClaudeFallback?: boolean;
};

const CHATGPT_BASE_URL = "https://chatgpt.com/";

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/**
 * Desktop: long / multiline prompts use the hash so the web UI can prefill.
 * Mobile: keep ?q= query params so universal links can open the native app.
 */
export function buildChatGptUrl(prompt: string, mobile = isMobileDevice()): string {
  const encoded = encodeURIComponent(prompt);

  if (mobile) {
    return `${CHATGPT_BASE_URL}?q=${encoded}`;
  }

  if (prompt.includes("\n") || encoded.length > 240) {
    return `${CHATGPT_BASE_URL}#?prompt=${encoded}`;
  }

  return `${CHATGPT_BASE_URL}?prompt=${encoded}`;
}

function openExternalUrl(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function openChatGpt(prompt: string) {
  const mobile = isMobileDevice();
  const url = buildChatGptUrl(prompt, mobile);

  if (mobile) {
    // Same-window navigation lets iOS/Android intercept chatgpt.com universal links.
    window.location.assign(url);
    return;
  }

  openExternalUrl(url);
}

export function buildDiscussPrompt(story: StoryForPrompt): string {
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

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy copy.
    }
  }

  return legacyCopyToClipboard(text);
}

function legacyCopyToClipboard(text: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export async function continueWithAgent(
  provider: AgentProvider,
  prompt: string
): Promise<AgentActionResult> {
  if (typeof window === "undefined") {
    return { message: "" };
  }

  if (provider === "chatgpt") {
    const mobile = isMobileDevice();
    const copied = await copyToClipboard(prompt);
    openChatGpt(prompt);

    if (mobile) {
      return {
        message: copied
          ? "Prompt copied. Opening ChatGPT…"
          : "Opening ChatGPT…",
      };
    }

    return {
      message: copied
        ? "Opening ChatGPT. Prompt copied as fallback."
        : "Opening ChatGPT…",
    };
  }

  if (provider === "claude") {
    const copied = await copyToClipboard(prompt);
    window.location.href = `claude://claude.ai/new?q=${encodeURIComponent(prompt)}`;
    return {
      message: copied
        ? "Prompt copied. Trying Claude Desktop…"
        : "Trying Claude Desktop…",
      showClaudeFallback: true,
    };
  }

  if (provider === "kimi") {
    const copied = await copyToClipboard(prompt);
    window.open("https://kimi.moonshot.cn/", "_blank", "noopener,noreferrer");
    return {
      message: copied
        ? "Prompt copied. Paste it into Kimi to continue."
        : "Opening Kimi…",
    };
  }

  const copied = await copyToClipboard(prompt);
  return {
    message: copied ? "Prompt copied" : "Could not copy prompt",
  };
}
