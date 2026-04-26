import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'
import { ensureString } from '../utils/common.js'

const KEY = 'accessUsers'

export function listAccessUsers() {
  return readCollectionByKey(KEY)
}

export function findAccessUserByRoleEmail(role, email) {
  const normalizedEmail = ensureString(email).toLowerCase()
  return listAccessUsers().find(
    (item) =>
      item.role === role
      && ensureString(item.email).toLowerCase() === normalizedEmail,
  )
}

export function findAccessUserById(id) {
  return listAccessUsers().find((item) => item.id === id)
}

export function findAccessUserForAgencySession(email, agenceId) {
  const normalizedEmail = ensureString(email).toLowerCase()
  const normalizedAgencyId = ensureString(agenceId)
  return listAccessUsers().find(
    (item) =>
      item.role === 'agence'
      && ensureString(item.email).toLowerCase() === normalizedEmail
      && ensureString(item.linkedId) === normalizedAgencyId,
  )
}

export function createAccessUser(payload) {
  const rows = listAccessUsers()
  rows.push(payload)
  writeCollectionByKey(KEY, rows)
  return payload
}

export function updateAccessUser(id, updater) {
  const rows = listAccessUsers()
  const index = rows.findIndex((item) => item.id === id)
  if (index === -1) return null
  rows[index] = updater(rows[index])
  writeCollectionByKey(KEY, rows)
  return rows[index]
}

export function deleteAccessUser(id) {
  const rows = listAccessUsers()
  const exists = rows.some((item) => item.id === id)
  if (!exists) return false
  writeCollectionByKey(KEY, rows.filter((item) => item.id !== id))
  return true
}

