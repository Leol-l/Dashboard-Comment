/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'http://localhost:3000/api/:path*', // Redirige vers ton API port 3000
      },
    ];
  },
};

export default nextConfig;