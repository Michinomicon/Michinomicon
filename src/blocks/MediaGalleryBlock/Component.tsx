import React from 'react'
import { getPayload, PaginatedDocs } from 'payload'
import configPromise from '@payload-config'
import { cn } from '@/utilities/ui'
import type { Media, MediaGalleryBlock as MediaGalleryBlockProps } from '@/payload-types'
import LightBoxGallery, { LightBoxGalleryProps } from '@/components/Lightbox'
import { isPayloadMedia } from '@/components/Media/types'
import { getCachedCreatorsByMediaCredits } from '@/utilities/getCreatorsByMediaCredit'

type Props = MediaGalleryBlockProps & {
  className?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

export const MediaGalleryBlock: React.FC<Props> = async (props) => {
  const {
    selectionMethod,
    individualMedia,
    mediaCategory,
    className,
    enableGutter = true,
    ...otherProps
  } = props

  let galleryItems: Media[] = []

  if (selectionMethod === 'individual' && individualMedia) {
    galleryItems = individualMedia.map((row) => row.media).filter((media) => isPayloadMedia(media))
  }

  if (selectionMethod === 'category' && mediaCategory) {
    const categoryId = typeof mediaCategory === 'object' ? mediaCategory.id : mediaCategory

    const payload = await getPayload({ config: configPromise })

    const fetchedMedia: PaginatedDocs<Media> = await payload.find({
      collection: 'media',
      depth: 3,
      where: {
        category: {
          equals: categoryId,
        },
      },
      limit: 100,
    })

    galleryItems = fetchedMedia.docs
  }

  galleryItems = await populateMedia(galleryItems)

  if (galleryItems.length === 0) return null

  const lightBoxProps: LightBoxGalleryProps = {
    ...otherProps,
    items: galleryItems,
    display: otherProps.display || 'album',
    albumLayout: otherProps.albumLayout || 'masonry',
    carouselImageFit: otherProps.carouselImageFit || undefined,
    thumbnailsPosition:
      otherProps.thumbnailsPosition === null ? undefined : otherProps.thumbnailsPosition,
    thumbnailsShowToggle:
      otherProps.thumbnailsShowToggle === null ? undefined : otherProps.thumbnailsShowToggle,
  }

  return (
    <div
      className={cn(
        'media-gallery-block my-8 flex w-full flex-col',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      <LightBoxGallery className={'media-gallery-block'} {...lightBoxProps} />
    </div>
  )
}

async function populateMedia(allMedia: Media[]): Promise<Media[]> {
  for (const media of allMedia) {
    await populateMediaCredits(media)
    await populateMediaProject(media)
  }
  return allMedia
}

async function populateMediaCredits(media: Media): Promise<Media> {
  if (media.credits) {
    const mediaCreators = await getCachedCreatorsByMediaCredits(media.id)()
    for (const credit of media.credits) {
      const currentCreator = credit.creator
      const creatorId = typeof currentCreator === 'object' ? currentCreator.id : credit.creator
      const foundCreator = mediaCreators.find(({ id }) => id === creatorId)
      if (foundCreator) {
        credit.creator = foundCreator
      }
    }
  }

  return media
}

async function populateMediaProject(media: Media): Promise<Media> {
  const { isForProject, project: mediaProject } = media
  if (mediaProject && isForProject) {
    const projectId = typeof mediaProject === 'object' ? mediaProject.id : mediaProject
    const payload = await getPayload({ config: configPromise })
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 1,
    })
    media.project = project
  }
  return media
}
