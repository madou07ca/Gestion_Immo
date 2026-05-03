import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'notificationQueue'

export function listNotificationQueue() {
  return readCollectionByKey(KEY)
}

export function appendNotification(row) {
  const rows = readCollectionByKey(KEY)
  rows.push(row)
  writeCollectionByKey(KEY, rows.slice(-2000))
  return row
}

export function writeNotificationQueue(rows) {
  writeCollectionByKey(KEY, rows)
}
