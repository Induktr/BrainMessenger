const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Add this line for standalone build
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a9626498a00940957150d921ac383a62.r2.cloudflarestorage.com',
        pathname: '/brainmessenger-files/avatars/**', // Убедитесь, что pathname соответствует структуре ваших URL аватаров
      },
    ],
  },
  /* config options here */
  // env object can often be removed if you rely on NEXT_PUBLIC_prefixes directly
  // env: {
  //   API_URL: process.env.NEXT_PUBLIC_API_URL,
  //   GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  //   WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  // },
  // trailingSlash: true, // Commenting this out or setting to false
  // Configure webpack to properly resolve components from the src directory
  webpack: (config: any, _: { isServer: boolean }) => {
    // Add src directory to the module resolution paths
    config.resolve.modules.push("./src");
    config.resolve.modules.push("./src/components");
    // Configure SVG loading
    // Add a rule for standard image files
    config.module.rules.push({
      test: /\\.(png|jpe?g|gif|webp|avif|ico|bmp)$/i,
      type: 'asset/resource',
    });

    // Configure SVG loading
    config.module.rules.push({
      test: /\\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Find the existing rule for image assets and exclude SVG
    const fileLoaderRule = config.module.rules.find((rule: any) => {
      if (rule.test instanceof RegExp) {
        return rule.test.test('.png'); // Check against a common image extension
      }
      return false;
    });

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\\.svg$/;
    }

    return config;
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  transpilePackages: ['apollo-upload-client'], // Add apollo-upload-client to transpile
  // Configure page extensions to include tsx files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Ensure components in src/components are properly imported
  experimental: {
  },
  // Add rewrites to proxy GraphQL requests
  async rewrites() {
    return [
      {
        source: '/api/graphql/:path*', // Match requests starting with /api/graphql
        // Destination URL should use localhost as Next.js server talks to NestJS server internally
        destination: `http://backend:4000/graphql/:path*`,
      },
    ]
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "brainmessenger",
    project: "brainmessenger-frontend",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be able to use it in older browsers
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can't be configured when a custom transport is used in the client.
    tunnelRoute: "/monitoring-tunnel",

    // Hides source maps from browser devtools
    hideSourceMaps: true,

    // Starts Sentry in debug mode
    debug: false,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Disable server/edge source map uploads in production.
    // This will reduce build time and prevent sensitive information from being uploaded.
    disableServerWebpackPlugin: process.env.NODE_ENV === "production",
    disableClientWebpackPlugin: process.env.NODE_ENV === "production",
  }
);
