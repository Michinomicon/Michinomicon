'use client'

import { useState } from 'react'
import React from 'react'

export function StreamTimer({ startedAt }: { startedAt?: string | undefined }) {
  const [uptime, setUptime] = useState<string>('00:00:00')
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)

    const startTimestamp = startedAt ? new Date(startedAt).getTime() : null

    const updateTimer = () => {
      if (startTimestamp) {
        const now = Date.now()
        const diff = Math.max(0, now - startTimestamp)
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setUptime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        )
      }
    }

    // Run immediately to set initial time, then start the interval
    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [startedAt])

  if (!mounted) {
    return <span>--:--:--</span>
  }

  return <span>{uptime}</span>
}
