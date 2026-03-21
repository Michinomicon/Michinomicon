'use client'

import { useEffect } from 'react'
import MinimalAudioPlayer from './AudioMedia'
import { useAudioTracks } from '@/providers/Audio'

interface TrackLoaderProps {
  audioUrl: string
  audioTitle: string
  audioSrc?: string
}

export default function TrackLoader({ audioUrl, audioTitle, audioSrc }: TrackLoaderProps) {
  const { setAudioTracks } = useAudioTracks()

  useEffect(() => {
    if (audioUrl) {
      // Set the single track in the provider state
      setAudioTracks([
        {
          url: audioUrl,
          src: audioSrc,
          title: audioTitle,
        },
      ])
    }

    // Cleanup on unmount (optional: clears the player when leaving the page)
    return () => setAudioTracks([])
  }, [audioUrl, audioTitle, audioSrc, setAudioTracks])

  return <MinimalAudioPlayer />
}
