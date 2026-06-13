import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export type GlobalSlug = keyof Config['globals']

async function getGlobal<SlugType extends GlobalSlug = GlobalSlug>(slug: SlugType, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <SlugType extends GlobalSlug = GlobalSlug>(
  slug: SlugType,
  depth = 0,
) =>
  unstable_cache(async () => getGlobal<SlugType>(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })
