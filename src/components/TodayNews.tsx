"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import DateWheel from "./DateWheel";
import type { DailyDigest } from "../lib/parser";

const BRAND_CARDS = [
  { bg: "bg-brand-pink", label: "text-white/80" },
  { bg: "bg-brand-teal", label: "text-white/80" },
  { bg: "bg-brand-lavender", label: "text-ink/70" },
  { bg: "bg-brand-peach", label: "text-ink/70" },
  { bg: "bg-brand-ochre", label: "text-ink/70" },
  { bg: "bg-brand-mint", label: "text-ink/70" },
];

function getCardStyle(category: string, index: number) {
  const map: Record<string, number> = {
    AI: 0,
    研究: 0,
    创投: 1,
    科技: 3,
    政策: 4,
    财经: 3,
    硬件: 5,
    其他: 2,
    综合: 2,
  };
  const idx = map[category] ?? (index % BRAND_CARDS.length);
  return BRAND_CARDS[idx] ?? { bg: "bg-surface-card", label: "text-muted" };
}

interface TodayNewsProps {
  digests: DailyDigest[];
}

export default function TodayNews({ digests }: TodayNewsProps) {
  const [selectedSlug, setSelectedSlug] = useState(digests[0]?.slug ?? "");
  const [wheelOpen, setWheelOpen] = useState(false);

  const current = digests.find((d) => d.slug === selectedSlug) ?? digests[0];

  if (!current) {
    return (
      <div className="text-center py-20 text-muted">暂无新闻内容</div>
    );
  }

  const formattedDate = format(parseISO(current.date), "yyyy年MM月dd日 EEEE", {
    locale: zhCN,
  });
  const card = getCardStyle(current.category, 0);
  const isToday = selectedSlug === digests[0]?.slug;

  const dateItems = digests.map((d) => ({
    slug: d.slug,
    date: d.date,
    category: d.category,
    articleCount: d.articles.length,
  }));

  return (
    <div>
      {/* Date header + history button */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1
              className="text-[clamp(32px,4.5vw,48px)] font-medium leading-[1.05] tracking-[-1.5px] text-ink"
            >
              {isToday ? "今日新闻" : "历史推送"}
            </h1>
            {isToday && (
              <span className="text-xs font-semibold tracking-[1.5px] uppercase px-2.5 py-1 rounded-full bg-brand-coral text-white">
                TODAY
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <time className="text-sm font-medium text-muted">
              {formattedDate}
            </time>
            <span className="text-xs text-muted-soft">
              {current.articles.length} 条精选 · 扫描 {current.totalScanned} 篇
            </span>
          </div>
        </div>

        <button
          onClick={() => setWheelOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-primary-active transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          选择日期
        </button>
      </div>

      {/* Main card */}
      <section className={`${card.bg} rounded-3xl overflow-hidden`}>
        {/* Category label */}
        <div className="px-8 pt-6 pb-2">
          <span className={`text-xs font-semibold tracking-[1.5px] uppercase ${card.label}`}>
            {current.category}
          </span>
        </div>

        {/* Articles list */}
        <div className="px-2 pb-2">
          <div className="bg-canvas rounded-2xl overflow-hidden">
            {current.articles.map((article, aidx) => (
              <article
                key={aidx}
                className={`px-6 py-4 ${
                  aidx > 0 ? "border-t border-hairline-soft" : ""
                } hover:bg-surface-soft/50 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      article.importance >= 4
                        ? "bg-brand-coral text-white"
                        : "bg-surface-card text-muted"
                    }`}
                  >
                    {article.importance}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] font-semibold text-ink hover:text-primary-active transition-colors line-clamp-1"
                    >
                      {article.title}
                    </a>
                    <p className="mt-1 text-sm text-body line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                      <span>{article.source}</span>
                      <span>·</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-card text-muted">
                        {article.category}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Date Wheel */}
      <DateWheel
        dates={dateItems}
        selectedSlug={selectedSlug}
        onSelect={setSelectedSlug}
        onClose={() => setWheelOpen(false)}
        isOpen={wheelOpen}
      />
    </div>
  );
}
