import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', '..', 'data')

const files = {
  agences: path.join(dataDir, 'agences.json'),
  sessions: path.join(dataDir, 'sessions.json'),
  accessUsers: path.join(dataDir, 'access-users.json'),
  proprietaires: path.join(dataDir, 'proprietaires.json'),
  locataires: path.join(dataDir, 'locataires.json'),
  biens: path.join(dataDir, 'biens.json'),
  prospects: path.join(dataDir, 'prospects.json'),
  contrats: path.join(dataDir, 'contrats.json'),
  demandesLocataires: path.join(dataDir, 'demandes-locataires.json'),
  paiements: path.join(dataDir, 'paiements.json'),
  quittances: path.join(dataDir, 'quittances.json'),
  emailLogs: path.join(dataDir, 'email-logs.json'),
  tickets: path.join(dataDir, 'tickets.json'),
  appSettings: path.join(dataDir, 'app-settings.json'),
}

function ensureFile(filePath) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]))
}

export function readCollectionByKey(key) {
  const filePath = files[key]
  ensureFile(filePath)
  const raw = fs.readFileSync(filePath, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeCollectionByKey(key, rows) {
  const filePath = files[key]
  ensureFile(filePath)
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2))
}

