import type { NextConfig } from "next";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${backendBaseUrl.replace(/\/$/, "")}/:path*`
      }
    ];
  }
};

export default nextConfig;
