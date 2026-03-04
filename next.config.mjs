/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

const nextConfig = {
  basePath: '/Dashboard',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/Dashboard'
  },
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;