/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/api/favicon',
      },
    ];
  },
}

module.exports = nextConfig