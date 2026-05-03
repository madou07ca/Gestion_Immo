import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'relances'

export function listRelances() {
  return readCollectionByKey(KEY)
}

export function appendRelance(row) {
  const rows = readCollectionByKey(KEY)
  rows.unshift(row)
  writeCollectionByKey(KEY, rows.slice(0, 3000))
  return row
}
