import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Tech & Business News",
  description: "每日科技商业新闻精选，覆盖 AI、创投、政策与硬件",
  openGraph: {
    title: "Daily Tech & Business News",
    description: "每日科技商业新闻精选",
    url: "https://daily.monstea.cn",
    siteName: "Daily News",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Daily Tech & Business News",
    description: "每日科技商业新闻精选",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas text-ink">
        <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-sm border-b border-hairline-soft">
          <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold tracking-tight text-ink">
              Daily News
            </a>
            <nav className="flex items-center gap-6">
              <a
                href="/"
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                首页
              </a>
              <a
                href="/rss.xml"
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                RSS
              </a>
              <a
                href="/api/feed.json"
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                JSON
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-12">
          {children}
        </main>

        <footer className="bg-surface-soft border-t border-hairline-soft">
          <div className="mx-auto max-w-5xl px-6 py-12 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted">
              Daily Tech & Business News — 每日科技商业新闻精选
            </p>
            <div className="flex items-center gap-4 text-sm text-muted">
              <a href="/rss.xml" className="hover:text-ink transition-colors">
                RSS
              </a>
              <a href="/api/feed.json" className="hover:text-ink transition-colors">
                JSON Feed
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
