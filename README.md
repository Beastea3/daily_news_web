# Daily Tech & Business News

A concise daily technology and business briefing built with Next.js, Markdown,
and Vercel.

- **Site**: https://daily.monstea.cn
- **Stack**: Next.js 16 / React 19 / Tailwind CSS v4 / TypeScript
- **Content**: Markdown files in `content/news/`
- **Deployment**: Vercel deploys automatically from pushes to `main`
- **Likes**: Upstash Redis

## Local Development

```bash
npm install
npm run dev
```

The local development server may need webpack because this project has a
Turbopack root override:

```bash
npx next dev --webpack
```

## Daily News Sync

The scheduled GitHub Actions workflow in
`.github/workflows/sync-daily-news.yml` calls an agent server, receives JSON,
converts it to `content/news/YYYY-MM-DD.md`, validates the build, and commits
the generated file to `main`. Vercel then deploys from that push.

Required GitHub repository secret:

```text
AGENT_SERVER_URL=https://your-agent-server.example.com/generate
```

Optional GitHub repository secret:

```text
AGENT_SERVER_TOKEN=...
```

Expected agent JSON shape:

```json
{
  "title": "Daily Tech News",
  "date": "2026-05-03",
  "category": "AI",
  "source": "TechCrunch, The Verge",
  "summary": "Scanned 1200 articles and selected the most relevant stories.",
  "totalScanned": 1200,
  "sections": [
    {
      "name": "🤖 AI / ML",
      "articles": [
        {
          "title": "Article Title",
          "url": "https://example.com",
          "summary": "One sentence summary.",
          "source": "TechCrunch",
          "importance": 4
        }
      ]
    }
  ]
}
```

You can also run the workflow manually from GitHub Actions and provide a
`YYYY-MM-DD` date override.
