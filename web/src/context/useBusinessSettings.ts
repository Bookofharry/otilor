import { useCallback, useState } from 'react'
import {
  defaultBusinessSettings,
  persistBusinessSettings,
  readStoredBusinessSettings,
  type BusinessSettings,
} from '../app/businessSettings'

export function useBusinessSettings() {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => readStoredBusinessSettings())

  const saveBusinessSettings = useCallback((nextSettings: Partial<BusinessSettings>) => {
    const savedSettings = persistBusinessSettings({
      ...businessSettings,
      ...nextSettings,
    })
    setBusinessSettings(savedSettings)
    return savedSettings
  }, [businessSettings])

  const resetBusinessSettings = useCallback(() => {
    const defaults = defaultBusinessSettings()
    const savedDefaults = persistBusinessSettings(defaults)
    setBusinessSettings(savedDefaults)
    return savedDefaults
  }, [])

  const reloadBusinessSettings = useCallback(() => {
    const latestSettings = readStoredBusinessSettings()
    setBusinessSettings(latestSettings)
    return latestSettings
  }, [])

  return {
    businessSettings,
    saveBusinessSettings,
    resetBusinessSettings,
    reloadBusinessSettings,
  }
}
