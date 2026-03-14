'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type { Props } from './types'
import { Media } from '@/payload-types'
import { Spinner } from '../ui/spinner'

const PdfMediaClient = dynamic<Media>(
  () =>
    import('./PdfMedia').then((mod) => {
      return mod.PdfMedia
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center py-6 h-full w-full">
        <Spinner className="size-8" />
      </div>
    ),
  },
)

export const PdfMediaWrapper: React.FC<Props> = (props) => {
  const { resource } = props
  if (resource && typeof resource === 'object') {
    return <PdfMediaClient {...resource} />
  }

  return null
}
