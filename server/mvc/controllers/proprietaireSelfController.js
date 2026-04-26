import { getProprietaireMe } from '../services/operationsService.js'

export function getProprietaireMeController(req, res) {
  const result = getProprietaireMe(req.query?.ownerId)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

