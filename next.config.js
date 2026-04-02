/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output for Docker
  images: {
    domains: [
      'assets.sansiri.com',
      'www.sansiri.com',
      'images.unsplash.com',
    ],
  },
}

module.exports = nextConfig
