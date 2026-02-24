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
  },
  output: 'standalone',
}
module.exports = nextConfig
