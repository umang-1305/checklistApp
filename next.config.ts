import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignores all ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignores all TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  // Add any other configurations you may need here
};

export default nextConfig;
