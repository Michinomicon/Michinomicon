'use client'
import { ProjectMediaCredit } from '@/utilities/extractMediaCreditsByCreatorId'
import { FolderOpen, ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDateTime } from '@/utilities/formatDateTime'
import { cn } from '@/lib/utils'
import { ImageGallery } from '../ImageGallery'
import { StatusBadge } from '../StatusBadge'
import { getFileMediaMetaData } from '@/utilities/getMediaMetaData'
import { getMediaFileExtension } from '@/utilities/getMediaFileType'
import { isMedia } from '@/utilities/isMedia'

export function CreatorCreditsTableBody({
  data,
}: React.ComponentPropsWithoutRef<typeof TableBody> & { data?: ProjectMediaCredit[] }) {
  const [isOpen, setOpen] = useState(false)
  if (!data || data.length <= 0) return
  const { project } = data[0]
  const profileImage = isMedia(project.profileImage) ? project.profileImage : null

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen} asChild>
      <TableBody className={cn(isOpen ? 'bg-primary/10' : '', 'rounded-none')}>
        {/* (Always Visible) Project Credits Summary Row */}
        <TableRow>
          {/* Asset */}
          <TableCell className={'p-0 text-center'}>
            {profileImage && (
              <ImageGallery items={[profileImage]} layout={'default'} thumbnailTooltip={false} />
            )}
          </TableCell>
          <TableCell>{project.title}</TableCell>
          <TableCell className="text-center">
            <StatusBadge status={project.status} />
          </TableCell>

          <TableCell className="text-center">
            {project.startDate ? formatDateTime(project.startDate) : '---'}
          </TableCell>
          <TableCell className="text-center">
            {project.endDate ? formatDateTime(project.endDate) : '---'}
          </TableCell>
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
                  <Button variant={'ghost'} size="lg" className="ml-auto text-muted-foreground">
                    {isOpen ? (
                      <div className="flex flex-nowrap gap-2">
                        <span>Collapse</span>
                        <ListChevronsDownUp />
                      </div>
                    ) : (
                      <div className="flex flex-nowrap gap-2">
                        <span>Expand</span>
                        <ListChevronsUpDown />
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
              newTab={false}
              size="lg"
              appearance="ghost"
              className="lg"
              tooltipContent={'Project Page'}
              url={`/projects/${project.slug}`}
            >
              <FolderOpen size={32} />
            </CMSLink>
          </TableCell>
        </TableRow>

        {/* (Initially hidden - Collapsible) Itemized Project Credits Row */}
        <CollapsibleContent asChild>
          <TableRow className={cn('')}>
            <TableCell colSpan={2} className="bg-card/10"></TableCell>
            <TableCell
              colSpan={7}
              className={cn('rounded-none bg-card/40 p-0', isOpen ? 'border-b' : '')}
            >
              <div className="w-full rounded-none border-l-2 border-primary/60 bg-card">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead
                        className="h-auto w-fit min-w-16 p-0 text-left"
                        aria-label={'Asset'}
                      ></TableHead>
                      <TableHead className="h-auto w-auto" aria-label={'Title'}></TableHead>
                      <TableHead className="h-auto w-full" aria-label={'Credits'}></TableHead>
                      <TableHead
                        className="h-auto w-fit text-center"
                        aria-label={'File'}
                      ></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((credit, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className={'p-0'}>
                            <ImageGallery
                              items={[credit.media]}
                              layout={'default'}
                              thumbnailTooltip={false}
                            />
                          </TableCell>
                          <TableCell className="text-center text-lg">
                            {credit.media.title}
                          </TableCell>
                          <TableCell className="text-left text-lg">
                            {credit.roles.join(', ')}
                          </TableCell>
                          <TableCell className="text-center">
                            <CMSLink
                              url={credit.media.url}
                              newTab={false}
                              size="lg"
                              appearance="ghost"
                              className=""
                              tooltipContent={`${credit.media.filename} ( ${getFileMediaMetaData(credit.media).filesize} )`}
                            >
                              <pre className="font-semibold">
                                {getMediaFileExtension(credit.media)}
                              </pre>
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

export function CreatorCreditsTableContent({
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
    <CreatorCreditsTableBody key={projectId} data={creditData} {...props} />
  ))
}

export function CreatorCreditsTable({
  data,
  ...props
}: React.ComponentPropsWithoutRef<typeof Table> & { data: ProjectMediaCredit[] }) {
  return (
    <Table {...props}>
      <TableHeader className="bg-primary/5">
        <TableRow>
          <TableHead className="w-fit min-w-16" aria-label={'Project Picture'}>
            Project
          </TableHead>
          <TableHead aria-label={'Project Title'}></TableHead>
          <TableHead className="text-center" aria-label={'Status'}></TableHead>
          <TableHead className="w-fit text-center">Started</TableHead>
          <TableHead className="w-fit text-center">Finished</TableHead>
          <TableHead className="w-full">Credits</TableHead>
          <TableHead className="w-fit text-center"></TableHead>
          <TableHead className="w-fit text-center"></TableHead>
        </TableRow>
      </TableHeader>
      <CreatorCreditsTableContent data={data} />
    </Table>
  )
}
