import {
  listAdminAccess,
  createAdminAccess,
  updateAdminAccess,
  removeAdminAccess,
  resetAdminAccessCode,
} from '../services/authService.js'

export function listAccessController(_req, res) {
  return res.json(listAdminAccess())
}

export function createAccessController(req, res) {
  const result = createAdminAccess(req.body || {})
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.status(201).json({ ok: true, data: result.data })
}

export function updateAccessController(req, res) {
  const result = updateAdminAccess(req.params.id, req.body || {})
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true, data: result.data })
}

export function deleteAccessController(req, res) {
  const result = removeAdminAccess(req.params.id)
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true })
}

export function resetAccessCodeController(req, res) {
  const result = resetAdminAccessCode(req.params.id)
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true, data: result.data.access, temporaryCode: result.data.temporaryCode })
}

