"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  buildDiscussPrompt,
  continueWithAgent,
  type AgentProvider,
  type StoryForPrompt,
} from "../lib/discuss";

type DiscussMenuProps = {
  story: StoryForPrompt;
};

const MENU_OPTIONS: { provider: AgentProvider; label: string }[] = [
  { provider: "chatgpt", label: "Discuss with ChatGPT" },
  { provider: "claude", label: "Discuss with Claude" },
  { provider: "kimi", label: "Discuss with Kimi" },
  { provider: "copy", label: "Copy prompt" },
];

const STATUS_DURATION_MS = 1800;
const CLAUDE_FALLBACK_DELAY_MS = 1000;

function supportsHoverOpen() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export default function DiscussMenu({ story }: DiscussMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [showClaudeFallback, setShowClaudeFallback] = useState(false);

  const prompt = buildDiscussPrompt(story);

  const clearStatus = useCallback(() => {
    setStatus(null);
    setShowClaudeFallback(false);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  const toggleMenu = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, open]);

  useEffect(() => {
    if (!status) {
      return;
    }

    const timer = window.setTimeout(clearStatus, STATUS_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [clearStatus, status]);

  const handleSelect = useCallback(
    async (provider: AgentProvider) => {
      closeMenu();
      clearStatus();

      const result = await continueWithAgent(provider, prompt);
      if (!result.message) {
        return;
      }

      setStatus(result.message);

      if (result.showClaudeFallback) {
        window.setTimeout(() => {
          setShowClaudeFallback(true);
        }, CLAUDE_FALLBACK_DELAY_MS);
      }
    },
    [clearStatus, closeMenu, prompt]
  );

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  };

  return (
    <div
      ref={containerRef}
      className="discuss-menu"
      onMouseEnter={() => {
        if (supportsHoverOpen()) {
          openMenu();
        }
      }}
      onMouseLeave={() => {
        if (supportsHoverOpen()) {
          closeMenu();
        }
      }}
    >
      <span className="text-muted-soft" aria-hidden="true">
        ·
      </span>
      <button
        ref={triggerRef}
        type="button"
        className="discuss-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggleMenu}
        onFocus={() => {
          if (supportsHoverOpen()) {
            openMenu();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        discuss
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="discuss-popover"
          onMouseLeave={() => {
            if (supportsHoverOpen()) {
              closeMenu();
            }
          }}
        >
          {MENU_OPTIONS.map((option) => (
            <button
              key={option.provider}
              type="button"
              role="menuitem"
              className="discuss-option"
              onClick={() => handleSelect(option.provider)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {status && (
        <span className="discuss-status" role="status" aria-live="polite">
          {status}
          {showClaudeFallback && (
            <>
              {" "}
              If Claude Desktop did not open, paste the copied prompt into{" "}
              <a
                href="https://claude.ai/new"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Claude Web
              </a>
              .
            </>
          )}
        </span>
      )}
    </div>
  );
}
