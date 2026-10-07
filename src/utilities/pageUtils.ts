import { Media, Page } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export function getPageCoverMedia(page: Partial<Page>): Media | null {
  const { hero, meta } = page
  let media: string | Media | null | undefined = null

  if (hero?.type === 'highImpact' || hero?.type === 'mediumImpact') {
    media = hero.media
  } else if (meta) {
    media = meta.image
  }
  return media && typeof media === 'object' ? media : null
}

export function getPageDescription(page: Partial<Page>): (DefaultTypedEditorState | string) | null {
  const { hero, meta } = page

  let description: (DefaultTypedEditorState | string) | null = null

  if (hero?.type !== 'none' && hero?.richText) {
    description = hero?.richText
  } else if (meta && meta.description) {
    description = meta.description
  }
  return description
}
