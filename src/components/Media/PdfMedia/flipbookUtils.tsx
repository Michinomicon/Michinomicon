export const FlipbookElementClassIndex = {
  hiddenCover: 'hidden-cover', // Hidden cover element
  book: 'c-flipbook', // Flipbook element
  page: 'c-flipbook__page', // Page element
} as const
export type FlipbookElement = keyof typeof FlipbookElementClassIndex
export type PageElementType = keyof Pick<typeof FlipbookElementClassIndex, 'page'>
export type BookElementType = keyof Pick<typeof FlipbookElementClassIndex, 'book'>
export type FlipbookElementClass = (typeof FlipbookElementClassIndex)[FlipbookElement]
export type FlipbookElementStatus = {
  [K in FlipbookElement]: boolean
}

export const FlipbookStateClassIndex = {
  atFrontCover: 'at-front-cover', // Book is at front cover
  atBackCover: 'at-rear-cover', // Book is at back cover
  isReady: 'is-ready', // Book is initialized
} as const
export type FlipbookState = keyof typeof FlipbookStateClassIndex
export type FlipbookStateClass = (typeof FlipbookStateClassIndex)[FlipbookState]
export type FlipbookStateSelector = (typeof FlipbookStateClassIndex)[FlipbookState][]
export type FlipbookStateStatus = {
  [K in FlipbookState]: boolean
}

export const FlipbookPageStateClassIndex = {
  isActive: 'is-active', // Page is active
  firstPage: 'first-page', // First page
  lastPage: 'last-page', // Last page
  isAnimating: 'is-animating', // Page is animating
  wasActive: 'was-active', // Page was active
  isCalling: 'is-calling', // Callout animation
} as const

export type FlipbookPageState = keyof typeof FlipbookPageStateClassIndex
export type FlipbookPageStateClass = (typeof FlipbookPageStateClassIndex)[FlipbookPageState]
export type FlipbookPageStateSelector = (typeof FlipbookPageStateClassIndex)[FlipbookPageState][]
export type FlipbookPageStateStatus = {
  [K in FlipbookPageState]: boolean
}

export const isFlipbookElement = (
  flipbookElement: HTMLElement | null,
): flipbookElement is HTMLElement => {
  if (flipbookElement && flipbookElement.classList.contains(FlipbookElementClassIndex.book)) {
    return true
  }
  return false
}

export const isFlipbookPageElement = (
  flipbookPageElement: HTMLElement | null,
): flipbookPageElement is HTMLElement => {
  if (
    flipbookPageElement &&
    (flipbookPageElement.classList.contains(FlipbookElementClassIndex.page) ||
      !flipbookPageElement.classList.contains(FlipbookElementClassIndex.hiddenCover))
  ) {
    return true
  }
  return false
}

export const getFlipbookState = (flipbookElement: HTMLElement | null) => {
  const state: FlipbookStateStatus = {
    atFrontCover: false,
    atBackCover: false,
    isReady: false,
  }
  if (!isFlipbookElement(flipbookElement)) {
    return
  }

  for (const item of Object.keys(state) as FlipbookState[]) {
    state[item] = flipbookElement.classList.contains(FlipbookStateClassIndex[item])
  }
  return state
}

export const getFlipbookPageState = (flipbookPageElement: HTMLElement | null) => {
  const state: FlipbookPageStateStatus = {
    isActive: false,
    firstPage: false,
    lastPage: false,
    isAnimating: false,
    wasActive: false,
    isCalling: false,
  }
  if (!isFlipbookPageElement(flipbookPageElement)) {
    return
  }

  for (const item of Object.keys(state) as FlipbookPageState[]) {
    state[item] = flipbookPageElement.classList.contains(FlipbookPageStateClassIndex[item])
  }

  return state
}

export function asFlipbookSlelector(
  element: BookElementType,
  classes?: FlipbookStateSelector,
): string
export function asFlipbookSlelector(
  element: PageElementType,
  classes?: FlipbookPageStateSelector,
): string
export function asFlipbookSlelector(
  element: BookElementType | PageElementType,
  classes: FlipbookPageStateSelector | FlipbookStateSelector = [],
): string {
  if (element === 'book') {
    return `.${[FlipbookElementClassIndex[element], ...classes].join(`.`)}`
  } else {
    return `.${[FlipbookElementClassIndex[element], ...classes].join(`.`)}`
  }
}

export const FirstPageActiveSelector = asFlipbookSlelector('page', [
  FlipbookPageStateClassIndex.firstPage,
  FlipbookPageStateClassIndex.isActive,
])
export const LastPageActiveSelector = asFlipbookSlelector('page', [
  FlipbookPageStateClassIndex.lastPage,
  FlipbookPageStateClassIndex.isActive,
])

export function clearFlipbookPageIsActiveClasses(flipbookElementId: string) {
  const flipbookContainer: HTMLElement | null = document.getElementById(flipbookElementId)
  if (!flipbookContainer) {
    console.debug(
      `Error clearing 'is-active' classes from flipbook pages. Flipbook Container Element not found.`,
    )
    return
  }

  // Clear current DOM state
  const pages = flipbookContainer.querySelectorAll(asFlipbookSlelector('page'))
  pages.forEach((page) => {
    if (page.classList.contains('is-active')) {
      const pageNumber = page.querySelector('.react-pdf__Page')?.getAttribute('data-page-number')
      console.debug(`cleared 'is-active' from data-page-number="${pageNumber}"`, page)
    }
    page.classList.remove('is-active')
  })
}
