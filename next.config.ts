import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
