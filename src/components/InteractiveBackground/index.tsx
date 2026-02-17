'use client'
import { useState, useRef, useEffect } from 'react'
import EyesPatternGeometry from './eyes-pattern-geometry'

const TILE_SIZE = 300
const SPOTLIGHT_SIZE = 120
const LERP_FACTOR = 0.1 // Lower = more lag/heavier feel (Best results: 0.05 - 0.15)

export default function InteractiveBackground() {
  // Actual Cursor Coords
  const mouseRef = useRef({ x: -9999, y: -9999 })

  // Current interaction coords
  // > lags behind cursor
  const spotlightRef = useRef({ x: -9999, y: -9999 })

  const [activeTile, setActiveTile] = useState<{ x: number; y: number } | null>(null)
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
      const spotlight = spotlightRef.current // Spotlight coords

      // Move spotlight gradually towards cursor
      const dx = cursor.x - spotlight.x
      const dy = cursor.y - spotlight.y

      // If we are very close, stop interpolating to save CPU
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        spotlight.x += dx * LERP_FACTOR
        spotlight.y += dy * LERP_FACTOR

        // Update the spotlight coords
        container.style.setProperty('--mouse-x', `${spotlight.x}px`)
        container.style.setProperty('--mouse-y', `${spotlight.y}px`)

        // Update the active tile coords
        // lag behind cursor with spotlight so the active tile stays under the spotlight
        const snapX = Math.floor(spotlight.x / TILE_SIZE) * TILE_SIZE
        const snapY = Math.floor(spotlight.y / TILE_SIZE) * TILE_SIZE

        setActiveTile((prev) => {
          if (prev?.x === snapX && prev?.y === snapY) return prev
          // Only if value changed
          return { x: snapX, y: snapY }
        })
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
  }, [])

  return (
    <div
      ref={containerRef}
      id="eyesBackgroundContainer"
      className="fixed inset-0 z-0 overflow-hidden bg-(--pattern-background-color)"
      style={
        {
          '--mouse-x': '-9999px',
          '--mouse-y': '-9999px',
        } as React.CSSProperties
      }
    >
      <svg id="wallpaperBase" className="absolute inset-0 h-full w-full pointer-events-none">
        <defs>
          <pattern
            className="staticPattern"
            id="staticPattern"
            width={TILE_SIZE}
            height={TILE_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <EyesPatternGeometry />
          </pattern>
        </defs>
        <rect id="staticBackground" width="100%" height="100%" fill="url(#staticPattern)" />
      </svg>

      {activeTile && (
        <svg
          id="activeTile"
          width={TILE_SIZE}
          height={TILE_SIZE}
          className={`eyesBackground absolute left-0 top-0 pointer-events-auto`}
          style={{
            transform: `translate3d(${activeTile.x}px, ${activeTile.y}px, 0)`,
            pointerEvents: 'auto',
          }}
        >
          <EyesPatternGeometry activeGroup={hoveredGroup} onHoverChange={setHoveredGroup} />
        </svg>
      )}
      <div
        id="wallpaperOverlay"
        className={`absolute inset-0 -m-[${SPOTLIGHT_SIZE * 2}px] pointer-events-none bg-(--pattern-overlay-color) opacity-(--pattern-overlay-opacity) transition-opacity duration-500`}
        style={{
          opacity: isHovering
            ? 'var(--pattern-overlay-opacity)'
            : 'var(--pattern-overlay-inactive-opacity)',
          maskImage: isHovering
            ? `radial-gradient(${SPOTLIGHT_SIZE}px circle at var(--mouse-x) var(--mouse-y), transparent 0%, black 100%)`
            : 'none',
        }}
      />
    </div>
  )
}
