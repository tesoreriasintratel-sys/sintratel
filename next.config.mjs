/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // Allow xlsx and jspdf to work without bundling issues
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig;
