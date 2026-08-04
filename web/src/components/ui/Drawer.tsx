import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../hooks/useFocusTrap'

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
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    [position]: 0,
    width,
    height: '100vh',
    background: 'var(--color-surface, #ffffff)',
    borderLeft: position === 'right' ? '1px solid var(--color-border)' : undefined,
    borderRight: position === 'left' ? '1px solid var(--color-border)' : undefined,
    boxShadow: 'var(--shadow-xl)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    animation: `drawer-slide-${position} 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
  }

  return createPortal(
    <>
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          zIndex: 999,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      />
      <div ref={focusTrapRef} style={positionStyles}>
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
