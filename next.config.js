/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable Pages Router alongside App Router
  experimental: {
    // You can add experimental features here if needed
  },
}

module.exports = nextConfig

