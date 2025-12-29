import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const target =
      process.env.KYC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!target) return [];
    const base = target.replace(/\/+$/, "");
    return [
      {
        source: "/kyc/:path*",
        destination: `${base}/kyc/:path*`,
      },
    ];
  },
};

export default nextConfig;
