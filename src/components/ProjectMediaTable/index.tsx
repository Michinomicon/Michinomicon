'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProjectMediaCreators } from '@/utilities/extractMediaCreditsByProjectId'
import { Fragment } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { cn } from '@/lib/utils'
import { CMSLink } from '../Link'
import { ImageGallery } from '../ImageGallery'
import {
  FileImage,
  ListChevronsDownUp,
  ListChevronsUpDown,
  SquareArrowRightEnter,
} from 'lucide-react'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '../ui/button'
import { isMedia } from '@/utilities/isMedia'
import { Badge, isBadgeStatus } from '../ui/badge'
import React from 'react'

export function ProjectMediaTableBody({
  data,
}: React.ComponentPropsWithoutRef<typeof TableBody> & { data?: ProjectMediaCreators[] }) {
  const [isOpen, setOpen] = React.useState(false)
  if (!data || data.length <= 0) return
  const { media, credits } = data[0]

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen} asChild>
      <TableBody className={cn(isOpen ? 'bg-primary/10' : '', 'rounded-none')}>
        {/* (Always Visible)Media Summary Row */}
        <TableRow>
          {/* Asset */}
          <TableCell className={'p-0'}>
            <ImageGallery items={[media]} inlineGallery={false} />
          </TableCell>

          {/* Type */}
          <TableCell>{media.mimeType}</TableCell>

          {/* Title */}
          <TableCell>{media.title}</TableCell>

          {/* Credits (Summary) */}
          <TableCell>{credits.map(({ creator }) => creator.title).join(', ')}</TableCell>

          {/* Toggle Details Credits */}
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
              <TooltipContent>{isOpen ? 'Collapse Credits' : 'Show Credits'}</TooltipContent>
            </Tooltip>
          </TableCell>

          {/* link to file */}
          <TableCell className="text-center">
            <CMSLink
              url={media.url}
              newTab={true}
              size="icon"
              appearance="ghost"
              className="rounded-full"
              tooltipContent={'Open this item in a new tab.'}
            >
              <FileImage className="size-4" />
            </CMSLink>
          </TableCell>
        </TableRow>

        {/* (Initially hidden - Collapsible) Detailed Credits Table */}
        <CollapsibleContent asChild>
          <TableRow className={cn('')}>
            <TableCell
              colSpan={7}
              className={cn('rounded-none bg-card/40 p-0 pl-32', isOpen ? 'border-b' : '')}
            >
              <div className="w-full rounded-none border-l-2 border-primary/60 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead colSpan={2}>Creator</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-full">Credits</TableHead>
                      <TableHead className="w-fit text-center">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credits.map(({ creator, roles }, index) => {
                      return (
                        <TableRow key={index}>
                          {/* Creator Profile Picture */}
                          <TableCell className={'p-0'}>
                            {isMedia(creator.profileImage) && (
                              <ImageGallery items={[creator.profileImage]} inlineGallery={false} />
                            )}
                          </TableCell>
                          {/* Creator Title */}
                          <TableCell>{creator.title}</TableCell>
                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant={'status'}
                              status={isBadgeStatus(creator.status) ? creator.status : null}
                            >
                              <span className="font-bold uppercase">{creator.status}</span>
                            </Badge>
                          </TableCell>

                          {/* Credits */}
                          <TableCell>
                            {roles.map((role, index) => {
                              const isLast = index === credits.length - 1
                              return (
                                <Fragment key={index}>
                                  {role}
                                  {!isLast && <Fragment>, &nbsp;</Fragment>}
                                </Fragment>
                              )
                            })}
                          </TableCell>

                          <TableCell className="text-center">
                            <CMSLink
                              appearance="ghost"
                              size="icon"
                              className="rounded-full"
                              tooltipContent={'Go to this projects homepage'}
                              url={`/creators/${creator.slug}`}
                            >
                              <SquareArrowRightEnter className="size-4" />
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

export function ProjectMediaTableContent({
  data,
  ...props
}: React.ComponentPropsWithoutRef<typeof TableBody> & { data?: ProjectMediaCreators[] }) {
  if (!data || data.length <= 0) {
    return (
      <TableBody {...props}>
        <TableRow>
          <TableCell colSpan={4}>No available results.</TableCell>
        </TableRow>
      </TableBody>
    )
  }

  const dataGroupedByMedia: Partial<Record<string, ProjectMediaCreators[]>> = Object.groupBy(
    data,
    ({ media }) => media.id,
  )

  return Object.entries(dataGroupedByMedia).map(([mediaId, creditedCreators]) => (
    <ProjectMediaTableBody key={mediaId} data={creditedCreators} {...props} />
  ))
}

export function ProjectMediaTable({
  data,
  ...props
}: React.ComponentPropsWithoutRef<typeof Table> & { data?: ProjectMediaCreators[] }) {
  return (
    <Table {...props}>
      <TableHeader className="bg-primary/5">
        <TableRow>
          <TableHead className="w-fit">Asset</TableHead>
          <TableHead className="w-fit">Type</TableHead>
          <TableHead className="w-auto">Title</TableHead>
          <TableHead className="w-full">Credits</TableHead>
          <TableHead className="w-fit text-center">Details</TableHead>
          <TableHead className="w-fit text-center">File</TableHead>
        </TableRow>
      </TableHeader>

      <ProjectMediaTableContent data={data} />
    </Table>
  )
}
