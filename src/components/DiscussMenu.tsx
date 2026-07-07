"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
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
  { provider: "chatgpt", label: "ChatGPT" },
  { provider: "claude", label: "Claude" },
  { provider: "kimi", label: "Kimi" },
  { provider: "copy", label: "Copy prompt" },
];

const STATUS_DURATION_MS = 1800;
const CLAUDE_FALLBACK_DELAY_MS = 1000;

type MenuPosition = {
  top: number;
  left: number;
  minWidth: number;
};

function computeMenuPosition(trigger: HTMLElement): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  const minWidth = 168;
  const gap = 4;
  const viewportPadding = 8;
  const estimatedHeight = MENU_OPTIONS.length * 36 + 12;

  let top = rect.bottom + gap;
  if (top + estimatedHeight > window.innerHeight - viewportPadding) {
    top = Math.max(viewportPadding, rect.top - estimatedHeight - gap);
  }

  let left = rect.left;
  if (left + minWidth > window.innerWidth - viewportPadding) {
    left = window.innerWidth - minWidth - viewportPadding;
  }
  left = Math.max(viewportPadding, left);

  return { top, left, minWidth };
}

export default function DiscussMenu({ story }: DiscussMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [showClaudeFallback, setShowClaudeFallback] = useState(false);

  const prompt = buildDiscussPrompt(story);

  const clearStatus = useCallback(() => {
    setStatus(null);
    setShowClaudeFallback(false);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setMenuPosition(null);
  }, []);

  const openMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    setMenuPosition(computeMenuPosition(trigger));
    setActiveIndex(0);
    setOpen(true);
  }, []);

  const toggleMenu = useCallback(() => {
    if (open) {
      closeMenu();
      return;
    }
    openMenu();
  }, [closeMenu, open, openMenu]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (trigger) {
        setMenuPosition(computeMenuPosition(trigger));
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % MENU_OPTIONS.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (current) => (current - 1 + MENU_OPTIONS.length) % MENU_OPTIONS.length
        );
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
      if (!open) {
        openMenu();
      }
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = MENU_OPTIONS[activeIndex];
      if (option) {
        void handleSelect(option.provider);
      }
    }
  };

  const menu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className="discuss-popover"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              minWidth: menuPosition.minWidth,
            }}
            onKeyDown={handleMenuKeyDown}
          >
            {MENU_OPTIONS.map((option, index) => (
              <button
                key={option.provider}
                type="button"
                role="menuitem"
                tabIndex={index === activeIndex ? 0 : -1}
                className="discuss-option"
                data-active={index === activeIndex || undefined}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => void handleSelect(option.provider)}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className="discuss-menu">
      <span className="text-muted-soft" aria-hidden="true">
        ·
      </span>
      <button
        ref={triggerRef}
        type="button"
        className="discuss-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggleMenu}
        onKeyDown={handleTriggerKeyDown}
      >
        discuss
      </button>

      {menu}

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
