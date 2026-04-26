import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'contrats'

export function listContrats() {
  return readCollectionByKey(KEY)
}

export function createContrat(row) {
  const rows = listContrats()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function findContratById(id) {
  return listContrats().find((row) => row.id === id)
}

export function updateContrat(id, updater) {
  const rows = listContrats()
  const index = rows.findIndex((row) => row.id === id)
  if (index < 0) return null
  const next = updater(rows[index])
  rows[index] = next
  writeCollectionByKey(KEY, rows)
  return next
}

export function deleteContratById(id) {
  const rows = listContrats()
  const next = rows.filter((row) => row.id !== id)
  if (next.length === rows.length) return false
  writeCollectionByKey(KEY, next)
  return true
}

