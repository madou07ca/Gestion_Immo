import {
  getProprietaires,
  createProprietaireService,
  updateProprietaireService,
  deleteProprietaireService,
} from '../services/partyPropertyService.js'

export function listProprietairesController(_req, res) {
  res.json(getProprietaires())
}

export function createProprietaireController(req, res) {
  const result = createProprietaireService(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function updateProprietaireController(req, res) {
  const result = updateProprietaireService(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function deleteProprietaireController(req, res) {
  const result = deleteProprietaireService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true })
}

