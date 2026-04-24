const STORAGE_KEY = 'immo_auth_session'

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuthSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isRoleAuthorized(role) {
  const session = getAuthSession()
  return Boolean(session && session.role === role)
}

