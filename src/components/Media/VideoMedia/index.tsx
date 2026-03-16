'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useMemo, useRef } from 'react'

import type { VideoMediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<VideoMediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

  const fileUrl = useMemo(() => {
    if (resource && typeof resource === 'object') {
      return resource.url
    }
  }, [resource])

  const videoRef = useRef<HTMLVideoElement>(null)
  // const [showFallback] = useState<boolean>()

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      })
    }
  }, [])

  if (resource && typeof resource === 'object') {
    const { updatedAt } = resource
    const videoSrc = fileUrl || getMediaUrl(fileUrl, updatedAt)

    return (
      <video
        autoPlay={false}
        className={cn(videoClassName)}
        controls={true}
        loop={false}
        muted={true}
        onClick={onClick}
        playsInline
        ref={videoRef}
      >
        <source src={videoSrc} />
      </video>
    )
  }

  return null
}
