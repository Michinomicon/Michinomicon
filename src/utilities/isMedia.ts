import { Media } from '@/payload-types'

/**
 *
 * @description Check if item is Payload Media.
 * @export
 * @param {(string | Media | null | undefined)} item
 * @return {*}  {item is Media}
 */
export function isMedia(item: string | Media | null | undefined): item is Media {
  return (
    item !== null &&
    item !== undefined &&
    typeof item !== 'string' &&
    typeof item === 'object' &&
    !!item.id
  )
}
