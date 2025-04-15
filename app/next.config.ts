import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  async rewrites() {
    return [
      {
        source: "/vibes-standalone/:slug",
        destination: "/vibes-standalone/:slug/index.html",
      },
    ];
  },
};

export default nextConfig;
