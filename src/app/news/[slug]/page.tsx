import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllNews, getNewsBySlug } from "../../../lib/news";
import { markdownToHtml } from "../../../lib/markdown";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import NewsContent from "../../../components/NewsContent";
import LikeButton from "../../../components/LikeButton";
import ShareButton from "../../../components/ShareButton";

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  AI: "AI",
  研究: "Research",
  创投: "Startups",
  科技: "Technology",
  政策: "Policy",
  财经: "Business",
  硬件: "Hardware",
  其他: "Other",
  综合: "Briefing",
};

export async function generateStaticParams() {
  const newsList = getAllNews();
  return newsList.map((news) => ({
    slug: news.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = getNewsBySlug(slug);
  if (!news) {
    return { title: "Not Found" };
  }

  return {
    title: `${news.frontmatter.title} | Daily News`,
    description: news.frontmatter.summary || news.frontmatter.title,
    openGraph: {
      title: news.frontmatter.title,
      description: news.frontmatter.summary || news.frontmatter.title,
      type: "article",
      publishedTime: news.frontmatter.date,
    },
  };
}

export default async function NewsPage({ params }: Props) {
  const { slug } = await params;
  const news = getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  const html = await markdownToHtml(news.content);
  const formattedDate = format(new Date(news.frontmatter.date), "MMMM d, yyyy", {
    locale: enUS,
  });
  const category =
    CATEGORY_LABELS[news.frontmatter.category] ?? news.frontmatter.category;

  return (
    <article>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {category}
          </span>
          <time className="text-sm text-gray-500 dark:text-gray-400">
            {formattedDate}
          </time>
          {news.frontmatter.source && (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              · {news.frontmatter.source}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-4">{news.frontmatter.title}</h1>
        {news.frontmatter.summary && (
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {news.frontmatter.summary}
          </p>
        )}
      </div>

      <div className="mb-8">
        <NewsContent html={html} />
      </div>

      <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
        <LikeButton slug={slug} />
        <ShareButton title={news.frontmatter.title} slug={slug} />
      </div>
    </article>
  );
}
