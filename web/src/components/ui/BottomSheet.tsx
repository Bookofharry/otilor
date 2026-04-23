import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  height?: string
}

const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  height = '70vh',
}: BottomSheetProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    }

    // Focus trap
    const content = contentRef.current
    if (content) {
      const focusableElements = content.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      firstElement?.focus()

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTabKey)
      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTabKey)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <>
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          zIndex: 'var(--z-drawer)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      />
      <div
        ref={contentRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height,
          background: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-3)',
          zIndex: 'var(--z-drawer)',
          display: 'flex',
          flexDirection: 'column',
          animation: `bottom-sheet-slide var(--duration-emphasized) var(--easing-emphasized)`,
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 'var(--space-3)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '4px',
              background: 'var(--color-neutral-300)',
              borderRadius: 'var(--radius-pill)',
            }}
          />
        </div>

        {title && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-5) var(--space-4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 id="bottom-sheet-title" className="panel__title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="btn btn--ghost btn--sm"
              aria-label="Close bottom sheet"
            >
              ✕
            </button>
          </div>
        )}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: title ? '0 var(--space-5) var(--space-5)' : 'var(--space-5)',
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: 'var(--space-4) var(--space-5) calc(var(--space-4) + env(safe-area-inset-bottom))',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-surface-muted)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes bottom-sheet-slide {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>,
    document.body,
  )
}

export default BottomSheet
export type { BottomSheetProps }
