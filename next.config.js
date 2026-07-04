/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow product images from ANY https host (so imported products from other
    // sites render without "hostname not configured" errors).
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

module.exports = nextConfig
