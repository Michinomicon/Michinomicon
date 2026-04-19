'use client'

import React from 'react'
import LightGallery from 'lightgallery/react'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import lgVideo from 'lightgallery/plugins/video'

import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-video.css'

import { cn } from '@/utilities/ui'
import { ImageMedia } from '../Media/ImageMedia'
import { VideoMedia } from '../Media/VideoMedia'
import { isPayloadMedia } from '../Media/types'
import { getImageMediaMetaData, getVideoMediaMetaData } from '@/utilities/getMediaMetaData'
import { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

interface Props {
  items: Media[]
  className?: string
}

export const LightGalleryComponent: React.FC<Props> = ({ items, className }) => {
  
  
  
  return (
    <div className={cn('w-full', className)}>
      <LightGallery
        speed={500}
        width={'100%'}
        plugins={[lgThumbnail, lgZoom, lgVideo]}
        elementClassNames="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {items.map((item,index) => {
          
          if(!isPayloadMedia(item)){
            console.debug(`item was not valid media:`,item)
            return (
              <a
                key={index}
                href={''}
                className="block aspect-square relative overflow-hidden rounded-lg border border-primary/30 bg-card hover:opacity-80 transition-opacity cursor-pointer"
                data-lg-size="1280-720"
              >
                Media Missing
              </a>
            )
          }

          if(item.mimeType?.includes('image')){

              let src = getMediaUrl(item.url)

              if (typeof src === 'string' && src.startsWith('http')) {
                try {
                  const urlObj = new URL(src)
                  // If the URL matches localhost, strip it down to just the relative path
                  if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                    src = urlObj.pathname + urlObj.search
                  }
                } catch (_err) {
                  // Silently ignore invalid URLs
                }
              }

              const imageMetadata = getImageMediaMetaData(item);

              return (
                <a
                  key={index}
                  href={src}
                  className="block aspect-square relative overflow-hidden rounded-lg border border-primary/30 bg-card hover:opacity-80 transition-opacity cursor-pointer"
                  data-lg-size="1280-720"
                  data-src={src}
                >
                  <ImageMedia resource={item} src={src} metadata={imageMetadata} fill={true} imgClassName="object-cover"
    pictureClassName="relative block w-full h-full"/>
                </a>
              )

            } else if(item.mimeType?.includes('video')){

              const videoMetadata = getVideoMediaMetaData(item);
              console.debug(`${item.mimeType} gallery item:`,item);

              return (
                <a
                  key={index}
                  href={item.url || ''}
                  className="block aspect-square relative overflow-hidden rounded-lg border border-primary/30 bg-card hover:opacity-80 transition-opacity cursor-pointer"
                  data-lg-size="1280-720"
                  data-video={{source: [{src:item.url, type:item.mimeType}]} }
                >
                  <VideoMedia resource={item} metadata={videoMetadata}  />
                </a>
              )
          }
        })}
      </LightGallery>
    </div>
  )
}