const { withSentryConfig } = require('@sentry/nextjs');

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
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    unoptimized: true
  }
}

// Only wrap with Sentry if DSN is configured
const sentryEnabled = !!process.env.SENTRY_DSN || !!process.env.NEXT_PUBLIC_SENTRY_DSN;

module.exports = sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    }, {
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    })
  : nextConfig;
