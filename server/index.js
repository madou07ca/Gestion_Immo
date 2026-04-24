import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import PDFDocument from 'pdfkit'

// Reconstitue __dirname en environnement ESM (import/export).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Fichiers JSON utilises comme stockage local (MVP).
const dataDir = path.join(__dirname, 'data')
const leadsFile = path.join(dataDir, 'leads.json')
const biensFile = path.join(dataDir, 'biens.json')
const proprietairesFile = path.join(dataDir, 'proprietaires.json')
const locatairesFile = path.join(dataDir, 'locataires.json')
const prospectsFile = path.join(dataDir, 'prospects.json')
const contratsFile = path.join(dataDir, 'contrats.json')
const demandesLocatairesFile = path.join(dataDir, 'demandes-locataires.json')
const paiementsFile = path.join(dataDir, 'paiements.json')
const quittancesFile = path.join(dataDir, 'quittances.json')
const emailLogsFile = path.join(dataDir, 'email-logs.json')
const accessUsersFile = path.join(dataDir, 'access-users.json')

function ensureDataDir() {
  // Cree le dossier/fichiers manquants pour eviter les erreurs de lecture.
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, JSON.stringify([]))
  if (!fs.existsSync(biensFile)) fs.writeFileSync(biensFile, JSON.stringify([]))
  if (!fs.existsSync(proprietairesFile)) fs.writeFileSync(proprietairesFile, JSON.stringify([]))
  if (!fs.existsSync(locatairesFile)) fs.writeFileSync(locatairesFile, JSON.stringify([]))
  if (!fs.existsSync(prospectsFile)) fs.writeFileSync(prospectsFile, JSON.stringify([]))
  if (!fs.existsSync(contratsFile)) fs.writeFileSync(contratsFile, JSON.stringify([]))
  if (!fs.existsSync(demandesLocatairesFile)) fs.writeFileSync(demandesLocatairesFile, JSON.stringify([]))
  if (!fs.existsSync(paiementsFile)) fs.writeFileSync(paiementsFile, JSON.stringify([]))
  if (!fs.existsSync(quittancesFile)) fs.writeFileSync(quittancesFile, JSON.stringify([]))
  if (!fs.existsSync(emailLogsFile)) fs.writeFileSync(emailLogsFile, JSON.stringify([]))
  if (!fs.existsSync(accessUsersFile)) fs.writeFileSync(accessUsersFile, JSON.stringify([]))
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

function createId(prefix) {
  // Identifiant simple lisible (sans base SQL), suffisant pour un prototype.
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now()}_${randomPart}`
}

function readCollection(filePath) {
  ensureDataDir()
  const raw = fs.readFileSync(filePath, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Meme logique defensive pour toutes les collections.
    return []
  }
}

function writeCollection(filePath, items) {
  ensureDataDir()
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2))
}

function ensureString(value) {
  // Uniformise les entrees texte (trim + fallback chaine vide).
  return typeof value === 'string' ? value.trim() : ''
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isPositiveNumber(value) {
  // Accepte string ou number, puis verifie une valeur >= 0.
  return Number.isFinite(Number(value)) && Number(value) >= 0
}

function findById(items, id) {
  return items.find((item) => item.id === id)
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatPrice(price) {
  return `${Number(price).toLocaleString('fr-FR')} GNF / mois`
}

function formatType(type) {
  return String(type || '').replace(/-/g, ' ')
}

function currentPeriodLabel() {
  const now = new Date()
  return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function extractFirstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || 'Utilisateur'
}

function generateTemporaryCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

app.use(cors())
// Parse automatiquement req.body en JSON.
app.use(express.json())

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

app.get('/api/proprietaires', (req, res) => {
  const proprietaires = readCollection(proprietairesFile)
  res.json(proprietaires)
})

app.post('/api/proprietaires', (req, res) => {
  // Validation minimale des donnees d'entree.
  const nom = ensureString(req.body?.nom)
  const email = ensureString(req.body?.email)
  const telephone = ensureString(req.body?.telephone)

  if (!nom) {
    return res.status(400).json({ ok: false, error: 'Le nom du proprietaire est obligatoire.' })
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ ok: false, error: "L'email du proprietaire est invalide." })
  }

  const proprietaires = readCollection(proprietairesFile)
  // Modele de donnees proprietaire stocke en JSON.
  const newProprietaire = {
    id: createId('owner'),
    nom,
    email,
    telephone,
    statut: 'Actif',
    adresse: ensureString(req.body?.adresse),
    notes: ensureString(req.body?.notes),
    createdAt: new Date().toISOString(),
  }

  proprietaires.push(newProprietaire)
  writeCollection(proprietairesFile, proprietaires)

  res.status(201).json({ ok: true, data: newProprietaire })
})

app.put('/api/proprietaires/:id', (req, res) => {
  const proprietaires = readCollection(proprietairesFile)
  const index = proprietaires.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'Proprietaire introuvable.' })
  }

  const current = proprietaires[index]
  const nextNom = req.body?.nom !== undefined ? ensureString(req.body.nom) : current.nom
  const nextEmail = req.body?.email !== undefined ? ensureString(req.body.email) : current.email
  const nextTelephone = req.body?.telephone !== undefined ? ensureString(req.body.telephone) : current.telephone
  const nextStatut = req.body?.statut !== undefined ? ensureString(req.body.statut) : current.statut || 'Actif'

  if (!nextNom) {
    return res.status(400).json({ ok: false, error: 'Le nom du proprietaire est obligatoire.' })
  }
  if (nextEmail && !isEmail(nextEmail)) {
    return res.status(400).json({ ok: false, error: "L'email du proprietaire est invalide." })
  }

  proprietaires[index] = {
    ...current,
    nom: nextNom,
    email: nextEmail,
    telephone: nextTelephone,
    statut: nextStatut || 'Actif',
    adresse: req.body?.adresse !== undefined ? ensureString(req.body.adresse) : current.adresse || '',
    notes: req.body?.notes !== undefined ? ensureString(req.body.notes) : current.notes || '',
    updatedAt: new Date().toISOString(),
  }
  writeCollection(proprietairesFile, proprietaires)
  res.json({ ok: true, data: proprietaires[index] })
})

app.delete('/api/proprietaires/:id', (req, res) => {
  const proprietaires = readCollection(proprietairesFile)
  const exists = findById(proprietaires, req.params.id)
  if (!exists) {
    return res.status(404).json({ ok: false, error: 'Proprietaire introuvable.' })
  }

  const biens = readCollection(biensFile)
  const hasLinkedProperty = biens.some((item) => item.proprietaireId === req.params.id)
  if (hasLinkedProperty) {
    return res.status(400).json({
      ok: false,
      error: 'Suppression impossible: ce proprietaire est associe a un ou plusieurs biens.',
    })
  }

  const filtered = proprietaires.filter((item) => item.id !== req.params.id)
  writeCollection(proprietairesFile, filtered)
  res.json({ ok: true })
})

app.get('/api/locataires', (req, res) => {
  const locataires = readCollection(locatairesFile)
  res.json(locataires)
})

app.post('/api/locataires', (req, res) => {
  // Validation minimale des donnees d'entree.
  const nom = ensureString(req.body?.nom)
  const email = ensureString(req.body?.email)
  const telephone = ensureString(req.body?.telephone)

  if (!nom) {
    return res.status(400).json({ ok: false, error: 'Le nom du locataire est obligatoire.' })
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ ok: false, error: "L'email du locataire est invalide." })
  }

  const locataires = readCollection(locatairesFile)
  // Modele de donnees locataire stocke en JSON.
  const newLocataire = {
    id: createId('tenant'),
    nom,
    email,
    telephone,
    statut: 'Actif',
    profession: ensureString(req.body?.profession),
    revenuMensuel: isPositiveNumber(req.body?.revenuMensuel) ? Number(req.body.revenuMensuel) : null,
    notes: ensureString(req.body?.notes),
    createdAt: new Date().toISOString(),
  }

  locataires.push(newLocataire)
  writeCollection(locatairesFile, locataires)

  res.status(201).json({ ok: true, data: newLocataire })
})

app.put('/api/locataires/:id', (req, res) => {
  const locataires = readCollection(locatairesFile)
  const index = locataires.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'Locataire introuvable.' })
  }

  const current = locataires[index]
  const nextNom = req.body?.nom !== undefined ? ensureString(req.body.nom) : current.nom
  const nextEmail = req.body?.email !== undefined ? ensureString(req.body.email) : current.email
  const nextTelephone = req.body?.telephone !== undefined ? ensureString(req.body.telephone) : current.telephone
  const nextStatut = req.body?.statut !== undefined ? ensureString(req.body.statut) : current.statut || 'Actif'

  if (!nextNom) {
    return res.status(400).json({ ok: false, error: 'Le nom du locataire est obligatoire.' })
  }
  if (nextEmail && !isEmail(nextEmail)) {
    return res.status(400).json({ ok: false, error: "L'email du locataire est invalide." })
  }

  const revenuMensuel = req.body?.revenuMensuel !== undefined
    ? (isPositiveNumber(req.body.revenuMensuel) ? Number(req.body.revenuMensuel) : null)
    : current.revenuMensuel ?? null

  locataires[index] = {
    ...current,
    nom: nextNom,
    email: nextEmail,
    telephone: nextTelephone,
    statut: nextStatut || 'Actif',
    profession: req.body?.profession !== undefined ? ensureString(req.body.profession) : current.profession || '',
    revenuMensuel,
    notes: req.body?.notes !== undefined ? ensureString(req.body.notes) : current.notes || '',
    updatedAt: new Date().toISOString(),
  }
  writeCollection(locatairesFile, locataires)
  res.json({ ok: true, data: locataires[index] })
})

app.delete('/api/locataires/:id', (req, res) => {
  const locataires = readCollection(locatairesFile)
  const exists = findById(locataires, req.params.id)
  if (!exists) {
    return res.status(404).json({ ok: false, error: 'Locataire introuvable.' })
  }

  const biens = readCollection(biensFile)
  const hasLinkedProperty = biens.some((item) => item.locataireId === req.params.id)
  if (hasLinkedProperty) {
    return res.status(400).json({
      ok: false,
      error: 'Suppression impossible: ce locataire est associe a un ou plusieurs biens.',
    })
  }

  const filtered = locataires.filter((item) => item.id !== req.params.id)
  writeCollection(locatairesFile, filtered)
  res.json({ ok: true })
})

app.get('/api/biens', (req, res) => {
  const biens = readCollection(biensFile)
  res.json(biens)
})

app.post('/api/biens', (req, res) => {
  // Champs obligatoires pour creer un bien.
  const titre = ensureString(req.body?.titre)
  const type = ensureString(req.body?.type)
  const adresse = ensureString(req.body?.adresse)
  const proprietaireId = ensureString(req.body?.proprietaireId)

  if (!titre || !type || !adresse || !proprietaireId) {
    return res.status(400).json({
      ok: false,
      error: 'titre, type, adresse et proprietaireId sont obligatoires pour un bien.',
    })
  }

  if (!isPositiveNumber(req.body?.loyerMensuel)) {
    return res.status(400).json({ ok: false, error: 'Le loyerMensuel doit etre un nombre positif.' })
  }

  // Controle de coherence: le proprietaire doit exister.
  const proprietaires = readCollection(proprietairesFile)
  const ownerExists = proprietaires.some((owner) => owner.id === proprietaireId)
  if (!ownerExists) {
    return res.status(400).json({ ok: false, error: 'proprietaireId introuvable.' })
  }

  const locataireId = ensureString(req.body?.locataireId)
  if (locataireId) {
    // Controle de coherence: si renseigne, le locataire doit exister.
    const locataires = readCollection(locatairesFile)
    const tenantExists = locataires.some((tenant) => tenant.id === locataireId)
    if (!tenantExists) {
      return res.status(400).json({ ok: false, error: 'locataireId introuvable.' })
    }
  }

  const biens = readCollection(biensFile)
  // Modele de donnees bien avec references vers proprietaire/locataire.
  const newBien = {
    id: createId('property'),
    titre,
    type,
    slug: slugify(`${titre}-${Date.now()}`),
    adresse,
    ville: ensureString(req.body?.ville),
    codePostal: ensureString(req.body?.codePostal),
    surface: isPositiveNumber(req.body?.surface) ? Number(req.body.surface) : null,
    loyerMensuel: Number(req.body.loyerMensuel),
    chargesMensuelles: isPositiveNumber(req.body?.chargesMensuelles) ? Number(req.body.chargesMensuelles) : 0,
    statut: ensureString(req.body?.statut) || 'disponible',
    operation: 'location',
    published: Boolean(req.body?.published),
    images: Array.isArray(req.body?.images) ? req.body.images : [],
    proprietaireId,
    locataireId: locataireId || null,
    description: ensureString(req.body?.description),
    createdAt: new Date().toISOString(),
  }

  biens.push(newBien)
  writeCollection(biensFile, biens)

  res.status(201).json({ ok: true, data: newBien })
})

app.put('/api/biens/:id', (req, res) => {
  const biens = readCollection(biensFile)
  const index = biens.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'Bien introuvable.' })
  }

  const current = biens[index]
  const nextTitre = req.body?.titre !== undefined ? ensureString(req.body.titre) : current.titre
  const nextType = req.body?.type !== undefined ? ensureString(req.body.type) : current.type
  const nextAdresse = req.body?.adresse !== undefined ? ensureString(req.body.adresse) : current.adresse
  const nextOwnerId = req.body?.proprietaireId !== undefined
    ? ensureString(req.body.proprietaireId)
    : current.proprietaireId

  if (!nextTitre || !nextType || !nextAdresse || !nextOwnerId) {
    return res.status(400).json({
      ok: false,
      error: 'titre, type, adresse et proprietaireId sont obligatoires pour un bien.',
    })
  }

  if (req.body?.loyerMensuel !== undefined && !isPositiveNumber(req.body.loyerMensuel)) {
    return res.status(400).json({ ok: false, error: 'Le loyerMensuel doit etre un nombre positif.' })
  }

  const proprietaires = readCollection(proprietairesFile)
  const ownerExists = proprietaires.some((owner) => owner.id === nextOwnerId)
  if (!ownerExists) {
    return res.status(400).json({ ok: false, error: 'proprietaireId introuvable.' })
  }

  const nextLocataireId = req.body?.locataireId !== undefined
    ? ensureString(req.body.locataireId)
    : ensureString(current.locataireId)
  if (nextLocataireId) {
    const locataires = readCollection(locatairesFile)
    const tenantExists = locataires.some((tenant) => tenant.id === nextLocataireId)
    if (!tenantExists) {
      return res.status(400).json({ ok: false, error: 'locataireId introuvable.' })
    }
  }

  biens[index] = {
    ...current,
    titre: nextTitre,
    type: nextType,
    slug: req.body?.slug !== undefined ? ensureString(req.body.slug) : current.slug || slugify(`${nextTitre}-${current.id}`),
    adresse: nextAdresse,
    ville: req.body?.ville !== undefined ? ensureString(req.body.ville) : current.ville || '',
    codePostal: req.body?.codePostal !== undefined ? ensureString(req.body.codePostal) : current.codePostal || '',
    surface: req.body?.surface !== undefined
      ? (isPositiveNumber(req.body.surface) ? Number(req.body.surface) : null)
      : current.surface ?? null,
    loyerMensuel: req.body?.loyerMensuel !== undefined ? Number(req.body.loyerMensuel) : Number(current.loyerMensuel),
    chargesMensuelles: req.body?.chargesMensuelles !== undefined
      ? (isPositiveNumber(req.body.chargesMensuelles) ? Number(req.body.chargesMensuelles) : 0)
      : Number(current.chargesMensuelles ?? 0),
    statut: req.body?.statut !== undefined ? ensureString(req.body.statut) || 'disponible' : current.statut || 'disponible',
    published: req.body?.published !== undefined ? Boolean(req.body.published) : Boolean(current.published),
    operation: req.body?.operation !== undefined ? ensureString(req.body.operation) || 'location' : current.operation || 'location',
    images: req.body?.images !== undefined
      ? (Array.isArray(req.body.images) ? req.body.images : [])
      : (Array.isArray(current.images) ? current.images : []),
    proprietaireId: nextOwnerId,
    locataireId: nextLocataireId || null,
    description: req.body?.description !== undefined ? ensureString(req.body.description) : current.description || '',
    updatedAt: new Date().toISOString(),
  }

  writeCollection(biensFile, biens)
  res.json({ ok: true, data: biens[index] })
})

app.delete('/api/biens/:id', (req, res) => {
  const biens = readCollection(biensFile)
  const exists = findById(biens, req.params.id)
  if (!exists) {
    return res.status(404).json({ ok: false, error: 'Bien introuvable.' })
  }

  const filtered = biens.filter((item) => item.id !== req.params.id)
  writeCollection(biensFile, filtered)
  res.json({ ok: true })
})

app.get('/api/public/biens', (req, res) => {
  const biens = readCollection(biensFile)
  const published = biens
    .filter((item) => item.published)
    .map((item) => ({
      id: item.id,
      slug: item.slug || slugify(`${item.titre}-${item.id}`),
      title: item.titre,
      type: item.type || 'appartement',
      operation: item.operation || 'location',
      district: item.ville || 'Conakry',
      city: item.ville || 'Conakry',
      price: Number(item.loyerMensuel || 0),
      priceLabel: formatPrice(Number(item.loyerMensuel || 0)),
      surface: Number(item.surface || 0),
      surfaceLand: 0,
      rooms: 0,
      bedrooms: 0,
      floor: null,
      description: item.description || '',
      features: [],
      images: Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200'],
      featured: false,
      available: item.statut !== 'loue',
      reference: item.id,
      lat: null,
      lng: null,
    }))
  res.json(published)
})

app.post('/api/prospects/interets', (req, res) => {
  const nom = ensureString(req.body?.name)
  const email = ensureString(req.body?.email)
  const telephone = ensureString(req.body?.phone)
  const propertyId = ensureString(req.body?.propertyId)

  if (!nom || !email || !telephone || !propertyId) {
    return res.status(400).json({ ok: false, error: 'name, email, phone et propertyId sont obligatoires.' })
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Email prospect invalide.' })
  }

  const prospects = readCollection(prospectsFile)
  const newProspect = {
    id: createId('prospect'),
    propertyId,
    propertyTitle: ensureString(req.body?.propertyTitle),
    nom,
    email,
    telephone,
    message: ensureString(req.body?.message),
    statut: 'Nouveau',
    managerReply: '',
    createdAt: new Date().toISOString(),
  }
  prospects.push(newProspect)
  writeCollection(prospectsFile, prospects)
  res.status(201).json({ ok: true, data: newProspect })
})

app.get('/api/prospects/interets', (req, res) => {
  const prospects = readCollection(prospectsFile)
  res.json(prospects)
})

app.put('/api/prospects/interets/:id', (req, res) => {
  const prospects = readCollection(prospectsFile)
  const index = prospects.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'Prospect introuvable.' })
  }

  const current = prospects[index]
  prospects[index] = {
    ...current,
    statut: req.body?.statut !== undefined ? ensureString(req.body.statut) || current.statut : current.statut,
    managerReply: req.body?.managerReply !== undefined ? ensureString(req.body.managerReply) : current.managerReply || '',
    updatedAt: new Date().toISOString(),
  }
  writeCollection(prospectsFile, prospects)
  res.json({ ok: true, data: prospects[index] })
})

app.post('/api/prospects/interets/:id/convertir-locataire', (req, res) => {
  const prospects = readCollection(prospectsFile)
  const prospectIndex = prospects.findIndex((item) => item.id === req.params.id)
  if (prospectIndex === -1) {
    return res.status(404).json({ ok: false, error: 'Prospect introuvable.' })
  }

  const prospect = prospects[prospectIndex]
  if (prospect.convertedLocataireId) {
    return res.status(400).json({ ok: false, error: 'Ce prospect a deja ete converti en locataire.' })
  }

  const locataires = readCollection(locatairesFile)
  const newLocataire = {
    id: createId('tenant'),
    nom: prospect.nom,
    email: prospect.email,
    telephone: prospect.telephone,
    statut: 'Actif',
    profession: ensureString(req.body?.profession),
    revenuMensuel: isPositiveNumber(req.body?.revenuMensuel) ? Number(req.body.revenuMensuel) : null,
    notes: ensureString(req.body?.notes) || `Converti depuis prospect ${prospect.id}`,
    sourceProspectId: prospect.id,
    createdAt: new Date().toISOString(),
  }
  locataires.push(newLocataire)
  writeCollection(locatairesFile, locataires)

  prospects[prospectIndex] = {
    ...prospect,
    statut: 'Converti en locataire',
    convertedLocataireId: newLocataire.id,
    updatedAt: new Date().toISOString(),
  }
  writeCollection(prospectsFile, prospects)

  res.status(201).json({ ok: true, data: { prospect: prospects[prospectIndex], locataire: newLocataire } })
})

app.post('/api/contrats/signature', (req, res) => {
  const bienId = ensureString(req.body?.bienId)
  const locataireId = ensureString(req.body?.locataireId)
  const dateDebut = ensureString(req.body?.dateDebut)
  const dateFin = ensureString(req.body?.dateFin)

  if (!bienId || !locataireId || !dateDebut || !dateFin) {
    return res.status(400).json({ ok: false, error: 'bienId, locataireId, dateDebut et dateFin sont obligatoires.' })
  }

  const biens = readCollection(biensFile)
  const bienIndex = biens.findIndex((item) => item.id === bienId)
  if (bienIndex === -1) {
    return res.status(404).json({ ok: false, error: 'Bien introuvable.' })
  }
  const locataires = readCollection(locatairesFile)
  const locataireExists = locataires.some((item) => item.id === locataireId)
  if (!locataireExists) {
    return res.status(404).json({ ok: false, error: 'Locataire introuvable.' })
  }

  const contrats = readCollection(contratsFile)
  const newContrat = {
    id: createId('lease'),
    bienId,
    locataireId,
    dateDebut,
    dateFin,
    loyerMensuel: Number(req.body?.loyerMensuel || biens[bienIndex].loyerMensuel || 0),
    statut: 'Signe',
    createdAt: new Date().toISOString(),
  }
  contrats.push(newContrat)
  writeCollection(contratsFile, contrats)

  biens[bienIndex] = {
    ...biens[bienIndex],
    locataireId,
    statut: 'loue',
    updatedAt: new Date().toISOString(),
  }
  writeCollection(biensFile, biens)

  res.status(201).json({ ok: true, data: newContrat, bien: biens[bienIndex] })
})

app.get('/api/locataire/me', (req, res) => {
  const requestedTenantId = ensureString(req.query?.tenantId)
  const locataires = readCollection(locatairesFile)
  const tenant = requestedTenantId
    ? locataires.find((item) => item.id === requestedTenantId)
    : locataires[0]

  if (!tenant) {
    return res.status(404).json({ ok: false, error: 'Aucun locataire disponible.' })
  }

  const biens = readCollection(biensFile)
  const bien = biens.find((item) => item.locataireId === tenant.id) || null
  const demandes = readCollection(demandesLocatairesFile).filter((item) => item.locataireId === tenant.id)
  const paiements = readCollection(paiementsFile)
  const quittances = readCollection(quittancesFile)

  // Si aucune echeance n'existe encore pour ce locataire, on initialise l'echeancier mensuel.
  if (bien && !paiements.some((item) => item.locataireId === tenant.id && item.statut === 'A payer')) {
    const period = currentPeriodLabel()
    const newRows = [
      {
        id: createId('pay'),
        locataireId: tenant.id,
        bienId: bien.id,
        libelle: `Loyer ${period}`,
        type: 'Loyer',
        periode: period,
        echeance: new Date().toLocaleDateString('fr-FR'),
        montant: Number(bien.loyerMensuel || 0),
        statut: 'A payer',
        createdAt: new Date().toISOString(),
      },
      {
        id: createId('pay'),
        locataireId: tenant.id,
        bienId: bien.id,
        libelle: `Charges ${period}`,
        type: 'Charges',
        periode: period,
        echeance: new Date().toLocaleDateString('fr-FR'),
        montant: Number(bien.chargesMensuelles || 0),
        statut: 'A payer',
        createdAt: new Date().toISOString(),
      },
    ].filter((item) => item.montant > 0)
    if (newRows.length > 0) {
      writeCollection(paiementsFile, [...paiements, ...newRows])
    }
  }

  const nextPaiements = readCollection(paiementsFile).filter((item) => item.locataireId === tenant.id)
  const quittanceByPaiementId = Object.fromEntries(
    quittances
      .filter((item) => item.locataireId === tenant.id)
      .map((item) => [item.paiementId, item]),
  )
  const pendingPaiements = nextPaiements
    .filter((item) => item.statut === 'A payer')
    .map((item) => ({
      id: item.id,
      libelle: item.libelle,
      type: item.type,
      echeance: item.echeance,
      montant: Number(item.montant || 0),
      statut: item.statut,
    }))
  const historiquePaiements = nextPaiements
    .filter((item) => item.statut !== 'A payer')
    .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())
    .map((item) => ({
      id: item.id,
      date: new Date(item.paidAt || item.createdAt).toLocaleDateString('fr-FR'),
      periode: item.periode,
      moyen: item.moyen || '-',
      montant: `${Number(item.montant || 0).toLocaleString('fr-FR')} GNF`,
      reference: item.reference || '-',
      statut: item.statut,
      quittanceId: quittanceByPaiementId[item.id]?.id || null,
    }))
  const quittancesLocataire = quittances.filter((item) => item.locataireId === tenant.id)

  res.json({
    ok: true,
    data: {
      tenant,
      bien,
      demandes,
      paiements: pendingPaiements,
      historiquePaiements,
      quittances: quittancesLocataire,
    },
  })
})

app.post('/api/locataire/me/demandes', (req, res) => {
  const locataireId = ensureString(req.body?.locataireId)
  const type = ensureString(req.body?.type)
  const sujet = ensureString(req.body?.sujet)
  const details = ensureString(req.body?.details)

  if (!locataireId || !type || !sujet || !details) {
    return res.status(400).json({ ok: false, error: 'locataireId, type, sujet et details sont obligatoires.' })
  }

  const locataires = readCollection(locatairesFile)
  const exists = locataires.some((item) => item.id === locataireId)
  if (!exists) {
    return res.status(404).json({ ok: false, error: 'Locataire introuvable.' })
  }

  const demandes = readCollection(demandesLocatairesFile)
  const newDemande = {
    id: createId('demande'),
    locataireId,
    type,
    sujet,
    details,
    priorite: ensureString(req.body?.priorite) || 'Normale',
    statut: 'Nouvelle',
    createdAt: new Date().toISOString(),
  }
  demandes.push(newDemande)
  writeCollection(demandesLocatairesFile, demandes)
  res.status(201).json({ ok: true, data: newDemande })
})

app.post('/api/locataire/me/paiements/regler', (req, res) => {
  const locataireId = ensureString(req.body?.locataireId)
  const paiementIds = Array.isArray(req.body?.paiementIds) ? req.body.paiementIds : []
  const moyen = ensureString(req.body?.moyen) || 'Orange Money'
  const reference = ensureString(req.body?.reference)

  if (!locataireId || paiementIds.length === 0 || !reference) {
    return res.status(400).json({
      ok: false,
      error: 'locataireId, paiementIds et reference sont obligatoires pour regler un paiement.',
    })
  }

  const paiements = readCollection(paiementsFile)
  const quittances = readCollection(quittancesFile)

  const targetRows = paiements.filter(
    (item) => item.locataireId === locataireId && paiementIds.includes(item.id) && item.statut === 'A payer',
  )
  if (targetRows.length === 0) {
    return res.status(400).json({ ok: false, error: 'Aucune ligne payable trouvee pour cette selection.' })
  }

  const now = new Date().toISOString()
  const updatedPaiements = paiements.map((item) => {
    if (targetRows.some((row) => row.id === item.id)) {
      return {
        ...item,
        statut: 'Confirme',
        moyen,
        reference,
        paidAt: now,
      }
    }
    return item
  })
  writeCollection(paiementsFile, updatedPaiements)

  const newQuittances = targetRows.map((item) => ({
    id: createId('quittance'),
    locataireId,
    bienId: item.bienId,
    paiementId: item.id,
    periode: item.periode,
    type: item.type,
    montant: item.montant,
    moyen,
    reference,
    statut: 'Generee',
    createdAt: now,
  }))
  writeCollection(quittancesFile, [...quittances, ...newQuittances])

  res.json({ ok: true, data: { paiementsRegles: targetRows.length, quittances: newQuittances } })
})

app.get('/api/gestionnaire/quittances', (req, res) => {
  const quittances = readCollection(quittancesFile)
  res.json(quittances)
})

app.post('/api/auth/login', (req, res) => {
  const role = ensureString(req.body?.role)
  const email = ensureString(req.body?.email).toLowerCase()
  const code = ensureString(req.body?.code)

  if (!role || !email || !code) {
    return res.status(400).json({ ok: false, error: 'role, email et code sont obligatoires.' })
  }

  if (code !== '1234') {
    const accessUsers = readCollection(accessUsersFile)
    const matchedAccess = accessUsers.find(
      (item) =>
        item.role === role
        && ensureString(item.email).toLowerCase() === email
        && item.code === code
        && item.statut === 'Actif',
    )
    if (!matchedAccess) {
      return res.status(401).json({ ok: false, error: 'Code d acces invalide.' })
    }
    return res.json({
      ok: true,
      data: {
        role,
        userId: matchedAccess.linkedId || matchedAccess.id,
        name: matchedAccess.nom || extractFirstName(matchedAccess.email),
        email: matchedAccess.email,
        token: createId('session'),
      },
    })
  }

  if (role === 'gestionnaire') {
    return res.json({
      ok: true,
      data: {
        role,
        userId: 'manager_demo',
        name: 'Gestionnaire Demo',
        email,
        token: createId('session'),
      },
    })
  }

  if (role === 'agence') {
    return res.json({
      ok: true,
      data: {
        role,
        userId: 'agency_demo',
        name: 'Agence Demo',
        email,
        token: createId('session'),
      },
    })
  }

  const collection = role === 'proprietaire' ? readCollection(proprietairesFile) : readCollection(locatairesFile)
  const user = collection.find((item) => ensureString(item.email).toLowerCase() === email)
  if (!user) {
    return res.status(404).json({ ok: false, error: 'Utilisateur introuvable pour ce role.' })
  }

  return res.json({
    ok: true,
    data: {
      role,
      userId: user.id,
      name: user.nom,
      email: user.email,
      token: createId('session'),
    },
  })
})

app.get('/api/admin/acces', (req, res) => {
  const users = readCollection(accessUsersFile)
  res.json(
    users.map(({ code, ...rest }) => rest),
  )
})

app.post('/api/admin/acces', (req, res) => {
  const role = ensureString(req.body?.role)
  const email = ensureString(req.body?.email).toLowerCase()
  const code = ensureString(req.body?.code)
  const nom = ensureString(req.body?.nom)
  const linkedId = ensureString(req.body?.linkedId)

  if (!role || !email || !code) {
    return res.status(400).json({ ok: false, error: 'role, email et code sont obligatoires.' })
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Email invalide.' })
  }

  const users = readCollection(accessUsersFile)
  const duplicate = users.some((item) => item.role === role && ensureString(item.email).toLowerCase() === email)
  if (duplicate) {
    return res.status(400).json({ ok: false, error: 'Un acces existe deja pour ce role et cet email.' })
  }

  const newAccess = {
    id: createId('access'),
    role,
    email,
    code,
    nom,
    linkedId: linkedId || null,
    statut: 'Actif',
    createdAt: new Date().toISOString(),
  }
  users.push(newAccess)
  writeCollection(accessUsersFile, users)
  const { code: _, ...safeAccess } = newAccess
  res.status(201).json({ ok: true, data: safeAccess })
})

app.put('/api/admin/acces/:id', (req, res) => {
  const users = readCollection(accessUsersFile)
  const index = users.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'Acces introuvable.' })
  }

  const current = users[index]
  const nextEmail = req.body?.email !== undefined ? ensureString(req.body.email).toLowerCase() : current.email
  if (nextEmail && !isEmail(nextEmail)) {
    return res.status(400).json({ ok: false, error: 'Email invalide.' })
  }

  users[index] = {
    ...current,
    role: req.body?.role !== undefined ? ensureString(req.body.role) || current.role : current.role,
    email: nextEmail || current.email,
    code: req.body?.code !== undefined ? ensureString(req.body.code) || current.code : current.code,
    nom: req.body?.nom !== undefined ? ensureString(req.body.nom) : current.nom || '',
    linkedId: req.body?.linkedId !== undefined ? ensureString(req.body.linkedId) || null : current.linkedId || null,
    statut: req.body?.statut !== undefined ? ensureString(req.body.statut) || current.statut : current.statut,
    updatedAt: new Date().toISOString(),
  }
  writeCollection(accessUsersFile, users)
  const { code: _, ...safeAccess } = users[index]
  res.json({ ok: true, data: safeAccess })
})

app.delete('/api/admin/acces/:id', (req, res) => {
  const users = readCollection(accessUsersFile)
  const exists = users.some((item) => item.id === req.params.id)
  if (!exists) {
    return res.status(404).json({ ok: false, error: 'Acces introuvable.' })
  }
  writeCollection(accessUsersFile, users.filter((item) => item.id !== req.params.id))
  res.json({ ok: true })
})

app.post('/api/admin/acces/:id/reset-code', (req, res) => {
  const users = readCollection(accessUsersFile)
  const index = users.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'Acces introuvable.' })
  }

  const temporaryCode = generateTemporaryCode()
  users[index] = {
    ...users[index],
    code: temporaryCode,
    updatedAt: new Date().toISOString(),
  }
  writeCollection(accessUsersFile, users)

  const { code: _, ...safeAccess } = users[index]
  res.json({ ok: true, data: safeAccess, temporaryCode })
})

app.get('/api/proprietaire/me', (req, res) => {
  const requestedOwnerId = ensureString(req.query?.ownerId)
  const proprietaires = readCollection(proprietairesFile)
  const owner = requestedOwnerId
    ? proprietaires.find((item) => item.id === requestedOwnerId)
    : proprietaires[0]
  if (!owner) {
    return res.status(404).json({ ok: false, error: 'Aucun proprietaire disponible.' })
  }

  const biens = readCollection(biensFile).filter((item) => item.proprietaireId === owner.id)
  const paiements = readCollection(paiementsFile)
  const ownerPayments = paiements.filter((item) => biens.some((b) => b.id === item.bienId))
  const confirmed = ownerPayments.filter((item) => item.statut !== 'A payer')
  const revenus = confirmed.reduce((sum, item) => sum + Number(item.montant || 0), 0)
  const lateCount = ownerPayments.filter((item) => item.statut === 'En retard').length

  const kpis = [
    { label: 'Revenus encaisses', value: `${revenus.toLocaleString('fr-FR')} GNF`, sub: 'Depuis le debut' },
    { label: 'Biens loues', value: `${biens.filter((b) => b.statut === 'loue').length} / ${biens.length}`, sub: 'Taux d occupation' },
    { label: 'Paiements en retard', value: String(lateCount), sub: 'Action requise' },
  ]

  const feed = confirmed.slice(0, 6).map((item) => ({
    t: new Date(item.paidAt || item.createdAt).toLocaleDateString('fr-FR'),
    msg: `${item.libelle} - ${Number(item.montant || 0).toLocaleString('fr-FR')} GNF (${item.reference || '-'})`,
  }))

  res.json({ ok: true, data: { owner, kpis, feed } })
})

app.post('/api/quittances/:id/send-email', (req, res) => {
  const quittances = readCollection(quittancesFile)
  const quittance = quittances.find((item) => item.id === req.params.id)
  if (!quittance) {
    return res.status(404).json({ ok: false, error: 'Quittance introuvable.' })
  }

  const locataires = readCollection(locatairesFile)
  const tenant = locataires.find((item) => item.id === quittance.locataireId)
  const targetEmail = ensureString(req.body?.email) || ensureString(tenant?.email)
  if (!targetEmail || !isEmail(targetEmail)) {
    return res.status(400).json({ ok: false, error: 'Email destinataire invalide.' })
  }

  const logs = readCollection(emailLogsFile)
  const logItem = {
    id: createId('mail'),
    type: 'quittance',
    quittanceId: quittance.id,
    to: targetEmail,
    subject: `Quittance ${quittance.periode}`,
    status: 'sent',
    createdAt: new Date().toISOString(),
  }
  logs.push(logItem)
  writeCollection(emailLogsFile, logs)
  res.json({ ok: true, data: logItem })
})

app.get('/api/quittances/:id/download', (req, res) => {
  const quittances = readCollection(quittancesFile)
  const quittance = quittances.find((item) => item.id === req.params.id)
  if (!quittance) {
    return res.status(404).json({ ok: false, error: 'Quittance introuvable.' })
  }

  const locataires = readCollection(locatairesFile)
  const biens = readCollection(biensFile)
  const tenant = locataires.find((item) => item.id === quittance.locataireId)
  const bien = biens.find((item) => item.id === quittance.bienId)

  const fileName = `quittance-${quittance.id}.pdf`
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)
  res.setHeader('Content-Type', 'application/pdf')

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)

  const left = doc.page.margins.left
  const right = doc.page.width - doc.page.margins.right
  const width = right - left

  // Header marque
  doc
    .save()
    .rect(left, 40, width, 72)
    .fill('#0f172a')
    .restore()
  doc.fillColor('#fbbf24').fontSize(10).text('IMMO CONNECT GN', left + 16, 52)
  doc.fillColor('#ffffff').fontSize(18).text('Quittance de loyer', left + 16, 68)
  doc.fillColor('#cbd5e1').fontSize(10).text(`N° ${quittance.id}`, right - 130, 56, { width: 120, align: 'right' })
  doc.fillColor('#cbd5e1').fontSize(10).text(new Date(quittance.createdAt).toLocaleDateString('fr-FR'), right - 130, 72, { width: 120, align: 'right' })

  doc.y = 130

  const drawSection = (title, lines) => {
    const startY = doc.y
    const sectionHeight = 22 + lines.length * 16 + 12
    doc
      .save()
      .roundedRect(left, startY, width, sectionHeight, 8)
      .strokeColor('#334155')
      .lineWidth(1)
      .stroke()
      .restore()
    doc.fillColor('#fbbf24').fontSize(11).text(title, left + 12, startY + 8)
    let lineY = startY + 28
    doc.fillColor('#e5e7eb').fontSize(11)
    lines.forEach((line) => {
      doc.text(line, left + 12, lineY, { width: width - 24 })
      lineY += 16
    })
    doc.y = startY + sectionHeight + 12
  }

  drawSection('Periode et reference', [
    `Periode: ${quittance.periode}`,
    `Type: ${quittance.type}`,
    `Reference de paiement: ${quittance.reference}`,
  ])

  drawSection('Informations locataire', [
    `Nom: ${tenant?.nom || quittance.locataireId}`,
    `Email: ${tenant?.email || '-'}`,
    `Telephone: ${tenant?.telephone || '-'}`,
  ])

  drawSection('Informations bien', [
    `Titre: ${bien?.titre || '-'}`,
    `Adresse: ${`${bien?.adresse || '-'} ${bien?.ville || ''}`.trim()}`,
    `Reference bien: ${quittance.bienId}`,
  ])

  drawSection('Detail du reglement', [
    `Montant regle: ${Number(quittance.montant || 0).toLocaleString('fr-FR')} GNF`,
    `Moyen de paiement: ${quittance.moyen}`,
    `Statut: ${quittance.statut}`,
  ])

  // Bloc signatures
  const signTop = doc.y + 16
  const signWidth = (width - 16) / 2
  doc
    .save()
    .roundedRect(left, signTop, signWidth, 90, 8)
    .strokeColor('#334155')
    .stroke()
    .roundedRect(left + signWidth + 16, signTop, signWidth, 90, 8)
    .strokeColor('#334155')
    .stroke()
    .restore()
  doc.fillColor('#9ca3af').fontSize(10).text('Signature gestionnaire', left + 12, signTop + 10)
  doc.fillColor('#9ca3af').fontSize(10).text('Signature locataire', left + signWidth + 28, signTop + 10)
  doc.fillColor('#6b7280').fontSize(9).text('Nom / cachet / date', left + 12, signTop + 68)
  doc.fillColor('#6b7280').fontSize(9).text('Nom / date', left + signWidth + 28, signTop + 68)

  doc.y = signTop + 110
  doc.fillColor('#6b7280').fontSize(9)
  doc.text('Document genere automatiquement par la plateforme Gestion Locative.', left, doc.y, { width, align: 'center' })
  doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, left, doc.y + 14, { width, align: 'center' })

  doc.end()
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
