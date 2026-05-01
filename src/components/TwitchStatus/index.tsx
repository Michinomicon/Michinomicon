'use client'

import { Badge } from '@/components/ui/badge'
import TwitchGlitchIcon from '@/public/TwitchGlitchPurple.png'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { StreamTimer } from './StreamTimer'

type TwitchStatusData = {
  live: boolean
  username: string
  gameName?: string
  startedAt?: string
  title?: string
  error?: string
}

export default function TwitchStatus() {
  const [status, setStatus] = useState<TwitchStatusData | null>(null)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/twitch-status')
        const data = await res.json()

        if (!res.ok || data.error) {
          console.log('Failed to fetch status', { res: res, data: data })
          setError(data.error || 'Failed to fetch status')
          return
        }

        setStatus(data)
      } catch (err) {
        console.error('Error fetching Twitch status:', err)
      }
    }

    // Fetch on mount
    fetchStatus()
    // background polling 60 seconds (60000ms)
    const intervalId = setInterval(fetchStatus, 60000)
    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, [])

  // handle errors
  if (error) {
    return (
      <div className="flex w-fit items-center justify-center rounded-xl border border-destructive px-4 text-sm whitespace-nowrap text-destructive">
        Error: {error}
      </div>
    )
  }

  // blank/loading while initializing
  if (!status) {
    return (
      <div className="flex h-8 w-30 animate-pulse items-center justify-center rounded-xl bg-muted" />
    )
  }

  const { username, live, gameName, startedAt, title } = status

  const showTitle = false
  const showGameName = true
  const showLiveDuration = true

  return (
    <div className="flex flex-col items-center rounded-none">
      <div className="flex flex-row items-center gap-1">
        <Image
          src={TwitchGlitchIcon.src}
          alt="twitch logo"
          className="h-auto w-auto rounded-none"
          width="20"
          height="20"
          loading="eager"
        />
        <Link
          href={`https://twitch.tv/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[0.4rem] px-2 text-(--color-twitch-purple)!"
        >
          <div className="twitch-text font-medium text-foreground! capitalize no-underline">
            {username}
          </div>
        </Link>
        {live ? (
          <Tooltip delayDuration={800} disableHoverableContent={true}>
            <TooltipTrigger className="py-0" asChild>
              <Badge
                variant="destructive"
                className="flex h-fit gap-0 rounded-[0.4rem] px-1 py-0 text-lg font-medium"
              >
                LIVE
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <span className="font-semibold">
                {showLiveDuration && (
                  <span>
                    <StreamTimer startedAt={startedAt} />
                  </span>
                )}
                {showGameName && (
                  <span>
                    {' | '}
                    {gameName}
                  </span>
                )}
                {showTitle && (
                  <span>
                    {' | '}
                    {title}
                  </span>
                )}
              </span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Badge variant="outline" className="capitalize">
            OFFLINE
          </Badge>
        )}
      </div>
    </div>
  )
}
