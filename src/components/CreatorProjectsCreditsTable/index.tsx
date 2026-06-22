'use client'
import { ProjectMediaCredit } from '@/utilities/extractMediaCreditsByCreatorId'
import {
  ExternalLinkIcon,
  ListChevronsDownUp,
  ListChevronsUpDown,
  SquareArrowRightEnter,
} from 'lucide-react'
import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CMSLink } from '@/components/Link'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import { ProjectStatusBadge } from '@/components/ProjectStatusBadge'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Item, ItemMedia } from '../ui/item'
import { formatDateTime } from '@/utilities/formatDateTime'
import { cn } from '@/lib/utils'

export function CreatorProjectsCreditsTableBody({
  data,
}: React.ComponentPropsWithoutRef<typeof TableBody> & { data?: ProjectMediaCredit[] }) {
  const [isOpen, setOpen] = useState(false)
  if (!data || data.length <= 0) return
  const { project } = data[0]

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen} asChild>
      <TableBody className={cn(isOpen ? 'bg-primary/10' : '', 'rounded-none')}>
        {/* (Always Visible) Project Credits Summary Row */}
        <TableRow>
          <TableCell>{project.title}</TableCell>
          <TableCell className="text-center">
            <ProjectStatusBadge project={project} />
          </TableCell>

          <TableCell>{project.startDate ? formatDateTime(project.startDate) : '---'}</TableCell>
          <TableCell>{project.endDate ? formatDateTime(project.endDate) : '---'}</TableCell>
          <TableCell className="">
            <div className="flex w-full items-center">
              <div className="text-ellipsis">
                {data.flatMap((credit) => credit.roles).join(', ')}
              </div>
            </div>
          </TableCell>
          <TableCell className="text-center">
            <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <Button variant={isOpen ? 'default' : 'ghost'} size="sm" className="ml-auto">
                    {isOpen ? (
                      <div className="flex flex-nowrap gap-2">
                        <span>Collapse</span> <ListChevronsUpDown />
                      </div>
                    ) : (
                      <div className="flex flex-nowrap gap-2">
                        <span>Show</span>
                        <ListChevronsDownUp />
                      </div>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent>
                {isOpen ? 'Collapse Project Details' : 'Show Project Details'}
              </TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell className="text-center">
            <CMSLink
              appearance="ghost"
              size="icon"
              className="rounded-full"
              tooltipContent={'Go to this projects homepage'}
              {...project.homepage}
            >
              <SquareArrowRightEnter className="size-4" />
            </CMSLink>
          </TableCell>
        </TableRow>

        {/* (Initially hidden - Collapsible) Itemized Project Credits Row */}
        <CollapsibleContent asChild>
          <TableRow className={cn('')}>
            <TableCell
              colSpan={7}
              className={cn('rounded-none bg-card/40 p-0 pl-32', isOpen ? 'border-b' : '')}
            >
              <div className="w-full rounded-none border-l-2 border-primary/60 bg-card">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead className="w-fit">Item</TableHead>
                      <TableHead className="w-auto">Title</TableHead>
                      <TableHead className="w-full">Credits</TableHead>
                      <TableHead className="w-fit text-center">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((credit, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <HoverCard openDelay={10} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <Item size={'sm'} className="flex-nowrap p-0">
                                  <ItemMedia variant="image">
                                    <Media
                                      imgClassName={'w-[32px] h-[32px]'}
                                      resource={credit.media}
                                      src={credit.media.thumbnailURL || ''}
                                    />
                                  </ItemMedia>
                                </Item>
                              </HoverCardTrigger>
                              <HoverCardContent className="flex h-64 w-64 flex-col gap-0.5">
                                <Media
                                  imgClassName={''}
                                  resource={credit.media}
                                  src={credit.media.thumbnailURL || ''}
                                />
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell>{credit.media.title}</TableCell>
                          <TableCell>{credit.roles.join(', ')}</TableCell>
                          <TableCell className="text-center">
                            <CMSLink
                              url={credit.media.url}
                              newTab={true}
                              size="icon"
                              appearance="ghost"
                              className="rounded-full"
                              tooltipContent={'Open this item in a new tab.'}
                            >
                              <ExternalLinkIcon className="size-4" />
                            </CMSLink>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </TableBody>
    </Collapsible>
  )
}

export function CreatorProjectsCreditsTableContent({
  data,
  ...props
}: React.ComponentPropsWithoutRef<typeof TableBody> & { data?: ProjectMediaCredit[] }) {
  if (!data || data.length <= 0) {
    return (
      <TableBody {...props}>
        <TableRow>
          <TableCell colSpan={4}>No available results.</TableCell>
        </TableRow>
      </TableBody>
    )
  }

  const dataGroupedByProject: Partial<Record<string, ProjectMediaCredit[]>> = Object.groupBy(
    data,
    ({ project }) => project.id,
  )

  return Object.entries(dataGroupedByProject).map(([projectId, creditData]) => (
    <CreatorProjectsCreditsTableBody key={projectId} data={creditData} {...props} />
  ))
}

export function CreatorProjectsCreditsTable({
  data,
  ...props
}: React.ComponentPropsWithoutRef<typeof Table> & { data?: ProjectMediaCredit[] }) {
  return (
    <Table {...props}>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="w-fit">Started</TableHead>
          <TableHead className="w-fit">Finished</TableHead>
          <TableHead className="w-full">Credits</TableHead>
          <TableHead className="w-fit text-center">Details</TableHead>
          <TableHead className="w-fit text-center">Homepage</TableHead>
        </TableRow>
      </TableHeader>
      <CreatorProjectsCreditsTableContent data={data} />
    </Table>
  )
}
