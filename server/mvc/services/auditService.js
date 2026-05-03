import { createId } from '../utils/common.js'
import { appendAuditEvent } from '../repositories/auditEventRepository.js'

export function recordAuditEvent({
  actor = 'system',
  action,
  entityType = '',
  entityId = '',
  detail = '',
  severity = 'info',
  payload = null,
}) {
  const row = {
    id: createId('audit'),
    at: new Date().toISOString(),
    actor: String(actor),
    action: String(action),
    entityType: String(entityType),
    entityId: String(entityId),
    detail: String(detail),
    severity: String(severity),
    payload,
  }
  appendAuditEvent(row)
  return row
}

export function formatAuditEventsForAdmin(rows) {
  return rows.map((r) => ({
    horodatage: new Date(r.at).toLocaleString('fr-FR'),
    user: r.actor,
    action: r.action,
    detail: r.detail,
    objectType: r.entityType,
    severity: r.severity,
    entityId: r.entityId,
  }))
}
