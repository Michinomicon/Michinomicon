import React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Badge } from '../ui/badge'
import { Info } from 'lucide-react'
import { MediaCaption } from '../MediaCaption'
import { MediaInfo } from '@/utilities/mediaInfo'

export function MediaTooltip({
  info,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'> & { info: MediaInfo }): React.ReactNode {
  const [tooltipOpen, setTooltipOpen] = React.useState<boolean>(false)
  const onTooltipOpenChange = (isOpen: boolean) => {
    setTooltipOpen(isOpen)
  }
  return (
    <Tooltip onOpenChange={onTooltipOpenChange} delayDuration={600}>
      <TooltipTrigger asChild className={cn(className)} {...props}>
        <Badge
          variant={'caption'}
          className={cn(
            'absolute top-1 right-1 z-10 h-6 transition-transform delay-10 duration-590',
            tooltipOpen === true ? '' : 'opacity-50',
          )}
        >
          <Info className="inline-start" />
          <span className={cn(tooltipOpen === true ? '' : 'hidden')}>Details</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <MediaCaption id={props.id} className="lg-caption-tooltip" info={info} />
      </TooltipContent>
    </Tooltip>
  )
}
