import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import authRoutes from './mvc/routes/authRoutes.js'
import accessAdminRoutes from './mvc/routes/accessAdminRoutes.js'
import proprietaireRoutes from './mvc/routes/proprietaireRoutes.js'
import locataireRoutes from './mvc/routes/locataireRoutes.js'
import bienRoutes from './mvc/routes/bienRoutes.js'
import prospectRoutes from './mvc/routes/prospectRoutes.js'
import contratRoutes from './mvc/routes/contratRoutes.js'
import tenantSelfRoutes from './mvc/routes/tenantSelfRoutes.js'
import proprietaireSelfRoutes from './mvc/routes/proprietaireSelfRoutes.js'
import quittanceRoutes from './mvc/routes/quittanceRoutes.js'
import gestionnaireRoutes from './mvc/routes/gestionnaireRoutes.js'
import publicRoutes from './mvc/routes/publicRoutes.js'
import agenceAdminRoutes from './mvc/routes/agenceAdminRoutes.js'
import agenceWorkspaceRoutes from './mvc/routes/agenceWorkspaceRoutes.js'
import adminPlatformRoutes from './mvc/routes/adminPlatformRoutes.js'
import lifecycleRoutes from './mvc/routes/lifecycleRoutes.js'
import { runSlaNotificationsAutoTick } from './mvc/services/operationsService.js'
import { runRentalLifecycleTicks } from './mvc/services/lifecycleTickService.js'

// Reconstitue __dirname en environnement ESM (import/export).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Fichier JSON historique pour les leads marketing.
const dataDir = path.join(__dirname, 'data')
const leadsFile = path.join(dataDir, 'leads.json')

function ensureDataDir() {
  // Conserve la compatibilite des routes leads existantes.
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, JSON.stringify([]))
}

function readLeads() {
  ensureDataDir()
  const raw = fs.readFileSync(leadsFile, 'utf8')
  try {
    return JSON.parse(raw)
  } catch {
    // Si le JSON est corrompu, on evite de faire planter l'API.
    return []
  }
}

function writeLeads(leads) {
  ensureDataDir()
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2))
}

app.use(cors())
// Parse automatiquement req.body en JSON.
app.use(express.json({ limit: '15mb' }))
app.use('/api/auth', authRoutes)
app.use('/api/admin/acces', accessAdminRoutes)
app.use('/api/proprietaires', proprietaireRoutes)
app.use('/api/locataires', locataireRoutes)
app.use('/api/biens', bienRoutes)
app.use('/api/prospects', prospectRoutes)
app.use('/api/contrats', contratRoutes)
app.use('/api/locataire/me', tenantSelfRoutes)
app.use('/api/proprietaire', proprietaireSelfRoutes)
app.use('/api/quittances', quittanceRoutes)
app.use('/api/gestionnaire', gestionnaireRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/admin/agences', agenceAdminRoutes)
app.use('/api/admin', adminPlatformRoutes)
app.use('/api/gestionnaire/lifecycle', lifecycleRoutes)
app.use('/api/admin/lifecycle', lifecycleRoutes)
app.use('/api/agence', agenceWorkspaceRoutes)

// Routes "leads" historiques du projet.
app.post('/api/leads/estimation-rapide', (req, res) => {
  const leads = readLeads()
  leads.push({
    type: 'estimation-rapide',
    ...req.body,
    createdAt: new Date().toISOString(),
  })
  writeLeads(leads)
  res.status(201).json({ ok: true })
})

app.post('/api/leads/estimation', (req, res) => {
  const leads = readLeads()
  leads.push({
    type: 'estimation',
    ...req.body,
    createdAt: new Date().toISOString(),
  })
  writeLeads(leads)
  res.status(201).json({ ok: true })
})

app.post('/api/leads/gestion-locative', (req, res) => {
  const leads = readLeads()
  leads.push({
    type: 'gestion-locative',
    ...req.body,
    createdAt: new Date().toISOString(),
  })
  writeLeads(leads)
  res.status(201).json({ ok: true })
})

app.post('/api/leads/contact-bien', (req, res) => {
  const leads = readLeads()
  leads.push({
    type: 'contact-bien',
    ...req.body,
    createdAt: new Date().toISOString(),
  })
  writeLeads(leads)
  res.status(201).json({ ok: true })
})

app.get('/api/leads/export', (req, res) => {
  const leads = readLeads()
  if (leads.length === 0) {
    return res.type('text/csv').send('type,createdAt\n')
  }
  const keys = [...new Set(leads.flatMap((l) => Object.keys(l)))]
  const header = keys.join(',')
  const rows = leads.map((l) =>
    keys.map((k) => {
      const v = l[k]
      if (v === null || v === undefined) return ''
      const s = String(v)
      // Echappe les virgules/guillemets pour produire un CSV valide.
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  )
  const csv = [header, ...rows].join('\n')
  res.setHeader('Content-Disposition', 'attachment; filename=leads.csv')
  res.type('text/csv').send(csv)
})

if (process.env.NODE_ENV === 'production') {
  // En production, sert l'application front buildée.
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (_, res) => {
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Scheduler léger: vérifie périodiquement si un run SLA auto est dû.
setInterval(() => {
  try {
    runSlaNotificationsAutoTick()
  } catch (error) {
    console.error('SLA auto tick error:', error?.message || error)
  }
}, 60 * 1000)

setInterval(() => {
  try {
    runRentalLifecycleTicks()
  } catch (error) {
    console.error('Lifecycle tick error:', error?.message || error)
  }
}, 60 * 60 * 1000)
