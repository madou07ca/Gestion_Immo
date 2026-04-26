import { readCollectionByKey } from '../utils/dataStore.js'
import { ensureString } from '../utils/common.js'

export function findProprietaireByEmail(email) {
  const normalizedEmail = ensureString(email).toLowerCase()
  return readCollectionByKey('proprietaires').find(
    (item) => ensureString(item.email).toLowerCase() === normalizedEmail,
  )
}

export function findLocataireByEmail(email) {
  const normalizedEmail = ensureString(email).toLowerCase()
  return readCollectionByKey('locataires').find(
    (item) => ensureString(item.email).toLowerCase() === normalizedEmail,
  )
}

