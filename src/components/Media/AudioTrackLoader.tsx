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
      console.debug(`TrackLoader set the audio track:`, { track: track })
      setAudioTracks([track])
    }

    return () => {
      // Cleanup on unmount
      setAudioTracks([])
    }

    /**  
      To avoid excessesive renders only url is added
      since url is unique and track specific 
      if url changes, the audio track must have changed.
    */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, setAudioTracks])

  return <AudioPlayerComponent />
}
