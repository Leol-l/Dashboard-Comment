/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/Dashboard',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/Dashboard'
  },
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