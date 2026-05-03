import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'etatsLieux'

export function listEtatsLieux() {
  return readCollectionByKey(KEY)
}

export function findEtatLieuById(id) {
  return listEtatsLieux().find((item) => item.id === id)
}

export function createEtatLieu(row) {
  const rows = readCollectionByKey(KEY)
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateEtatLieu(id, updater) {
  const rows = readCollectionByKey(KEY)
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}

export function deleteEtatLieu(id) {
  const rows = readCollectionByKey(KEY)
  const next = rows.filter((item) => item.id !== id)
  if (next.length === rows.length) return false
  writeCollectionByKey(KEY, next)
  return true
}
