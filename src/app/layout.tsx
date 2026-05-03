import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Tech & Business News",
  description: "每日科技商业新闻精选，覆盖 AI、创投、政策与硬件",
  metadataBase: new URL("https://daily.monstea.cn"),
  openGraph: {
    title: "Daily Tech & Business News",
    description: "每日科技商业新闻精选",
    url: "https://daily.monstea.cn",
    siteName: "Daily News",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              Daily News
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:text-gray-600 dark:hover:text-gray-300">
                首页
              </a>
              <a href="/rss.xml" className="hover:text-gray-600 dark:hover:text-gray-300">
                RSS
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Daily News · 每日科技商业新闻
          </div>
        </footer>
      </body>
    </html>
  );
}
