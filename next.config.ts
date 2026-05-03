import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/home/yue/tech-news-webapp",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
