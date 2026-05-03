import {
  getGestionnaireQuittances,
  getGestionnaireTickets,
  createGestionnaireTicket,
  updateGestionnaireTicket,
  runSlaNotificationsNow,
  getSlaNotificationLogs,
  getSlaNotificationSettings,
  updateSlaNotificationSettings,
  getSlaNotificationPreview,
} from '../services/operationsService.js'
import { findTicketById } from '../repositories/ticketRepository.js'
import { listBiens } from '../repositories/bienRepository.js'
import { mergeBodyAgenceId } from '../utils/backofficeScope.js'

export function listGestionnaireQuittancesController(req, res) {
  let rows = getGestionnaireQuittances()
  if (req.scopeAgenceId) {
    const biens = listBiens()
    const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
    const aid = req.scopeAgenceId
    rows = rows.filter((q) => String(bienById[q.bienId]?.agenceId || '') === aid)
  }
  res.json(rows)
}

export function listGestionnaireTicketsController(req, res) {
  let rows = getGestionnaireTickets()
  if (req.scopeAgenceId) {
    rows = rows.filter((t) => String(t.agenceId || '') === req.scopeAgenceId)
  }
  res.json(rows)
}

export function createGestionnaireTicketController(req, res) {
  const body = mergeBodyAgenceId(req.body || {}, req.scopeAgenceId)
  const result = createGestionnaireTicket(body)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.status(201).json({ ok: true, data: result.data })
}

export function updateGestionnaireTicketController(req, res) {
  const ticket = findTicketById(req.params.id)
  if (!ticket) return res.status(404).json({ ok: false, error: 'Ticket introuvable.' })
  if (req.scopeAgenceId && String(ticket.agenceId || '') !== req.scopeAgenceId) {
    return res.status(403).json({ ok: false, error: 'Ticket hors perimeter agence.' })
  }
  const result = updateGestionnaireTicket(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

export function runSlaNotificationsController(req, res) {
  if (req.scopeAgenceId) {
    return res.status(403).json({ ok: false, error: 'Execution SLA globale reservee au pilotage plateforme.' })
  }
  const result = runSlaNotificationsNow()
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

export function listSlaNotificationLogsController(_req, res) {
  return res.json(getSlaNotificationLogs())
}

export function getSlaNotificationSettingsController(_req, res) {
  return res.json({ ok: true, data: getSlaNotificationSettings() })
}

export function updateSlaNotificationSettingsController(req, res) {
  if (req.scopeAgenceId) {
    return res.status(403).json({ ok: false, error: 'Parametrage SLA global reserve au pilotage plateforme.' })
  }
  const result = updateSlaNotificationSettings(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

export function previewSlaNotificationTemplateController(req, res) {
  if (req.scopeAgenceId) {
    return res.status(403).json({ ok: false, error: 'Previsualisation SLA globale reservee au pilotage plateforme.' })
  }
  const result = getSlaNotificationPreview(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

function escapeCsv(value) {
  const source = value === null || value === undefined ? '' : String(value)
  if (source.includes(',') || source.includes('"') || source.includes('\n')) {
    return `"${source.replace(/"/g, '""')}"`
  }
  return source
}

export function exportGestionnaireReportingCsvController(req, res) {
  let quittances = getGestionnaireQuittances()
  if (req.scopeAgenceId) {
    const biens = listBiens()
    const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
    const aid = req.scopeAgenceId
    quittances = quittances.filter((q) => String(bienById[q.bienId]?.agenceId || '') === aid)
  }
  const grouped = quittances.reduce((acc, item) => {
    const period = item.periode || '-'
    if (!acc[period]) {
      acc[period] = { periode: period, generees: 0, relances: 0, erreurs: 0, montantTotal: 0 }
    }
    acc[period].generees += 1
    acc[period].montantTotal += Number(item.montant || 0)
    return acc
  }, {})

  const rows = Object.values(grouped)
    .sort((a, b) => String(a.periode).localeCompare(String(b.periode), 'fr'))
    .map((item) => [
      item.periode,
      item.generees,
      item.relances,
      item.erreurs,
      Math.round(item.montantTotal),
    ])

  const header = ['periode', 'quittances_generees', 'relances', 'erreurs', 'montant_total_gnf']
  const csvRows = [header, ...rows].map((line) => line.map(escapeCsv).join(','))
  const csv = `${csvRows.join('\n')}\n`

  res.setHeader('Content-Disposition', 'attachment; filename=reporting-gestionnaire.csv')
  res.type('text/csv').send(csv)
}

