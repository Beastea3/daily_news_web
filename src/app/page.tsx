import { getAllNews } from "../lib/news";
import NewsCard from "../components/NewsCard";

export default function HomePage() {
  const newsList = getAllNews();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">每日科技商业新闻</h1>
        <p className="text-gray-600 dark:text-gray-400">
          覆盖 AI、创投、政策与硬件领域的每日精选
        </p>
      </div>

      {newsList.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          暂无新闻内容
        </div>
      ) : (
        <div className="grid gap-4">
          {newsList.map((news) => (
            <NewsCard key={news.slug} news={news} />
          ))}
        </div>
      )}
    </div>
  );
}
