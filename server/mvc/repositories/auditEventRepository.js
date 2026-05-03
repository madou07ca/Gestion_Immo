import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'auditEvents'

export function listAuditEvents() {
  return readCollectionByKey(KEY)
}

export function appendAuditEvent(row) {
  const rows = readCollectionByKey(KEY)
  rows.unshift(row)
  const capped = rows.slice(0, 500)
  writeCollectionByKey(KEY, capped)
  return row
}
