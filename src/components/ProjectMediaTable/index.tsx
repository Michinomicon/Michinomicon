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
import { Collapsible } from '../ui/collapsible'
import { cn } from '@/lib/utils'
import { CMSLink } from '../Link'
import { MediaGallery } from '../MediaGallery'
import { ExternalLink } from 'lucide-react'
import React from 'react'
import { getFileMediaMetaData } from '@/utilities/getMediaMetaData'
import { getMediaFileExtension } from '@/utilities/mediaInfo'
import { CreatorAvatarGroup } from '../CreatorAvatarGroup'

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
        <TableRow className={''}>
          {/* Asset */}
          <TableCell className={'p-0 text-center'}>
            <MediaGallery items={[media]} layout={'default'} thumbnailTooltip={false} />
          </TableCell>

          {/* Title */}
          <TableCell className={'text-wrap'}>{media.title}</TableCell>

          {/* Credits (Summary) */}
          <TableCell className={''}>
            <div className={'flex w-full items-center justify-start'}>
              <CreatorAvatarGroup credits={credits} />
            </div>
          </TableCell>

          {/* link to file */}
          <TableCell className="text-center">
            {media.youtubeId ? (
              <CMSLink
                url={`https://youtube.com/watch?v=${media.youtubeId}`}
                newTab={true}
                size="lg"
                appearance="ghost"
                className=""
                tooltipContent={`YouTube - ${media.title} ( opens in a new tab )`}
              >
                <pre className="font-semibold">Youtube</pre>
                <ExternalLink></ExternalLink>
              </CMSLink>
            ) : (
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
            )}
          </TableCell>
        </TableRow>
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
          <TableHead className="w-fit max-w-24 min-w-16">Asset</TableHead>
          <TableHead className="w-auto max-w-50">Title</TableHead>
          <TableHead className="w-fit">Credits</TableHead>
          <TableHead className="w-fit min-w-16 text-center"></TableHead>
        </TableRow>
      </TableHeader>

      <ProjectMediaTableContent data={data} />
    </Table>
  )
}
