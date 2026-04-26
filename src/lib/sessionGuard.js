import { clearAuthSession, getAuthSession } from './authSession'

const EXCLUDED_AUTH_ENDPOINTS = ['/api/auth/login']
const SESSION_EXPIRED_FLASH_KEY = 'immo_session_expired_flash'

function isExcludedRequest(input) {
  const url = typeof input === 'string' ? input : input?.url || ''
  return EXCLUDED_AUTH_ENDPOINTS.some((entry) => url.includes(entry))
}

function redirectToPortalLogin(role) {
  const safeRole = typeof role === 'string' && role.trim() ? role.trim() : 'gestionnaire'
  try {
    sessionStorage.setItem(
      SESSION_EXPIRED_FLASH_KEY,
      JSON.stringify({
        role: safeRole,
        message: 'Session expiree. Veuillez vous reconnecter.',
        createdAt: Date.now(),
      }),
    )
  } catch {
    // ignore storage errors
  }
  const target = `/espace/${safeRole}`
  if (window.location.pathname !== target) {
    window.location.href = target
  }
}

export function initGlobalSessionGuard() {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return
  if (window.__immoSessionGuardInstalled) return

  const nativeFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const response = await nativeFetch(input, init)
    if (response.status !== 401 || isExcludedRequest(input)) return response

    const session = getAuthSession()
    if (!session) return response

    let apiErrorMessage = ''
    try {
      const payload = await response.clone().json()
      apiErrorMessage = String(payload?.error || '')
    } catch {
      apiErrorMessage = ''
    }

    // Expired/invalid server session should force relogin.
    if (apiErrorMessage.toLowerCase().includes('session')) {
      clearAuthSession()
      redirectToPortalLogin(session.role)
    }

    return response
  }

  window.__immoSessionGuardInstalled = true
}
