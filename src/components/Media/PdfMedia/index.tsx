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
  OnRenderSuccess,
  PageCallback,
} from 'react-pdf/dist/esm/shared/types.js'
import FlipBook, { FlipBookOptions } from 'flipbook-js'
import { PDFDocumentProxy } from 'pdfjs-dist'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Expand, Shrink } from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const fullScreenContainerClasses = `absolute h-[90vw] w-[90vw] ml-[5vw] mt-[10vw] m-auto inset-0 z-9999 bg-neutral-900/95 flex flex-col justify-center items-center p-4 md:p-10 backdrop-blur-sm transition-all duration-300`
const defaultContainerClasses = `relative w-full max-w-full max-h-full min-h-[50vh] flex flex-col justify-center items-center py-10 overflow-hidden transition-all duration-300`
// mx-auto

type SafePdfProps = {
  url: string
}

type ActivePageRange = { start: number | null; end: number | null }

export const PdfMedia: React.FC<SafePdfProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [renderedPages, setRenderedPages] = useState<number>(0)
  const [allPagesRendered, setAllPagesRendered] = useState<boolean>(false)
  const [isFileLoaded, setIsFileLoaded] = useState<boolean>(false)
  const [pageWidth, setPageWidth] = useState<number>(400)
  const [pageHeight] = useState<number>(() => pageWidth * 1.4142)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activePages, setActivePages] = useState<ActivePageRange>({ start: null, end: null })

  const containerRef = useRef<HTMLDivElement>(null)
  const documentDivRef = useRef<HTMLDivElement>(null)
  const documentProxyRef = useRef<PDFDocumentProxy>(null)
  const flipBookInstance = useRef<FlipBook>(null)

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

  useEffect(() => {
    const documentProxy = documentProxyRef.current
    if (!documentProxy) return

    console.log(`isFileLoaded: `, isFileLoaded)
    const { numPages } = documentProxy
    console.log(`Page Count: `, numPages)
    setNumPages(numPages)
    setActivePages({ start: 0, end: null })

    if (numPages !== null && numPages > 0 && renderedPages === numPages) {
      console.log(`All pages rendered: ${renderedPages} of ${numPages}`)
      setAllPagesRendered(true)
    }
    // setCurrentPage(1)
    // setRenderedPages(0)
  }, [isFileLoaded, renderedPages])

  // Document Event Handlers
  const onDocumentLoadSuccess: OnDocumentLoadSuccess = (document: PDFDocumentProxy) => {
    documentProxyRef.current = document
    console.log(`onDocumentLoadSuccess: `, document)
    setIsFileLoaded(true)
  }

  const onPageRenderSuccess: OnRenderSuccess = (page: PageCallback) => {
    setRenderedPages((prevCount) => {
      return prevCount + 1
    })
    console.log(`Rendered Page No. ${page._pageIndex}. ${renderedPages} of ${numPages}`, page)
  }

  // useEffect(() => {  },[]);

  useEffect(() => {
    if (allPagesRendered && isFileLoaded) {
      const onPageTurn = (): void => {
        const flipBook = flipBookInstance.current
        if (!flipBook) return

        const [pageRangeStart, pageRangeEnd] = flipBook.getActivePages() ?? [null, null]

        const pageRange = { start: pageRangeStart ?? null, end: pageRangeEnd ?? null }

        const onPageAfterLastPage = pageRange.start === null && pageRange.end === null

        setActivePages(pageRange)

        if (onPageAfterLastPage) {
          flipBook.turnPage(1)
        }
      }

      const options: Required<FlipBookOptions> = {
        nextButton: document.getElementById('flipbookNextButton'), // next button element
        previousButton: document.getElementById('flipbookPrevButton'), // previous button element
        canClose: true, // book can close on its cover
        arrowKeys: true, // can be navigated with arrow keys
        initialActivePage: 0, // index of initial page that is opened
        onPageTurn: onPageTurn, // callback after page is turned
        initialCall: true, // should the book page calls for attention
        width: '100%', // define width
        height: `${pageHeight}px`, //'300px', // define height
      }

      console.log(`FlipBookOptions:`, options)

      // Initialize the vanilla JS plugin on our container ID
      flipBookInstance.current = new FlipBook('pdfFlipbookContainer', options)
    }
  }, [allPagesRendered, isFileLoaded, pageHeight])

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

  const getPageStateDescription = (pageRange: ActivePageRange, numPages: number | null) => {
    const pageRangeStart = pageRange.start ? pageRange.start + 1 : 1
    const pageRangeEnd = pageRange.end ? ` | ${pageRange.end + 1}` : ''
    if (numPages && numPages >= 0) {
      return `Page${pageRange.end ? 's' : ''} ${pageRangeStart}${pageRangeEnd} of ${numPages ?? '--'}`
    } else {
      return `No Pages.`
    }
  }

  const containerClasses = isFullscreen ? fullScreenContainerClasses : defaultContainerClasses

  return (
    <div className={containerClasses} ref={containerRef}>
      <div className={`absolute z-10 w-full ml-0 mr-auto flex flex-row flex-nowrap justify-center`}>
        <ButtonGroup orientation={'horizontal'}>
          <Button variant={'outline'} id="flipbookPrevButton" disabled={activePages.start === 0}>
            <ChevronLeft />
          </Button>

          <Button variant={'outline'}>
            <span className="whitespace-nowrap w-40">
              {getPageStateDescription(activePages, numPages)}
            </span>
          </Button>

          <Button variant={'outline'} id="flipbookNextButton">
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

      <div id="pdfDocumentContainer" style={{ width: '100%', minHeight: pageHeight }}>
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
    </div>
  )
}
