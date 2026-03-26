'use client'

import React, { useState, useMemo, useRef, useEffect, Fragment } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'flipbook-js/style.css'
import FlipBook, { FlipBookOptions } from 'flipbook-js'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import {
  OnDocumentLoadProgress,
  OnDocumentLoadSuccess,
  OnItemClickArgs,
  OnLoadProgressArgs,
  PageCallback,
} from 'react-pdf/dist/esm/shared/types.js'

import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Info,
  FileTextIcon,
  SquareArrowOutUpRight,
  ChevronFirst,
  ChevronLast,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Field } from '@/components/ui/field'
import { isPayloadMedia, PdfMediaProps } from '../types'
import Image from 'next/image'
import { Media } from '@/payload-types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemFooter,
  ItemGroup,
} from '@/components/ui/item'
import { FloatingLabelSlider } from '@/components/ui/slider'
import {
  asFlipbookSlelector,
  clearFlipbookPageIsActiveClasses,
  FirstPageActiveSelector,
  FlipbookPageStateClassIndex,
  FlipbookStateClassIndex,
  getFlipbookState,
  LastPageActiveSelector,
} from './flipbookUtils'
import { formatFileSize } from '@/utilities/formatFileSize'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import InteractiveBackground from '@/components/InteractiveBackground'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const FLIPBOOK_ELEMENT_ID = 'pdfFlipbookContainer'

const OVERSHOOT = 30 // Zoom and Pan Overshoot buffer percentage.
const ZOOM_AND_PAN_SCALE_FACTOR = 1.5 // zoom strength
const SAFE_X = 80 //128 // Total horizontal padding around PDF flipbook.
const SAFE_Y = 180 //240 // Total vertical padding around PDF flipbook.
const MIN_WIDTH_SAFEGUARD = 200

const FlipbookPopoverContent: React.FC<{
  media: Media
  onClose: () => void
  isOpen: boolean
  disableHoverAnim?: boolean
}> = ({ media, onClose, isOpen, disableHoverAnim = false }) => {
  const [documentLoaded, setDocumentLoaded] = useState<boolean>(false)
  const [flipbookRenderCount, setFlipbookRenderCount] = useState<number>(0)
  const [fileloadingProgress, setFileLoadingProgress] = useState<OnLoadProgressArgs>({
    loaded: 0,
    total: 0,
  })
  const [processedPagesCount, setLoadedPagesCount] = useState<number>(0)
  const [renderedPagesCount, setRenderedPagesCount] = useState<number>(0)

  const [numPages, setNumPages] = useState<number | null>(null)

  const [pageWidth, setPageWidth] = useState<number | null>(null)
  const pageHeight = Math.max(Number(pageWidth), 0) * 1.4142
  const bookWidth = Math.max(Number(pageWidth), 0) * 2

  const [activePages, setActivePages] = useState<number[] | null>([0])
  const activePageRangeRef = useRef<number[] | null>([0])
  const totalPagesAcrossRendersRef = useRef<number>(0)

  const [isZoomMode, setIsZoomMode] = useState<boolean>(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, isHovering: false })

  const containerRef = useRef<HTMLDivElement>(null)
  const flipBookRef = useRef<FlipBook>(null)

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const sliderPopoverRef = useRef<HTMLDivElement>(null)
  const sliderTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isLinkClickRef = useRef<boolean>(false)

  const file = useMemo(() => {
    return media.url
  }, [media])

  const isFullyRendered = useMemo(() => {
    return numPages !== null && numPages > 0 && renderedPagesCount === numPages
  }, [numPages, renderedPagesCount])

  const onDocumentLoadSuccess: OnDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    console.log(`Successfully loaded ${numPages} page document.`)
    setDocumentLoaded(true)
  }

  const getPageSlideTooltipContent = (previewIndex: number, total: number | null) => {
    const tooltipStyles = 'mx-1.5 text-lg'
    if (!total) {
      return <span className={tooltipStyles}>No Pages.</span>
    }
    if (previewIndex === 0) {
      return <span className={tooltipStyles}>Page 1 of {total}</span>
    }
    if (previewIndex === total - 1) {
      return (
        <span className={tooltipStyles}>
          Page {total} of {total}
        </span>
      )
    }
    const isRight = previewIndex % 2 === 0
    const leftPage = isRight ? previewIndex : previewIndex + 1
    const rightPage = leftPage + 1
    return (
      <span className={tooltipStyles}>
        {leftPage}
        {' | '}
        {rightPage}
      </span>
    )
  }

  const getPreviewPageStateDescription = (previewIndex: number, total: number | null) => {
    if (!total) return 'No Pages.'
    if (previewIndex === 0) return `Page 1 of ${total}`
    if (previewIndex === total - 1) return `Page ${total} of ${total}`
    const isRight = previewIndex % 2 === 0
    const leftPage = isRight ? previewIndex : previewIndex + 1
    const rightPage = leftPage + 1
    return `Pages ${leftPage} | ${rightPage} of ${total}`
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

  const handleSliderCommit = (val: number[]) => {
    // kill any existing timers
    if (sliderTimeoutRef.current) clearTimeout(sliderTimeoutRef.current)
    // new 250ms countdown
    sliderTimeoutRef.current = setTimeout(() => {
      const targetPage = val[0]
      if (activePages && !activePages.includes(targetPage)) {
        goToSpecificPage(targetPage)
      }
      sliderPopoverRef.current?.hidePopover()
    }, 250)
  }

  const goToSpecificPage = (args?: Partial<OnItemClickArgs> | number, force: boolean = false) => {
    const destPageIndex =
      typeof args === 'object' ? args.pageIndex : typeof args === 'number' ? args : undefined

    if (destPageIndex === undefined) {
      console.debug(`PDF Navigation Error. Invalid Page Index:`, args)
      return
    }

    const currentActive = activePageRangeRef.current

    if (currentActive === null || !Array.isArray(currentActive)) {
      console.debug(`PDF Navigation Error. Invalid Active Page Range:`, currentActive)
      return
    }

    if (currentActive.includes(destPageIndex) && !force) {
      console.debug(`PDF Navigation Error. Already on page with index ${destPageIndex}.`)
      return
    }

    if (!flipBookRef || !flipBookRef.current) {
      console.debug(`PDF Navigation Error. Flipbook Instance not found.`)
      return
    }

    const flipbookContainer: HTMLElement | null = document.getElementById(FLIPBOOK_ELEMENT_ID)

    if (!flipbookContainer) {
      console.debug(`PDF Navigation Error. Flipbook Container Element not found.`)
      return
    }
    const pages = flipbookContainer.querySelectorAll(asFlipbookSlelector('page'))
    const pageCount: number = pages.length
    pages.forEach((page) => page.classList.remove(FlipbookPageStateClassIndex.isActive))

    // In flipbook-js (with covers), even indices are on the right, odd are on the left
    const isTargetRight: boolean = destPageIndex % 2 === 0
    const targetRight: number = isTargetRight ? destPageIndex : destPageIndex + 1
    const targetLeft: number = targetRight - 1

    // determine direction
    const validActive: number[] = currentActive.filter(
      (pageIndex): pageIndex is number => pageIndex !== null && pageIndex !== undefined,
    )
    const currentMax: number = Math.max(...validActive)
    const direction: 'forward' | 'back' = destPageIndex > currentMax ? 'forward' : 'back'

    // get page just before target and turn the page
    if (direction === 'forward') {
      const prevLeft: number = targetLeft - 2
      const prevRight: number = targetRight - 2

      if (prevLeft >= 0 && pages[prevLeft]) {
        pages[prevLeft].classList.add(FlipbookPageStateClassIndex.isActive)
        if (pages[prevLeft].classList.contains(FlipbookPageStateClassIndex.firstPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atFrontCover)
        }
        if (pages[prevLeft].classList.contains(FlipbookPageStateClassIndex.lastPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atBackCover)
        }
      }
      if (prevRight >= 0 && pages[prevRight]) {
        pages[prevRight].classList.add(FlipbookPageStateClassIndex.isActive)
        if (pages[prevRight].classList.contains(FlipbookPageStateClassIndex.firstPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atFrontCover)
        }
        if (pages[prevRight].classList.contains(FlipbookPageStateClassIndex.lastPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atBackCover)
        }
      }

      flipBookRef.current.turnPage('forward')
    } else {
      const nextLeft = targetLeft + 2
      const nextRight = targetRight + 2

      if (nextLeft < pageCount && pages[nextLeft]) {
        pages[nextLeft].classList.add(FlipbookPageStateClassIndex.isActive)
        if (pages[nextLeft].classList.contains(FlipbookPageStateClassIndex.firstPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atFrontCover)
        }
        if (pages[nextLeft].classList.contains(FlipbookPageStateClassIndex.lastPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atBackCover)
        }
      }
      if (nextRight < pageCount && pages[nextRight]) {
        pages[nextRight].classList.add(FlipbookPageStateClassIndex.isActive)
        if (pages[nextRight].classList.contains(FlipbookPageStateClassIndex.firstPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atFrontCover)
        }
        if (pages[nextRight].classList.contains(FlipbookPageStateClassIndex.lastPage)) {
          flipbookContainer.classList.add(FlipbookStateClassIndex.atBackCover)
        }
      }

      flipBookRef.current.turnPage('back')
    }
  }

  const goToFirstPage: React.MouseEventHandler<HTMLButtonElement> = (_event) => {
    const flipbookElement = document.getElementById(FLIPBOOK_ELEMENT_ID)
    if (!flipBookRef || !flipBookRef.current || !numPages || !flipbookElement) return

    const activePageCheck = flipBookRef.current.getActivePages().includes(0)
    const firstPageCheck = flipBookRef.current.isFirstPage()

    if (activePageCheck || firstPageCheck) return

    goToSpecificPage(0)
  }

  const goToLastPage: React.MouseEventHandler<HTMLButtonElement> = (_event) => {
    const flipbookElement = document.getElementById(FLIPBOOK_ELEMENT_ID)
    if (!flipBookRef || !flipBookRef.current || !numPages || !flipbookElement) return

    const activePageCheck = flipBookRef.current.getActivePages().includes(numPages - 1)
    const lastPageCheck = flipBookRef.current.isLastPage()

    if (activePageCheck || lastPageCheck) return

    goToSpecificPage(numPages - 1)
  }

  const previousPage: React.MouseEventHandler<HTMLButtonElement> = (_event?: React.MouseEvent) => {
    if (!flipBookRef || !flipBookRef.current || !numPages) return
    flipBookRef.current.turnPage('back')
  }

  const nextPage: React.MouseEventHandler<HTMLButtonElement> = (_event?: React.MouseEvent) => {
    if (!flipBookRef || !flipBookRef.current || !numPages) return
    flipBookRef.current.turnPage('forward')
  }

  const mouseEnterPreviousPageButton: React.MouseEventHandler<HTMLButtonElement> = (
    _event: React.MouseEvent,
  ) => {
    if (!flipBookRef || !flipBookRef.current || !numPages) return
    triggerPageHover('prev')
  }

  const mouseEnterNextPageButton: React.MouseEventHandler<HTMLButtonElement> = (
    _event: React.MouseEvent,
  ) => {
    if (!flipBookRef || !flipBookRef.current || !numPages) return
    triggerPageHover('next')
  }

  const triggerPageHover = (direction: 'prev' | 'next') => {
    if (disableHoverAnim || isZoomMode) return
    const container = document.getElementById(FLIPBOOK_ELEMENT_ID)
    if (container) {
      container.classList.add(direction === 'prev' ? 'hover-prev-active' : 'hover-next-active')
    }
  }

  const clearPageHover = () => {
    const container = document.getElementById(FLIPBOOK_ELEMENT_ID)
    if (container) {
      container.classList.remove('hover-prev-active', 'hover-next-active')
    }
  }

  const onClickDocumentItem = ({ pageIndex }: OnItemClickArgs) => {
    goToSpecificPage(pageIndex)
  }

  const onClickZoomModeButton: React.MouseEventHandler<HTMLButtonElement> = (
    _event: React.MouseEvent,
  ) => {
    setIsZoomMode(!isZoomMode)
  }

  const onPageSliderValueChange = (val: number[]) => {
    setSliderValue(val)
    if (!activePageRangeRef.current?.includes(val[0])) {
      goToSpecificPage(val[0])
    }
  }

  const getPageSliderValueFormatter: (value: number) => React.ReactNode = (_value: number) => {
    return getPageSlideTooltipContent(sliderValue[0], numPages)
  }

  const onDocumentLoadProgress: OnDocumentLoadProgress = (
    loadingProgress: OnLoadProgressArgs,
  ): void => {
    setFileLoadingProgress(loadingProgress)
  }

  const onPageLoadSuccess = (_page: PageCallback) => {
    setLoadedPagesCount((prev) => prev + 1)
  }

  const onPageRenderSuccess = (_page: PageCallback) => {
    setRenderedPagesCount((prev) => prev + 1)
  }

  const atFrontCover = (): boolean => {
    const flipbookContainer: HTMLElement | null = document.getElementById(FLIPBOOK_ELEMENT_ID)
    const flipbookState = getFlipbookState(flipbookContainer)
    if (flipbookState) return flipbookState.atFrontCover
    return false
  }

  const atBackCover = (): boolean => {
    const flipbookContainer: HTMLElement | null = document.getElementById(FLIPBOOK_ELEMENT_ID)
    const flipbookState = getFlipbookState(flipbookContainer)
    if (flipbookState) return flipbookState.atBackCover
    return false
  }

  const isBackNavigationDisabled = (): boolean => {
    const flipbookContainer: HTMLElement | null = document.getElementById(FLIPBOOK_ELEMENT_ID)
    if (flipbookContainer) {
      const flipbookState = getFlipbookState(flipbookContainer)
      const atFrontCover = flipbookState?.atFrontCover ?? false
      const firstPageIsActive =
        flipbookContainer.querySelectorAll(FirstPageActiveSelector).length > 0
      return atFrontCover || firstPageIsActive
    }
    return false
  }

  const isForwardNavigationDisabled = (): boolean => {
    const flipbookContainer: HTMLElement | null = document.getElementById(FLIPBOOK_ELEMENT_ID)
    if (flipbookContainer) {
      const flipbookState = getFlipbookState(flipbookContainer)
      const atBackCover = flipbookState?.atBackCover ?? false
      const lastPageIsActive = flipbookContainer.querySelectorAll(LastPageActiveSelector).length > 0
      return atBackCover || lastPageIsActive
    }
    return false
  }

  React.useEffect(() => {
    setSliderValue([0])
    setActivePages([0])
    setRenderedPagesCount(0)
  }, [pageWidth])

  React.useEffect(() => {
    if (isFullyRendered === true) {
      setFlipbookRenderCount((prev) => {
        return prev + 1
      })
      const previousNumPages = totalPagesAcrossRendersRef.current ?? 0
      const restoredActivePage = Math.max(...(activePageRangeRef.current ?? [0]), 0)
      if (previousNumPages > 0 && restoredActivePage >= previousNumPages) {
        // overriding default behaviour to reach back page
        goToSpecificPage(previousNumPages - 1, true)
        goToSpecificPage(previousNumPages, true)
      } else {
        goToSpecificPage(restoredActivePage, true)
      }
    }
  }, [isFullyRendered])

  useEffect(() => {
    if (!sliderTimeoutRef || !sliderTimeoutRef.current) {
      return
    }
    return () => {
      if (sliderTimeoutRef.current) {
        clearTimeout(sliderTimeoutRef.current)
      }
    }
  }, [activePages])

  // Click event listener
  useEffect(() => {
    if (!isOpen || !numPages || !isLinkClickRef) return
    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // IF click event target is on an anchor tag, in the annotations layer of a PDF Page
      const isPdfLink = target.closest('a') && target.closest('.react-pdf__Page__annotations')

      if (isPdfLink) {
        // Flag that the click event was on a annotation layer link
        isLinkClickRef.current = true
      }
    }
    const handleBubbleClick = () => {
      // reset the flag after the event finishes bubbling up the DOM
      setTimeout(() => {
        isLinkClickRef.current = false
      }, 0)
    }
    // capture phase to catch the click before flipbook-js
    window.addEventListener('click', handleCaptureClick, { capture: true })

    // bubble phase to clean up
    window.addEventListener('click', handleBubbleClick)

    return () => {
      window.removeEventListener('click', handleCaptureClick, { capture: true })
      window.removeEventListener('click', handleBubbleClick)
    }
  }, [isOpen, numPages])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!flipBookRef || !flipBookRef.current || !isOpen) return

      if (e.ctrlKey && e.key === 'z') console.debug(`PDF FLIPBOOK: Pressed Key ${e.key}`)

      switch (e.key) {
        case 'ArrowRight':
          flipBookRef.current.turnPage('forward')
          break
        case 'ArrowLeft':
          flipBookRef.current.turnPage('back')
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

  // Flipbook sizing and Resizing
  useEffect(() => {
    if (!numPages || !containerRef || !containerRef.current) return
    const container = containerRef.current
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
          setPageWidth((w) => (w !== finalPageWidth ? finalPageWidth : w))
        }
      }, 150)
    })

    observer.observe(container)
    return () => {
      observer.disconnect()
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
    }
  }, [numPages])

  // when file is loaded, create the flipbook
  useEffect(() => {
    if (numPages && pageWidth) {
      const onPageTurn = (): void => {
        if (!flipBookRef || !flipBookRef.current) return

        const flipbookActivePages = flipBookRef.current.getActivePages() ?? [0]
        setActivePages(flipbookActivePages)
        activePageRangeRef.current = flipbookActivePages
        const sliderActivePage =
          flipbookActivePages.filter((p) => p !== null && p !== undefined)[0] || 0
        setSliderValue([sliderActivePage])
      }

      const options: Required<FlipBookOptions> = {
        canClose: true,
        arrowKeys: false,
        initialActivePage: 0,
        onPageTurn: onPageTurn,
        initialCall: false,
        width: `${pageWidth * 2}px`,
        height: `${pageHeight}px`,
        nextButton: null,
        previousButton: null,
      }

      if (flipBookRef.current === null) {
        flipBookRef.current = new FlipBook(FLIPBOOK_ELEMENT_ID, options)

        if (flipBookRef.current) {
          // Required to override the click event listeners that flipbook-js wraps the entire page with
          const originalTurnPage = flipBookRef.current.turnPage.bind(flipBookRef.current)
          flipBookRef.current.turnPage = (direction: number | 'forward' | 'back') => {
            // If the user just clicked a PDF link, do not turn the page
            if (isLinkClickRef.current) {
              return
            }
            // If we haven't flagged the click event target as being on a annotation layer link, then proceed as normal.
            originalTurnPage(direction)
          }
        }
      }
    }
    return () => {
      if (flipBookRef.current !== null) {
        totalPagesAcrossRendersRef.current = numPages ? numPages - 1 : 0
        const flipbookActivePages = flipBookRef.current.getActivePages() ?? [0]
        activePageRangeRef.current = flipbookActivePages
        console.debug(`clearing flipBook.(${JSON.stringify(flipbookActivePages)})[${numPages}]`)
        flipBookRef.current = null
        clearFlipbookPageIsActiveClasses(FLIPBOOK_ELEMENT_ID)
      }
    }
  }, [numPages, pageHeight, pageWidth])

  const getProgressItem = ({
    completedLabel,
    currentValue,
    inProgressLabel,
    inProgressValue,
    totalValue,
    completedValue,
  }: {
    completedLabel: string
    currentValue: number
    inProgressValue: string | number
    inProgressLabel: string
    totalValue: number
    completedValue: string | number
  }) => {
    const progressPercent = currentValue > 0 ? Math.max((currentValue / totalValue) * 100, 0) : 0
    const isCompleted = progressPercent >= 100
    const itemContentStyle = isCompleted ? 'text-lg text-muted-foreground' : 'text-lg font-semibold'
    const statusIconStyle = isCompleted ? 'size-8 text-green-700  dark:text-green-300' : 'size-8'
    const progressBarStyle = isCompleted ? '[&>div]:bg-green-400' : ''

    const statusIcon = isCompleted ? (
      <Check className={statusIconStyle} />
    ) : (
      <Spinner className={statusIconStyle} />
    )

    const itemLabelContent = isCompleted ? (
      completedLabel
    ) : (
      <span>
        {progressPercent.toFixed(0)}%<span className="ml-3">{inProgressLabel}</span>
      </span>
    )

    const itemDescriptionContent = (
      <span className="ml-auto">{isCompleted ? completedValue : inProgressValue}</span>
    )
    return (
      <Item variant="muted">
        <ItemMedia>{statusIcon}</ItemMedia>
        <ItemContent className={itemContentStyle}>{itemLabelContent}</ItemContent>
        <ItemContent className={cn('flex-none', itemContentStyle)}>
          {itemDescriptionContent}
        </ItemContent>
        <ItemFooter>
          <Progress value={progressPercent} className={progressBarStyle} />
        </ItemFooter>
      </Item>
    )
  }

  const getLoadingProgressComponent = (): React.ReactNode => {
    const totalPages = numPages && numPages > 0 ? numPages : 0
    const isFirstRender = flipbookRenderCount < 1
    const showDataTransfer = !documentLoaded || isFirstRender
    const showPageProcessing = isFirstRender || processedPagesCount <= totalPages
    const { loaded: fileDataLoaded, total: totalFileSize }: OnLoadProgressArgs = fileloadingProgress
    const cardTitle = isFirstRender ? 'Creating Flipbook' : 'Updating Flipbook'

    return (
      <div className="z-50 flex w-full h-full flex-col items-center gap-4 pointer-events-none">
        <Card className="w-full max-w-3xl my-auto pointer-events-auto">
          <CardHeader>
            <CardTitle className=" text-3xl font-semibold text-center">{cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-4">
              {showDataTransfer &&
                getProgressItem({
                  completedLabel: 'Data Transfer Complete',
                  currentValue: fileDataLoaded,
                  totalValue: totalFileSize,
                  inProgressValue: formatFileSize(fileDataLoaded),
                  completedValue: formatFileSize(fileDataLoaded),
                  inProgressLabel: 'Transferring Data...',
                })}
              {showPageProcessing &&
                getProgressItem({
                  currentValue: processedPagesCount,
                  totalValue: totalPages,
                  completedLabel: 'Page Processing Complete',
                  completedValue: `${processedPagesCount} Pages`,
                  inProgressValue: `${processedPagesCount} / ${totalPages} Pages`,
                  inProgressLabel: 'Processing Pages...',
                })}
              {getProgressItem({
                currentValue: renderedPagesCount,
                totalValue: totalPages,
                completedLabel: 'Page Rendering Complete',
                completedValue: `${renderedPagesCount} Pages`,
                inProgressValue: `${renderedPagesCount} / ${totalPages} Pages`,
                inProgressLabel: 'Rendering Pages...',
              })}
            </ItemGroup>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              size="lg"
              onClick={onClose}
              aria-label="Close flipbook"
              className="w-fit mx-auto"
            >
              <X /> Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const pageSliderMaxValue = numPages ? Math.max(numPages - 1, 1) : 1
  const pageSliderWidthStyles = { width: bookWidth }

  const flipbookElementStyles = {
    top: 15,
    left: atFrontCover()
      ? 'calc(50px + calc(-25% + 0px))'
      : atBackCover()
        ? 'calc(50px + calc(25% + 0px))'
        : 50,
  }

  const zoomAndPanLayerStyles = {
    transform:
      isZoomMode && zoomPos.isHovering ? `scale(${ZOOM_AND_PAN_SCALE_FACTOR})` : `scale(1)`,
    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
  }

  const flipbookOverflowContainerStyles = { width: 100 + bookWidth, height: 30 + pageHeight }
  const flipbookOverflowContainerClasses = cn(
    'relative transition-all border w-full h-full bg-card',
    isZoomMode
      ? 'cursor-zoom-in overflow-hidden outline-2 outline-primary outline-offset-6'
      : 'cursor-auto',
  )
  const floatingNextButtonStyles = { right: `calc(calc(50% - 120px) - ${pageWidth}px)` }
  const floatingPreviousButtonnStyles = { left: `calc(calc(50% - 120px) - ${pageWidth}px)` }

  const readyToMapPages = numPages !== null && numPages > 0 && pageWidth !== null

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen flex flex-col items-center bg-background overflow-hidden"
    >
      <InteractiveBackground enableSpotlight={isFullyRendered} />
      {isFullyRendered && (
        <React.Fragment>
          <div
            id="pdfDocumentControls"
            style={{ maxWidth: flipbookOverflowContainerStyles.width }}
            className={`absolute bg-card border border-primary/20 bottom-0 z-10 w-full flex flex-col justify-center items-center gap-0 px-2 py-0 pb-2 `}
          >
            <div className="flex justify-center w-full gap-0 p-0">
              <Field style={pageSliderWidthStyles}>
                <FloatingLabelSlider
                  value={sliderValue}
                  onValueChange={onPageSliderValueChange}
                  onValueCommit={handleSliderCommit}
                  defaultValue={[0]}
                  max={pageSliderMaxValue}
                  step={1}
                  orientation={'horizontal'}
                  className="mt-4 mb-2 w-full min-h-1.5 cursor-grab active:cursor-grabbing border-2 border-solid border-input"
                  aria-label="Page Navigation"
                  badgeVariant="default"
                  valueLabelFormatter={getPageSliderValueFormatter}
                />
              </Field>
            </div>
            <ButtonGroup orientation="horizontal">
              <ButtonGroup orientation="horizontal">
                <Button
                  variant="default"
                  id="flipbookFirstButton"
                  onClick={goToFirstPage}
                  onMouseEnter={mouseEnterPreviousPageButton}
                  onMouseLeave={clearPageHover}
                  disabled={isBackNavigationDisabled() || isZoomMode}
                >
                  <ChevronFirst />
                </Button>
                <Button
                  variant="default"
                  id="flipbookPrevButton"
                  onClick={previousPage}
                  onMouseEnter={mouseEnterPreviousPageButton}
                  onMouseLeave={clearPageHover}
                  disabled={isBackNavigationDisabled() || isZoomMode}
                >
                  <ChevronLeft />
                </Button>
                <Button variant="default" className="w-32 sm:w-40 [anchor-name:--slider-btn]">
                  <span className="whitespace-nowrap text-center">
                    {getPreviewPageStateDescription(sliderValue[0], numPages)}
                  </span>
                </Button>
                <Button
                  variant="default"
                  id="flipbookNextButton"
                  onClick={nextPage}
                  onMouseEnter={mouseEnterNextPageButton}
                  onMouseLeave={clearPageHover}
                  disabled={isForwardNavigationDisabled() || isZoomMode}
                >
                  <ChevronRight />
                </Button>
                <Button
                  variant="default"
                  id="flipbookLastButton"
                  onClick={goToLastPage}
                  onMouseEnter={mouseEnterNextPageButton}
                  onMouseLeave={clearPageHover}
                  disabled={isForwardNavigationDisabled() || isZoomMode}
                >
                  <ChevronLast />
                </Button>
              </ButtonGroup>
              <ButtonGroupSeparator />

              <ButtonGroup orientation="horizontal">
                <Button
                  variant={isZoomMode ? 'secondary' : 'default'}
                  onClick={onClickZoomModeButton}
                  aria-label="Toggle zoom and pan"
                  title="Toggle zoom and pan"
                >
                  <ZoomIn />
                </Button>
              </ButtonGroup>
              <ButtonGroupSeparator />
              <ButtonGroup orientation="horizontal">
                <Button variant="default" onClick={onClose} aria-label="Close flipbook">
                  <X /> Close
                </Button>
              </ButtonGroup>
            </ButtonGroup>
          </div>

          {/* Floating Left "Previous" Button*/}
          <button
            className={cn([
              `absolute  top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-primary/20 hover:bg-primary/40 text-foreground/50 hover:text-foreground transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none`,
            ])}
            style={floatingPreviousButtonnStyles}
            onClick={previousPage}
            onMouseEnter={mouseEnterPreviousPageButton}
            onMouseLeave={clearPageHover}
            disabled={isBackNavigationDisabled() || isZoomMode}
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          {/* Floating Right "Next" Button*/}
          <button
            className={cn([
              `absolute  top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-primary/20 hover:bg-primary/40 text-foreground/50 hover:text-foreground transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none`,
            ])}
            style={floatingNextButtonStyles}
            onClick={nextPage}
            onMouseEnter={mouseEnterNextPageButton}
            onMouseLeave={clearPageHover}
            disabled={isForwardNavigationDisabled() || isZoomMode}
            aria-label="Next Page"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </React.Fragment>
      )}

      {!isFullyRendered && getLoadingProgressComponent()}

      <div
        id="pdfDocumentContainer"
        style={{ marginTop: 30 }}
        className={cn(
          'relative flex items-center justify-center max-h-screen border-2 border-background',
          isFullyRendered
            ? 'opacity-100 transition-opacity duration-500'
            : 'opacity-0 pointer-events-none absolute',
        )}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadProgress={onDocumentLoadProgress}
          loading={<></>}
          onItemClick={onClickDocumentItem}
          externalLinkTarget="_blank"
          className={cn('flex items-center justify-center w-full')}
        >
          <div
            id="flipbookOverflowContainer"
            className={flipbookOverflowContainerClasses}
            style={flipbookOverflowContainerStyles}
            onMouseMove={handleZoomAndPanMouseMove}
            onMouseEnter={handleZoomAndPanMouseEnter}
            onMouseLeave={handleZoomAndPanMouseLeave}
          >
            <div
              id="zoomAndPanLayer"
              className={cn(
                'w-full h-full ease-out transition-transform duration-100 will-change-transform bg-card',
              )}
              style={zoomAndPanLayerStyles}
            >
              <div
                className={cn('c-flipbook-custom c-flipbook absolute pointer-events-none')}
                id={FLIPBOOK_ELEMENT_ID}
                style={flipbookElementStyles}
              >
                {readyToMapPages &&
                  Array.from(new Array(numPages), (_, index) => (
                    <div
                      key={`page_${index + 1}`}
                      className={cn('c-flipbook__page pointer-events-auto')}
                    >
                      <Page
                        pageIndex={index}
                        renderTextLayer={false}
                        renderAnnotationLayer={true}
                        width={pageWidth}
                        height={pageHeight}
                        onLoadSuccess={onPageLoadSuccess}
                        onRenderSuccess={onPageRenderSuccess}
                        className="bg-transparent"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Document>
      </div>
    </div>
  )
}

export const PdfMedia: React.FC<PdfMediaProps> = (props) => {
  const { resource, description, metadata } = props
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
      <React.Fragment>
        <Item
          variant="outline"
          className="relative flex flex-row bg-card text-card-foreground border border-card shadow-none w-full"
        >
          <div className="absolute top-2 right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Media Information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-80 bg-popover text-popover-foreground border border-popover grid grid-cols-[auto_1fr] gap-0 p-1">
                {Object.entries(metadata ?? {}).map(([label, value]) => {
                  return (
                    <React.Fragment key={label}>
                      <div className="text-xs font-semibold whitespace-nowrap">{label}:</div>
                      <div className="text-xs whitespace-normal wrap-break-word">{value}</div>
                    </React.Fragment>
                  )
                })}
              </TooltipContent>
            </Tooltip>
          </div>
          <ItemMedia
            variant="image"
            className="relative w-32 shrink-0 overflow-hidden rounded-md shadow-md border flex items-center justify-center min-h-40"
          >
            {thumbnailURL ? (
              <Image
                src={thumbnailURL}
                alt={`Cover for ${title}`}
                loading="eager"
                fill
                sizes="128px"
                className="aspect-square w-full mt-0 mb-0 object-cover rounded-none"
              />
            ) : (
              <FileTextIcon />
            )}
          </ItemMedia>
          <ItemContent className="flex flex-col grow-2">
            <ItemTitle className="line-clamp-1 font-medium whitespace-nowrap">
              {title}
              <span className="text-muted-foreground"></span>
            </ItemTitle>
            <ItemDescription>{description}</ItemDescription>
          </ItemContent>
          <ItemActions className="flex flex-col">
            <Button size="lg" variant="default" onClick={handleOpen} className="">
              Open
              <SquareArrowOutUpRight data-icon="inline-end" />
            </Button>
          </ItemActions>
        </Item>
        <div
          popover="auto"
          ref={popoverRef}
          className="fixed inset-0 w-screen h-screen m-0 p-0 bg-neutral-900/95 backdrop:bg-black/80 border-none outline-none transition-opacity duration-300"
        >
          {hasOpened && (
            <FlipbookPopoverContent media={resource} onClose={handleClose} isOpen={isPopoverOpen} />
          )}
        </div>
      </React.Fragment>
    )
  }
}
