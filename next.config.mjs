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
    domains: [
      'picsum.photos',
      'image.pollinations.ai',
      'cdn.openai.com',
      's3.us.archive.org',
      'archive.org'
    ],
  },
  // Ensure proper static generation
  output: 'standalone',
  // Handle dynamic routes properly
  trailingSlash: false,
}

export default nextConfig
