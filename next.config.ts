import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Run ESLint during builds but don't fail on warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ignore build warnings from TypeScript
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xfmonwoufccbkucjqjxb.supabase.co",
      },
    ],
  },
  // NOTE: There's a known issue with production build optimization in Next.js 16
  // causing "RangeError: Invalid count value: -10" in String.repeat()
  // This appears to be a Next.js internal bug, not related to our code
  // Development mode works fine
  productionBrowserSourceMaps: true,
};

export default nextConfig;
