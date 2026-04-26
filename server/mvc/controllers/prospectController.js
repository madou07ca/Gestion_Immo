import {
  createProspectInteret,
  getProspectsInterets,
  updateProspectInteret,
  convertProspectToLocataire,
} from '../services/operationsService.js'

export function createProspectInteretController(req, res) {
  const result = createProspectInteret(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function listProspectsInteretsController(_req, res) {
  res.json(getProspectsInterets())
}

export function updateProspectInteretController(req, res) {
  const result = updateProspectInteret(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function convertProspectToLocataireController(req, res) {
  const result = convertProspectToLocataire(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

