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
      // /rfq/compare-quotes and /rfq-compare were orphaned demo pages —
      // hardcoded mock quotes ("ABC Electronics Ltd." etc.), zero internal
      // links anywhere in the app (verified via repo-wide search, Hackathon
      // 6.0 P1 demo-safety cleanup). The real quote-comparison-and-accept
      // experience lives on /rfq/[id] itself. Neither orphaned page carried
      // an RFQ-id context to redirect more specifically, so both go to the
      // real RFQ browse page — already used elsewhere in the app as the
      // "Marketplace" breadcrumb destination from /rfq/[id].
      { source: '/rfq/compare-quotes', destination: '/rfq', permanent: true },
      { source: '/rfq-compare', destination: '/rfq', permanent: true },
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
