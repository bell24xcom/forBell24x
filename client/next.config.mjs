/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Re-enable for production performance
<<<<<<< HEAD
  output: 'export',
=======
  // output: 'export', // REMOVED - enables dynamic routes and API endpoints
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
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
<<<<<<< HEAD
    unoptimized: true, // Required for static export
=======
    unoptimized: false, // Enable image optimization for dynamic routes
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    domains: ['bell24h.com', 'www.bell24h.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
