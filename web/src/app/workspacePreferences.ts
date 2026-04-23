import { readStoredAuthUserProfile, type AuthUserProfile } from './userProfile'

export interface WorkspacePreferences {
  isPro: boolean
}

const STORAGE_PREFIX = 'otilor.workspace-preferences'

const resolveStorageKey = (profile: AuthUserProfile | null = readStoredAuthUserProfile()): string => {
  const emailKey = typeof profile?.email === 'string' ? profile.email.trim().toLowerCase() : ''
  return emailKey ? `${STORAGE_PREFIX}:${emailKey}` : STORAGE_PREFIX
}

const sanitizeWorkspacePreferences = (
  preferences: Partial<WorkspacePreferences> | null | undefined,
): WorkspacePreferences => ({
  isPro: Boolean(preferences?.isPro),
})

export const readStoredWorkspacePreferences = (
  profile: AuthUserProfile | null = readStoredAuthUserProfile(),
): WorkspacePreferences => {
  if (typeof window === 'undefined') {
    return sanitizeWorkspacePreferences(undefined)
  }

  try {
    const raw = window.localStorage.getItem(resolveStorageKey(profile))
    if (!raw) return sanitizeWorkspacePreferences(undefined)

    const parsed = JSON.parse(raw) as Partial<WorkspacePreferences>
    return sanitizeWorkspacePreferences(parsed)
  } catch {
    return sanitizeWorkspacePreferences(undefined)
  }
}

export const persistWorkspacePreferences = (
  preferences: Partial<WorkspacePreferences>,
  profile: AuthUserProfile | null = readStoredAuthUserProfile(),
): WorkspacePreferences => {
  const sanitized = sanitizeWorkspacePreferences(preferences)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(resolveStorageKey(profile), JSON.stringify(sanitized))
  }

  return sanitized
}
