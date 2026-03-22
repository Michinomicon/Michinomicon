'use client'

import { useEffect } from 'react'
import { AudioPlayerComponent } from './AudioMedia'
import { useAudioTracks } from '@/providers/Audio'
import { Track } from '@/lib/html-audio'

export default function TrackLoader({
  id,
  url,
  title,
  artist,
  artwork,
  images,
  duration,
  album,
  genre,
  live,
}: Track) {
  console.debug(`TrackLoader => track:`, {
    id,
    url,
    title,
    artist,
    artwork,
    images,
    duration,
    album,
    genre,
    live,
  })

  const { setAudioTracks } = useAudioTracks()

  useEffect(() => {
    if (url) {
      const track: Track = {
        id,
        url,
        title,
        artist,
        artwork,
        images,
        duration,
        album,
        genre,
        live,
      }
      console.debug(`TrackLoader => setAudioTracks => track:`, track)
      setAudioTracks([track])
    }

    return () => {
      // Cleanup on unmount
      setAudioTracks([])
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, setAudioTracks])

  return <AudioPlayerComponent />
}
