import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ponytail: Crewo is fully per-user / auth-gated — nothing to statically prerender.
  // Cache Components (+ partial prefetching) only add per-page dynamic-opt-in boilerplate here.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
