import { deleteSessionByToken, findSessionByToken } from '../repositories/sessionRepository.js'

const SESSION_TTL_MS = 1000 * 60 * 60 * 12

export function extractBearerToken(req) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return ''
  return token
}

export function requireAuth(req, res, next) {
  const token = extractBearerToken(req)
  if (!token) return res.status(401).json({ ok: false, error: 'Token manquant.' })
  const session = findSessionByToken(token)
  if (!session) return res.status(401).json({ ok: false, error: 'Session invalide.' })
  const createdAtMs = new Date(session.createdAt || 0).getTime()
  const expired = !Number.isFinite(createdAtMs) || Date.now() - createdAtMs > SESSION_TTL_MS
  if (expired) {
    deleteSessionByToken(token)
    return res.status(401).json({ ok: false, error: 'Session expiree. Veuillez vous reconnecter.' })
  }
  req.auth = session
  next()
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ ok: false, error: 'Session invalide.' })
    if (req.auth.role !== role) return res.status(403).json({ ok: false, error: 'Role non autorise.' })
    return next()
  }
}

export function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ ok: false, error: 'Session invalide.' })
    if (!Array.isArray(roles) || !roles.includes(req.auth.role)) {
      return res.status(403).json({ ok: false, error: 'Role non autorise.' })
    }
    return next()
  }
}
