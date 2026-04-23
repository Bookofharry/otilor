import type { ToastState } from '../app/types'

interface ToastProps {
  toast: ToastState | null
}

function Toast({ toast }: ToastProps) {
  if (!toast) return null

  return (
    <div className={`toast toast-${toast.tone}`} role="status">
      {toast.message}
    </div>
  )
}

export default Toast
