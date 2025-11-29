import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  /* any other config options here */
  // Add these for better performance
  images: {
    domains: [], // Add any image domains you use
  },
  // Enable SWC minification
  swcMinify: true,
};

export default nextConfig;
