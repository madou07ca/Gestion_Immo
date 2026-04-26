import { getAdminOverview, searchAdminEntities } from '../services/adminPlatformService.js'

export function adminOverviewController(_req, res) {
  const result = getAdminOverview()
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

export function adminSearchController(req, res) {
  const result = searchAdminEntities(req.query?.q)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}
