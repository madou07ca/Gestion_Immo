import {
  getLocataires,
  createLocataireService,
  updateLocataireService,
  deleteLocataireService,
} from '../services/partyPropertyService.js'
import { findLocataireById } from '../repositories/locataireRepository.js'
import { assertSameAgence, filterRowsByAgence, mergeBodyAgenceId } from '../utils/backofficeScope.js'

export function listLocatairesController(req, res) {
  let rows = getLocataires()
  rows = filterRowsByAgence(req.scopeAgenceId, rows, (r) => r.agenceId)
  res.json(rows)
}

export function createLocataireController(req, res) {
  const result = createLocataireService(mergeBodyAgenceId(req.body || {}, req.scopeAgenceId))
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function updateLocataireController(req, res) {
  const current = findLocataireById(req.params.id)
  if (!current) return res.status(404).json({ ok: false, error: 'Locataire introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, current.agenceId, 'Locataire')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = updateLocataireService(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function deleteLocataireController(req, res) {
  const current = findLocataireById(req.params.id)
  if (!current) return res.status(404).json({ ok: false, error: 'Locataire introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, current.agenceId, 'Locataire')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = deleteLocataireService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true })
}

