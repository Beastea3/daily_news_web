"use client";

import { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

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
  onClose: () => void;
  isOpen: boolean;
}

export default function DateWheel({
  dates,
  selectedSlug,
  onSelect,
  onClose,
  isOpen,
}: DateWheelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tempSelected, setTempSelected] = useState(selectedSlug);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedSlug);
      // Scroll to selected after animation
      setTimeout(() => {
        const el = document.getElementById(`date-item-${selectedSlug}`);
        if (el && scrollRef.current) {
          const container = scrollRef.current;
          const scrollTop =
            el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
          container.scrollTo({ top: scrollTop, behavior: "instant" });
        }
      }, 100);
    }
  }, [isOpen, selectedSlug]);

  if (!isOpen) return null;

  const handleSelect = (slug: string) => {
    setTempSelected(slug);
    onSelect(slug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-canvas rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col animate-slide-up">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-hairline" />
        </div>

        {/* Header */}
        <div className="px-6 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">历史推送</h3>
          <button
            onClick={onClose}
            className="text-sm font-medium text-muted hover:text-ink transition-colors px-3 py-1 rounded-lg hover:bg-surface-soft"
          >
            完成
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-hairline-soft" />

        {/* Date list - scrollable */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scrollbar-hide"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {dates.map((item) => {
            const isSelected = tempSelected === item.slug;
            const dateObj = parseISO(item.date);

            return (
              <button
                key={item.slug}
                id={`date-item-${item.slug}`}
                onClick={() => handleSelect(item.slug)}
                className={`w-full text-left rounded-2xl px-4 py-3.5 transition-all duration-200 scroll-snap-start ${
                  isSelected
                    ? "bg-ink text-white shadow-lg scale-[1.02]"
                    : "bg-surface-card text-ink hover:bg-surface-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {format(dateObj, "MM月dd日", { locale: zhCN })}
                    </span>
                    <span
                      className={`text-xs ${
                        isSelected ? "text-white/70" : "text-muted"
                      }`}
                    >
                      {format(dateObj, "EEEE", { locale: zhCN })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-canvas text-muted"
                      }`}
                    >
                      {item.category}
                    </span>
                    <span
                      className={`text-xs ${
                        isSelected ? "text-white/60" : "text-muted-soft"
                      }`}
                    >
                      {item.articleCount} 条
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
