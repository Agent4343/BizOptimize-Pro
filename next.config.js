/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for containerized deployments (Railway, Docker)
  output: 'standalone',

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'BizOptimize Pro',
  },

  // Image optimization
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/api/favicon',
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
