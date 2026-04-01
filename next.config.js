/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'assets.sansiri.com',
      'www.sansiri.com',
      'images.unsplash.com',
    ],
  },
}

module.exports = nextConfig
