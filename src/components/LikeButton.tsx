"use client";

import { useState, useEffect } from "react";

interface LikeButtonProps {
  slug: string;
}

export default function LikeButton({ slug }: LikeButtonProps) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/like?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    const likedKey = `liked:${slug}`;
    setLiked(localStorage.getItem(likedKey) === "true");
    fetchCount();
  }, [slug]);

  const handleLike = async () => {
    if (liked) return;

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setLiked(true);
        localStorage.setItem(`liked:${slug}`, "true");
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
        ${
          liked
            ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 cursor-default"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }
      `}
    >
      <svg
        className="w-4 h-4"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {loading ? "..." : count}
    </button>
  );
}
