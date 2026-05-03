"use client";

import { NewsItem } from "../../types/news";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  const { slug, frontmatter } = news;
  const formattedDate = format(new Date(frontmatter.date), "yyyy年MM月dd日", {
    locale: zhCN,
  });

  const categoryColors: Record<string, string> = {
    AI: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    创投: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    政策: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    财经: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    硬件: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  return (
    <article className="group border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            categoryColors[frontmatter.category] ||
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          {frontmatter.category}
        </span>
        <time className="text-xs text-gray-500 dark:text-gray-400">
          {formattedDate}
        </time>
        {frontmatter.source && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            · {frontmatter.source}
          </span>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        <a href={`/news/${slug}`}>{frontmatter.title}</a>
      </h2>
      {frontmatter.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {frontmatter.summary}
        </p>
      )}
    </article>
  );
}
