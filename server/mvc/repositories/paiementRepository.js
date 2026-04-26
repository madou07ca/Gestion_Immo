import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'paiements'

export function listPaiements() {
  return readCollectionByKey(KEY)
}

export function writePaiements(rows) {
  writeCollectionByKey(KEY, rows)
}

