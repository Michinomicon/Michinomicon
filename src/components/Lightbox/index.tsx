'use client'

import { Media } from '@/payload-types'
import React from 'react'
import Lightbox, {
  ClickCallbackProps,
  ControllerRef,
  ImageFit,
  LightboxExternalProps,
  Plugin as LightboxPlugin,
  Slide,
  SlideshowRef,
  ThumbnailsRef,
  ViewCallbackProps,
} from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Inline from 'yet-another-react-lightbox/plugins/inline'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Video from 'yet-another-react-lightbox/plugins/video'
import PhotoAlbum, { ClickHandlerProps, Photo } from 'react-photo-album'
import 'react-photo-album/styles.css'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import LightBoxSlide, { mapMediaToSlides } from './Slide'
import { cn } from '@/utilities/ui'
import { MediaCaption } from '../MediaCaption'

const InlineStyles = {
  style: {
    width: '100%',
    maxWidth: '900px',
    aspectRatio: '3 / 2',
    margin: '0 auto',
  },
}

type AlbumLayout = 'columns' | 'rows' | 'masonry'
type DisplayType = 'carousel' | 'album' | 'inline'

type FeatureProps<
  FeatureName extends string & keyof Required<LightboxExternalProps>,
  PickList extends keyof Feature = keyof Omit<Required<LightboxExternalProps>[FeatureName], 'ref'>,
  Feature extends Omit<Required<LightboxExternalProps>[FeatureName], 'ref'> = Omit<
    Required<LightboxExternalProps>[FeatureName],
    'ref'
  >,
> = {
  [Property in keyof Required<
    Pick<Feature, PickList>
  > as `${FeatureName}${Capitalize<string & Property>}`]: Feature[Property]
}

type ThumbnailFeatureProps = FeatureProps<'thumbnails', 'position' | 'hidden' | 'showToggle'>
type SlideshowFeatureProps = FeatureProps<'slideshow'> & { slideshowEnable: boolean | undefined }

interface DisplayProps {
  display: DisplayType | undefined
  carouselImageFit: ImageFit | undefined
  albumLayout: AlbumLayout | undefined
}

interface ToolbarControls {
  toolbarFullscreen: boolean | undefined
  toolbarZoom: boolean | undefined
  toolbarCounter: boolean | undefined
}

type LightBoxFeatureProps = DisplayProps &
  ThumbnailFeatureProps &
  SlideshowFeatureProps &
  ToolbarControls

function getEnabledPlugins({
  display,
  slideshowEnable,
  toolbarZoom,
  toolbarCounter,
  toolbarFullscreen,
  thumbnailsHidden,
}: Pick<
  LightBoxFeatureProps,
  | 'display'
  | 'slideshowEnable'
  | 'toolbarZoom'
  | 'toolbarCounter'
  | 'toolbarFullscreen'
  | 'thumbnailsHidden'
>): LightboxPlugin[] {
  const plugins: LightboxPlugin[] = []

  switch (display) {
    case 'carousel':
      plugins.push(Inline)
      break
    case 'album':
      break
    case 'inline':
      plugins.push(Inline)
      break
  }

  if (slideshowEnable) {
    plugins.push(Slideshow)
  }

  if (!!toolbarZoom) {
    plugins.push(Zoom)
  }

  if (!!toolbarCounter) {
    plugins.push(Counter)
  }

  if (!!toolbarFullscreen) {
    plugins.push(Fullscreen)
  }

  if (thumbnailsHidden === false) {
    plugins.push(Thumbnails)
  }

  plugins.push(...[Video])

  return plugins
}

export type LightBoxGalleryProps = Partial<LightBoxFeatureProps> & {
  className?: string
  items: Media[]
}

export default function LightBoxGallery({
  className,
  items,
  display: displayFromProps, // = 'carousel',
  carouselImageFit: carouselImageFitFromProps, // = 'cover',
  albumLayout: albumLayoutFromProps, // = 'masonry',
  thumbnailsPosition: thumbnailsPositionFromProps, // = 'bottom',
  thumbnailsHidden: thumbnailsHiddenFromProps, // = false,
  thumbnailsShowToggle: thumbnailsShowToggleFromProps, // = false,
  slideshowAutoplay: slideshowAutoplayFromProps, // = false,
  slideshowDelay: slideshowDelayFromProps, // = 3000,
  slideshowEnable: slideshowEnableFromProps, // = false,
  toolbarFullscreen: toolbarFullscreenFromProps, // = true,
  toolbarZoom: toolbarZoomFromProps, // = true,
  toolbarCounter: toolbarCounterFromProps, // = true,
}: LightBoxGalleryProps): React.ReactNode {
  const slideshowRef = React.useRef<SlideshowRef | null>(null)
  const thumbnailsRef = React.useRef<ThumbnailsRef | null>(null)
  const controllerRef = React.useRef<ControllerRef | null>(null)

  const [index, setIndex] = React.useState(-1)

  const [controls, _setControls] = React.useState(true)
  const [playsInline, _setPlaysInline] = React.useState(true)
  const [autoPlay, _setAutoPlay] = React.useState(false)
  const [loop, _setLoop] = React.useState(false)
  const [muted, _setMuted] = React.useState(false)
  const [disablePictureInPicture, _setDisablePictureInPicture] = React.useState(false)
  const [disableRemotePlayback, _setDisableRemotePlayback] = React.useState(false)
  const [controlsList, _setControlsList] = React.useState<
    ('nodownload' | 'nofullscreen' | 'noremoteplayback')[]
  >([])
  const [crossOrigin, _setCrossOrigin] = React.useState('')
  const [preload, _setPreload] = React.useState('')

  const [display, _setDisplay] = React.useState(displayFromProps)
  const [albumLayout, _setAlbumLayout] = React.useState(albumLayoutFromProps)
  const [carouselImageFit, _setCarouselImageFit] = React.useState(carouselImageFitFromProps)

  const [thumbnailsPosition, _setThumbnailsPosition] = React.useState(thumbnailsPositionFromProps)
  const [thumbnailsHidden, _setThumbnailsHidden] = React.useState(thumbnailsHiddenFromProps)
  const [thumbnailsShowToggle, _setThumbnailsShowToggle] = React.useState(
    thumbnailsShowToggleFromProps,
  )
  const [slideshowEnable, _setSlideshowEnable] = React.useState(slideshowEnableFromProps)
  const [slideshowAutoplay, _setSlideshowAutoplay] = React.useState(slideshowAutoplayFromProps)
  const [slideshowDelay, _setSlideshowDelay] = React.useState(slideshowDelayFromProps)
  const [toolbarFullscreen, _setToolbarFullscreen] = React.useState(toolbarFullscreenFromProps)
  const [toolbarZoom, _setToolbarZoom] = React.useState(toolbarZoomFromProps)
  const [toolbarCounter, _setToolbarCounter] = React.useState(toolbarCounterFromProps)

  const isDisplayAlbum = display === 'album'
  const isDisplayCarousel = display === 'carousel'
  const isDisplayInline = display === 'inline'

  const slides = mapMediaToSlides(items)

  const isSingleSlide = slides.length <= 1

  const toolbarButtons: ('close' | 'thumbnails' | 'fullscreen' | 'zoom' | 'slideshow')[] = []
  if (slideshowEnable) {
    toolbarButtons.push('slideshow')
  }
  if (toolbarZoom) {
    toolbarButtons.push('zoom')
  }
  if (toolbarFullscreen) {
    toolbarButtons.push('fullscreen')
  }
  toolbarButtons.push('close')

  // console.log(`Lightbox Gallery '${className}' Features:`, {
  //   display: display,
  //   carouselImageFit: carouselImageFit,
  //   albumLayout: albumLayout,
  //   thumbnailsPosition: thumbnailsPosition,
  //   thumbnailsHidden: thumbnailsHidden,
  //   thumbnailsShowToggle: thumbnailsShowToggle,
  //   slideshowAutoplay: slideshowAutoplay,
  //   slideshowDelay: slideshowDelay,
  //   slideshowEnable: slideshowEnable,
  //   toolbarFullscreen: toolbarFullscreen,
  //   toolbarZoom: toolbarZoom,
  //   toolbarCounter: toolbarCounter,
  // })

  const plugins = getEnabledPlugins({
    display,
    toolbarFullscreen,
    toolbarZoom,
    toolbarCounter,
    slideshowEnable,
    thumbnailsHidden,
  })

  const handleLightboxClose = () => {
    setIndex(-1)
  }

  const handleSlideClick = ({ index: _clickedSlideIndex }: ClickCallbackProps) => {
    const currentSlideshow = slideshowRef.current
    if (slideshowEnable && currentSlideshow) {
      const { playing } = currentSlideshow
      if (playing) {
        currentSlideshow.pause()
      } else {
        currentSlideshow.play()
      }
    }
  }

  const isSlideshow = () => {
    const currentSlideshow = slideshowRef.current
    return slideshowEnable && currentSlideshow
  }

  const toggleSlideshowPlayPause = () => {
    const currentSlideshow = slideshowRef.current
    if (slideshowEnable && currentSlideshow) {
      const { playing } = currentSlideshow
      if (playing) {
        currentSlideshow.pause()
      } else {
        currentSlideshow.play()
      }
    }
  }

  const handleKeyDownEvents = (event: React.KeyboardEvent) => {
    const { code } = event
    event.preventDefault()
    switch (code) {
      case 'Space': //Space
        if (!isDisplayInline && isSlideshow()) {
          console.log(`Pressed 32 (SPACE) with Slideshow Active.`)
          toggleSlideshowPlayPause()
        }
    }
  }

  const handleClickAlbumPhoto = ({ index: current }: ClickHandlerProps<Photo>) => {
    setIndex(current)
  }

  const handleView = ({ index: _currentIndex }: ViewCallbackProps) => {}

  return (
    <div
      onKeyDown={handleKeyDownEvents}
      className={cn('relative h-auto w-full', `gallery-layout-${display}`)}
    >
      {isDisplayAlbum && (
        <PhotoAlbum
          layout={albumLayout ?? 'masonry'}
          photos={slides as Photo[]}
          targetRowHeight={150}
          padding={1}
          spacing={1}
          onClick={handleClickAlbumPhoto}
          componentsProps={{
            image: {
              className: cn(
                isSingleSlide
                  ? ''
                  : 'rounded-none transition-[transform,border-radius] ease-in-out duration-300 delay-[250ms,0ms] hover:scale-110 hover:rounded-md hover:duration-[300ms,0ms] hover:delay-0 hover:ring-primary hover:ring-1',
              ),
            },
            button: {
              className: cn(
                isSingleSlide
                  ? ''
                  : cn(
                      '!p-0 hover:shadow-black hover:shadow-[0px_0px_30px_2px] ',
                      'z-0 transition-[transform,z-index] ease-in-out hover:duration-[300ms,0ms] hover:delay-0 delay-[250ms,0ms] transition-discrete hover:z-10',
                    ),
              ),
            },
          }}
        />
      )}
      <Lightbox
        index={index}
        className={cn(className)}
        inline={isDisplayInline || isDisplayCarousel ? InlineStyles : undefined}
        open={index >= 0}
        close={handleLightboxClose}
        slides={slides}
        controller={{ ref: controllerRef }}
        toolbar={{
          buttons: toolbarButtons,
        }}
        carousel={
          isDisplayCarousel
            ? {
                finite: isSingleSlide,
                padding: 0,
                spacing: 0,
                imageFit: carouselImageFit ?? undefined,
              }
            : undefined
        }
        slideshow={
          slideshowEnable
            ? {
                ref: slideshowRef,
                autoplay: slideshowAutoplay,
                delay: slideshowDelay,
              }
            : undefined
        }
        on={{
          click: handleSlideClick,
          view: handleView,
        }}
        render={{
          // buttonClose
          slideFooter: ({ slide }: { slide: Slide }) => (
            <MediaCaption
              className={`lightbox-slide-caption absolute bottom-0 z-0`}
              info={slide.info}
            />
          ),
          buttonPrev: isSingleSlide ? () => null : undefined,
          buttonNext: isSingleSlide ? () => null : undefined,
          slide: ({ slide }) => {
            if (slide.type === 'youtube') {
              return (
                <div
                  style={{
                    maxWidth: slide.width,
                    maxHeight: slide.height,
                    width: '100%',
                    aspectRatio: `${slide.width} / ${slide.height}`,
                  }}
                >
                  <iframe
                    src={slide.url}
                    width="100%"
                    height="100%"
                    title={slide.alt}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{ border: 0 }}
                  />
                </div>
              )
            }
            return undefined
          },
          thumbnail: (args) => {
            if (args.slide.type === 'youtube') {
              return <LightBoxSlide {...args} />
            }
            if (thumbnailsHidden === false) {
              return <LightBoxSlide {...args} />
            }
            return undefined
          },
        }}
        plugins={plugins}
        thumbnails={{
          ref: thumbnailsRef,
          position: thumbnailsPosition,
          hidden: thumbnailsHidden || isSingleSlide,
          showToggle: thumbnailsShowToggle,
          // width: ,
          // height: ,
          // border: ,
          // borderStyle: ,
          // borderColor: ,
          // borderRadius: ,
          // padding: ,
          // gap: ,
          // imageFit: ,
          // vignette: ,
        }}
        video={{
          controls,
          playsInline,
          autoPlay,
          loop,
          muted,
          disablePictureInPicture,
          disableRemotePlayback,
          controlsList: controlsList.join(' '),
          crossOrigin,
          preload,
        }}
      />
    </div>
  )
}
