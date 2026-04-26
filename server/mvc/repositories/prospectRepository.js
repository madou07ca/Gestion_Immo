import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'prospects'

export function listProspects() {
  return readCollectionByKey(KEY)
}

export function findProspectById(id) {
  return listProspects().find((item) => item.id === id)
}

export function createProspect(row) {
  const rows = listProspects()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateProspect(id, updater) {
  const rows = listProspects()
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}

