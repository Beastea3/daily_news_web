import { getAllDigests } from "../../../lib/news";

export async function GET() {
  const digests = getAllDigests();
  const siteUrl = "https://daily.monstea.cn";

  const items = digests.flatMap((digest) =>
    digest.articles.map((article) => ({
      id: article.url,
      url: article.url,
      title: article.title,
      content_text: article.summary,
      date_published: new Date(digest.date).toISOString(),
      tags: [article.category],
    }))
  );

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Daily Tech & Business News",
    description: "A concise daily briefing on technology and business.",
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/api/feed.json`,
    language: "en-US",
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
