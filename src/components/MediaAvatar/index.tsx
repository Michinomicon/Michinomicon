import { getMediaDisplayImageSources } from '@/utilities/getMediaDisplayImageSource'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Media } from '@/payload-types'
import React from 'react'
import { isMedia } from '@/utilities/isMedia'
import { cn } from '@/utilities/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export function MediaAvatar({
  media,
  title,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Avatar> & {
  media?: Media | string | null | undefined
  title?: string
}) {
  if (isMedia(media)) {
    const { title: mediaTitle } = media
    const { thumbnail } = getMediaDisplayImageSources(media)
    const altText = title ?? mediaTitle
    const fallback = altText.slice(0, 3).toUpperCase()
    return (
      <Tooltip delayDuration={600}>
        <TooltipTrigger asChild className={cn(className)} {...props}>
          <Avatar className={cn(className)} {...props}>
            <AvatarImage src={thumbnail} alt={altText} className="" />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>{altText}</TooltipContent>
      </Tooltip>
    )
  }
}
