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
import { ListChevronsDownUp, ListChevronsUpDown, User } from 'lucide-react'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '../ui/button'
import React from 'react'
import { StatusBadge } from '../StatusBadge'
import { getMediaFileExtension } from '@/utilities/getMediaFileType'
import { getFileMediaMetaData } from '@/utilities/getMediaMetaData'
import { MediaAvatar } from '../MediaAvatar'
import { AvatarGroup } from '../ui/avatar'

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
          <TableCell className={'p-0 text-center'}>
            <ImageGallery items={[media]} layout={'default'} thumbnailTooltip={false} />
          </TableCell>

          {/* Title */}
          <TableCell className={'text-wrap'}>{media.title}</TableCell>

          {/* Credits (Summary) */}
          <TableCell>
            <AvatarGroup>
              {credits.map(({ creator }, index) => (
                <MediaAvatar
                  key={index}
                  media={creator.profileImage}
                  size={'lg'}
                  title={creator.title}
                />
              ))}
            </AvatarGroup>
          </TableCell>

          {/* Toggle Details Credits */}
          <TableCell className="text-center">
            <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <Button variant={'ghost'} size="lg" className="ml-auto text-muted-foreground">
                    {isOpen ? (
                      <div className="flex flex-nowrap gap-2">
                        <span>Collapse</span>
                        <ListChevronsDownUp />
                      </div>
                    ) : (
                      <div className="flex flex-nowrap gap-2">
                        <span className="">Expand</span>

                        <ListChevronsUpDown />
                      </div>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent>{isOpen ? 'Collapse Credits' : 'Expand Credits'}</TooltipContent>
            </Tooltip>
          </TableCell>

          {/* link to file */}
          <TableCell className="text-center">
            <CMSLink
              url={media.url}
              newTab={false}
              size="lg"
              appearance="ghost"
              className=""
              tooltipContent={`${media.filename} ( ${getFileMediaMetaData(media).filesize} )`}
            >
              <pre className="font-semibold">{getMediaFileExtension(media)}</pre>
            </CMSLink>
          </TableCell>
        </TableRow>

        {/* (Initially hidden - Collapsible) Detailed Credits Table */}
        <CollapsibleContent asChild>
          <TableRow className={cn('')}>
            <TableCell colSpan={1} className="bg-card/10"></TableCell>
            <TableCell
              colSpan={4}
              className={cn('rounded-none bg-card/40 p-0', isOpen ? 'border-b' : '')}
            >
              <div className="w-full rounded-none border-l-2 border-primary/60 bg-card">
                <Table className="">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-auto w-fit" aria-label={'Creator Name'}></TableHead>
                      <TableHead className="h-auto text-center" aria-label={'Status'}></TableHead>
                      <TableHead className="h-auto w-full" aria-label={'Credits'}></TableHead>
                      <TableHead
                        className="h-auto min-w-16 text-center"
                        aria-label={'Profile'}
                      ></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credits.map(({ creator, roles }, index) => {
                      return (
                        <TableRow key={index}>
                          {/* Creator Title */}
                          <TableCell className="flex flex-row flex-nowrap items-center text-center">
                            <MediaAvatar
                              media={creator.profileImage}
                              size={'lg'}
                              title={creator.title}
                            />
                            <span className={'ml-2 text-lg'}>{creator.title}</span>
                          </TableCell>
                          {/* Status */}
                          <TableCell className="text-center">
                            <StatusBadge variant={'status'} status={creator.status}></StatusBadge>
                          </TableCell>

                          {/* Credits */}
                          <TableCell className="text-left text-lg">
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
                              size="lg"
                              className="text-lg"
                              tooltipContent={'Creator Page'}
                              url={`/creators/${creator.slug}`}
                            >
                              <User className="" size={32}></User>
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
          <TableHead className="w-fit min-w-16">Asset</TableHead>
          <TableHead className="w-auto max-w-50"></TableHead>
          <TableHead className="w-full">Credits</TableHead>
          <TableHead className="w-fit text-center"></TableHead>
          <TableHead className="w-fit min-w-16 text-center">File</TableHead>
        </TableRow>
      </TableHeader>

      <ProjectMediaTableContent data={data} />
    </Table>
  )
}
