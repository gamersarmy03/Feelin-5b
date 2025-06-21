/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["picsum.photos", "storage.googleapis.com", "cdn.openai.com", "s3.us.archive.org", "archive.org"],
  },
  // Ensure proper static generation
  output: "standalone",
  // Handle dynamic routes properly
  trailingSlash: false,
}

module.exports = nextConfig
