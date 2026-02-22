import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

const dataDir = path.join(__dirname, 'data')
const leadsFile = path.join(dataDir, 'leads.json')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, JSON.stringify([]))
}

function readLeads() {
  ensureDataDir()
  const raw = fs.readFileSync(leadsFile, 'utf8')
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeLeads(leads) {
  ensureDataDir()
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2))
}

app.use(cors())
app.use(express.json())

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
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  )
  const csv = [header, ...rows].join('\n')
  res.setHeader('Content-Disposition', 'attachment; filename=leads.csv')
  res.type('text/csv').send(csv)
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (_, res) => {
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
