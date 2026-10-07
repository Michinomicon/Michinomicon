import { Media, Creator } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export function getCreatorCoverMedia(creator: Partial<Creator>): Media | null {
  const { profileImage, meta } = creator
  let media: string | Media | null | undefined = null

  if (profileImage) {
    media = profileImage
  } else if (meta) {
    media = meta.image
  }
  return media && typeof media === 'object' ? media : null
}

export function getCreatorDescription(
  creator: Partial<Creator>,
): (DefaultTypedEditorState | string) | null {
  const { content, meta } = creator

  let description: (DefaultTypedEditorState | string) | null = null

  if (content?.description) {
    description = content?.description
  } else if (meta && meta.description) {
    description = meta.description
  }
  return description
}
