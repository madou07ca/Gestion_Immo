import {
  getAgenceWorkspaceService,
  createAgenceProprietaireService,
  updateAgenceProprietaireService,
  deleteAgenceProprietaireService,
  createAgenceLocataireService,
  updateAgenceLocataireService,
  deleteAgenceLocataireService,
  createAgenceGestionnaireService,
  updateAgenceGestionnaireService,
  deleteAgenceGestionnaireService,
  createAgenceBienService,
  updateAgenceBienService,
  deleteAgenceBienService,
} from '../services/agenceService.js'

function sendResult(res, result, status = 200) {
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.status(status).json({ ok: true, data: result.data })
}

export function getAgenceWorkspaceController(req, res) {
  return sendResult(res, getAgenceWorkspaceService(req.auth?.agenceId))
}

export function createAgenceProprietaireController(req, res) {
  return sendResult(res, createAgenceProprietaireService(req.auth?.agenceId, req.body || {}), 201)
}
export function updateAgenceProprietaireController(req, res) {
  return sendResult(res, updateAgenceProprietaireService(req.auth?.agenceId, req.params.id, req.body || {}))
}
export function deleteAgenceProprietaireController(req, res) {
  return sendResult(res, deleteAgenceProprietaireService(req.auth?.agenceId, req.params.id))
}

export function createAgenceLocataireController(req, res) {
  return sendResult(res, createAgenceLocataireService(req.auth?.agenceId, req.body || {}), 201)
}
export function updateAgenceLocataireController(req, res) {
  return sendResult(res, updateAgenceLocataireService(req.auth?.agenceId, req.params.id, req.body || {}))
}
export function deleteAgenceLocataireController(req, res) {
  return sendResult(res, deleteAgenceLocataireService(req.auth?.agenceId, req.params.id))
}

export function createAgenceGestionnaireController(req, res) {
  return sendResult(res, createAgenceGestionnaireService(req.auth?.agenceId, req.body || {}), 201)
}
export function updateAgenceGestionnaireController(req, res) {
  return sendResult(res, updateAgenceGestionnaireService(req.auth?.agenceId, req.params.id, req.body || {}))
}
export function deleteAgenceGestionnaireController(req, res) {
  return sendResult(res, deleteAgenceGestionnaireService(req.auth?.agenceId, req.params.id))
}

export function createAgenceBienController(req, res) {
  return sendResult(res, createAgenceBienService(req.auth?.agenceId, req.body || {}), 201)
}
export function updateAgenceBienController(req, res) {
  return sendResult(res, updateAgenceBienService(req.auth?.agenceId, req.params.id, req.body || {}))
}
export function deleteAgenceBienController(req, res) {
  return sendResult(res, deleteAgenceBienService(req.auth?.agenceId, req.params.id))
}
