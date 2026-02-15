/** @type {import('next').NextConfig} */
const nextConfig = {
  // Oracle VM configuration - Full Next.js with API routes
  // output: 'export', // DISABLED - We need API routes for Oracle VM
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['bell24h.com', 'n8n.bell24h.com', 'www.bell24h.com'],
    unoptimized: false, // Enable image optimization on Oracle VM
  },
  async redirects() {
    return [
      {
        source: '/n8n',
        destination: 'https://n8n.bell24h.com',
        permanent: true,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: false,
  },
  // Enable webpack cache for Oracle VM (no 25MB limit here)
  webpack: (config, { dev, isServer }) => {
    // Keep cache enabled for faster rebuilds on Oracle VM
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      util: false,
      url: false,
      assert: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
    };
    return config;
  },
}

module.exports = nextConfig

