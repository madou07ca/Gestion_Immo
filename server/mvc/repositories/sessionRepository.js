import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'sessions'

export function listSessions() {
  return readCollectionByKey(KEY)
}

export function findSessionByToken(token) {
  return listSessions().find((item) => item.token === token)
}

export function upsertSession(session) {
  const rows = listSessions()
  const index = rows.findIndex((item) => item.token === session.token)
  if (index === -1) rows.push(session)
  else rows[index] = session
  writeCollectionByKey(KEY, rows)
  return session
}

export function deleteSessionByToken(token) {
  const rows = listSessions()
  writeCollectionByKey(KEY, rows.filter((item) => item.token !== token))
}
