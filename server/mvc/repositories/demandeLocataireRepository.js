import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'demandesLocataires'

export function listDemandesLocataires() {
  return readCollectionByKey(KEY)
}

export function createDemandeLocataire(row) {
  const rows = listDemandesLocataires()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

