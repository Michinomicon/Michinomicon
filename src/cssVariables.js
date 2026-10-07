/**
 * This config is the 'source of truth' for the following configs:
 * `src/collections/Media.ts`: UploadImageSizes
 * `src/defaultImageSizes.js`: DEFAULT_IMAGE_SIZES
 * `next.config.js`: nextConfig.images.deviceSizes, nextConfig.images.imageSizes
 */

export const cssVariables = {
  breakpoints: {
    '3xl': 1920,
    '2xl': 1536,
    xl: 1280,
    lg: 1024,
    md: 768,
    sm: 640,
    xs: 480,
  },
}
