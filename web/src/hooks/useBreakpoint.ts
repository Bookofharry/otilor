import { useState, useEffect } from 'react'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface BreakpointState {
  breakpoint: Breakpoint
  width: number
  isMobile: boolean // xs, sm
  isTablet: boolean // md
  isDesktop: boolean // lg, xl, 2xl
  isAtLeastSm: boolean
  isAtLeastMd: boolean
  isAtLeastLg: boolean
  isAtLeastXl: boolean
  isAtLeast2Xl: boolean
}

const getBreakpoint = (width: number): Breakpoint => {
  if (width < 480) return 'xs'
  if (width < 768) return 'sm'
  if (width < 1024) return 'md'
  if (width < 1280) return 'lg'
  if (width < 1440) return 'xl'
  return '2xl'
}

export function useBreakpoint(): BreakpointState {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const breakpoint = getBreakpoint(width)

  return {
    breakpoint,
    width,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isAtLeastSm: width >= 480,
    isAtLeastMd: width >= 768,
    isAtLeastLg: width >= 1024,
    isAtLeastXl: width >= 1280,
    isAtLeast2Xl: width >= 1440,
  }
}
