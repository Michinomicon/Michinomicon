'use client'

import { useEffect } from 'react'
import { usePageTOC, type TOCItem } from '@/providers/PageTOC'

export const PageTOCEmitter = ({ toc }: { toc: TOCItem[] }) => {
  const { setTOCItems } = usePageTOC()

  useEffect(() => {
    setTOCItems(toc)
    console.debug(`PageTOCEmitter`, toc)
    return () => setTOCItems([])
  }, [toc, setTOCItems])

  return null // This component doesn't render anything visually
}
