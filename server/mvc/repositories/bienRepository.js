import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'biens'

export function listBiens() {
  return readCollectionByKey(KEY)
}

export function findBienById(id) {
  return listBiens().find((item) => item.id === id)
}

export function createBien(row) {
  const rows = listBiens()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateBien(id, updater) {
  const rows = listBiens()
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}

export function deleteBien(id) {
  const rows = listBiens()
  const exists = rows.some((item) => item.id === id)
  if (!exists) return false
  writeCollectionByKey(KEY, rows.filter((item) => item.id !== id))
  return true
}

