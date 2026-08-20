import { Media } from '@/payload-types'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { AspectRatio } from '../ui/aspect-ratio'
import React from 'react'
import { ImageMedia } from '../Media/ImageMedia'

export function CollectionItemCardImage({
  className,
  linkRef,
  href,
  ratio = 1 / 1,
  image,
  ...props
}: {
  image: Media | null
  linkRef?: React.RefObject<HTMLAnchorElement | null>
  href?: string
  ratio?: number | undefined
} & React.ComponentPropsWithoutRef<'div'>): React.ReactNode {
  return (
    <div
      className={cn(
        className,
        'item-image-container flex h-full shrink-0 grow-0 flex-col flex-nowrap items-center justify-center overflow-clip',
      )}
      {...props}
    >
      <div className={cn('item-image-wrapper h-full w-full')}>
        <Link className="" href={href ?? ''} ref={linkRef}>
          <AspectRatio
            ratio={ratio}
            className={cn('flex w-full flex-col items-center justify-center overflow-clip')}
          >
            {image && (
              <React.Fragment>
                <ImageMedia
                  src={image}
                  objectFit={'cover'}
                  className={'scale-300 opacity-50 blur-xs'}
                ></ImageMedia>
                <div className="absolute inset-0 overflow-hidden rounded">
                  <ImageMedia
                    src={image}
                    className={'flex h-full w-full flex-col items-center justify-center'}
                    imgClassName={'rounded'}
                  ></ImageMedia>
                </div>
              </React.Fragment>
            )}
          </AspectRatio>
        </Link>
      </div>
    </div>
  )
}
