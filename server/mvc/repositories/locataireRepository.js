import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'locataires'

export function listLocataires() {
  return readCollectionByKey(KEY)
}

export function findLocataireById(id) {
  return listLocataires().find((item) => item.id === id)
}

export function createLocataire(row) {
  const rows = listLocataires()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateLocataire(id, updater) {
  const rows = listLocataires()
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}

export function deleteLocataire(id) {
  const rows = listLocataires()
  const exists = rows.some((item) => item.id === id)
  if (!exists) return false
  writeCollectionByKey(KEY, rows.filter((item) => item.id !== id))
  return true
}

