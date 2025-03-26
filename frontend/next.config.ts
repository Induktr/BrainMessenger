/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  trailingSlash: true,
  // Configure webpack to properly resolve components from the src directory
  webpack: (config: any, _: { isServer: boolean }) => {
    // Add src directory to the module resolution paths
    config.resolve.modules.push("./src");
    config.resolve.modules.push("./src/components");
    return config;
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Configure page extensions to include tsx files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Ensure components in src/components are properly imported
  experimental: {
  },
};

module.exports = nextConfig;
