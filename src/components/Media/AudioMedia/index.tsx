'use client'

import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerPlay,
  AudioPlayerVolume,
} from '@/components/audio/player'

export default function MinimalAudioPlayer() {
  return (
    <AudioPlayer>
      <AudioPlayerControlBar>
        <AudioPlayerPlay />
        <AudioPlayerVolume />
      </AudioPlayerControlBar>
    </AudioPlayer>
  )
}
