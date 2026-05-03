export interface NewsFrontmatter {
  title: string;
  date: string;
  category: string;
  source?: string;
  summary?: string;
}

export interface NewsItem {
  slug: string;
  frontmatter: NewsFrontmatter;
  content: string;
}
