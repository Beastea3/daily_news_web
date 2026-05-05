"use client";

import { useEffect, useRef, useState, type RefCallback } from "react";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

interface DateItem {
  slug: string;
  date: string;
  category: string;
  articleCount: number;
}

interface DateWheelProps {
  dates: DateItem[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

export default function DateWheel({
  dates,
  selectedSlug,
  onSelect,
}: DateWheelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const scrollTimerRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const [sideSpacer, setSideSpacer] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const updateSpacer = () => {
      const selectedItem =
        itemRefs.current.get(selectedSlug) ?? itemRefs.current.values().next().value;
      const itemWidth = selectedItem?.clientWidth ?? 64;
      setSideSpacer(Math.max(0, (container.clientWidth - itemWidth) / 2));
    };

    updateSpacer();
    const resizeObserver = new ResizeObserver(updateSpacer);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [selectedSlug]);

  useEffect(() => {
    const el = itemRefs.current.get(selectedSlug);
    const container = scrollRef.current;
    if (!el || !container) {
      return;
    }

    programmaticScrollRef.current = true;
    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    const scrollLeft =
      el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });

    const timeoutId = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [selectedSlug]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const setItemRef =
    (slug: string): RefCallback<HTMLButtonElement> =>
    (node) => {
      if (node) {
        itemRefs.current.set(slug, node);
      } else {
        itemRefs.current.delete(slug);
      }
    };

  const selectCenteredDate = () => {
    const container = scrollRef.current;
    if (!container) return;

    const center = container.scrollLeft + container.clientWidth / 2;
    let closestSlug = selectedSlug;
    let closestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((button, slug) => {
      const itemCenter = button.offsetLeft + button.clientWidth / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSlug = slug;
      }
    });

    if (closestSlug !== selectedSlug) {
      onSelect(closestSlug);
    }
  };

  const handleScroll = () => {
    if (programmaticScrollRef.current) {
      return;
    }

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(selectCenteredDate, 120);
  };

  return (
    <section className="relative mt-4" aria-label="Choose a news date">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-canvas via-canvas/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-canvas via-canvas/90 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-3 bottom-3 z-10 w-px -translate-x-1/2 bg-ink/12" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/10 bg-canvas/30 shadow-[0_0_24px_rgba(10,10,10,0.08)]" />

      <div className="relative overflow-hidden rounded-xl border border-hairline-soft bg-canvas/70 py-2 shadow-sm">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-hairline-soft" />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide relative flex gap-1 overflow-x-auto py-1 snap-x snap-mandatory"
          style={{ scrollPaddingInline: sideSpacer }}
        >
          <div
            className="shrink-0"
            style={{ width: sideSpacer }}
            aria-hidden="true"
          />
          {dates.map((item) => {
            const isSelected = selectedSlug === item.slug;
            const dateObj = parseISO(item.date);

            return (
              <button
                key={item.slug}
                ref={setItemRef(item.slug)}
                type="button"
                onClick={() => onSelect(item.slug)}
                aria-pressed={isSelected}
                className={`group flex w-[64px] shrink-0 snap-center flex-col items-center rounded-lg px-2 py-1.5 transition-all duration-300 ease-out ${
                  isSelected
                    ? "text-ink scale-110"
                    : "text-muted hover:text-ink"
                }`}
              >
                <span
                  className={`text-[11px] font-medium transition-colors duration-300 ${
                    isSelected ? "text-ink" : "text-muted-soft"
                  }`}
                >
                  {format(dateObj, "EEE", { locale: enUS })}
                </span>
                <span className="mt-0.5 text-sm font-semibold leading-none">
                  {format(dateObj, "dd", { locale: enUS })}
                </span>
                <span
                  className={`mt-2 rounded-full transition-all duration-300 ${
                    isSelected
                      ? "h-2 w-2 bg-brand-coral shadow-[0_0_0_4px_rgba(255,107,90,0.16)]"
                      : "h-1.5 w-1.5 bg-muted-soft/50 group-hover:bg-brand-coral/70"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
          <div
            className="shrink-0"
            style={{ width: sideSpacer }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
