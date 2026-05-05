import type { Metadata } from "next";
import Link from "next/link";
import ThemeSwitcher from "../components/ThemeSwitcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Tech & Business News",
  description: "A concise daily briefing on technology and business.",
  openGraph: {
    title: "Daily Tech & Business News",
    description: "A concise daily briefing on technology and business.",
    url: "https://daily.monstea.cn",
    siteName: "Daily News",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Daily Tech & Business News",
    description: "A concise daily briefing on technology and business.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-canvas text-ink">
        <header className="sticky top-0 z-50 border-b border-hairline-soft bg-canvas/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
            <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
              Daily News
            </Link>
            <ThemeSwitcher />
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
          {children}
        </main>

        <footer className="border-t border-hairline-soft bg-surface-soft/50">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-8">
            <p className="text-sm text-muted">
              Daily Tech & Business News
            </p>
            <p className="text-sm text-muted">Curated for quick reading.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
