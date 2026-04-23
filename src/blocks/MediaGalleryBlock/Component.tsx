import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cn } from '@/utilities/ui'
import type { Media, MediaGalleryBlock as MediaGalleryBlockProps } from '@/payload-types'
import { LightGalleryComponent } from '@/components/LightGallery'


type Props = MediaGalleryBlockProps & {
  className?: string
  enableGutter?: boolean
}

export const MediaGalleryBlock: React.FC<Props> = async (props) => {
  const { selectionMethod, individualMedia, mediaCategory, className, enableGutter = true } = props
  
  let galleryItems: Media[] = []

  if (selectionMethod === 'individual' && individualMedia) {
    galleryItems = individualMedia
      .map((row) => row.media)
      .filter((media) => typeof media === 'object' && media !== null)
  } 
  
  if (selectionMethod === 'category' && mediaCategory) {
    const categoryId = typeof mediaCategory === 'object' ? mediaCategory.id : mediaCategory

    const payload = await getPayload({ config: configPromise })
    
    const fetchedMedia = await payload.find({
      collection: 'media',
      where: {
        category: {
          equals: categoryId,
        },
      },
      limit: 100,
    })

    galleryItems = fetchedMedia.docs
  }

  if (galleryItems.length === 0) return null

  return (
    <div
      className={cn(
        'media-gallery-block min-w-160 my-8',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      <LightGalleryComponent items={galleryItems} />
    </div>
  )
}