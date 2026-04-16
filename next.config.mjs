/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
