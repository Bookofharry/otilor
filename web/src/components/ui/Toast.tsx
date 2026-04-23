import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ToastTone = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  tone?: ToastTone
  duration?: number
  onClose?: () => void
}

const Toast = ({ message, tone = 'info', duration = 2400, onClose }: ToastProps) => {
  useEffect(() => {
    if (!onClose) return
    const timeout = setTimeout(onClose, duration)
    return () => clearTimeout(timeout)
  }, [duration, onClose])

  const toneClasses = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
    warning: 'toast-info',
  }

  return createPortal(
    <div
      className={`toast ${toneClasses[tone]}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>,
    document.body,
  )
}

export default Toast
export type { ToastProps, ToastTone }
