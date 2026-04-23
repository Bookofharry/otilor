import { readStoredAuthUserProfile, type AuthUserProfile } from './userProfile'

export interface BusinessSettings {
  businessName: string
  businessEmail: string
  businessPhone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  defaultTaxRate: number
  defaultDiscountRate: number
  defaultPaymentTermsDays: number
  defaultNotes: string
}

const STORAGE_PREFIX = 'otilor.business-settings'

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const sanitizeRate = (value: unknown): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Number(parsed.toFixed(2)))
}

const sanitizePaymentTerms = (value: unknown): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 14
  return Math.min(365, Math.max(1, Math.round(parsed)))
}

const resolveStorageKey = (profile: AuthUserProfile | null = readStoredAuthUserProfile()): string => {
  const emailKey = clean(profile?.email).toLowerCase()
  return emailKey ? `${STORAGE_PREFIX}:${emailKey}` : STORAGE_PREFIX
}

export const defaultBusinessSettings = (
  profile: AuthUserProfile | null = readStoredAuthUserProfile(),
): BusinessSettings => ({
  businessName: clean(import.meta.env.VITE_BUSINESS_NAME) || clean(profile?.name) || 'Your business',
  businessEmail: clean(import.meta.env.VITE_BUSINESS_EMAIL) || clean(profile?.email),
  businessPhone: clean(import.meta.env.VITE_BUSINESS_PHONE),
  addressLine1: clean(import.meta.env.VITE_BUSINESS_ADDRESS_LINE_1 || import.meta.env.VITE_BUSINESS_ADDRESS),
  addressLine2: clean(import.meta.env.VITE_BUSINESS_ADDRESS_LINE_2),
  city: clean(import.meta.env.VITE_BUSINESS_CITY),
  state: clean(import.meta.env.VITE_BUSINESS_STATE),
  postalCode: clean(import.meta.env.VITE_BUSINESS_POSTAL_CODE),
  country: clean(import.meta.env.VITE_BUSINESS_COUNTRY),
  defaultTaxRate: sanitizeRate(import.meta.env.VITE_DEFAULT_TAX_RATE),
  defaultDiscountRate: sanitizeRate(import.meta.env.VITE_DEFAULT_DISCOUNT_RATE),
  defaultPaymentTermsDays: sanitizePaymentTerms(import.meta.env.VITE_DEFAULT_PAYMENT_TERMS_DAYS),
  defaultNotes: clean(import.meta.env.VITE_DEFAULT_INVOICE_NOTES),
})

const sanitizeBusinessSettings = (
  settings: Partial<BusinessSettings>,
  profile: AuthUserProfile | null = readStoredAuthUserProfile(),
): BusinessSettings => {
  const defaults = defaultBusinessSettings(profile)

  return {
    businessName: clean(settings.businessName) || defaults.businessName,
    businessEmail: clean(settings.businessEmail) || defaults.businessEmail,
    businessPhone: clean(settings.businessPhone),
    addressLine1: clean(settings.addressLine1),
    addressLine2: clean(settings.addressLine2),
    city: clean(settings.city),
    state: clean(settings.state),
    postalCode: clean(settings.postalCode),
    country: clean(settings.country),
    defaultTaxRate: sanitizeRate(
      settings.defaultTaxRate === undefined ? defaults.defaultTaxRate : settings.defaultTaxRate,
    ),
    defaultDiscountRate: sanitizeRate(
      settings.defaultDiscountRate === undefined ? defaults.defaultDiscountRate : settings.defaultDiscountRate,
    ),
    defaultPaymentTermsDays: sanitizePaymentTerms(
      settings.defaultPaymentTermsDays === undefined
        ? defaults.defaultPaymentTermsDays
        : settings.defaultPaymentTermsDays,
    ),
    defaultNotes: clean(settings.defaultNotes),
  }
}

export const readStoredBusinessSettings = (
  profile: AuthUserProfile | null = readStoredAuthUserProfile(),
): BusinessSettings => {
  if (typeof window === 'undefined') {
    return defaultBusinessSettings(profile)
  }

  try {
    const raw = window.localStorage.getItem(resolveStorageKey(profile))
    if (!raw) return defaultBusinessSettings(profile)

    const parsed = JSON.parse(raw) as Partial<BusinessSettings>
    return sanitizeBusinessSettings(parsed, profile)
  } catch {
    return defaultBusinessSettings(profile)
  }
}

export const persistBusinessSettings = (
  settings: Partial<BusinessSettings>,
  profile: AuthUserProfile | null = readStoredAuthUserProfile(),
): BusinessSettings => {
  const sanitized = sanitizeBusinessSettings(settings, profile)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(resolveStorageKey(profile), JSON.stringify(sanitized))
  }

  return sanitized
}
