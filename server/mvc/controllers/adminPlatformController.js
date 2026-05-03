import {
  getAdminOverview,
  searchAdminEntities,
  scopeAdminOverviewForAgence,
  scopeAdminSearchMatches,
} from '../services/adminPlatformService.js'

export function adminOverviewController(req, res) {
  const result = getAdminOverview()
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  const data = req.scopeAgenceId
    ? scopeAdminOverviewForAgence(result.data, req.scopeAgenceId)
    : result.data
  return res.json({ ok: true, data })
}

export function adminSearchController(req, res) {
  const result = searchAdminEntities(req.query?.q)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  const data = req.scopeAgenceId
    ? scopeAdminSearchMatches(result.data, req.scopeAgenceId)
    : result.data
  return res.json({ ok: true, data })
}
