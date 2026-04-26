import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'proprietaires'

export function listProprietaires() {
  return readCollectionByKey(KEY)
}

export function findProprietaireById(id) {
  return listProprietaires().find((item) => item.id === id)
}

export function createProprietaire(row) {
  const rows = listProprietaires()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateProprietaire(id, updater) {
  const rows = listProprietaires()
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}

export function deleteProprietaire(id) {
  const rows = listProprietaires()
  const exists = rows.some((item) => item.id === id)
  if (!exists) return false
  writeCollectionByKey(KEY, rows.filter((item) => item.id !== id))
  return true
}

