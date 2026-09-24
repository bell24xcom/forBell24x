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
      // /services has no index page — only subpaths exist (/services/logistics,
      // /services/verification, etc.) — so the bare URL 404s. Nothing in the
      // app links to it (verified via repo-wide search for '/services'), but
      // Google Search Console keeps finding it, presumably from stale/external
      // crawl history. Redirecting rather than building a new index page,
      // since there's no real content to put there.
      { source: '/services', destination: '/how-it-works', permanent: true },
      // Dead category slugs, still linked live from src/data/city-category-seo.ts
      // (feeds /suppliers/[city]/[category] pages) — none of these three exist
      // as real Category rows in the DB (verified). Redirecting to the closest
      // real, active category rather than leaving a 404 on a genuinely-linked
      // page. mining-minerals and hvac-refrigeration were investigated too and
      // have zero references anywhere in the codebase — left as 404s, not
      // redirected, since there's no live link to fix and no invented target.
      { source: '/categories/pipes-fittings', destination: '/categories/plumbing-supplies', permanent: true },
      { source: '/categories/leather-footwear', destination: '/categories/footwear', permanent: true },
      { source: '/categories/chemicals-petrochemicals', destination: '/categories/chemicals', permanent: true },
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
