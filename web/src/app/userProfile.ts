export interface AuthUserProfile {
  name: string
  email: string
}

const STORAGE_KEY = 'otilor.auth-user-profile'

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const toDisplayNameFromEmail = (email: string): string => {
  const localPart = clean(email).split('@')[0] ?? ''
  const pieces = localPart
    .split(/[._-]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (pieces.length === 0) return 'Your business'

  return pieces
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const readStoredAuthUserProfile = (): AuthUserProfile | null => {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<AuthUserProfile>
    const name = clean(parsed.name)
    const email = clean(parsed.email)

    if (!name && !email) return null

    return {
      name: name || toDisplayNameFromEmail(email),
      email,
    }
  } catch {
    return null
  }
}

export const persistAuthUserProfile = (profile: Partial<AuthUserProfile>): AuthUserProfile => {
  const existing = readStoredAuthUserProfile()
  const nextEmail = clean(profile.email)
  const nextName = clean(profile.name)

  const nextProfile: AuthUserProfile = {
    name: nextName || (nextEmail ? toDisplayNameFromEmail(nextEmail) : existing?.name || 'Your business'),
    email: nextEmail || existing?.email || '',
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile))
  }

  return nextProfile
}

export const clearStoredAuthUserProfile = (): void => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
