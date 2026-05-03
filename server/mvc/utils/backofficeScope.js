import { ensureString } from './common.js'

/** Express middleware sets req.scopeAgenceId: null (admin) or string (agence / gestionnaire). */

export function filterRowsByAgence(scopeAgenceId, rows, getAgenceId) {
  if (!scopeAgenceId || !Array.isArray(rows)) return rows
  const aid = ensureString(scopeAgenceId)
  return rows.filter((r) => String(getAgenceId(r) || '') === aid)
}

export function assertSameAgence(scopeAgenceId, entityAgenceId, label) {
  if (!scopeAgenceId) return null
  if (String(entityAgenceId || '') !== ensureString(scopeAgenceId)) {
    return { status: 403, message: `${label}: acces refuse (hors perimeter agence).` }
  }
  return null
}

export function mergeBodyAgenceId(body, scopeAgenceId) {
  if (!scopeAgenceId) return { ...body }
  return { ...body, agenceId: ensureString(scopeAgenceId) }
}
