'use client'
import { AudioProvider } from '@/components/audio/provider'
import { Track } from '@/lib/html-audio'
import { createContext, useContext, useState } from 'react'

export const AudioTrackContext = createContext<{
  setAudioTracks: (tracks: Track[]) => void
}>({
  setAudioTracks: () => {},
})

export const AudioTrackProvider = ({ children }: { children: React.ReactNode }) => {
  const [audioTracks, setAudioTracks] = useState<Track[]>([])

  return (
    <AudioTrackContext.Provider value={{ setAudioTracks }}>
      <AudioProvider tracks={audioTracks}>{children}</AudioProvider>
    </AudioTrackContext.Provider>
  )
}

export const useAudioTracks = () => useContext(AudioTrackContext)
