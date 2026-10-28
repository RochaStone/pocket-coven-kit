import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep the build rooted in this folder, whatever sits in the folders above it.
  turbopack: { root: import.meta.dirname },
  // Lets parallel dev servers (gallery renders, tests) run without sharing a build dir.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
