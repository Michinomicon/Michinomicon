import { Media } from '@/payload-types'
import { getImageMediaMetaData } from './getMediaMetaData'

export function getMediaSize(media: Media): {
  width: number | `${number}`
  height: number | `${number}`
  size: string
} {
  const { width: metaDataWidth, height: metaDataHeight } = getImageMediaMetaData(media)
  const mediaWidth: number = Math.max(Number(media.width ?? metaDataWidth), 0)
  const mediaHeight: number = Math.max(Number(media.height ?? metaDataHeight), 0)
  const width: number = mediaWidth > 0 ? mediaWidth : 1200
  const height: number = mediaHeight > 0 ? mediaHeight : 630
  return {
    width: width,
    height: height,
    size: `${width}-${height}`,
  }
}
