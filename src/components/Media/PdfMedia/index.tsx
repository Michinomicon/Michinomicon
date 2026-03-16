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
import { ChevronLeft, ChevronRight, X, FileText, ZoomIn, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Field } from '@/components/ui/field'
import { FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { isPayloadMedia, PdfMediaProps } from '../types'
import { getMediaInfo } from '@/utilities/getMediaInfo'
import Image from 'next/image'
import { Media } from '@/payload-types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipArrow } from '@radix-ui/react-tooltip'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type ActivePageRange = { start: number | null; end: number | null }

const OVERSHOOT = 20 // Zoom and Pan Overshoot buffer percentage.
const ZOOM_AND_PAN_SCALE_FACTOR = 1.5 // zoom strength
const SAFE_X = 128 // Total horizontal padding around PDF flipbook.
const SAFE_Y = 240 // Total vertical padding around PDF flipbook.
const MIN_WIDTH_SAFEGUARD = 200

const FlipbookPopoverContent: React.FC<{ media: Media; onClose: () => void }> = ({
  media,
  onClose,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [renderedPages, setRenderedPages] = useState<number>(0)
  const [allPagesRendered, setAllPagesRendered] = useState<boolean>(false)
  const [isFileLoaded, setIsFileLoaded] = useState<boolean>(false)
  const [loadingProgress, setLoadingProgress] = useState<OnLoadProgressArgs>({
    loaded: 0,
    total: 0,
  })
  const [pageWidth, setPageWidth] = useState<number>(400)
  const pageHeight = pageWidth * 1.4142

  const [activePages, setActivePages] = useState<ActivePageRange>({ start: null, end: null })
  const [isZoomMode, setIsZoomMode] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, isHovering: false })

  const containerRef = useRef<HTMLDivElement>(null)
  const documentProxyRef = useRef<PDFDocumentProxy>(null)
  const flipBookInstance = useRef<FlipBook>(null)

  const file = useMemo(() => {
    return media.url
  }, [media])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const { width: containerWidth } = container.getBoundingClientRect()

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height: entryHeight } = entry.contentRect

        const maxAvailableWidth = (containerWidth - SAFE_X) / 2
        const maxAvailableHeightBasedWidth = (entryHeight - SAFE_Y) / 1.4142
        const maxPageWidth = (window.innerWidth - window.innerWidth * 0.2) / 2

        const calculatedWidth = Math.min(
          maxAvailableWidth,
          maxAvailableHeightBasedWidth,
          maxPageWidth,
        )

        const finalPageWidth = Math.max(calculatedWidth, MIN_WIDTH_SAFEGUARD)

        setPageWidth(finalPageWidth)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const documentProxy = documentProxyRef.current
    if (!documentProxy) return

    const { numPages } = documentProxy
    setNumPages(numPages)
    setActivePages({ start: 0, end: null })

    if (numPages !== null && numPages > 0 && renderedPages === numPages) {
      setAllPagesRendered(true)
    }
  }, [isFileLoaded, renderedPages])

  const onDocumentLoadSuccess: OnDocumentLoadSuccess = (document: PDFDocumentProxy) => {
    documentProxyRef.current = document
    console.log(`onDocumentLoadSuccess =>`, document)
    setIsFileLoaded(true)
  }

  const onPageRenderSuccess: OnRenderSuccess = (_page: PageCallback) => {
    setRenderedPages((prev) => prev + 1)
  }

  useEffect(() => {
    if (allPagesRendered && isFileLoaded) {
      const onPageTurn = (): void => {
        const flipBook = flipBookInstance.current
        if (!flipBook) return

        const [pageRangeStart, pageRangeEnd] = flipBook.getActivePages() ?? [null, null]
        const pageRange = { start: pageRangeStart ?? null, end: pageRangeEnd ?? null }

        setActivePages(pageRange)

        if (pageRange.start === null && pageRange.end === null) {
          flipBook.turnPage(1)
        }
      }

      const options: FlipBookOptions = {
        nextButton: document.getElementById('flipbookNextButton'),
        previousButton: document.getElementById('flipbookPrevButton'),
        canClose: true,
        arrowKeys: true,
        initialActivePage: 0,
        onPageTurn: onPageTurn,
        initialCall: true,
        width: `${pageWidth * 2}px`,
        height: `${pageHeight}px`,
      }

      flipBookInstance.current = new FlipBook('pdfFlipbookContainer', options)
    }
  }, [allPagesRendered, isFileLoaded, pageHeight, pageWidth])

  const getPageNavigationStatus = (pageRange: ActivePageRange, numPages: number | null) => {
    const pageRangeStart = pageRange.start ? pageRange.start + 1 : 1
    const pageRangeEnd = pageRange.end ? ` | ${pageRange.end + 1}` : ''
    return (
      (!!numPages &&
        numPages >= 0 &&
        `Page${pageRange.end ? 's' : ''} ${pageRangeStart}${pageRangeEnd} of ${numPages}`) ||
      ''
    )
  }

  const getDocumentLoadingProgress = () => {
    const { loaded, total } = loadingProgress
    const progress = total > 0 && loaded < total ? Math.max((loaded / total) * 100, 0) : 0
    return (
      <Field className="flex justify-center items-center py-6 h-full w-xl">
        <FieldLabel htmlFor="progress-loading">
          <span>Loading</span>
          <span className="ml-auto">{progress}%</span>
        </FieldLabel>
        <Progress value={progress} id="progress-loading" />
      </Field>
    )
  }

  const getPageRenderingProgress = () => {
    const progress = Math.max(renderedPages, 0)
    const max = Math.max(numPages ?? 0)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Field className="flex justify-center items-center py-6 h-full w-xl">
          <FieldLabel htmlFor="progress-rendering">
            <span>Rendering</span>
            <span className="ml-auto">
              Page {progress} of {max}
            </span>
          </FieldLabel>
          <Progress value={progress} max={max} id="progress-rendering" />
        </Field>
      </div>
    )
  }

  const handleZoomAndPanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const rawX = (e.clientX - rect.left) / rect.width
    const rawY = (e.clientY - rect.top) / rect.height
    const x = rawX * (100 + OVERSHOOT * 2) - OVERSHOOT
    const y = rawY * (100 + OVERSHOOT * 2) - OVERSHOOT

    setZoomPos({ x, y, isHovering: true })
  }

  const handleZoomAndPanMouseEnter = () => {
    if (!isZoomMode) return
    setZoomPos((prev) => ({ ...prev, isHovering: true }))
  }

  const handleZoomAndPanMouseLeave = () => {
    setZoomPos((prev) => ({ ...prev, isHovering: false }))
  }

  const onDocumentLoadProgress: OnDocumentLoadProgress = (
    loadingProgress: OnLoadProgressArgs,
  ): void => {
    setLoadingProgress(loadingProgress)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center pt-20 pb-10 px-8"
    >
      <div
        id="pdfDocumentControls"
        className="absolute bottom-4 z-10 w-full flex justify-center gap-4 px-4"
      >
        <ButtonGroup orientation="horizontal">
          <Button variant="outline" id="flipbookPrevButton" disabled={activePages.start === 0}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" className="pointer-events-none">
            <span className="whitespace-nowrap w-40 text-center">
              {getPageNavigationStatus(activePages, numPages)}
            </span>
          </Button>
          <Button variant="outline" id="flipbookNextButton">
            <ChevronRight />
          </Button>
        </ButtonGroup>

        <ButtonGroup orientation="horizontal">
          <Button
            variant={isZoomMode ? 'default' : 'outline'}
            onClick={() => setIsZoomMode(!isZoomMode)}
            aria-label="Toggle zoom and pan"
            title="Toggle zoom and pan"
          >
            <ZoomIn />
          </Button>
        </ButtonGroup>

        <Button variant="outline" onClick={onClose} aria-label="Close flipbook">
          <X /> Close
        </Button>
      </div>

      <div
        id="pdfDocumentContainer"
        className="flex items-center justify-center w-full h-full mt-20 mb-10"
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadProgress={onDocumentLoadProgress}
          loading={getDocumentLoadingProgress()}
          noData={<p>No Data.</p>}
          className="flex items-center justify-center w-full h-full"
        >
          {numPages && (
            <div
              id="flipbookOverflowContainer"
              className={cn(
                'relative transition-all',
                isZoomMode ? 'cursor-zoom-in overflow-hidden ' : 'cursor-auto',
              )}
              style={{ width: pageWidth * 2, height: pageHeight }}
              onMouseMove={handleZoomAndPanMouseMove}
              onMouseEnter={handleZoomAndPanMouseEnter}
              onMouseLeave={handleZoomAndPanMouseLeave}
            >
              <div
                id="zoomAndPanLayer"
                className="w-full h-full ease-out transition-transform duration-100 will-change-transform"
                style={{
                  transform:
                    isZoomMode && zoomPos.isHovering
                      ? `scale(${ZOOM_AND_PAN_SCALE_FACTOR})`
                      : `scale(1)`,
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              >
                {!allPagesRendered && getPageRenderingProgress()}

                <div
                  className="c-flipbook w-full h-full absolute top-0 left-0"
                  id="pdfFlipbookContainer"
                  hidden={allPagesRendered ? false : true}
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div key={`page_${index + 1}`} className="c-flipbook__page">
                      <Page
                        pageIndex={index}
                        onRenderSuccess={onPageRenderSuccess}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={pageWidth}
                        height={pageHeight}
                        className="bg-transparent"
                        error={<p>Failed to load the page.</p>}
                        loading={<p>Page loading...</p>}
                        noData={<p>No page data.</p>}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Document>
      </div>
    </div>
  )
}

export const PdfMedia: React.FC<PdfMediaProps> = (props) => {
  const { resource } = props
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    const popover = popoverRef.current
    if (!popover) return

    const handleToggle = (e: ToggleEvent) => {
      const isOpenState = e.newState === 'open'
      setIsPopoverOpen(isOpenState)

      document.body.style.overflow = isOpenState ? 'hidden' : ''
    }

    popover.addEventListener('toggle', handleToggle)
    return () => {
      popover.removeEventListener('toggle', handleToggle)
      document.body.style.overflow = ''
    }
  }, [])

  const handleOpen = () => {
    popoverRef.current?.showPopover()
  }

  const handleClose = () => {
    popoverRef.current?.hidePopover()
  }

  if (isPayloadMedia(resource)) {
    const { title, thumbnailURL } = resource

    return (
      <>
        <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 border rounded-xl shadow-sm bg-card max-w-2xl w-full">
          <div className="absolute top-2 right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Document Information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-80 bg-popover text-popover-foreground border border-popover grid grid-cols-[auto_1fr] gap-0 p-1">
                {Object.entries(getMediaInfo(props)).map(([label, value]) => {
                  return (
                    <React.Fragment key={label}>
                      <div className="text-xs font-semibold whitespace-nowrap">{label}:</div>
                      <div className="text-xs whitespace-normal wrap-break-word">{value}</div>
                    </React.Fragment>
                  )
                })}
                <TooltipArrow className="fill-popover" />
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative w-32 shrink-0 overflow-hidden rounded-md shadow-md border bg-neutral-100 flex items-center justify-center min-h-40">
            {thumbnailURL ? (
              <Image
                src={thumbnailURL}
                alt={`Cover for ${title}`}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              // Fallback icon
              <FileText className="text-neutral-400 w-12 h-12" />
            )}
          </div>
          <div className="flex flex-col text-center sm:text-left">
            <div className="flex flex-row w-full">
              <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            </div>
            <Button onClick={handleOpen} className="w-full sm:w-auto self-center sm:self-start">
              Open
            </Button>
          </div>
        </div>

        <div
          popover="auto"
          ref={popoverRef}
          className="fixed inset-0 w-screen h-screen m-0 p-0 bg-neutral-900/95 backdrop:bg-black/80 border-none outline-none transition-opacity duration-300"
        >
          {isPopoverOpen && <FlipbookPopoverContent media={resource} onClose={handleClose} />}
        </div>
      </>
    )
  }
}
