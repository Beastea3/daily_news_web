# Daily Tech & Business News

每日科技商业新闻站点，基于 Next.js + Markdown + Vercel。

- **域名**: https://daily.monstea.cn
- **技术栈**: Next.js 16 / React 19 / Tailwind CSS v4 / TypeScript
- **内容**: Markdown 文件存储于 `content/news/`
- **部署**: Vercel 自动构建
- **点赞**: Upstash Redis (最小计算资源)

## 本地开发

```bash
npm install
npm run dev
```

## 添加新闻

在 `content/news/YYYY-MM-DD.md` 创建 Markdown 文件：

```markdown
---
title: "新闻标题"
date: "2026-05-03"
category: "AI"
source: "来源"
summary: "摘要"
---

正文...
```

push 到仓库后 Vercel 自动部署。
