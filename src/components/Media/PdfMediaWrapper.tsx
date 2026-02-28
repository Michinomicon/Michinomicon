'use client'

import dynamic from 'next/dynamic'
import React from 'react'

type SafePdfProps = {
  url: string
}

const PdfMediaClient = dynamic<SafePdfProps>(
  () =>
    import('./PdfMedia').then((mod) => {
      return mod.PdfMedia
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center py-6 h-full">Loading PDF...</div>
    ),
  },
)

export const PdfMediaWrapper: React.FC<SafePdfProps> = ({ url }) => {
  return <PdfMediaClient url={url} />
}
