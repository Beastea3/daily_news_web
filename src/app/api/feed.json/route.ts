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
    description: "每日科技商业新闻精选，覆盖 AI、创投、政策与硬件",
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/api/feed.json`,
    language: "zh-CN",
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
