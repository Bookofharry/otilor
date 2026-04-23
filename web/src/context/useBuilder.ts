import { useState, useCallback } from 'react'
import type { BuilderForm, LineItem, Invoice } from '../app/types'
import { emptyBuilder, toBuilder } from '../app/invoiceUtils'

export function useBuilder() {
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [builder, setBuilder] = useState<BuilderForm>(emptyBuilder())
  const [builderError, setBuilderError] = useState<string | null>(null)

  const patchBuilder = useCallback((patch: Partial<BuilderForm>) => {
    setBuilder((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetBuilder = useCallback(() => {
    setBuilder(emptyBuilder())
    setEditingInvoiceId(null)
    setBuilderError(null)
  }, [])

  const loadInvoiceForEdit = useCallback((invoice: Invoice) => {
    setBuilder(toBuilder(invoice))
    setEditingInvoiceId(invoice.id)
    setBuilderError(null)
  }, [])

  const addItem = useCallback(() => {
    setBuilder((prev) => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 0, unitPrice: 0 }],
    }))
  }, [])

  const updateItem = useCallback((itemId: string, patch: Partial<LineItem>) => {
    setBuilder((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }))
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setBuilder((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== itemId) : prev.items,
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setBuilderError(error)
  }, [])

  return {
    editingInvoiceId,
    builder,
    builderError,
    patchBuilder,
    resetBuilder,
    loadInvoiceForEdit,
    addItem,
    updateItem,
    removeItem,
    setError,
  }
}
