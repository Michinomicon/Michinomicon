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
import { formatFileSize } from '@/utilities/formatFileSize'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type ActivePageRange = { start: number | null; end?: number | null }

const OVERSHOOT = 30 // Zoom and Pan Overshoot buffer percentage.
const ZOOM_AND_PAN_SCALE_FACTOR = 1.5 // zoom strength
const SAFE_X = 80 //128 // Total horizontal padding around PDF flipbook.
const SAFE_Y = 180 //240 // Total vertical padding around PDF flipbook.
const MIN_WIDTH_SAFEGUARD = 200

const FlipbookPopoverContent: React.FC<{ media: Media; onClose: () => void; isOpen: boolean }> = ({
  media,
  onClose,
  isOpen,
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
  const activePageRangeRef = useRef<ActivePageRange>({ start: 0, end: null })

  const [isZoomMode, setIsZoomMode] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, isHovering: false })

  const containerRef = useRef<HTMLDivElement>(null)
  const documentProxyRef = useRef<PDFDocumentProxy>(null)
  const flipBookInstance = useRef<FlipBook>(null)

  const file = useMemo(() => {
    return media.url
  }, [media])

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!flipBookInstance.current || !isOpen) {
        console.debug(`ingoring keyboard events: `, { isOpen: isOpen })
        return
      }

      if (e.ctrlKey && e.key === 'z') console.debug(`PDF FLIPBOOK: Pressed Key ${e.key}`)

      switch (e.key) {
        case 'ArrowRight':
          if (flipBookInstance.current.isLastPage()) {
            console.debug(`Pressed next page on last page, jumping to start`)
            flipBookInstance.current.turnPage(0)
          } else {
            flipBookInstance.current.turnPage('forward')
          }
          break
        case 'ArrowLeft':
          if (!flipBookInstance.current.isFirstPage()) {
            flipBookInstance.current.turnPage('back')
          }
          break
        case 'z':
          if (e.ctrlKey) {
            console.debug(`Pressed CTRL+Z => Toggle Zoom Mode`)
            setIsZoomMode(!isZoomMode)
          }
          break
        // More key bindings go here
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isZoomMode])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const { width: containerWidth } = container.getBoundingClientRect()

    const observer = new ResizeObserver((entries) => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      resizeTimeoutRef.current = setTimeout(() => {
        for (const entry of entries) {
          const { height: entryHeight } = entry.contentRect

          if (containerWidth === 0 || entryHeight === 0) return

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
      }, 150)
    })

    observer.observe(container)
    return () => {
      observer.disconnect()
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const documentProxy = documentProxyRef.current
    if (!documentProxy) return

    const { numPages } = documentProxy
    setNumPages(numPages)

    if (numPages !== null && numPages > 0 && renderedPages === numPages) {
      setActivePages(activePageRangeRef.current)
      console.debug(`all pages rendered. `, activePageRangeRef.current)
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

        // setIsFirstPageActive(flipBook.isFirstPage())
        // setIsLastPageActive(flipBook.isLastPage())
        const [pageRangeStart, pageRangeEnd] = flipBook.getActivePages()

        const pageRange = { start: pageRangeStart, end: pageRangeEnd }
        activePageRangeRef.current = pageRange

        console.debug(`onPageTurn`, activePageRangeRef.current)
        setActivePages(activePageRangeRef.current)

        if (pageRange.start === null && pageRange.end === null) {
          console.debug(`onPageTurn => Force Page 1`, activePageRangeRef.current)
          flipBook.turnPage(1)
        }
      }

      const options: FlipBookOptions = {
        canClose: true,
        arrowKeys: false,
        initialActivePage: activePageRangeRef.current.start ?? 0,
        onPageTurn: onPageTurn,
        initialCall: false,
        width: `${pageWidth * 2}px`,
        height: `${pageHeight}px`,
      }

      console.debug(`file is loaded && all pages rendered. `, activePageRangeRef.current)
      flipBookInstance.current = new FlipBook('pdfFlipbookContainer', options)

      return () => {
        if (flipBookInstance.current) {
          flipBookInstance.current = null
          console.debug(`removed flipbook instance`)
        }
      }
    }
  }, [allPagesRendered, isFileLoaded, pageHeight, pageWidth])

  const getPageNavigationStatus = (pageRange: ActivePageRange, numPages: number | null) => {
    const { start, end } = pageRange

    if (start === null || !numPages || numPages <= 0) {
      return ''
    }

    if (start <= 0) {
      return `Front Cover | ${numPages} Pages`
    }

    if (start + 1 === numPages) {
      return `Back Cover | ${numPages} Pages`
    }

    return `Page${end ? 's' : ''} ${start}${end ? ` | ${end}` : ''} of ${numPages}`
  }

  const getDocumentLoadingProgress = () => {
    const { loaded, total }: OnLoadProgressArgs = loadingProgress
    const progress = total > 0 && loaded < total ? Math.max((loaded / total) * 100, 0) : 0
    return (
      <Field className="flex justify-center items-center py-6 h-full w-xl">
        <FieldLabel htmlFor="progress-loading">
          <span>
            Loading {formatFileSize(loaded)} of {formatFileSize(total)}{' '}
          </span>
          <span className="ml-auto">{progress.toFixed(0)}%</span>
        </FieldLabel>
        <Progress value={progress} id="progress-loading" />
      </Field>
    )
  }

  const getPageRenderingProgress = () => {
    const rendered = Math.max(renderedPages, 0)
    const max = Math.max(numPages ?? 0)
    const progress = max > 0 && rendered < max ? Math.max((rendered / max) * 100, 0) : 0
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Field className="flex justify-center items-center py-6 h-full w-xl">
          <FieldLabel htmlFor="progress-rendering">
            <span>
              Rendering page {rendered} of {max}
            </span>
            <span className="ml-auto">{progress.toFixed(0)}%</span>
          </FieldLabel>
          <Progress value={progress} id="progress-rendering" />
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

  const previousPage: React.MouseEventHandler<HTMLButtonElement> = (_event: React.MouseEvent) => {
    if (!flipBookInstance.current) {
      console.debug(`clicked previous page, but there is no flipbook instance`)
      return
    }
    console.debug(`clicked previous page,`, activePageRangeRef.current)
    flipBookInstance.current.turnPage('back')
  }

  const nextPage: React.MouseEventHandler<HTMLButtonElement> = (_event: React.MouseEvent) => {
    if (!flipBookInstance.current) {
      console.debug(`clicked next, but there is no flipbook instance`)
      return
    }
    console.debug(`clicked next page,`, activePageRangeRef.current)
    flipBookInstance.current.turnPage('forward')
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center pt-10 pb-10 px-8 bg-background"
    >
      <div
        id="pdfDocumentControls"
        className="absolute bottom-4 z-10 w-full flex justify-center gap-4 px-4"
      >
        <ButtonGroup orientation="horizontal">
          <Button
            variant="outline"
            id="flipbookPrevButton"
            onClick={previousPage}
            disabled={activePages.start === 0 || isZoomMode}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" className="pointer-events-none">
            <span className="whitespace-nowrap w-40 text-center">
              {getPageNavigationStatus(activePages, numPages)}
            </span>
          </Button>
          <Button
            variant="outline"
            id="flipbookNextButton"
            onClick={nextPage}
            disabled={isZoomMode}
          >
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
        className="flex items-center justify-center w-full h-full mt-1 mb-10 border border-background"
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
                'relative transition-all border w-full h-full bg-card',
                isZoomMode
                  ? 'cursor-zoom-in overflow-hidden outline-2 outline-accent outline-offset-8'
                  : 'cursor-auto',
              )}
              style={{ width: 100 + pageWidth * 2, height: 100 + pageHeight }}
              onMouseMove={handleZoomAndPanMouseMove}
              onMouseEnter={handleZoomAndPanMouseEnter}
              onMouseLeave={handleZoomAndPanMouseLeave}
            >
              <div
                id="zoomAndPanLayer"
                className="w-full h-full ease-out transition-transform duration-100 will-change-transform bg-card"
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
                  className="c-flipbook w-full h-full absolute"
                  // t-0 l-0
                  id="pdfFlipbookContainer"
                  style={{ top: 50, left: 50 }}
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

  // Track opened state to minimise re-rendering the PDF
  const [hasOpened, setHasOpened] = useState(false)

  // track the open state without triggering re-renders
  const isPopoverOpenRef = useRef(false)

  useEffect(() => {
    const popover = popoverRef.current
    if (!popover) return

    const handleToggle = (e: ToggleEvent) => {
      const isOpenState = e.newState === 'open'
      isPopoverOpenRef.current = isOpenState
      setIsPopoverOpen(isOpenState)
      document.body.style.overflow = isOpenState ? 'hidden' : ''
    }

    popover.addEventListener('toggle', handleToggle)
    return () => {
      popover.removeEventListener('toggle', handleToggle)
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const handleOtherFlipbookOpened = (e: Event) => {
      const customEvent = e as CustomEvent<{ url: string }>

      const { url } = isPayloadMedia(resource) ? resource : { url: '' }

      // If a different flipbook opens while this one is closed,
      // then discard the popover for this one to free up memory
      if (customEvent.detail.url !== url && !isPopoverOpenRef.current) {
        setHasOpened(false)
      }
    }

    // Listen for events from other flipbooks
    window.addEventListener('flipbook-opened', handleOtherFlipbookOpened)

    return () => {
      window.removeEventListener('flipbook-opened', handleOtherFlipbookOpened)
    }
  }, [resource])

  const handleOpen = () => {
    setHasOpened(true)
    const { url } = isPayloadMedia(resource) ? resource : { url: '' }
    window.dispatchEvent(new CustomEvent('flipbook-opened', { detail: { url } }))
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
          {hasOpened && (
            <FlipbookPopoverContent media={resource} onClose={handleClose} isOpen={isPopoverOpen} />
          )}
        </div>
      </>
    )
  }
}
