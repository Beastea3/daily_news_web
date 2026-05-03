import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NewsItem, NewsFrontmatter } from "../../types/news";
import { parseDigestMarkdown, DailyDigest } from "./parser";

const newsDirectory = path.join(process.cwd(), "content", "news");

export function getAllNews(): NewsItem[] {
  if (!fs.existsSync(newsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(newsDirectory);
  const allNews = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(newsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        frontmatter: data as NewsFrontmatter,
        content,
      };
    });

  return allNews.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
}

export function getNewsBySlug(slug: string): NewsItem | null {
  const fullPath = path.join(newsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    frontmatter: data as NewsFrontmatter,
    content,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(newsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(newsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

export function getAllDigests(): DailyDigest[] {
  const newsList = getAllNews();
  return newsList.map((news) =>
    parseDigestMarkdown(news.slug, news.frontmatter, news.content)
  );
}

export function getDigestBySlug(slug: string): DailyDigest | null {
  const news = getNewsBySlug(slug);
  if (!news) return null;
  return parseDigestMarkdown(news.slug, news.frontmatter, news.content);
}
