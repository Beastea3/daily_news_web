"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

const OPTIONS: ThemeChoice[] = ["system", "light", "dark"];

function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.dataset.theme = theme;
  }
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const savedTheme = window.localStorage.getItem("theme");
    return savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
      ? savedTheme
      : "system";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const selectTheme = (nextTheme: ThemeChoice) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  };

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-hairline-soft bg-surface-card p-1 shadow-sm"
      aria-label="Theme"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => selectTheme(option)}
          aria-pressed={theme === option}
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
            theme === option
              ? "bg-surface-soft text-ink"
              : "text-muted hover:bg-surface-soft hover:text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
