import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
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

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="overlay-wrap"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="overlay-backdrop" />
      <div
        ref={focusTrapRef}
        className={`send-panel ${sizeClasses[size]}`}
        style={{ width: '100%' }}
      >
        {title && (
          <div className="panel__header">
            <h3 id="modal-title" className="panel__title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="btn btn--ghost btn--sm"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
export type { ModalProps }
