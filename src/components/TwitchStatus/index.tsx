import { Badge } from '@/components/ui/badge'
import TwitchGlitchIcon from '@/public/TwitchGlitchPurple.png'
import Link from 'next/link'
import Image from 'next/image'
import { StreamTimer } from './StreamTimer'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function msToTime(duration: number): string {
  const seconds = parseInt(String((duration / 1000) % 60)),
    minutes = parseInt(String((duration / (1000 * 60)) % 60)),
    hours = parseInt(String((duration / (1000 * 60 * 60)) % 24))

  const hoursString = String(hours < 10 ? '0' + hours : hours)
  const minutesString = String(minutes < 10 ? '0' + minutes : minutes)
  const secondsString = String(seconds < 10 ? '0' + seconds : seconds)

  return hoursString + ':' + minutesString + ':' + secondsString
}

async function getTwitchToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: 'POST',
      next: { revalidate: 3600 },
    },
  )

  if (!res.ok) throw new Error('Failed to fetch Twitch token')
  const data = await res.json()
  return data.access_token
}

async function checkIsLive() {
  const username = process.env.TWITCH_STATUS_USERNAME

  if (!username) {
    console.error('TWITCH_STATUS_USERNAME environment variable is missing.')
    return false
  }

  try {
    const token = await getTwitchToken()
    const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) throw new Error('Failed to fetch stream status')
    const data = await res.json()
    if (data.data && data.data.length > 0) {
      const { game_name: gameName, started_at: startedAt, title, type } = data.data[0]
      const liveData = {
        gameName: String(gameName),
        startedAt: String(startedAt),
        title: String(title),
        live: type === 'live',
      }
      // console.debug(`Twitch API Data: `, liveData)
      return liveData
    } else {
      return false
    }
  } catch (error) {
    console.error('Error fetching Twitch status:', error)
    return false
  }
}

export default async function TwitchStatus() {
  const username = process.env.TWITCH_STATUS_USERNAME

  if (!username) {
    return (
      <div className="w-fit rounded-xl border border-destructive p-4 text-sm text-destructive">
        Error: Streamer username not configured.
      </div>
    )
  }

  const isLiveStatus = await checkIsLive()

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

        <Tooltip>
          <TooltipTrigger asChild>
            {isLiveStatus ? (
              <Badge
                variant="destructive"
                className="flex gap-1 rounded-[0.4rem] text-lg font-medium"
              >
                LIVE
              </Badge>
            ) : (
              <Badge variant="outline" className="capitalize">
                OFFLINE
              </Badge>
            )}
          </TooltipTrigger>
          <TooltipContent className="rounded-[0.4rem] border border-primary/40 bg-card p-0">
            {isLiveStatus && (
              <div className="grid w-full grid-cols-2 items-start">
                <div className="px-1 text-right text-xs font-medium text-card-foreground">
                  <StreamTimer startedAt={isLiveStatus.startedAt} />
                </div>
                <div className="px-1 text-left text-xs font-medium text-card-foreground">
                  {isLiveStatus.gameName}
                </div>
                <div className="col-span-2 px-1 text-xs font-medium text-card-foreground">
                  {isLiveStatus.title}
                </div>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
