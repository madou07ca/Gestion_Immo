import { login, logoutByToken } from '../services/authService.js'
import { extractBearerToken } from '../middlewares/authMiddleware.js'

export function loginController(req, res) {
  const result = login(req.body || {})
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true, data: result.data })
}

export function logoutController(req, res) {
  const token = extractBearerToken(req)
  const result = logoutByToken(token)
  if (result.error) {
    return res.status(result.error.status).json({ ok: false, error: result.error.message })
  }
  return res.json({ ok: true, data: result.data })
}

