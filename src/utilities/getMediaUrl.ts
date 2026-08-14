import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  console.log(`getMediaUrl => IN: ${url} `)

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const alreadyPrepended = cacheTag ? `${url}?${cacheTag}` : url
    console.log(`getMediaUrl => OUT(1): ${alreadyPrepended} `)
    return alreadyPrepended
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  const formattedUrl = cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
  console.log(`getMediaUrl => OUT(2): ${formattedUrl} `)
  return formattedUrl
}
