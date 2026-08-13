import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
  ? `${process.env.NEXT_PUBLIC_SERVER_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://127.0.0.1:3000'

const LOCAL_DEV_IP = process.env.LOCAL_DEV_IP

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 100],
    deviceSizes: [480, 640, 768, 1024, 1280, 1536, 1920, 3840],
    imageSizes: [64, 96, 128, 256, 400, 500],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
          port: url.port || '',
        }
      }),
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
  },
  webpack: (webpackConfig, { isServer }) => {
    if (!isServer) {
      webpackConfig.resolve.alias.canvas = false
      webpackConfig.resolve.alias.encoding = false
    }

    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  output: 'standalone',
  reactStrictMode: true,
  redirects,
  outputFileTracingIncludes: {
    '/': ['ecosystem.config.cjs'],
  },
  serverExternalPackages: ['pdf-img-convert', 'pdfjs-dist', 'canvas'],
  transpilePackages: ['react-pdf', 'flipbook-js'],
  allowedDevOrigins: LOCAL_DEV_IP ? [LOCAL_DEV_IP] : undefined,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
