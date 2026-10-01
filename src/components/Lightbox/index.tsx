'use client'

import { Media } from '@/payload-types'
import React from 'react'
import Lightbox, {
  ClickCallbackProps,
  ImageFit,
  Plugin as LightboxPlugin,
  SlideshowRef,
  ViewCallbackProps,
} from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Inline from 'yet-another-react-lightbox/plugins/inline'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Video from 'yet-another-react-lightbox/plugins/video'
import { ClickHandlerProps, Photo, RowsPhotoAlbum } from 'react-photo-album'
import 'react-photo-album/rows.css'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import LightBoxSlide, { mapMediaToSlides } from './Slide'
import { cn } from '@/utilities/ui'

const InlineStyles = {
  style: {
    width: '100%',
    maxWidth: '900px',
    aspectRatio: '3 / 2',
    margin: '0 auto',
  },
}

type AvailablePlugin = string &
  ('inline' | 'fullscreen' | 'zoom' | 'thumbnails' | 'counter' | 'slideshow')
type PluginIndex = { [pluginName in AvailablePlugin]: LightboxPlugin }

const AvailablePluginIndex: PluginIndex = {
  inline: Inline,
  fullscreen: Fullscreen,
  zoom: Zoom,
  thumbnails: Thumbnails,
  counter: Counter,
  slideshow: Slideshow,
}

type PluginEnabledState = {
  [pluginName in AvailablePlugin]?: boolean
}

interface BaseFeatureProps extends PluginEnabledState {
  carousel?: boolean
  imageFit?: ImageFit | undefined
}

type LightBoxFeatureProps = BaseFeatureProps

const DefaultFeatures: LightBoxFeatureProps = {
  inline: false,
  fullscreen: true,
  zoom: true,
  thumbnails: false,
  carousel: true,
  counter: true,
  slideshow: false,
  imageFit: 'cover',
}

function getEnabledPlugins(features: BaseFeatureProps): LightboxPlugin[] {
  const plugins: LightboxPlugin[] = []

  for (const feature of Object.keys(features) as AvailablePlugin[]) {
    if (Object.keys(AvailablePluginIndex).includes(feature) && features[feature] === true) {
      plugins.push(AvailablePluginIndex[feature as AvailablePlugin])
    }
  }

  return plugins
}

export type LightBoxGalleryProps = {
  className?: string
  items: Media[]
  features?: Partial<LightBoxFeatureProps>
}

export default function LightBoxGallery({
  className,
  items,
  features = DefaultFeatures,
}: LightBoxGalleryProps): React.ReactNode {
  const slideshowRef = React.useRef<SlideshowRef | null>(null)

  const [index, setIndex] = React.useState(-1)
  const [autoplay, _setAutoplay] = React.useState(false)
  const [delay, _setDelay] = React.useState(3000)
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

  //   const slideProperties =
  const slides = mapMediaToSlides(items)

  const useInline = features?.inline === true
  const useCarousel = useInline && features?.carousel === true
  const useThumbnails = features?.thumbnails === true
  const useSlideShow = features?.slideshow === true

  const plugins = getEnabledPlugins(features)

  const handleLightboxClose = () => {
    setIndex(-1)
  }

  const handleSlideClick = ({ index: _clickedSlideIndex }: ClickCallbackProps) => {
    const currentSlideshow = slideshowRef.current
    if (useSlideShow && currentSlideshow) {
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
    return useSlideShow && currentSlideshow
  }

  const toggleSlideshowPlayPause = () => {
    const currentSlideshow = slideshowRef.current
    if (useSlideShow && currentSlideshow) {
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
        if (!useInline && isSlideshow()) {
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
    <div onKeyDown={handleKeyDownEvents} className={cn('relative h-auto w-full')}>
      {!useInline && (
        <RowsPhotoAlbum
          photos={slides as Photo[]}
          targetRowHeight={150}
          padding={1}
          spacing={1}
          onClick={handleClickAlbumPhoto}
          componentsProps={{
            button: {
              className: cn(
                'hover:-mt-1 hover:ring-3 hover:ring-primary hover:shadow-[0px_0px_30px_2px] hover:shadow-primary/40 hover:rounded-md overflow-hidden',
              ),
            },
          }}
        />
      )}
      <Lightbox
        index={index}
        className={cn(className)}
        {...(useInline
          ? {
              inline: InlineStyles,
              carousel: useCarousel
                ? {
                    padding: 0,
                    spacing: 0,
                    imageFit: features?.imageFit,
                  }
                : undefined,
            }
          : {})}
        open={index >= 0}
        close={handleLightboxClose}
        slides={slides}
        slideshow={useSlideShow ? { ref: slideshowRef, autoplay, delay } : undefined}
        on={{
          click: handleSlideClick,
          view: handleView,
        }}
        render={{
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
            if (useThumbnails) {
              return <LightBoxSlide {...args} />
            }
            return undefined
          },
        }}
        plugins={[Video, ...plugins]}
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
