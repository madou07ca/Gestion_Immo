import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'tickets'

export function listTickets() {
  return readCollectionByKey(KEY)
}

export function findTicketById(id) {
  return listTickets().find((item) => item.id === id)
}

export function createTicket(row) {
  const rows = listTickets()
  rows.push(row)
  writeCollectionByKey(KEY, rows)
  return row
}

export function updateTicket(id, updater) {
  const rows = listTickets()
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}
