import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors during build
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        fs: false,
        tls: false,
      };
    }
    return config;
  },
  images: {
    domains: [
      'bayut-production.s3.eu-central-1.amazonaws.com',
      'realestate-tracker-nextjs.s3.eu-central-1.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'realestate-tracker-nextjs.s3.eu-central-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
