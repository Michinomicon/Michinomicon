'use client'

import { useEffect, useState } from 'react'
import { useAllFormFields, useField } from '@payloadcms/ui'

type YouTubeMetaData = {
  title?: string
  author_name?: string
  author_url?: string
  type?: string
  height?: string | number
  width?: string | number
  version?: string
  provider_name?: string
  provider_url?: string
  thumbnail_height?: string | number
  thumbnail_width?: string | number
  thumbnail_url?: string
  html?: string
}

const processYouTubeVideoUrl = (youtubeUrl: string) => {
  const ytRegex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i
  const match = youtubeUrl.match(ytRegex)
  if (match && match[1]) {
    const [youtubeUrl, videoId] = match
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    return {
      videoUrl: youtubeUrl,
      thumbnailUrl: thumbnailUrl,
      id: videoId,
    }
  }
  return null
}

export default function MediaUploadYoutubeRemoteURListener() {
  const { setValue: setYoutubeUrl } = useField<string>({ path: 'youtubeUrl' })
  const { setValue: setYoutubeId } = useField<string>({ path: 'youtubeId' })
  const { setValue: setMediaTitle } = useField<string>({ path: 'title' })
  const { setValue: setAlt } = useField<string>({ path: 'alt' })
  const { setValue: setYoutubeThumbnailUrl } = useField<string>({ path: 'youtubeThumbnailUrl' })

  const [, dispatchFields] = useAllFormFields()

  const [_isFetching, setIsFetching] = useState(false)
  const [_error, setError] = useState('')

  const fetchYouTubeMetadata = async (youtubeUrl: string) => {
    setIsFetching(true)
    setError('')

    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`,
      )

      if (!response.ok) {
        throw new Error('Video not found or invalid URL')
      }

      const metaData = await (response.json() as Promise<YouTubeMetaData>)
      return metaData
    } catch (err) {
      setError('Could not fetch video metadata.' + JSON.stringify(err))
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    const handlePaste = (clipboardEvent: ClipboardEvent) => {
      const { target: inputTarget, clipboardData: inputDataTransfer } = clipboardEvent

      const dataTransferText: string | undefined = inputDataTransfer?.getData('text/plain')

      if (
        !(inputTarget as HTMLInputElement).classList.contains(`file-field__remote-file`) ||
        !dataTransferText
      ) {
        return
      }

      const verified = processYouTubeVideoUrl(dataTransferText)

      if (!verified) {
        return
      }

      clipboardEvent.preventDefault()
      clipboardEvent.stopPropagation()

      const { videoUrl, thumbnailUrl, id } = verified

      setYoutubeId(id)
      setYoutubeUrl(videoUrl)
      setYoutubeThumbnailUrl(thumbnailUrl)

      fetchYouTubeMetadata(videoUrl).then((metaData) => {
        if (metaData) {
          const { title } = metaData
          if (title) {
            setMediaTitle(title)
            setAlt(title)
          }
        }
      })
    }

    document.addEventListener('paste', handlePaste, true)

    return () => {
      document.removeEventListener('paste', handlePaste, true)
    }
  }, [dispatchFields, setAlt, setMediaTitle, setYoutubeId, setYoutubeThumbnailUrl, setYoutubeUrl])

  return null
}
