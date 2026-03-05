/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
const parsedScheduleInterval = Number.parseInt(process.env.SCHEDULE_INTERVAL || '30', 10);
const scheduleIntervalMinutes = Number.isFinite(parsedScheduleInterval) && parsedScheduleInterval > 0
  ? parsedScheduleInterval
  : 30;

const nextConfig = {
  basePath: '/Dashboard',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/Dashboard',
    NEXT_PUBLIC_REFRESH_INTERVAL_MS: String(scheduleIntervalMinutes * 60 * 1000)
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