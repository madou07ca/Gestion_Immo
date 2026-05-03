import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'signatureRequests'

export function listSignatureRequests() {
  return readCollectionByKey(KEY)
}

export function createSignatureRequest(row) {
  const rows = readCollectionByKey(KEY)
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}
