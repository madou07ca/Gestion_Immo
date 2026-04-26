import {
  getBiens,
  createBienService,
  updateBienService,
  deleteBienService,
} from '../services/partyPropertyService.js'

export function listBiensController(_req, res) {
  res.json(getBiens())
}

export function createBienController(req, res) {
  const result = createBienService(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function updateBienController(req, res) {
  const result = updateBienService(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function deleteBienController(req, res) {
  const result = deleteBienService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true })
}

