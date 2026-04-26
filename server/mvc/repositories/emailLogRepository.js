import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'emailLogs'

export function listEmailLogs() {
  return readCollectionByKey(KEY)
}

export function createEmailLog(row) {
  const rows = listEmailLogs()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

