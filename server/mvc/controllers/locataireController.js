import {
  getLocataires,
  createLocataireService,
  updateLocataireService,
  deleteLocataireService,
} from '../services/partyPropertyService.js'

export function listLocatairesController(_req, res) {
  res.json(getLocataires())
}

export function createLocataireController(req, res) {
  const result = createLocataireService(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function updateLocataireController(req, res) {
  const result = updateLocataireService(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function deleteLocataireController(req, res) {
  const result = deleteLocataireService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true })
}

