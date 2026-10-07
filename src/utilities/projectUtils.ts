import { Media, Project } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export function getProjectCoverMedia(project: Partial<Project>): Media | null {
  const { profileImage, meta } = project
  let media: string | Media | null | undefined = null

  if (profileImage) {
    media = profileImage
  } else if (meta) {
    media = meta.image
  }
  return media && typeof media === 'object' ? media : null
}

export function getProjectDescription(
  project: Partial<Project>,
): (DefaultTypedEditorState | string) | null {
  const { content, meta } = project

  let description: (DefaultTypedEditorState | string) | null = null

  if (content?.description) {
    description = content?.description
  } else if (meta && meta.description) {
    description = meta.description
  }
  return description
}
