import { AvatarGroup } from '../ui/avatar'
import { MediaAvatar } from '../MediaAvatar'
import { cn } from '@/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardContentProps,
  HoverCardTrigger,
} from '../ui/hover-card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '../ui/item'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import { ProjectCredit } from '@/utilities/extractMediaCreditsByProjectId'

export function CreatorAvatarGroup({
  credits,
  hoverCardProps,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarGroup> & {
  credits?: ProjectCredit[] | null | undefined
  hoverCardProps?: HoverCardContentProps
}): React.ReactNode {
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <AvatarGroup {...props} className={cn('')}>
          {credits?.map(({ creator }, index) => {
            return (
              <MediaAvatar
                key={index}
                media={creator.profileImage}
                size={'lg'}
                title={creator.title}
                disableTooltip={true}
              />
            )
          })}
        </AvatarGroup>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        {...hoverCardProps}
        className="mx-8 border border-border/30 p-2 select-none"
      >
        <ItemGroup className="max-w-sm gap-1">
          {credits?.map(({ creator, roles }, index) => {
            return (
              <Item size="sm" variant="muted" className="w-full py-1" key={index} asChild>
                <Link
                  href={`/creators/${creator.slug}`}
                  className="hover:[&_.creator-title]:underline hover:[&_.lucide]:opacity-100"
                >
                  <ItemMedia>
                    <MediaAvatar
                      media={creator.profileImage}
                      size={'default'}
                      title={creator.title}
                    />
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle className="creator-title">{creator.title}</ItemTitle>
                    <ItemDescription className={'font-stretch-condensed'}>
                      {roles.join(', ')}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ExternalLinkIcon className="size-4 opacity-0" />
                  </ItemActions>
                </Link>
              </Item>
            )
          })}
        </ItemGroup>
      </HoverCardContent>
    </HoverCard>
  )
}
