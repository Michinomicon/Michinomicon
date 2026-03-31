'use client'
import { useState, useRef, useEffect, useId } from 'react'
import EyesPatternGeometry from './eyes-pattern-geometry'
import { useWallpaper } from '@/providers/Wallpaper'
import { cn } from '@/lib/utils'

const EYES_BACKGROUND_CONTAINER = 'eyes-background-container'
const EYES_BACKGROUND_BASE = 'eyes-background-base'
const EYES_BACKGROUND_STATIC_PATTERN = 'eyes-background-static-pattern'
const EYES_BACKGROUND_ACTIVE_TILE = 'eyes-background-active-tile'
const EYES_BACKGROUND_OVERLAY = 'eyes-background-overlay'

const TILE_SIZE = 300
const SPOTLIGHT_SIZE = 120
const LERP_FACTOR = 0.1 // Lower = more lag/heavier feel (Best results: 0.05 - 0.15)

type InteractiveBackgroundProps = {
  enableSpotlight?: boolean
  enableReactiveTile?: boolean
}

export default function InteractiveBackground({
  enableSpotlight: localSpotlight,
  enableReactiveTile: localReactiveTile,
}: InteractiveBackgroundProps) {
  const instanceId = useId()
  const { globalSpotlight, globalReactiveTile } = useWallpaper()
  const isSpotlightActive = globalSpotlight && localSpotlight === true
  const isReactiveTileActive = globalReactiveTile && localReactiveTile === true
  // Actual Cursor Coords
  const mouseRef = useRef({ x: -9999, y: -9999 })

  // Current interaction coords
  // > the "spotlight" that lags behind cursor
  const spotlightPositionRef = useRef({ x: -9999, y: -9999 })
  const spotlightOverlayRef = useRef<HTMLDivElement>(null)
  const activeTileRef = useRef<SVGSVGElement>(null)
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Capture the REAL mouse position instantly
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseEnter = () => {
      setIsHovering(true)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    const animateMousemove = () => {
      const cursor = mouseRef.current // Actual cursor coords
      const spotlight = spotlightPositionRef.current // Spotlight coords

      // Move spotlight gradually towards cursor
      const dx = cursor.x - spotlight.x
      const dy = cursor.y - spotlight.y

      // If we are very close, stop interpolating to save CPU
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        spotlight.x += dx * LERP_FACTOR
        spotlight.y += dy * LERP_FACTOR

        // Update the spotlight coords
        if (isSpotlightActive && spotlightOverlayRef.current) {
          container.style.setProperty('--mouse-x', `${spotlight.x}px`)
          container.style.setProperty('--mouse-y', `${spotlight.y}px`)
        }

        // Update the active tile coords
        if (isReactiveTileActive && activeTileRef.current) {
          // lag behind cursor with spotlight so the active tile stays under the spotlight
          const snapX = Math.floor(spotlight.x / TILE_SIZE) * TILE_SIZE
          const snapY = Math.floor(spotlight.y / TILE_SIZE) * TILE_SIZE

          activeTileRef.current.style.transform = `translate3d(${snapX}px, ${snapY}px, 0)`
        }
      }

      requestRef.current = requestAnimationFrame(animateMousemove)
    }

    // Start listeners and loop
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    requestRef.current = requestAnimationFrame(animateMousemove)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(requestRef.current)
    }
  }, [isReactiveTileActive, isSpotlightActive])

  return (
    <div
      ref={containerRef}
      id={`eyesBackgroundContainer-${instanceId}`}
      className={cn(
        EYES_BACKGROUND_CONTAINER,
        'fixed inset-0 z-0 overflow-hidden bg-(--pattern-background-color)',
        isSpotlightActive ? 'spotlight-active' : 'spotlight-disabled',
        isReactiveTileActive ? 'reactive-active' : 'reactive-disabled',
      )}
      style={
        {
          '--mouse-x': '-9999px',
          '--mouse-y': '-9999px',
        } as React.CSSProperties
      }
    >
      <svg
        id={`eyesBackgroundBase-${instanceId}`}
        className={cn(EYES_BACKGROUND_BASE, 'absolute inset-0 h-full w-full pointer-events-none')}
      >
        <defs>
          <pattern
            className={cn(EYES_BACKGROUND_STATIC_PATTERN)}
            id={`staticPattern-${instanceId}`}
            width={TILE_SIZE}
            height={TILE_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <EyesPatternGeometry instanceId={instanceId} />
          </pattern>
        </defs>
        <rect
          id={`staticBackground-${instanceId}`}
          width="100%"
          height="100%"
          fill={`url(#staticPattern-${instanceId})`}
        />
      </svg>
      {isReactiveTileActive && (
        <svg
          id={`activeTile-${instanceId}`}
          ref={activeTileRef}
          width={TILE_SIZE}
          height={TILE_SIZE}
          className={cn(EYES_BACKGROUND_ACTIVE_TILE, `absolute left-0 top-0 pointer-events-auto`)}
        >
          <EyesPatternGeometry
            instanceId={instanceId}
            activeGroup={hoveredGroup}
            onHoverChange={setHoveredGroup}
          />
        </svg>
      )}

      {isSpotlightActive && (
        <div
          id={`eyesBackgroundOverlay-${instanceId}`}
          ref={spotlightOverlayRef}
          className={cn(
            EYES_BACKGROUND_OVERLAY,
            `absolute inset-0 -m-[${SPOTLIGHT_SIZE * 2}px] pointer-events-none bg-(--pattern-overlay-color) opacity-(--pattern-overlay-opacity) transition-opacity duration-500`,
          )}
          style={{
            opacity: isHovering
              ? 'var(--pattern-overlay-opacity)'
              : 'var(--pattern-overlay-inactive-opacity)',
            maskImage: isHovering
              ? `radial-gradient(${SPOTLIGHT_SIZE}px circle at var(--mouse-x) var(--mouse-y), transparent 0%, black 100%)`
              : 'none',
          }}
        />
      )}
    </div>
  )
}
