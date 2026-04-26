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

export function listGestionnaireQuittancesController(_req, res) {
  res.json(getGestionnaireQuittances())
}

export function listGestionnaireTicketsController(_req, res) {
  res.json(getGestionnaireTickets())
}

export function createGestionnaireTicketController(req, res) {
  const result = createGestionnaireTicket(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.status(201).json({ ok: true, data: result.data })
}

export function updateGestionnaireTicketController(req, res) {
  const result = updateGestionnaireTicket(req.params.id, req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

export function runSlaNotificationsController(_req, res) {
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
  const result = updateSlaNotificationSettings(req.body || {})
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  return res.json({ ok: true, data: result.data })
}

export function previewSlaNotificationTemplateController(req, res) {
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

export function exportGestionnaireReportingCsvController(_req, res) {
  const quittances = getGestionnaireQuittances()
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

