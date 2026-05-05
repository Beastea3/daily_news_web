export interface ArticleItem {
  title: string;
  url: string;
  summary: string;
  source: string;
  importance: number;
  category: string;
}

export interface DigestSection {
  name: string;
  articles: ArticleItem[];
}

export interface DailyDigest {
  slug: string;
  date: string;
  category: string;
  source: string;
  summary: string;
  totalScanned: number;
  articles: ArticleItem[];
  sections: DigestSection[];
}

const SECTION_MAP: Record<string, string> = {
  "🤖 AI / ML": "AI",
  "💼 Business & Startups": "创投",
  "🌐 Tech Industry": "科技",
  "🔬 Research & Science": "研究",
  "📊 Other": "其他",
};

export function parseDigestMarkdown(
  slug: string,
  frontmatter: { date: string; category: string; source?: string; summary?: string },
  content: string
): DailyDigest {
  const articles: ArticleItem[] = [];
  const sections: DigestSection[] = [];
  let currentCategory = frontmatter.category || "综合";
  let currentSection: DigestSection | null = null;

  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Section header: ## 🤖 AI / ML
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      currentCategory = SECTION_MAP[sectionName] || sectionName;
      currentSection = {
        name: sectionName,
        articles: [],
      };
      sections.push(currentSection);
      i++;
      continue;
    }

    // Article line: - [Title](URL)
    const articleMatch = line.match(/^-\s+\[(.+?)\]\((.+?)\)$/);
    if (articleMatch) {
      const title = articleMatch[1].trim();
      const url = articleMatch[2].trim();
      let summary = "";
      let source = "";
      let importance = 0;

      // Look ahead for summary and source lines
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith("  - ")) {
        const detailLine = lines[j].trim();
        const summaryMatch = detailLine.match(/^-\s+摘要：(.+)$/);
        if (summaryMatch) {
          summary = summaryMatch[1].trim();
        }
        const sourceMatch = detailLine.match(/^-\s+来源：(.+?)\s*·\s*重要性：([★☆]+)$/);
        if (sourceMatch) {
          source = sourceMatch[1].trim();
          const stars = sourceMatch[2];
          importance = (stars.match(/★/g) || []).length;
        }
        j++;
      }

      const article = {
        title,
        url,
        summary,
        source,
        importance,
        category: currentCategory,
      };

      articles.push(article);
      if (!currentSection) {
        currentSection = {
          name: currentCategory,
          articles: [],
        };
        sections.push(currentSection);
      }
      currentSection.articles.push(article);

      i = j;
      continue;
    }

    i++;
  }

  // Try to extract total scanned from summary or intro
  const totalMatch = frontmatter.summary?.match(/扫描了\s*\*\*(\d+)\*\*/);
  const totalScanned = totalMatch ? parseInt(totalMatch[1], 10) : articles.length;

  return {
    slug,
    date: frontmatter.date,
    category: frontmatter.category,
    source: frontmatter.source || "",
    summary: frontmatter.summary || "",
    totalScanned,
    articles,
    sections,
  };
}
