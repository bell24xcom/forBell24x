/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Re-enable for production performance
  // output: 'export', // REMOVED - enables dynamic routes and API endpoints
  trailingSlash: true,
  distDir: 'dist',

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack optimizations for faster development
  webpack: (config, { dev, isServer }) => {
    // Optimize for faster compilation in development
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**'],
      };

      // Enable faster builds
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // Image optimization
  images: {
    unoptimized: false, // Enable image optimization for dynamic routes
    domains: ['bell24h.com', 'www.bell24h.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
