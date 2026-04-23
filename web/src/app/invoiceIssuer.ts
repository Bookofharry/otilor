import { defaultBusinessSettings, readStoredBusinessSettings, type BusinessSettings } from './businessSettings'
import { readStoredAuthUserProfile, type AuthUserProfile } from './userProfile'

export interface InvoiceIssuerProfile {
  name: string
  email: string
  phone: string
  addressLines: string[]
}

export const resolveInvoiceIssuerProfile = (
  businessSettings: Partial<BusinessSettings>,
  authUser: AuthUserProfile | null = readStoredAuthUserProfile(),
): InvoiceIssuerProfile => {
  const defaults = defaultBusinessSettings(authUser)
  const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
  const mergedSettings = {
    ...defaults,
    ...businessSettings,
  }
  const cityLine = [
    clean(mergedSettings.city),
    clean(mergedSettings.state),
    clean(mergedSettings.postalCode),
  ].filter(Boolean).join(', ')

  return {
    name: clean(mergedSettings.businessName) || defaults.businessName,
    email: clean(mergedSettings.businessEmail) || defaults.businessEmail,
    phone: clean(mergedSettings.businessPhone),
    addressLines: [
      clean(mergedSettings.addressLine1),
      clean(mergedSettings.addressLine2),
      cityLine,
      clean(mergedSettings.country),
    ].filter(Boolean),
  }
}

export const getInvoiceIssuerProfile = (): InvoiceIssuerProfile => {
  const authUser = readStoredAuthUserProfile()
  return resolveInvoiceIssuerProfile(readStoredBusinessSettings(authUser), authUser)
}

export const resolveInvoiceIssuerContactLines = (issuer: InvoiceIssuerProfile): string[] => {
  return [
    issuer.email,
    issuer.phone,
    ...issuer.addressLines,
  ].filter(Boolean)
}

export const getInvoiceIssuerContactLines = (): string[] =>
  resolveInvoiceIssuerContactLines(getInvoiceIssuerProfile())
