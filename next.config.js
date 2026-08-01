const path = require('path');

// Build: 2026-03-28 — dark homepage, ₹999 plan, schema v2
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['lucide-react', 'react-icons', 'date-fns'],
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
  compress: true,
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
  async redirects() {
    return [
      // /rfq/new was a superseded duplicate of /rfq/create (payload shape
      // no longer matched /api/rfq/create's Zod schema). Config-level
      // redirects are checked before the filesystem/page routes, so this
      // is the framework-recommended way to permanently retire a route —
      // no page.tsx needed at all. permanent:true -> 308.
      { source: '/rfq/new', destination: '/rfq/create', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
}
module.exports = nextConfig
// cache-bust: 1774642273
