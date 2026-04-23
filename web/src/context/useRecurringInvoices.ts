import { useState, useCallback } from 'react'
import { parseDateValue, toDateOnly } from '../app/invoiceUtils'
import type { RecurringInvoice, RecurrenceInterval } from '../app/types'

interface UseRecurringInvoicesReturn {
  recurringInvoices: RecurringInvoice[]
  isLoading: boolean
  error: string | null
  createRecurringInvoice: (data: Omit<RecurringInvoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateRecurringInvoice: (id: string, data: Partial<RecurringInvoice>) => Promise<void>
  deleteRecurringInvoice: (id: string) => Promise<void>
  toggleRecurringInvoice: (id: string) => Promise<void>
}

export function useRecurringInvoices(): UseRecurringInvoicesReturn {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRecurringInvoice = useCallback(async (data: Omit<RecurringInvoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      const newInvoice: RecurringInvoice = {
        ...data,
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      }
      setRecurringInvoices(prev => [...prev, newInvoice])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recurring invoice')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateRecurringInvoice = useCallback(async (id: string, data: Partial<RecurringInvoice>) => {
    setIsLoading(true)
    setError(null)
    try {
      setRecurringInvoices(prev =>
        prev.map(inv =>
          inv.id === id
            ? { ...inv, ...data, updatedAt: new Date().toISOString() }
            : inv
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recurring invoice')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteRecurringInvoice = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      setRecurringInvoices(prev => prev.filter(inv => inv.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recurring invoice')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleRecurringInvoice = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      setRecurringInvoices(prev =>
        prev.map(inv =>
          inv.id === id
            ? { ...inv, isActive: !inv.isActive, updatedAt: new Date().toISOString() }
            : inv
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle recurring invoice')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    recurringInvoices,
    isLoading,
    error,
    createRecurringInvoice,
    updateRecurringInvoice,
    deleteRecurringInvoice,
    toggleRecurringInvoice,
  }
}

// Helper function to calculate next invoice date
export function calculateNextInvoiceDate(
  interval: RecurrenceInterval,
  fromDate: string
): string {
  const date = parseDateValue(fromDate)
  if (!date) return fromDate
  
  switch (interval) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
  }
  
  return toDateOnly(date)
}
