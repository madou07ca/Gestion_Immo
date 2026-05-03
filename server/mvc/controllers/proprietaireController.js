import {
  getProprietaires,
  createProprietaireService,
  updateProprietaireService,
  deleteProprietaireService,
} from '../services/partyPropertyService.js'
import { findProprietaireById } from '../repositories/proprietaireRepository.js'
import { assertSameAgence, filterRowsByAgence, mergeBodyAgenceId } from '../utils/backofficeScope.js'

export function listProprietairesController(req, res) {
  let rows = getProprietaires()
  rows = filterRowsByAgence(req.scopeAgenceId, rows, (r) => r.agenceId)
  res.json(rows)
}

export function createProprietaireController(req, res) {
  const result = createProprietaireService(mergeBodyAgenceId(req.body || {}, req.scopeAgenceId))
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function updateProprietaireController(req, res) {
  const current = findProprietaireById(req.params.id)
  if (!current) return res.status(404).json({ ok: false, error: 'Proprietaire introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, current.agenceId, 'Proprietaire')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = updateProprietaireService(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function deleteProprietaireController(req, res) {
  const current = findProprietaireById(req.params.id)
  if (!current) return res.status(404).json({ ok: false, error: 'Proprietaire introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, current.agenceId, 'Proprietaire')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = deleteProprietaireService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true })
}

