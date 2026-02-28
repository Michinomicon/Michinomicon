'use client'

import React, { useState, forwardRef, Ref, useMemo, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import HTMLFlipBook from 'react-pageflip'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { OnDocumentLoadSuccess } from 'react-pdf/dist/esm/shared/types.js'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PageWrapper = forwardRef(
  ({ pageNumber, width }: { pageNumber: number; width: number }, ref: Ref<HTMLDivElement>) => {
    // Determine if the page is on the left or right side of the spine
    const isRightPage = pageNumber % 2 !== 0
    const isCover = pageNumber === 1

    let pageClass = 'flipbook-page '
    if (isCover) pageClass += 'page-cover page-right'
    else if (isRightPage) pageClass += 'page-right'
    else pageClass += 'page-left'

    return (
      <div
        ref={ref}
        className={`bg-white shadow-md border border-gray-200 ${pageClass}`}
        style={{ width: `${width}px`, height: '100%' }}
      >
        {/* The overlay that creates the curved shadow effect over the PDF */}
        <div className="spine-shadow" />

        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          width={width} // width of a single page
          className="bg-transparent" // remove defailt white background used by react-pdf
        />
      </div>
    )
  },
)

PageWrapper.displayName = 'FlipbookPage'

type SafePdfProps = {
  url: string
}

export const PdfMedia: React.FC<SafePdfProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageWidth, setPageWidth] = useState<number>(400)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const file = useMemo(() => ({ url }), [url])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }

    if (isFullscreen) {
      // Lock background scrolling and add Esc listener
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      // Restore background scrolling
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        const maxPageWidth = isFullscreen ? window.innerWidth : 500

        // Calculate the width of a single page.
        // We subtract 40px to leave a little breathing room around the book.
        // Divide by 2 because the book shows two pages side-by-side.
        // Cap the max width at 500px so it doesn't get comically large on big monitors.
        const calculatedWidth = Math.min((containerWidth - 6) / 2, maxPageWidth)
        const finalPageWidth = Math.max(calculatedWidth, 280)
        // set min page width as 280px for mobile
        setPageWidth(finalPageWidth)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [isFullscreen])

  const onDocumentLoadSuccess: OnDocumentLoadSuccess = (document) => {
    const { numPages } = document
    setNumPages(numPages)
  }

  const pageHeight = pageWidth * 1.414 // A4 aspect ratio

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-[100] bg-neutral-900/95 flex flex-col justify-center items-center p-4 md:p-10 backdrop-blur-sm transition-all duration-300'
    : 'relative w-full max-w-5xl mx-auto flex flex-col justify-center items-center py-10 overflow-hidden transition-all duration-300'

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Full Screen Toggle Button */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className={`absolute z-10 p-2 rounded-md transition-colors ${
          isFullscreen
            ? 'top-4 right-4 bg-white/10 text-white hover:bg-white/20'
            : 'top-2 right-2 bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        aria-label={isFullscreen ? 'Close fullscreen' : 'Open fullscreen'}
      >
        {isFullscreen ? (
          // Collapse Icon (Simple SVG)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          // Expand Icon (Simple SVG)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        )}
      </button>

      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {numPages && (
          <HTMLFlipBook
            //=== RESPONSIVE DIMENSIONS ===
            width={pageWidth} // Dynamic width per page
            height={pageHeight} // Dynamic height per page
            size="stretch" // Tells react-pageflip to allow scaling
            minWidth={280}
            maxWidth={window.innerWidth}
            minHeight={395}
            maxHeight={window.innerHeight}
            showCover={true}
            usePortrait={false}
            //=== FIXED DIMENSIONS ===
            // width={400}
            // height={566} // Standard A4 ratio
            // size="fixed"
            // minWidth={300}
            // maxWidth={800}
            // minHeight={400}
            // maxHeight={1132}
            // showCover={true}
            // usePortrait={false}
            className="flipbook mt-4"
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={200}
            startZIndex={0}
            autoSize={true}
            maxShadowOpacity={0.5}
            mobileScrollSupport={false}
            clickEventForward={false}
            useMouseEvents={true}
            swipeDistance={0}
            showPageCorners={false}
            disableFlipByClick={false}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <PageWrapper key={`page_${index + 1}`} pageNumber={index + 1} width={pageWidth} />
            ))}
          </HTMLFlipBook>
        )}
      </Document>
    </div>
  )
}
