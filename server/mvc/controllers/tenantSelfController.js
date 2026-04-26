import {
  getLocataireMe,
  createLocataireDemande,
  reglerPaiementsLocataire,
} from '../services/operationsService.js'

export function getLocataireMeController(req, res) {
  const result = getLocataireMe(req.query?.tenantId)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function createLocataireDemandeController(req, res) {
  const result = createLocataireDemande(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data })
}

export function reglerPaiementsLocataireController(req, res) {
  const result = reglerPaiementsLocataire(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

