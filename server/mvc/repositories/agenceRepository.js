import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'agences'

export function listAgences() {
  return readCollectionByKey(KEY)
}

export function findAgenceById(id) {
  return listAgences().find((item) => item.id === id)
}

export function createAgence(row) {
  const rows = listAgences()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateAgence(id, updater) {
  const rows = listAgences()
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}

export function deleteAgence(id) {
  const rows = listAgences()
  const exists = rows.some((item) => item.id === id)
  if (!exists) return false
  writeCollectionByKey(KEY, rows.filter((item) => item.id !== id))
  return true
}
