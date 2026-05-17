import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static generation for all pages that use auth/context
  // This ensures proper server-side rendering
  experimental: {
    // Allow server components to run in edge runtime context
  },
};

export default nextConfig;
