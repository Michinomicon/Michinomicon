'use client'

import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerControlGroup,
  AudioPlayerPlay,
  AudioPlayerSeekBar,
  AudioPlayerSkipBack,
  AudioPlayerSkipForward,
  AudioPlayerTimeDisplay,
  AudioPlayerVolume,
} from '@/components/audio/player'
import { AudioQueue, AudioQueueRepeatMode, AudioQueueShuffle } from '@/components/audio/queue'
import { AudioTrackList } from '@/components/audio/track'

export function AudioPlayerComponent() {
  return (
    <AudioPlayer>
      <AudioTrackList
        showPlayPause={false}
        className="h-auto w-full rounded-sm border bg-muted/50 p-1"
      />
      <AudioPlayerControlBar variant="stacked">
        <AudioPlayerControlGroup>
          <AudioPlayerTimeDisplay />
          <AudioPlayerSeekBar />
          <AudioPlayerTimeDisplay remaining />
        </AudioPlayerControlGroup>
        <AudioPlayerControlGroup>
          <AudioPlayerControlGroup>
            <AudioPlayerSkipBack />
            <AudioPlayerPlay />
            <AudioPlayerSkipForward />
          </AudioPlayerControlGroup>
          <AudioQueueShuffle />
          <AudioQueueRepeatMode />
          <AudioPlayerVolume />
          <AudioQueue />
        </AudioPlayerControlGroup>
      </AudioPlayerControlBar>
    </AudioPlayer>
  )
}
