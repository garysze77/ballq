/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ballq.gonggu.app/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
