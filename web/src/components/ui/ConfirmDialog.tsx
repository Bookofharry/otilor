import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  isLoading?: boolean
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="overlay-wrap"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="overlay-backdrop" />
      <div ref={focusTrapRef} className="send-panel max-w-sm">
        <div className="panel__header">
          <h3 id="confirm-dialog-title" className="panel__title">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn btn--ghost btn--sm"
            aria-label="Close dialog"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>
        <p id="confirm-dialog-message" className="text-secondary">
          {message}
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-4)',
          }}
        >
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmDialog
export type { ConfirmDialogProps }
