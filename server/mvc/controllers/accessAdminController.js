import {
  listAdminAccess,
  createAdminAccess,
  updateAdminAccess,
  removeAdminAccess,
  resetAdminAccessCode,
} from '../services/authService.js'
import { ensureString } from '../utils/common.js'
import { findAccessUserById } from '../repositories/accessRepository.js'

function accessRowInScope(row, aid) {
  return String(row.agenceId || '') === aid || String(row.linkedId || '') === aid
}

export function listAccessController(req, res) {
  let rows = listAdminAccess()
  if (req.scopeAgenceId) {
    rows = rows.filter((a) => accessRowInScope(a, req.scopeAgenceId))
  }
  return res.json(rows)
}

export function createAccessController(req, res) {
  let body = { ...(req.body || {}) }
  if (req.scopeAgenceId) {
    const role = ensureString(body.role)
    if (role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Creation de compte admin plateforme non autorisee.' })
    }
    if (role === 'gestionnaire') {
      body.agenceId = req.scopeAgenceId
    }
    if (role === 'agence') {
      body.linkedId = req.scopeAgenceId
    }
  }
  const result = createAdminAccess(body)
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.status(201).json({ ok: true, data: result.data })
}

export function updateAccessController(req, res) {
  const existing = findAccessUserById(req.params.id)
  if (!existing) return res.status(404).json({ ok: false, error: 'Acces introuvable.' })
  if (req.scopeAgenceId && !accessRowInScope(existing, req.scopeAgenceId)) {
    return res.status(403).json({ ok: false, error: 'Acces hors perimeter agence.' })
  }
  let body = { ...(req.body || {}) }
  if (req.scopeAgenceId) {
    const nextRole = body.role !== undefined ? ensureString(body.role) : existing.role
    if (existing.role === 'admin' || nextRole === 'admin') {
      return res.status(403).json({ ok: false, error: 'Modification non autorisee.' })
    }
    if (nextRole === 'gestionnaire') {
      body.agenceId = req.scopeAgenceId
    }
    if (nextRole === 'agence') {
      body.linkedId = req.scopeAgenceId
    }
  }
  const result = updateAdminAccess(req.params.id, body)
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true, data: result.data })
}

export function deleteAccessController(req, res) {
  const existing = findAccessUserById(req.params.id)
  if (!existing) return res.status(404).json({ ok: false, error: 'Acces introuvable.' })
  if (req.scopeAgenceId && !accessRowInScope(existing, req.scopeAgenceId)) {
    return res.status(403).json({ ok: false, error: 'Acces hors perimeter agence.' })
  }
  if (req.scopeAgenceId && existing.role === 'admin') {
    return res.status(403).json({ ok: false, error: 'Suppression non autorisee.' })
  }
  const result = removeAdminAccess(req.params.id)
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true })
}

export function resetAccessCodeController(req, res) {
  const existing = findAccessUserById(req.params.id)
  if (!existing) return res.status(404).json({ ok: false, error: 'Acces introuvable.' })
  if (req.scopeAgenceId && !accessRowInScope(existing, req.scopeAgenceId)) {
    return res.status(403).json({ ok: false, error: 'Acces hors perimeter agence.' })
  }
  const result = resetAdminAccessCode(req.params.id)
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true, data: result.data.access, temporaryCode: result.data.temporaryCode })
}

