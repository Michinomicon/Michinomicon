'use client'
import { Media } from '@/payload-types'
import { GalleryItem as LightGalleryItem } from 'lightgallery/lg-utils'
import { groupCreditsByCreator } from '@/utilities/groupCreditsByCreator'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const DUMMY_POSTER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export type ItemProperties = Omit<LightGalleryItem, 'width' | 'width'> & {
  width?: number | `${number}` | undefined
  height?: number | `${number}` | undefined
} & (
    | {
        id: string
        alt: string
        size: string
        src: string
        type: SupportedMIMEType
        thumb: string
        subHtml: string
      }
    | {
        id: string
        alt: string
        size: string
        src: string
        type: 'unsupported'
        mimeType: string
        thumb: string
        subHtml: string
      }
  )

type SupportedMIMEType = 'image' | 'video'

function hasMIMEType<T extends SupportedMIMEType>(
  media: Media,
  type: T,
): media is Media & { mimeType: string; url: string } {
  const mimeIsValid = typeof media.mimeType === 'string' && media.mimeType.includes(type)
  const validUrl = typeof media.url === 'string' && media.url.length > 0
  return mimeIsValid && validUrl
}

function getImageSource(media: Media): string {
  let src = getMediaUrl(media.url)
  if (typeof src === 'string' && src.startsWith('http')) {
    try {
      const urlObj = new URL(src)
      // If the URL matches localhost, strip it down to just the relative path
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        src = urlObj.pathname + urlObj.search
      }
    } catch (_err) {
      // Silently ignore invalid URLs
    }
  }
  return src
}

function getVideoSource(media: Media): string {
  const videoSrc = {
    html5: true,
    source: [{ src: media.url, type: media.mimeType }],
    attributes: {
      preload: 'none',
      controls: true,
      poster: getItemThumbnailUrl(media),
    },
  }
  return JSON.stringify(videoSrc)
}

function getMediaSource(media: Media): string | undefined {
  switch (true) {
    case hasMIMEType(media, 'video'):
      return getVideoSource(media)
    case hasMIMEType(media, 'image'):
      return getImageSource(media)
    default:
      return
  }
}

function getItemType(media: Media): SupportedMIMEType | 'unsupported' {
  switch (true) {
    case hasMIMEType(media, 'video'):
      return 'video'
    case hasMIMEType(media, 'image'):
      return 'image'
    default:
      return 'unsupported'
  }
}

function getItemThumbnailUrl(item: Media): string {
  return item.thumbnailURL || item.sizes?.thumbnail?.url || DUMMY_POSTER
}

function getItemSubHtml(item: Media): string {
  const credits = groupCreditsByCreator(item.credits)
  const captionCredits = credits.map(({ creator, roles }) => {
    return `<h3><a href='/creators/${creator.slug}'><b>${creator.title}</b></a> - ${roles.join(', ')}</h3>`
  })
  return `<div class="lightGallery-captions prose w-full text-center mx-auto">
        <h3>Title - ${item.title}</h3>
    ${captionCredits}
    </div>`
}

function getItemProperties(media: Media): ItemProperties | undefined {
  const itemType = getItemType(media)

  if (itemType === 'unsupported') {
    return {
      id: media.id,
      alt: media.alt ?? media.filename,
      size: media.width && media.height ? `${media.width}-${media.height}` : '1280-720',
      src: '',
      type: 'unsupported',
      mimeType: media.mimeType ?? '',
      thumb: '',
      subHtml: getItemSubHtml(media),
    }
  }

  const src = getMediaSource(media)
  if (!src) {
    console.log(` ImageGalleryItem media "${media.title}" was invalid:`, media)
    return
  }
  // const metaData = getImageMediaMetaData(item)
  const subHtml = getItemSubHtml(media)
  const thumbSrc = getItemThumbnailUrl(media)

  return {
    id: media.id,
    alt: media.alt ?? '',
    size: media.width && media.height ? `${media.width}-${media.height}` : '1280-720',
    src: src,
    type: itemType,
    thumb: thumbSrc,
    subHtml: subHtml,
  }
}

export function mapImageGalleryItems(media: Media[]) {
  const items: ItemProperties[] = media
    .sort((i, j) => Number(j.sortPriority) - Number(i.sortPriority))
    .map(getItemProperties)
    .filter((i) => !!i)

  return items
}
