import { cssVariables } from '@/cssVariables'
const { breakpoints } = cssVariables
export const DEFAULT_IMAGE_SIZES = Object.entries(breakpoints)
  .sort(([, valA], [, valB]) => valA - valB) // Sorts: 480, 640, 768, etc.
  .map(([, value]) => `(max-width: ${value}px) 100vw`)
  .join(', ')
  .concat(', 100vw')
