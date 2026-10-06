import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const apiUrl = process.env.CB_API_URL ?? "http://localhost:4200";
// Extra hostnames (e.g. this machine's LAN IP) allowed to load dev assets; comma-separated.
const devOrigins = (process.env.CB_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // The repo guide is maintained by hand; Next 16 reference docs live in node_modules/next/dist/docs.
  agentRules: false,
  allowedDevOrigins: devOrigins,
  // The floating dev badge overlaps content at phone width.
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
