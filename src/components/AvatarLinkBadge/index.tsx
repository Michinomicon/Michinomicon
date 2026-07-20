import { Media } from '@/payload-types'
import { Badge } from '../ui/badge'
import { MediaAvatar } from '../MediaAvatar'
import { cn } from '@/lib/utils'
import React from 'react'

export function AvatarLinkBadge({
  href,
  title,
  image,
}: React.ComponentPropsWithoutRef<typeof Badge> & {
  href: string
  title: string
  image: Media | null
}): React.ReactNode {
  return (
    <Badge asChild variant={'caption'} className={cn('pr-1 pl-0.5')}>
      <a href={href}>
        <MediaAvatar media={image} className="mr-1" size="sm" title={title} />
        <span className="">{title}</span>
      </a>
    </Badge>
  )
}
