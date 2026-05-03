import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'reversements'

export function listReversements() {
  return readCollectionByKey(KEY)
}

export function findReversementById(id) {
  return listReversements().find((item) => item.id === id)
}

export function createReversement(row) {
  const rows = readCollectionByKey(KEY)
  rows.unshift(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateReversement(id, updater) {
  const rows = readCollectionByKey(KEY)
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}
