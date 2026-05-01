import { NextResponse } from 'next/server'

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
    return { error: 'Streamer username not configured.', live: false, username: '' }
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
      return {
        gameName: String(gameName),
        startedAt: String(startedAt),
        title: String(title),
        live: type === 'live',
        username,
      }
    } else {
      return { live: false, username }
    }
  } catch (error) {
    console.error('Error fetching Twitch status:', error)
    return { live: false, username }
  }
}

export async function GET() {
  const status = await checkIsLive()

  if (status.error) {
    return NextResponse.json(status, { status: 500 })
  }

  return NextResponse.json(status)
}
