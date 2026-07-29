import FileQuestionMarkPNG from '@/public/file-question-mark.png'
import FileMusicPNG from '@/public/file-music.png'
import FileVideoCameraPNG from '@/public/file-video-camera.png'
import FileImagePNG from '@/public/file-image.png'
import FileTextPNG from '@/public/file-text.png'
import FolderArchivePNG from '@/public/folder-archive.png'
import FilePNG from '@/public/file.png'
import { Media } from '@/payload-types'
import { isMedia } from './isMedia'

function getSafeImageSource(media?: Media | string | null | undefined): string | null {
  if (isMedia(media) && media.mimeType?.includes('image')) {
    let src = media.url
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
    if (src && src.length > 0) {
      return src
    }
  }
  return null
}

function getThumbnailSource(media?: Media | string | null | undefined): string | null {
  let thumbnailUrl: string | null = null
  if (isMediaWithMIMEType(media)) {
    if (mediaIsVideo(media) || mediaIsImage(media)) {
      if (media.thumbnailURL) {
        thumbnailUrl = media.thumbnailURL
      } else if (media.sizes?.thumbnail?.url) {
        thumbnailUrl = media.sizes?.thumbnail?.url
      } else if (media.url) {
        thumbnailUrl = media.url
      }
    }
  }
  return thumbnailUrl
}

export function getFallbackSourceByMIMEType(MIMEType?: string | null | undefined): string {
  const mimeType = MIMEType

  switch (true) {
    case mimeType?.includes('video'):
      return FileVideoCameraPNG.src
    case mimeType?.includes('image'):
      return FileImagePNG.src
    case mimeType?.includes('audio'):
      return FileMusicPNG.src
    case mimeType?.includes('application'):
      switch (true) {
        case mimeType?.includes('pdf'):
          return FileTextPNG.src
        case mimeType?.includes('zip') || mimeType?.includes('compressed'):
          return FolderArchivePNG.src
      }
    default:
      console.log(`Failed to determine fallback image for media with mimeType: "${mimeType}". `)
      if (typeof mimeType === 'string' && mimeType.length > 0) {
        // There IS a MIMEType, but there is no icon here for it yet
        // So just return a generic file icon
        return FilePNG.src
      } else {
        // it's a mystery
        return FileQuestionMarkPNG.src
      }
  }
}

function getVideoSources(media: Media): MediaDisplayImageSources {
  const poster: string = getThumbnailSource(media) ?? getFallbackSourceByMIMEType('video')
  const src: string = media.url && media.url.length > 0 ? media.url : poster
  const videoSrc = {
    html5: true,
    source: [{ src: src, type: media.mimeType }],
    attributes: {
      preload: 'none',
      controls: true,
      poster: poster,
      playsinline: true,
    },
  }
  return {
    source: JSON.stringify(videoSrc),
    thumbnail: poster,
  }
}

function getYouTubeSources(media: Media): MediaDisplayImageSources {
  let source: string = ''
  let thumbnail: string = ''

  const { youtubeId, youtubeUrl, youtubeThumbnailUrl } = media

  if (youtubeId && youtubeThumbnailUrl && youtubeUrl) {
    source = youtubeUrl
    thumbnail = youtubeThumbnailUrl
  }
  return {
    source: source,
    thumbnail: thumbnail,
  }
}

type MediaWithCoverImage = Media & { mimeType: string; coverImage: MediaWithMIMEType }
function isMediaWithCoverImage(
  media?: Media | string | null | undefined,
): media is MediaWithCoverImage {
  if (isMediaWithMIMEType(media)) {
    if (!mediaIsVideo(media) && !mediaIsImage(media)) {
      if (isMediaWithMIMEType(media.coverImage) && mediaIsImage(media.coverImage)) {
        return true
      }
    }
  }
  return false
}

type MediaWithMIMEType = Media & { mimeType: string }
function isMediaWithMIMEType(
  media?: Media | string | null | undefined,
): media is Media & { mimeType: string } {
  if (isMedia(media) && media.mimeType) {
    const { mimeType } = media
    if (typeof mimeType === 'string' && mimeType.length > 0) {
      return true
    }
  }
  return false
}

function mediaIsVideo(media?: Media | string | null | undefined): boolean {
  if (isMediaWithMIMEType(media) && media.mimeType.includes('video')) {
    return true
  }
  return false
}

function mediaIsImage(media?: Media | string | null | undefined): boolean {
  if (isMediaWithMIMEType(media) && media.mimeType.includes('image')) {
    return true
  }
  return false
}

function mediaIsYouTube(media?: Media | string | null | undefined): boolean {
  if (isMedia(media)) {
    if (media.youtubeId || media.youtubeUrl) {
      return true
    }
  }
  return false
}

type MediaDisplayImageSources = {
  source: string
  thumbnail: string
}
export function getMediaDisplayImageSources(
  media: Media | string | null | undefined,
): MediaDisplayImageSources {
  if (!isMediaWithMIMEType(media)) {
    return {
      source: getFallbackSourceByMIMEType(),
      thumbnail: getFallbackSourceByMIMEType(),
    }
  }

  switch (true) {
    case mediaIsYouTube(media):
      return getYouTubeSources(media)
    case mediaIsImage(media):
      return {
        source: getSafeImageSource(media) ?? getFallbackSourceByMIMEType(media.mimeType),
        thumbnail: getThumbnailSource(media) ?? getFallbackSourceByMIMEType(media.mimeType),
      }
    case mediaIsVideo(media):
      return getVideoSources(media)

    case isMediaWithCoverImage(media):
      const source = getSafeImageSource(media.coverImage)
      const thumb = getThumbnailSource(media.coverImage)
      return {
        source: source ?? getFallbackSourceByMIMEType(media.mimeType),
        thumbnail: thumb ?? getFallbackSourceByMIMEType(media.mimeType),
      }

    default:
      return {
        source: getFallbackSourceByMIMEType(),
        thumbnail: getFallbackSourceByMIMEType(),
      }
  }
}
