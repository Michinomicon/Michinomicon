'use client'

import { useEffect } from 'react'
import { usePageAnchors, type PageAnchor } from '@/providers/PageAnchors'

export const PageAnchorEmitter = ({ anchors }: { anchors: PageAnchor[] }) => {
  const { setAnchors } = usePageAnchors()

  useEffect(() => {
    setAnchors(anchors)
    return () => setAnchors([])
  }, [anchors, setAnchors])

  return null // This component doesn't render anything visually
}
