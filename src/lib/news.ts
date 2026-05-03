import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NewsItem, NewsFrontmatter } from "../../types/news";

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
