import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap<T extends HTMLElement>(isOpen: boolean, onClose?: () => void) {
  const ref = useRef<T | null>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Store currently active element to restore later
    previousFocus.current = document.activeElement as HTMLElement | null

    const container = ref.current
    if (!container) return

    // Focus first focusable element inside container
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => el.offsetParent !== null)

    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    } else {
      container.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const elements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null)

      if (elements.length === 0) {
        e.preventDefault()
        return
      }

      const firstEl = elements[0]
      const lastEl = elements[elements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab: if on first element, wrap around to last
        if (document.activeElement === firstEl || !container.contains(document.activeElement)) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        // Tab: if on last element, wrap around to first
        if (document.activeElement === lastEl || !container.contains(document.activeElement)) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore previous focus when overlay closes
      if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
        previousFocus.current.focus()
      }
    }
  }, [isOpen, onClose])

  return ref
}
