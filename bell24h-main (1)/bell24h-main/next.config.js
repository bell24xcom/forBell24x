/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {},
  },
  // Required for Fly.io deployment
  output: 'standalone',
};

module.exports = nextConfig;
