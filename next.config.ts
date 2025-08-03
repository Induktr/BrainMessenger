import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a9626498a00940957150d921ac383a62.r2.cloudflarestorage.com',
        pathname: '/brainmessenger-files/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-51a1a8880278493e9425821ed8b219e9.r2.dev',
        pathname: '/brainmessenger-files/avatars/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{
        loader: '@svgr/webpack',
        options: {
          svgo: true,
          svgoConfig: {
            plugins: [
              {
                name: 'removeAttrs',
                params: {
                  attrs: '(fill|stroke)',
                },
              },
            ],
          },
          icon: true,
        },
      }],
    });

    return config;
  },
  reactStrictMode: true,
  transpilePackages: ['apollo-upload-client'],
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = withSentryConfig(nextConfig);
