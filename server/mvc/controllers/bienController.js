import {
  getBiens,
  createBienService,
  updateBienService,
  deleteBienService,
} from '../services/partyPropertyService.js'
import { findBienById } from '../repositories/bienRepository.js'
import { assertSameAgence, filterRowsByAgence, mergeBodyAgenceId } from '../utils/backofficeScope.js'

export function listBiensController(req, res) {
  let rows = getBiens()
  rows = filterRowsByAgence(req.scopeAgenceId, rows, (r) => r.agenceId)
  res.json(rows)
}

export function createBienController(req, res) {
  const result = createBienService(mergeBodyAgenceId(req.body || {}, req.scopeAgenceId))
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function updateBienController(req, res) {
  const current = findBienById(req.params.id)
  if (!current) return res.status(404).json({ ok: false, error: 'Bien introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, current.agenceId, 'Bien')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = updateBienService(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function deleteBienController(req, res) {
  const current = findBienById(req.params.id)
  if (!current) return res.status(404).json({ ok: false, error: 'Bien introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, current.agenceId, 'Bien')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = deleteBienService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true })
}

