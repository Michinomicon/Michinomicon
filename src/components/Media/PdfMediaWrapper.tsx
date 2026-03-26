'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type { PdfMediaProps } from './types'
import { Spinner } from '../ui/spinner'

const PdfMediaClient = dynamic<PdfMediaProps>(
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

export const PdfMediaWrapper: React.FC<PdfMediaProps> = (props) => {
  return <PdfMediaClient {...props} />
}
