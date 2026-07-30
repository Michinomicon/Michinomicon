// Light Gallery Props that are safe to change per instance

import { LightGalleryAllSettings, LightGallerySettings } from 'lightgallery/lg-settings'
import { LightGalleryProps } from 'lightgallery/react'

export const prevIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>`
export const nextIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>`

export type GalleryEventHandlers = Partial<
  Omit<LightGalleryProps, keyof LightGallerySettings | 'children' | 'elementClassNames'>
>

// Settings that should only ever be set inside the base component
export type InternalGallerySettings = Pick<
  LightGalleryAllSettings,
  'isMobile' | 'width' | 'plugins' | 'mode' | 'prevHtml' | 'nextHtml' | 'videojs' | 'addClass'
>

// Settings that can be changed
export type MediaGallerySettings = Partial<
  Omit<LightGalleryAllSettings, keyof InternalGallerySettings | 'container' | 'licenseKey'>
>

const BaseSettings: MediaGallerySettings = {
  /* Light Gallery Core Settings */
  controls: true,
  showMaximizeIcon: true,
  zoomFromOrigin: false,
  closable: false,
  showCloseIcon: false,
  allowMediaOverlap: true,
  counter: true,
  loop: true,
  escKey: true,
  mousewheel: true,
  download: false,
  backdropDuration: 100,
  hideScrollbar: true,
  startAnimationDuration: 100,
  speed: 300,
  appendSubHtmlTo: '.lg-sub-html',
  subHtmlSelectorRelative: false,

  /* lgZoom Plugin Settings */
  zoom: true,

  /* lgVideo Plugin Settings */
  youTubePlayerParams: {
    modestbranding: 1,
    showinfo: 0,
    rel: 0,
    controls: 1,
  },
  autoplayVideoOnSlide: false,
  autoplayFirstVideo: false,
  gotoNextSlideOnVideoEnd: false,

  /* lgThumbnail Plugin Settings */
  loadYouTubeThumbnail: false,
  currentPagerPosition: 'middle',
  alignThumbnails: 'middle',
  thumbnail: true,
  animateThumb: false,
}

const DefaultLayoutSettings: MediaGallerySettings = {
  ...BaseSettings,
  controls: true,
  showMaximizeIcon: false,
  thumbnail: true,
  closable: true,
  showCloseIcon: true,
  allowMediaOverlap: true,

  zoomFromOrigin: false,
  counter: true,
  loop: true,
  escKey: true,
  mousewheel: false,
  download: false,
  backdropDuration: 100,
  hideScrollbar: true,
  startAnimationDuration: 100,
  speed: 300,
  appendSubHtmlTo: '.lg-sub-html',
  subHtmlSelectorRelative: false,
}

const InlineLayoutSettings: MediaGallerySettings = {
  ...BaseSettings,
  controls: true,
  showMaximizeIcon: false,
  thumbnail: true,
  closable: false,
  showCloseIcon: false,
  allowMediaOverlap: true,
  mousewheel: false,
  autoplayVideoOnSlide: true,
}
const CardLayoutSettings: MediaGallerySettings = {
  ...BaseSettings,
  controls: true,
  showMaximizeIcon: false,
  thumbnail: false,
  closable: false,
  showCloseIcon: false,
  allowMediaOverlap: true,
  preload: 3,
}
const MediaBlockLayoutSettings: MediaGallerySettings = {
  ...BaseSettings,
  closable: true,
  showCloseIcon: false,
  thumbnail: false,
  controls: false,
  showMaximizeIcon: false,
  mousewheel: false,
  download: false,
  enableDrag: false,
  escKey: true,
}

export const LayoutVariantSettings = {
  default: DefaultLayoutSettings,
  inline: InlineLayoutSettings,
  card: CardLayoutSettings,
  mediaBlock: MediaBlockLayoutSettings,
} as const
export type GalleryLayout = `${keyof typeof LayoutVariantSettings}`

export function applyLayoutSettings(
  layout: GalleryLayout,
  setings?: MediaGallerySettings | null | undefined,
): MediaGallerySettings {
  const layoutSettings: MediaGallerySettings = LayoutVariantSettings[layout]
  if (setings) {
    const updatedSettings: MediaGallerySettings = {
      ...setings,
      ...layoutSettings,
    }
    return updatedSettings
  }
  return layoutSettings
}

// const test: ImageGallerySettings = {
//   easing: '',
//   speed: 0,
//   height: '',
//   startClass: '',
//   zoomFromOrigin: false,
//   startAnimationDuration: 0,
//   backdropDuration: 0,
//   hideBarsDelay: 0,
//   showBarsAfter: 0,
//   slideDelay: 0,
//   supportLegacyBrowser: false,
//   allowMediaOverlap: false,
//   videoMaxSize: '',
//   loadYouTubePoster: false,
//   defaultCaptionHeight: 0,
//   ariaLabelledby: '',
//   ariaDescribedby: '',
//   hideScrollbar: false,
//   resetScrollPosition: false,
//   closable: false,
//   swipeToClose: false,
//   closeOnTap: false,
//   showCloseIcon: false,
//   showMaximizeIcon: false,
//   loop: false,
//   escKey: false,
//   keyPress: false,
//   trapFocus: false,
//   controls: false,
//   slideEndAnimation: false,
//   hideControlOnEnd: false,
//   mousewheel: false,
//   getCaptionFromTitleOrAlt: false,
//   appendSubHtmlTo: '.lg-sub-html',
//   subHtmlSelectorRelative: false,
//   preload: 0,
//   numberOfSlideItemsInDom: 0,
//   selector: '',
//   selectWithin: '',
//   index: 0,
//   iframeWidth: '',
//   iframeHeight: '',
//   iframeMaxWidth: '',
//   iframeMaxHeight: '',
//   download: false,
//   counter: false,
//   appendCounterTo: '',
//   swipeThreshold: 0,
//   enableSwipe: false,
//   enableDrag: false,
//   dynamic: false,
//   dynamicEl: [],
//   extraProps: [],
//   exThumbImage: '',
//   mobileSettings: {},
// strings: {
//   closeGallery: string,
//   toggleMaximize: string,
//   previousSlide: string,
//   nextSlide: string,
//   download: string,
//   playVideo: string,
//   mediaLoadingFailed: string
// }
//   scale: 0,
//   zoom: false,
//   infiniteZoom: false,
//   actualSize: false,
//   enableZoomAfter: 0,
//   showZoomInOutIcons: false,
//   actualSizeIcons: { zoomIn: 'lg-actual-size', zoomOut: 'lg-zoom-out' },
//   zoomPluginStrings: {
//         zoomIn: string;
//         zoomOut: string;
//         viewActualSize: string;
//     },
//   thumbnail: false,
//   animateThumb: false,
//   currentPagerPosition: 'middle',
//   alignThumbnails: 'middle',
//   thumbWidth: 0,
//   thumbHeight: '',
//   thumbMargin: 0,
//   appendThumbnailsTo: '.lg-outer',
//   toggleThumb: false,
//   enableThumbDrag: false,
//   enableThumbSwipe: false,
//   thumbnailSwipeThreshold: 0,
//   loadYouTubeThumbnail: false,
//   youTubeThumbSize: 0,
//   thumbnailPluginStrings: undefined,
//   autoplayFirstVideo: false,
//   youTubePlayerParams: undefined,
//   vimeoPlayerParams: false,
//   wistiaPlayerParams: undefined,
//   gotoNextSlideOnVideoEnd: false,
//   autoplayVideoOnSlide: false,
//   videojsTheme: '',
//   videojsOptions: undefined,
//   autoplay: false,
//   slideShowAutoplay: false,
//   slideShowInterval: 0,
//   progressBar: false,
//   forceSlideShowAutoplay: false,
//   autoplayControls: false,
//   appendAutoplayControlsTo: '',
//   autoplayPluginStrings: undefined,
//   commentBox: false,
//   fbComments: false,
//   disqusComments: false,
//   disqusConfig: {
//     title: undefined,
//     language: '',
//   },
//   commentsMarkup: '',
//   commentPluginStrings: undefined,
//   fullScreen: false,
//   fullscreenPluginStrings: undefined,
//   hash: false,
//   galleryId: '',
//   customSlideName: false,
//   pager: false,
//   rotate: false,
//   rotateSpeed: 0,
//   rotateLeft: false,
//   rotateRight: false,
//   flipHorizontal: false,
//   flipVertical: false,
//   rotatePluginStrings: undefined,
//   share: false,
//   facebook: false,
//   facebookDropdownText: '',
//   twitter: false,
//   twitterDropdownText: '',
//   pinterest: false,
//   pinterestDropdownText: '',
//   additionalShareOptions: [],
//   sharePluginStrings: undefined,
//   mediumZoom: false,
//   margin: 0,
//   backgroundColor: '',
// }
