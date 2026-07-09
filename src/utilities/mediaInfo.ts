import { Media } from '@/payload-types'
import { isMedia } from './isMedia'
import { formatDateTime } from './formatDateTime'
import { groupCreditsByCreator } from './groupCreditsByCreator'
import path from 'path'

export function getMediaFileName(media: Media): string | undefined {
  const { filename } = media
  if (filename) {
    const { name } = path.parse(filename)
    if (name.length > 0) {
      return name
    }
  }
  return
}

export function getMediaFileExtension(media: Media): string | undefined {
  const { filename } = media
  if (filename) {
    const extension: string = path.extname(filename)
    if (extension.length > 0) {
      return extension
    }
  }
  return
}

export type MediaProjectInfo = {
  href: string
  slug: string
  title: string
  status: 'planned' | 'active' | 'completed' | 'archived'
  profileImage: Media | null
  categories: { title: string; slug: string }[] | undefined
  startDate: string | null
  endDate: string | null
}
export function getMediaProjectInfo(media: Media): MediaProjectInfo | undefined {
  const { project } = media
  if (project && typeof project === 'object') {
    const { slug, title, profileImage, categories, status, startDate, endDate } = project
    return {
      slug,
      title,
      status,
      profileImage: isMedia(profileImage) ? profileImage : null,
      categories: categories
        ?.filter((cat) => typeof cat === 'object')
        .map(({ title, slug }) => ({ title, slug })),
      startDate: startDate ? formatDateTime(startDate) : null,
      endDate: endDate ? formatDateTime(endDate) : null,
      href: `/projects/${slug}`,
    }
  }
}

export type MediaCreditInfo = {
  href: string
  title: string
  roles: string[]
  image: Media | null
}
export function getMediaCreditInfo(media: Media): MediaCreditInfo[] | undefined {
  if (media.credits) {
    return groupCreditsByCreator(media.credits).map(({ creator, roles }) => ({
      href: `/creators/${creator.slug}`,
      title: creator.title,
      roles: roles,
      image: isMedia(creator.profileImage) ? creator.profileImage : null,
    }))
  }
}

export type MediaInfo = {
  title: string
  credits?: MediaCreditInfo[]
  project?: MediaProjectInfo
}
export function getMediaInfo(media: Media): MediaInfo {
  return {
    title: media.title,
    credits: getMediaCreditInfo(media),
    project: getMediaProjectInfo(media),
  }
}
