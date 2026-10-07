import { Media, Post } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export function getPostCoverMedia(post: Partial<Post>): Media | null {
  const { heroImage, meta } = post
  let media: string | Media | null | undefined = null

  if (heroImage) {
    media = heroImage
  } else if (meta) {
    media = meta.image
  }
  return media && typeof media === 'object' ? media : null
}

export function getPostDescription(post: Partial<Post>): (DefaultTypedEditorState | string) | null {
  const { content, meta } = post

  let description: (DefaultTypedEditorState | string) | null = null

  if (content) {
    description = content
  } else if (meta && meta.description) {
    description = meta.description
  }
  return description
}
