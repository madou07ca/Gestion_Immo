import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'quittances'

export function listQuittances() {
  return readCollectionByKey(KEY)
}

export function findQuittanceById(id) {
  return listQuittances().find((item) => item.id === id)
}

export function appendQuittances(rowsToAppend) {
  const rows = listQuittances()
  const next = [...rows, ...rowsToAppend]
  writeCollectionByKey(KEY, next)
  return rowsToAppend
}

