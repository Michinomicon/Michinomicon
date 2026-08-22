import { getMediaDisplayImageSources } from '@/utilities/getMediaDisplayImageSource'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Media } from '@/payload-types'
import React from 'react'
import { cn } from '@/utilities/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export function MediaAvatar({
  media,
  title = '',
  disableTooltip = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Avatar> & {
  disableTooltip?: boolean
  media?: Media | string | null | undefined
}) {
  const { thumbnail } = media ? getMediaDisplayImageSources(media) : { thumbnail: undefined }
  const fallback = title.slice(0, 2)

  const avatar = (
    <Avatar className={cn(className)} {...props}>
      <AvatarImage src={thumbnail} alt={title} className="" />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )

  if (disableTooltip) {
    return avatar
  } else {
    return (
      <Tooltip delayDuration={600}>
        <TooltipTrigger asChild className={cn(className)} {...props}>
          {avatar}
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    )
  }
}
