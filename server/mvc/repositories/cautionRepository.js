import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'cautions'

export function listCautions() {
  return readCollectionByKey(KEY)
}

export function findCautionById(id) {
  return listCautions().find((item) => item.id === id)
}

export function createCaution(row) {
  const rows = readCollectionByKey(KEY)
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateCaution(id, updater) {
  const rows = readCollectionByKey(KEY)
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}
