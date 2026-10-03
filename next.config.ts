import type { NextConfig } from "next";

const apiUrl = process.env.CB_API_URL ?? "http://localhost:4200";

const nextConfig: NextConfig = {
  // The repo guide is maintained by hand; Next 16 reference docs live in node_modules/next/dist/docs.
  agentRules: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
