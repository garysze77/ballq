/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://172.104.99.225:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
