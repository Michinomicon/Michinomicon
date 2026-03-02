'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'flipbook-js/style.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import {
  OnDocumentLoadProgress,
  OnDocumentLoadSuccess,
  OnLoadProgressArgs,
} from 'react-pdf/dist/esm/shared/types.js'
import FlipBook from 'flipbook-js'
import { PDFDocumentProxy } from 'pdfjs-dist'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Expand, Shrink } from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const fullScreenContainerClasses = `absolute h-[90vw] w-[90vw] ml-[5vw] mt-[10vw] m-auto inset-0 z-9999 bg-neutral-900/95 flex flex-col justify-center items-center p-4 md:p-10 backdrop-blur-sm transition-all duration-300`
const defaultContainerClasses = `relative` //`relative w-full h-full max-w-full mx-auto flex flex-col justify-center items-center py-10 overflow-hidden transition-all duration-300`

type SafePdfProps = {
  url: string
}

export const PdfMedia: React.FC<SafePdfProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [renderedPages, setRenderedPages] = useState(0)
  const flipBookInstance = useRef<FlipBook>(null)
  const [pageWidth, setPageWidth] = useState<number>(400)
  const [pageHeight] = useState<number>(() => pageWidth * 1.4142)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const documentDivRef = useRef<HTMLDivElement>(null)
  const documentProxyRef = useRef<PDFDocumentProxy>(null)
  const [activePages, setActivePages] = useState<number[]>([])

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
      const containerRect = container.getBoundingClientRect()
      console.log(`container resize observer:`, {
        DOMRect: containerRect,
        entries: entries,
      })

      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        const maxPageWidth = isFullscreen ? window.innerWidth : 500
        const calculatedWidth = Math.min((containerWidth - 6) / 2, maxPageWidth)
        const finalPageWidth = Math.max(calculatedWidth, 280) // set min page width as 280px for mobile
        setPageWidth(finalPageWidth)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [isFullscreen])

  // Document Event Handlers
  const onDocumentLoadSuccess: OnDocumentLoadSuccess = (document: PDFDocumentProxy) => {
    documentProxyRef.current = document
    const { numPages } = documentProxyRef.current
    console.log(`onDocumentLoadSuccess: `, numPages, document)
    setNumPages(numPages)
    setCurrentPage(0)
    setRenderedPages(0)
  }

  const onPageRenderSuccess = () => {
    setRenderedPages((prevCount) => {
      return prevCount + 1
    })
  }

  const onPageTurn = (): void => {
    const activePages = flipBookInstance?.current?.getActivePages() ?? []
    setActivePages(activePages)
    console.log(`onPageTurn => activePages: ${activePages}`)
  }

  useEffect(() => {
    if (numPages !== null && renderedPages === numPages) {
      console.log(`All pages rendered: ${renderedPages} of ${numPages}`)
      // Initialize the vanilla JS plugin on our container ID
      flipBookInstance.current = new FlipBook('pdfFlipbookContainer', {
        nextButton: document.getElementById('flipbookNextButton'), // next button element
        previousButton: document.getElementById('flipbookPrevButton'), // previous button element
        canClose: true, // book can close on its cover
        arrowKeys: true, // can be navigated with arrow keys
        initialActivePage: 0, // index of initial page that is opened
        onPageTurn: onPageTurn, // callback after page is turned
        initialCall: true, // should the book page calls for attention
        width: '100%', // define width
        height: `${pageHeight}`, //'300px', // define height
      })
    }
  }, [activePages, currentPage, numPages, pageHeight, pageWidth, renderedPages])

  const onDocumentLoadProgress: OnDocumentLoadProgress = (
    _loadProgress: OnLoadProgressArgs,
  ): void => {
    // console.log(`onDocumentLoadProgress ${_loadProgress.loaded}/${_loadProgress.total}`)
  }
  const onDocumentLoadError = (_error: Error): void => {
    console.error(`PDF Document onLoadError:`, _error)
  }
  const onDocumentLoadedData = (args: false | PDFDocumentProxy | undefined): void => {
    console.log(`onDocumentLoadedData: `, args)
  }
  const onDocumentLoadedMetadata = (args: false | PDFDocumentProxy | undefined): void => {
    console.log(`onDocumentLoadedMetadata: `, args)
  }
  const onDocumentLoadStart = (args: false | PDFDocumentProxy | undefined): void => {
    console.log(`onDocumentLoadStart: `, args)
  }
  const onDocumentLoad = (args: false | PDFDocumentProxy | undefined): void => {
    console.log(`onDocumentLoad: `, args)
  }
  const onDocumentError = (args: false | PDFDocumentProxy | undefined): void => {
    console.log(`onDocumentError: `, args)
  }

  const containerClasses = isFullscreen ? fullScreenContainerClasses : defaultContainerClasses

  const getPageStateDescription = (activePages: number[], numPages: number | null) => {
    const leftActivePage = activePages.length >= 0 ? activePages[0] : null
    const rightActivePage = activePages.length >= 1 ? activePages[1] : null

    return (
      <span className="whitespace-nowrap">
        Page
        {`${activePages.length > 1 ? 's' : ''} ${leftActivePage ? `${Number(leftActivePage) + 1}` : 1} ${rightActivePage ? '| ' + `${Number(rightActivePage) + 1}` : ''} of ${numPages}`}
      </span>
    )
  }

  return (
    <div ref={containerRef} className={containerClasses}>
      <div id="pdfDocumentContainer" className="h-full">
        <Document
          inputRef={documentDivRef}
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadProgress={onDocumentLoadProgress}
          onLoadError={onDocumentLoadError}
          onLoadedData={onDocumentLoadedData}
          onLoadedMetadata={onDocumentLoadedMetadata}
          onLoadStart={onDocumentLoadStart}
          onLoad={onDocumentLoad}
          onError={onDocumentError}
          loading={
            numPages !== null &&
            renderedPages < numPages && (
              <p>
                Loading pages... {renderedPages} / {numPages}
              </p>
            )
          }
          noData={<p>No Data.</p>}
        >
          {numPages && (
            <div className="c-flipbook" id="pdfFlipbookContainer">
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className={`c-flipbook__page`}>
                  <Page
                    pageIndex={index}
                    pageNumber={index + 1}
                    onRenderSuccess={onPageRenderSuccess}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    error={<p>Failed to load the page.</p>}
                    loading={<p>Page loading...</p>}
                    noData={<p>No page data.</p>}
                    width={pageWidth}
                    height={pageHeight}
                    scale={1}
                    className="bg-transparent"
                  />
                </div>
              ))}
            </div>
          )}
        </Document>
      </div>

      <div className="absolute z-10 ml-[50%] mr-auto">
        <ButtonGroup orientation={'horizontal'}>
          <Button variant={'outline'} id="flipbookPrevButton" disabled={activePages[0] <= 0}>
            <ChevronLeft />
          </Button>

          <Button variant={'outline'}>{getPageStateDescription(activePages, numPages)}</Button>

          <Button
            variant={'outline'}
            id="flipbookNextButton"
            disabled={activePages[1] > 0 && activePages[1] === numPages}
          >
            <ChevronRight />
          </Button>

          <Button
            variant={'outline'}
            id="flipbook-full-screen"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? 'Close fullscreen' : 'Open fullscreen'}
          >
            {isFullscreen ? <Shrink /> : <Expand />}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
