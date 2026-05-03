import { getAllNews } from "../../lib/news";

export async function GET() {
  const newsList = getAllNews().slice(0, 20);

  const siteUrl = "https://daily.monstea.cn";

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Daily Tech &amp; Business News</title>
    <link>${siteUrl}</link>
    <description>每日科技商业新闻精选，覆盖 AI、创投、政策与硬件</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${newsList
      .map(
        (news) => `
    <item>
      <title>${escapeXml(news.frontmatter.title)}</title>
      <link>${siteUrl}/news/${news.slug}</link>
      <guid>${siteUrl}/news/${news.slug}</guid>
      <pubDate>${new Date(news.frontmatter.date).toUTCString()}</pubDate>
      <description>${escapeXml(news.frontmatter.summary || "")}</description>
      <category>${escapeXml(news.frontmatter.category)}</category>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
