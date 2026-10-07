import { Media, Project } from '@/payload-types'
import { isMedia } from './isMedia'
import { formatDateTime } from './formatDateTime'
import path from 'path'
import { groupCreditsByCreator, MediaCredit } from './groupCreditsByCreator'

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
  project: Project
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
      project,
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

export type MediaInfo = {
  title: string
  credits?: MediaCredit[]
  project?: MediaProjectInfo
}
export function getMediaInfo(media: Media): MediaInfo {
  return {
    title: media.title,
    credits: groupCreditsByCreator(media),
    project: getMediaProjectInfo(media),
  }
}
