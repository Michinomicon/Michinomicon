import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Collections } from '@/utilities/collectionTypes'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Media } from '@/payload-types'
import { getPageCoverMedia, getPageDescription } from '@/utilities/pageUtils'
import { getPostCoverMedia, getPostDescription } from '@/utilities/postsUtils'
import { getProjectCoverMedia, getProjectDescription } from '@/utilities/projectUtils'
import { getCreatorCoverMedia, getCreatorDescription } from '@/utilities/creatorUtils'
import { isMedia } from '@/utilities/isMedia'
import { MediaGallery } from '@/components/MediaGallery'
import RichText from '@/components/RichText'
import Link from 'next/link'
import { AspectRatio } from '../ui/aspect-ratio'
import { cn } from '@/utilities/ui'
import React from 'react'

type ValidCollections = Pick<Collections, 'pages' | 'creators' | 'posts' | 'projects'>
export type HoverCardLinkReference<R extends keyof ValidCollections, V = ValidCollections[R]> = {
  relationTo: string & R
  value: Partial<V> | string
}

type BasicReference = {
  relationTo: string
  value:
    | {
        [key: string]: unknown
        slug?: string | undefined
        id: string
      }
    | string
}

type PageOrPostReference =
  | HoverCardLinkReference<'pages'>
  | HoverCardLinkReference<'posts'>
  | HoverCardLinkReference<'creators'>
  | HoverCardLinkReference<'projects'>

type HoverCardLinkPropsReference = BasicReference | PageOrPostReference

type HoverCardLinkContent = {
  url: string
  title: string | null
  description: string | DefaultTypedEditorState | null
  coverImage: Media | null
}

export function parseHoverCardLinkReference(
  reference?: HoverCardLinkPropsReference | null | undefined,
): HoverCardLinkContent {
  if (reference) {
    if (reference.relationTo === 'pages') {
      const { value } = reference as HoverCardLinkReference<typeof reference.relationTo>
      if (typeof value === 'object') {
        return {
          url: `/pages/${value.slug}`,
          title: value.title ?? null,
          description: getPageDescription(value),
          coverImage: getPageCoverMedia(value),
        }
      }
    }

    if (reference.relationTo === 'posts') {
      const { value } = reference as HoverCardLinkReference<typeof reference.relationTo>
      if (typeof value === 'object') {
        return {
          url: `/posts/${value.slug}`,
          title: value.title ?? null,
          description: getPostDescription(value),
          coverImage: getPostCoverMedia(value),
        }
      }
    }

    if (reference.relationTo === 'projects') {
      const { value } = reference as HoverCardLinkReference<typeof reference.relationTo>
      if (typeof value === 'object') {
        return {
          url: `/projects/${value.slug}`,
          title: value.title ?? null,
          description: getProjectDescription(value),
          coverImage: getProjectCoverMedia(value),
        }
      }
    }

    if (reference.relationTo === 'creators') {
      const { value } = reference as HoverCardLinkReference<typeof reference.relationTo>
      if (typeof value === 'object') {
        return {
          url: `/creators/${value.slug}`,
          title: value.title ?? null,
          description: getCreatorDescription(value),
          coverImage: getCreatorCoverMedia(value),
        }
      }
    }
  }
  return {
    url: ``,
    title: null,
    description: null,
    coverImage: null,
  }
}

interface HoverCardLinkProps {
  url: string
  reference?: HoverCardLinkPropsReference | null
  children: React.ReactNode
  showCoverImage?: boolean
  showDescription?: boolean
}

export default function HoverCardLink({
  url,
  reference,
  children,
  showCoverImage = true,
  showDescription = true,
}: HoverCardLinkProps) {
  const { title, description, coverImage } = parseHoverCardLinkReference(reference)

  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Link href={url} className="hover-card-link text-primary underline">
          {children}
        </Link>
      </HoverCardTrigger>

      <HoverCardContent
        side="top"
        className="not-prose grid h-auto w-auto max-w-150 grid-cols-[auto_repeat(2,minmax(0,1fr))] flex-nowrap overflow-clip border border-border p-0"
      >
        <div className="pointer-events-none h-30 w-30 rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-lg border-r border-border">
          {showCoverImage && isMedia(coverImage) && (
            <AspectRatio
              ratio={1 / 1}
              className={cn(
                'h-full w-full overflow-clip rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-lg',
              )}
            >
              <MediaGallery items={[coverImage]} layout={'mediaBlock'} />
            </AspectRatio>
          )}
        </div>
        <div
          className={cn(
            'flex max-h-30 w-full flex-col p-2',
            showCoverImage ? 'col-span-2' : 'col-span-3',
          )}
        >
          {title && <span className="text-sm font-semibold">{title}</span>}
          {showDescription && (
            <div className={'overflow-hidden'}>
              {description && typeof description === 'object' ? (
                <RichText
                  className={
                    'h-full w-full overflow-clip rounded-none text-sm text-ellipsis text-muted-foreground'
                  }
                  data={description}
                  enableGutter={false}
                />
              ) : (
                <div className="prose line-clamp-2 text-sm text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
