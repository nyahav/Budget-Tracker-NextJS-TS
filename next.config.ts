import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors during build
  },

  images: {
    domains: [
      'bayut-production.s3.eu-central-1.amazonaws.com',
      'realestate-tracker-nextjs.s3.eu-central-1.amazonaws.com'
    ],
  },
};

export default nextConfig;
