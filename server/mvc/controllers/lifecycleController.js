import {
  generateEcheancesForMonth,
  markPaiementsOverdue,
  listComplianceAlerts,
  computeReversement,
  listReversementsService,
  validateReversement,
  createEtatLieuService,
  listEtatsLieuxService,
  updateEtatLieuService,
  deleteEtatLieuService,
  createCautionService,
  listCautionsService,
  updateCautionService,
  enqueueNotification,
  processNotificationQueueStub,
  exportRgpdTenant,
  exportRgpdOwner,
  applyRentRevisionService,
  requestSignatureService,
  recordRelanceService,
  listRelancesService,
} from '../services/rentalLifecycleService.js'
import { findBienById, listBiens } from '../repositories/bienRepository.js'
import { findContratById } from '../repositories/contratRepository.js'
import { findLocataireById } from '../repositories/locataireRepository.js'
import { findProprietaireById } from '../repositories/proprietaireRepository.js'
import { findEtatLieuById } from '../repositories/etatLieuRepository.js'
import { findCautionById } from '../repositories/cautionRepository.js'
import { findReversementById } from '../repositories/reversementRepository.js'
import { listPaiements } from '../repositories/paiementRepository.js'
import { assertSameAgence } from '../utils/backofficeScope.js'

function ok(res, payload, status = 200) {
  res.status(status).json({ ok: true, ...payload })
}

function fail(res, result) {
  res.status(result.error.status).json({ ok: false, error: result.error.message })
}

function scopedForbidden(res) {
  res.status(403).json({ ok: false, error: 'Action reservee au pilotage plateforme.' })
}

function filterComplianceAlertsForScope(alerts, aid) {
  const biens = listBiens()
  const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
  return alerts.filter((a) => {
    if (a.type === 'bail_echeance') {
      const b = bienById[a.bienId]
      return b && String(b.agenceId || '') === aid
    }
    if (a.type === 'piece_identite') {
      const loc = findLocataireById(a.locataireId)
      return loc && String(loc.agenceId || '') === aid
    }
    if (a.type === 'piece_identite_proprio') {
      const p = findProprietaireById(a.proprietaireId)
      return p && String(p.agenceId || '') === aid
    }
    if (a.type === 'assurance_bien') {
      const b = bienById[a.bienId]
      return b && String(b.agenceId || '') === aid
    }
    return false
  })
}

function filterEtatsLieuxForScope(rows, aid) {
  const biens = listBiens()
  const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
  return rows.filter((r) => String(bienById[r.bienId]?.agenceId || '') === aid)
}

function filterCautionsForScope(rows, aid) {
  const biens = listBiens()
  const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
  return rows.filter((r) => String(bienById[r.bienId]?.agenceId || '') === aid)
}

function filterRelancesForScope(rows, aid) {
  const paiements = listPaiements()
  const biens = listBiens()
  const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
  const payById = Object.fromEntries(paiements.map((p) => [p.id, p]))
  return rows.filter((rel) => {
    const p = payById[rel.paiementId]
    if (!p) return false
    const b = bienById[p.bienId]
    return b && String(b.agenceId || '') === aid
  })
}

function assertContratAgence(req, contratId) {
  const c = findContratById(contratId)
  if (!c) return { status: 404, message: 'Contrat introuvable.' }
  const bien = findBienById(c.bienId)
  const denied = assertSameAgence(req.scopeAgenceId, bien?.agenceId, 'Contrat')
  if (denied) return { status: denied.status, message: denied.message }
  return null
}

export function postGenerateEcheancesController(req, res) {
  if (req.scopeAgenceId) return scopedForbidden(res)
  const result = generateEcheancesForMonth({ ...req.body, actor: req.headers['x-actor'] })
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function postMarkOverdueController(req, res) {
  if (req.scopeAgenceId) return scopedForbidden(res)
  const result = markPaiementsOverdue()
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function getComplianceAlertsController(req, res) {
  const result = listComplianceAlerts()
  if (result.error) return fail(res, result)
  let alerts = result.data?.alerts || []
  if (req.scopeAgenceId) {
    alerts = filterComplianceAlertsForScope(alerts, req.scopeAgenceId)
  }
  ok(res, { data: { alerts } })
}

export function postReversementController(req, res) {
  const pid = req.body?.proprietaireId
  if (req.scopeAgenceId && pid) {
    const prop = findProprietaireById(pid)
    const denied = assertSameAgence(req.scopeAgenceId, prop?.agenceId, 'Proprietaire')
    if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  }
  const result = computeReversement({ ...req.body, actor: req.headers['x-actor'] })
  if (result.error) return fail(res, result)
  ok(res, { data: result.data }, 201)
}

export function getReversementsController(req, res) {
  const result = listReversementsService()
  let rows = result.data || []
  if (req.scopeAgenceId) {
    rows = rows.filter((r) => String(r.agenceId || '') === req.scopeAgenceId)
  }
  ok(res, { data: rows })
}

export function postValidateReversementController(req, res) {
  const rev = findReversementById(req.params.id)
  if (!rev) return res.status(404).json({ ok: false, error: 'Reversement introuvable.' })
  if (req.scopeAgenceId && String(rev.agenceId || '') !== req.scopeAgenceId) {
    return res.status(403).json({ ok: false, error: 'Reversement hors perimeter agence.' })
  }
  const result = validateReversement(req.params.id)
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function postEtatLieuController(req, res) {
  const blocked = assertContratAgence(req, req.body?.contratId)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const result = createEtatLieuService({ ...req.body, actor: req.headers['x-actor'] })
  if (result.error) return fail(res, result)
  ok(res, { data: result.data }, 201)
}

export function getEtatsLieuxController(req, res) {
  const result = listEtatsLieuxService()
  let rows = result.data || []
  if (req.scopeAgenceId) {
    rows = filterEtatsLieuxForScope(rows, req.scopeAgenceId)
  }
  ok(res, { data: rows })
}

export function putEtatLieuController(req, res) {
  const edl = findEtatLieuById(req.params.id)
  if (!edl) return res.status(404).json({ ok: false, error: 'Etat des lieux introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, findBienById(edl.bienId)?.agenceId, 'Etat des lieux')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = updateEtatLieuService(req.params.id, req.body || {})
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function deleteEtatLieuController(req, res) {
  const edl = findEtatLieuById(req.params.id)
  if (!edl) return res.status(404).json({ ok: false, error: 'Etat des lieux introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, findBienById(edl.bienId)?.agenceId, 'Etat des lieux')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = deleteEtatLieuService(req.params.id)
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function postCautionController(req, res) {
  const cid = req.body?.contratId
  const blocked = assertContratAgence(req, cid)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const result = createCautionService(req.body || {})
  if (result.error) return fail(res, result)
  ok(res, { data: result.data }, 201)
}

export function getCautionsController(req, res) {
  let rows = listCautionsService().data || []
  if (req.scopeAgenceId) {
    rows = filterCautionsForScope(rows, req.scopeAgenceId)
  }
  ok(res, { data: rows })
}

export function putCautionController(req, res) {
  const cau = findCautionById(req.params.id)
  if (!cau) return res.status(404).json({ ok: false, error: 'Caution introuvable.' })
  const denied = assertSameAgence(req.scopeAgenceId, findBienById(cau.bienId)?.agenceId, 'Caution')
  if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  const result = updateCautionService(req.params.id, req.body || {})
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function postEnqueueNotificationController(req, res) {
  const result = enqueueNotification(req.body || {})
  if (result.error) return fail(res, result)
  ok(res, { data: result.data }, 201)
}

export function postProcessNotificationsController(req, res) {
  if (req.scopeAgenceId) return scopedForbidden(res)
  const result = processNotificationQueueStub()
  ok(res, { data: result.data })
}

export function postRgpdTenantExportController(req, res) {
  const lid = req.body?.locataireId || req.params.id
  if (req.scopeAgenceId && lid) {
    const loc = findLocataireById(lid)
    const denied = assertSameAgence(req.scopeAgenceId, loc?.agenceId, 'Locataire')
    if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  }
  const result = exportRgpdTenant(lid)
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function postRgpdOwnerExportController(req, res) {
  const pid = req.body?.proprietaireId || req.params.id
  if (req.scopeAgenceId && pid) {
    const prop = findProprietaireById(pid)
    const denied = assertSameAgence(req.scopeAgenceId, prop?.agenceId, 'Proprietaire')
    if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  }
  const result = exportRgpdOwner(pid)
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function postRentRevisionController(req, res) {
  const blocked = assertContratAgence(req, req.params.id)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const result = applyRentRevisionService(req.params.id, { ...req.body, actor: req.headers['x-actor'] })
  if (result.error) return fail(res, result)
  ok(res, { data: result.data })
}

export function postSignatureRequestController(req, res) {
  const blocked = assertContratAgence(req, req.params.id)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const result = requestSignatureService(req.params.id, req.body || {})
  if (result.error) return fail(res, result)
  ok(res, { data: result.data }, 201)
}

export function postRelanceController(req, res) {
  const paiementId = req.body?.paiementId
  if (req.scopeAgenceId && paiementId) {
    const p = listPaiements().find((x) => x.id === paiementId)
    const bien = p ? findBienById(p.bienId) : null
    const denied = assertSameAgence(req.scopeAgenceId, bien?.agenceId, 'Paiement')
    if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  }
  const result = recordRelanceService({ ...req.body, actor: req.headers['x-actor'] })
  if (result.error) return fail(res, result)
  ok(res, { data: result.data }, 201)
}

export function getRelancesController(req, res) {
  let rows = listRelancesService().data || []
  if (req.scopeAgenceId) {
    rows = filterRelancesForScope(rows, req.scopeAgenceId)
  }
  ok(res, { data: rows })
}
