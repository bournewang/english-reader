/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export',
    distDir: 'dist',
    images: {
      unoptimized: true,
    },
  } : {
    // Development config
    distDir: '.next', // Use default .next directory for development
  })
}

module.exports = nextConfig 