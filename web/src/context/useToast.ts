import { useState, useCallback, useEffect } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastState {
  tone: ToastTone
  message: string
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const pushToast = useCallback((tone: ToastTone, message: string) => {
    setToast({ tone, message })
  }, [])

  const clearToast = useCallback(() => {
    setToast(null)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  return {
    toast,
    pushToast,
    clearToast,
  }
}
