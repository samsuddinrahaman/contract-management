import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
