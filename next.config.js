import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://172.104.99.225:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
