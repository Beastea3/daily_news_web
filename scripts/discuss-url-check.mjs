/** ponytail: runnable self-check for discuss URL builder shape */
const CHATGPT_BASE_URL = "https://chatgpt.com/";

function buildChatGptUrl(prompt, mobile = false) {
  const encoded = encodeURIComponent(prompt);
  const param = mobile ? "q" : "prompt";
  return `${CHATGPT_BASE_URL}?${param}=${encoded}`;
}

const multiline = "Title:\nTest\nSource:\nReuters";
const desktop = buildChatGptUrl(multiline, false);
const mobile = buildChatGptUrl(multiline, true);

const checks = [
  [desktop.startsWith("https://chatgpt.com/?prompt="), "desktop uses ?prompt="],
  [!desktop.includes("#"), "desktop must not use hash (ChatGPT ignores it)"],
  [mobile.startsWith("https://chatgpt.com/?q="), "mobile uses ?q="],
  [
    decodeURIComponent(desktop.split("?prompt=")[1]).includes("Title:"),
    "desktop URL round-trips prompt",
  ],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (!ok) {
    console.error("FAIL:", label);
    failed += 1;
  }
}

if (failed) {
  process.exit(1);
}

console.log("discuss-url-check: ok");
