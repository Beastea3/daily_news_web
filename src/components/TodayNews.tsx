"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import DateWheel from "./DateWheel";
import type { DailyDigest } from "../lib/parser";

interface TodayNewsProps {
  digests: DailyDigest[];
}

const CATEGORY_LABELS: Record<string, string> = {
  AI: "AI",
  研究: "Research",
  创投: "Startups",
  科技: "Technology",
  政策: "Policy",
  财经: "Business",
  硬件: "Hardware",
  其他: "Other",
  综合: "Briefing",
};

function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}

function getDateParamSlug(digests: DailyDigest[]) {
  if (typeof window === "undefined") {
    return "";
  }

  const dateParam = new URLSearchParams(window.location.search).get("date");
  if (!dateParam) {
    return "";
  }

  return (
    digests.find((digest) => digest.slug === dateParam || digest.date === dateParam)
      ?.slug ?? ""
  );
}

export default function TodayNews({ digests }: TodayNewsProps) {
  const [selectedSlug, setSelectedSlug] = useState(
    () => digests[0]?.slug || ""
  );

  const dateItems = useMemo(
    () =>
      [...digests]
        .reverse()
        .map((d) => ({
          slug: d.slug,
          date: d.date,
          category: d.category,
          articleCount: d.articles.length,
        })),
    [digests]
  );

  const handleSelectDate = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);

      const selectedDigest = digests.find((digest) => digest.slug === slug);
      if (!selectedDigest || typeof window === "undefined") {
        return;
      }

      const url = new URL(window.location.href);
      if (slug === digests[0]?.slug) {
        url.searchParams.delete("date");
      } else {
        url.searchParams.set("date", selectedDigest.date);
      }

      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    },
    [digests]
  );

  useEffect(() => {
    const handlePopState = () => {
      setSelectedSlug(getDateParamSlug(digests) || digests[0]?.slug || "");
    };

    handlePopState();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [digests]);

  const current = digests.find((d) => d.slug === selectedSlug) ?? digests[0];

  if (!current) {
    return <div className="py-20 text-center text-muted">No brief is available yet.</div>;
  }

  const formattedDate = format(parseISO(current.date), "EEEE, MMMM d, yyyy", {
    locale: enUS,
  });
  const isToday = selectedSlug === digests[0]?.slug;

  return (
    <div>
      <div className="mb-5">
        <div className="flex flex-col gap-3 border-b border-hairline-soft pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className="font-display text-[clamp(34px,5vw,56px)] font-normal leading-[1.02] text-ink"
            >
              {isToday ? "Today’s Brief" : "Daily Archive"}
            </h1>
            {isToday && (
              <span className="rounded-full border border-hairline bg-surface-card px-2.5 py-1 text-[11px] font-medium uppercase text-muted shadow-sm">
                TODAY
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <time className="font-medium text-body">
              {formattedDate}
            </time>
            <span className="text-muted-soft">/</span>
            <span>
              {current.articles.length} selected stories
            </span>
            <span className="text-muted-soft">/</span>
            <span>
              {current.totalScanned} scanned
            </span>
          </div>
        </div>
      </div>

      <DateWheel
        dates={dateItems}
        selectedSlug={selectedSlug}
        onSelect={handleSelectDate}
      />

      <div className="mt-7 space-y-5">
        {current.sections.map((section) => (
          <section
            key={section.name}
            className="overflow-hidden rounded-xl border border-hairline-soft bg-surface-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-hairline-soft px-5 py-3">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="h-2 w-2 rounded-full bg-brand-coral" />
                {section.name}
              </h2>
              <span className="text-xs text-muted-soft">
                {section.articles.length} stories
              </span>
            </div>

            <div>
              {section.articles.map((article, aidx) => (
                <article
                  key={`${article.url}-${aidx}`}
                  className={`px-5 py-4 transition-colors hover:bg-surface-soft/65 ${
                    aidx > 0 ? "border-t border-hairline-soft" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${
                        article.importance >= 4
                          ? "bg-brand-coral/10 text-brand-coral"
                          : "bg-surface-soft text-muted"
                      }`}
                    >
                      {article.importance}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-1 text-[15px] font-semibold text-ink transition-colors hover:text-primary-active hover:underline"
                      >
                        {article.title}
                      </a>
                      <p className="mt-1 text-sm leading-relaxed text-body">
                        {article.summary}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                        <span>{article.source}</span>
                        <span className="text-muted-soft">/</span>
                        <span>{getCategoryLabel(article.category)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
