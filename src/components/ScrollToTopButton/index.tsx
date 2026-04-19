'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronsUp } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

const ScrollToTopButton = (props: React.ComponentPropsWithoutRef<typeof Button>) => {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [_document, setDocumentObject] = React.useState<Document>()
  const [_window, setWindowObject] = React.useState<Window>()

  React.useEffect(() => {
    setMounted(true)
    setDocumentObject(document)
    setWindowObject(window)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    if (!_document) return

    const toggleVisible = () => {
      const mainContent: HTMLElement | null = _document.getElementById('#mainContent')
      const scrolled = mainContent?.scrollTop ?? 300
      if (scrolled >= 300) {
        setVisible(true)
      } else if (scrolled < 300) {
        setVisible(false)
      }
    }

    setDocumentObject(document)
    setWindowObject(window)
    window.addEventListener('scroll', toggleVisible)
    return () => {
      window.removeEventListener('scroll', toggleVisible)
    }
  }, [_document, mounted])

  const scrollToTop = () => {
    if (!_window) {
      return
    }
    _window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!mounted) {
    return <></>
  }

  return (
    <>
      {visible && (
        <Button
          style={{ opacity: visible ? 100 : 0 }}
          size={'lg'}
          variant={'outline'}
          onClick={scrollToTop}
          className={cn('group transition-all', props.className)}
          {...props}
        >
          <div className="pointer-events-none flex flex-col flex-nowrap items-center gap-0.5">
            <ChevronsUp className="absolute size-6 -translate-y-3 transition-all ease-in group-hover:size-8 group-hover:-translate-y-6 group-hover:stroke-2" />
            <span className="transition-all ease-in group-hover:translate-y-2 group-hover:font-semibold">
              Scroll to Top
            </span>
          </div>
        </Button>
      )}
    </>
  )
}

export default ScrollToTopButton
