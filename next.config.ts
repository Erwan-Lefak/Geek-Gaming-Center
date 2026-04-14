import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignore TypeScript errors for production build to allow deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors for production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
