import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  position?: 'left' | 'right'
  width?: string
}

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  width = '420px',
}: DrawerProps) => {
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

  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    [position]: 0,
    width,
    height: '100vh',
    background: 'var(--color-surface)',
    borderLeft: position === 'right' ? '1px solid var(--color-border)' : undefined,
    borderRight: position === 'left' ? '1px solid var(--color-border)' : undefined,
    boxShadow: 'var(--shadow-3)',
    zIndex: 'var(--z-drawer)',
    display: 'flex',
    flexDirection: 'column',
    animation: `drawer-slide-${position} var(--duration-emphasized) var(--easing-emphasized)`,
  }

  return createPortal(
    <>
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          zIndex: 'calc(var(--z-drawer) - 1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      />
      <div ref={contentRef} style={positionStyles}>
        {title && (
          <div
            style={{
              padding: 'var(--space-5)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 id="drawer-title" className="panel__title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="btn btn--ghost btn--sm"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-5)' }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: 'var(--space-4) var(--space-5)',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-surface-muted)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes drawer-slide-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes drawer-slide-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>,
    document.body,
  )
}

export default Drawer
export type { DrawerProps }
