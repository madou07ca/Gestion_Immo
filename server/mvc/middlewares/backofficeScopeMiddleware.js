import { ensureString } from '../utils/common.js'

/**
 * Apres requireAuth + requireRoles(['admin','agence','gestionnaire']):
 * - admin : req.scopeAgenceId = null (pas de filtre serveur impose ici)
 * - agence / gestionnaire : req.scopeAgenceId = id agence session
 */
export function attachScopeAgenceId(req, res, next) {
  if (req.auth?.role === 'admin') {
    req.scopeAgenceId = null
    return next()
  }
  const aid = ensureString(req.auth?.agenceId)
  if (!aid) {
    return res.status(403).json({ ok: false, error: 'Compte sans rattachement agence.' })
  }
  req.scopeAgenceId = aid
  next()
}
