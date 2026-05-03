import { getAllDigests } from "../lib/news";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function HomePage() {
  const digests = getAllDigests();

  const categoryColors: Record<string, string> = {
    AI: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    创投: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    政策: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    财经: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    硬件: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    科技: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    研究: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    其他: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    综合: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">每日科技商业新闻</h1>
        <p className="text-gray-600 dark:text-gray-400">
          覆盖 AI、创投、政策与硬件领域的每日精选
        </p>
      </div>

      {digests.length === 0 ? (
        <div className="text-center py-20 text-gray-500">暂无新闻内容</div>
      ) : (
        <div className="space-y-8">
          {digests.map((digest) => {
            const formattedDate = format(
              new Date(digest.date),
              "yyyy年MM月dd日 EEEE",
              { locale: zhCN }
            );

            return (
              <section
                key={digest.slug}
                className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
              >
                {/* Daily Header */}
                <div className="bg-gray-50 dark:bg-gray-900 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <time className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formattedDate}
                    </time>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        categoryColors[digest.category] ||
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {digest.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    共 {digest.articles.length} 条 · 扫描 {digest.totalScanned} 篇
                  </span>
                </div>

                {/* Articles List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {digest.articles.map((article, idx) => (
                    <article
                      key={idx}
                      className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            article.importance >= 4
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {article.importance}
                        </span>
                        <div className="flex-1 min-w-0">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                          >
                            {article.title}
                          </a>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span>{article.source}</span>
                            <span>·</span>
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                categoryColors[article.category] || ""
                              }`}
                            >
                              {article.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
