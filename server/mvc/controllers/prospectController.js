import {
  createProspectInteret,
  getProspectsInterets,
  updateProspectInteret,
  convertProspectToLocataire,
} from '../services/operationsService.js'
import { listBiens } from '../repositories/bienRepository.js'
import { findProspectById } from '../repositories/prospectRepository.js'
import { mergeBodyAgenceId } from '../utils/backofficeScope.js'

function prospectBiensScope(req, prospect) {
  if (!req.scopeAgenceId || !prospect?.propertyId) return null
  const biens = listBiens()
  const bien = biens.find((b) => b.id === prospect.propertyId)
  if (!bien) return { status: 404, message: 'Bien prospect introuvable.' }
  if (String(bien.agenceId || '') !== req.scopeAgenceId) {
    return { status: 403, message: 'Prospect hors perimeter agence.' }
  }
  return null
}

export function createProspectInteretController(req, res) {
  const result = createProspectInteret(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function listProspectsInteretsController(req, res) {
  let rows = getProspectsInterets()
  if (req.scopeAgenceId) {
    const biens = listBiens()
    const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
    const aid = req.scopeAgenceId
    rows = rows.filter((p) => String(bienById[p.propertyId]?.agenceId || '') === aid)
  }
  res.json(rows)
}

export function updateProspectInteretController(req, res) {
  const prospect = findProspectById(req.params.id)
  if (!prospect) return res.status(404).json({ ok: false, error: 'Prospect introuvable.' })
  const blocked = prospectBiensScope(req, prospect)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const result = updateProspectInteret(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function convertProspectToLocataireController(req, res) {
  const prospect = findProspectById(req.params.id)
  if (!prospect) return res.status(404).json({ ok: false, error: 'Prospect introuvable.' })
  const blocked = prospectBiensScope(req, prospect)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const body = mergeBodyAgenceId(req.body || {}, req.scopeAgenceId)
  const result = convertProspectToLocataire(req.params.id, body)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

