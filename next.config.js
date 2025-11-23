/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress middleware deprecation warning for now
  // We'll migrate to proxy pattern in future Next.js versions
  experimental: {
    // Keep using middleware for route protection
  },
}

module.exports = nextConfig