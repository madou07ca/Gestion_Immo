import { getPublicBiens } from '../services/operationsService.js'

export function listPublicBiensController(_req, res) {
  res.json(getPublicBiens())
}

