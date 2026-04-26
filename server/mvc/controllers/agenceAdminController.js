import {
  listAgencesAdminService,
  createAgenceAdminService,
  updateAgenceAdminService,
  deleteAgenceAdminService,
} from '../services/agenceService.js'

export function listAgencesAdminController(_req, res) {
  res.json(listAgencesAdminService())
}

export function createAgenceAdminController(req, res) {
  const result = createAgenceAdminService(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.status(201).json({ ok: true, data: result.data, onboarding: result.onboarding })
}

export function updateAgenceAdminController(req, res) {
  const result = updateAgenceAdminService(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

export function deleteAgenceAdminController(req, res) {
  const result = deleteAgenceAdminService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}
