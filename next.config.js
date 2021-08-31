/** @type {import('next').NextConfig} */
module.exports = {
  webpack5: false,
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com'],
  },
  eslint: {
    dirs: ['src'],
  },
};
