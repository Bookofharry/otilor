import { useState, useCallback } from 'react'
import type { ApiClientSummary } from '../api'
import { fallbackClients } from '../app/fallbackData'

export function useClients() {
  const [clients, setClients] = useState<ApiClientSummary[]>(fallbackClients)

  const updateClient = useCallback((clientId: string, updates: Partial<ApiClientSummary>) => {
    setClients((rows) =>
      rows.map((row) =>
        row.id === clientId ? { ...row, ...updates } : row,
      ),
    )
  }, [])

  const addClient = useCallback((client: ApiClientSummary) => {
    setClients((rows) => {
      const withoutExisting = rows.filter((row) => row.id !== client.id)
      return [client, ...withoutExisting]
    })
  }, [])

  const setAllClients = useCallback((newClients: ApiClientSummary[]) => {
    setClients(newClients)
  }, [])

  return {
    clients,
    updateClient,
    addClient,
    setAllClients,
  }
}
