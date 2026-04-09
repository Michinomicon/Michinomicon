import { useState } from 'react'
import { Button } from '../ui/button'
import { ArrowUpToLine } from 'lucide-react'
import React from 'react'

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop
    if (scrolled > 300) {
      setVisible(true)
    } else if (scrolled <= 300) {
      setVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // "auto"
    })
  }

  window.addEventListener('scroll', toggleVisible)

  if (!mounted) {
    return <></>
  }

  return (
    <>
      {visible && (
        <Button
          className="sticky bottom-0"
          size={'default'}
          variant={'ghost'}
          onClick={scrollToTop}
        >
          <div className="flex flex-nowrap gap-6">
            <ArrowUpToLine /> Scroll to Top
          </div>
        </Button>
      )}
    </>
  )
}

export default ScrollToTopButton
