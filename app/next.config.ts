import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/standalone/:slug",
        destination: "/standalone/:slug.html",
      },
    ];
  },
};

export default nextConfig;
