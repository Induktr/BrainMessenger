console.log('next.config.ts is being executed');

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: "@svgr/webpack", options: { defaultExport: "component" } }],
    });

    return config;
  },
};

export default nextConfig;
