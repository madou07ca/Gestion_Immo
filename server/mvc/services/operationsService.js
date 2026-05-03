import { createId, ensureString, isEmail, isPositiveNumber, slugify } from '../utils/common.js'
import { listBiens, findBienById, updateBien } from '../repositories/bienRepository.js'
import { listLocataires, findLocataireById, createLocataire } from '../repositories/locataireRepository.js'
import { listProprietaires } from '../repositories/proprietaireRepository.js'
import { listAccessUsers } from '../repositories/accessRepository.js'
import { listProspects, findProspectById, createProspect, updateProspect } from '../repositories/prospectRepository.js'
import { createContrat } from '../repositories/contratRepository.js'
import {
  listContrats,
  findContratById,
  updateContrat,
  deleteContratById,
} from '../repositories/contratRepository.js'
import { listDemandesLocataires, createDemandeLocataire } from '../repositories/demandeLocataireRepository.js'
import { listPaiements, writePaiements } from '../repositories/paiementRepository.js'
import { listQuittances, findQuittanceById, appendQuittances } from '../repositories/quittanceRepository.js'
import { createEmailLog, listEmailLogs } from '../repositories/emailLogRepository.js'
import {
  listTickets,
  findTicketById,
  createTicket,
  updateTicket,
} from '../repositories/ticketRepository.js'
import { getAppSettings, updateAppSettings } from '../repositories/settingsRepository.js'
import { recordAuditEvent } from './auditService.js'
import { listReversements } from '../repositories/reversementRepository.js'
import { listEtatsLieux } from '../repositories/etatLieuRepository.js'

const DEFAULT_SLA_TEMPLATES = {
  warning: {
    emailSubject: '[SLA imminent] Ticket {{ticketId}} - {{sujet}}',
    emailBody: 'Le ticket {{ticketId}} approche son echeance SLA ({{dueAt}}). Merci de traiter rapidement.',
    smsBody: 'SLA imminent: ticket {{ticketId}} ({{sujet}}), echeance {{dueAt}}.',
  },
  breach: {
    emailSubject: '[HORS SLA] Ticket {{ticketId}} - {{sujet}}',
    emailBody: 'Le ticket {{ticketId}} est hors SLA depuis {{dueAt}}. Escalade immediate requise.',
    smsBody: 'HORS SLA: ticket {{ticketId}} ({{sujet}}). Action immediate.',
  },
}

function renderTemplate(tpl, vars) {
  return String(tpl || '').replace(/\{\{(\w+)\}\}/g, (_m, key) => String(vars[key] ?? ''))
}

function formatPrice(price) {
  return `${Number(price).toLocaleString('fr-FR')} GNF / mois`
}

function currentPeriodLabel() {
  const now = new Date()
  return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export function getPublicBiens() {
  return listBiens()
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
}

export function createProspectInteret(input) {
  const nom = ensureString(input.name)
  const email = ensureString(input.email)
  const telephone = ensureString(input.phone)
  const propertyId = ensureString(input.propertyId)
  if (!nom || !email || !telephone || !propertyId) {
    return { error: { status: 400, message: 'name, email, phone et propertyId sont obligatoires.' } }
  }
  if (!isEmail(email)) return { error: { status: 400, message: 'Email prospect invalide.' } }

  const row = createProspect({
    id: createId('prospect'),
    propertyId,
    propertyTitle: ensureString(input.propertyTitle),
    nom,
    email,
    telephone,
    message: ensureString(input.message),
    statut: 'Nouveau',
    managerReply: '',
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function getProspectsInterets() {
  return listProspects()
}

export function updateProspectInteret(id, input) {
  const current = findProspectById(id)
  if (!current) return { error: { status: 404, message: 'Prospect introuvable.' } }
  const row = updateProspect(id, (item) => ({
    ...item,
    statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
    managerReply: input.managerReply !== undefined ? ensureString(input.managerReply) : item.managerReply || '',
    updatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function convertProspectToLocataire(id, input) {
  const prospect = findProspectById(id)
  if (!prospect) return { error: { status: 404, message: 'Prospect introuvable.' } }
  if (prospect.convertedLocataireId) {
    return { error: { status: 400, message: 'Ce prospect a deja ete converti en locataire.' } }
  }

  const locataire = createLocataire({
    id: createId('tenant'),
    nom: prospect.nom,
    email: prospect.email,
    telephone: prospect.telephone,
    statut: 'Actif',
    profession: ensureString(input.profession),
    revenuMensuel: isPositiveNumber(input.revenuMensuel) ? Number(input.revenuMensuel) : null,
    notes: ensureString(input.notes) || `Converti depuis prospect ${prospect.id}`,
    sourceProspectId: prospect.id,
    createdAt: new Date().toISOString(),
  })

  const updatedProspect = updateProspect(id, (item) => ({
    ...item,
    statut: 'Converti en locataire',
    convertedLocataireId: locataire.id,
    updatedAt: new Date().toISOString(),
  }))
  return { data: { prospect: updatedProspect, locataire } }
}

export function signContrat(input) {
  const bienId = ensureString(input.bienId)
  const locataireId = ensureString(input.locataireId)
  const dateDebut = ensureString(input.dateDebut)
  const dateFin = ensureString(input.dateFin)
  if (!bienId || !locataireId || !dateDebut || !dateFin) {
    return { error: { status: 400, message: 'bienId, locataireId, dateDebut et dateFin sont obligatoires.' } }
  }
  const startTs = new Date(dateDebut).getTime()
  const endTs = new Date(dateFin).getTime()
  if (Number.isFinite(startTs) && Number.isFinite(endTs) && endTs < startTs) {
    return { error: { status: 400, message: 'dateFin doit etre posterieure a dateDebut.' } }
  }
  const bien = findBienById(bienId)
  if (!bien) return { error: { status: 404, message: 'Bien introuvable.' } }
  if (!findLocataireById(locataireId)) return { error: { status: 404, message: 'Locataire introuvable.' } }

  const contrat = createContrat({
    id: createId('lease'),
    bienId,
    locataireId,
    dateDebut,
    dateFin,
    dateSignature: ensureString(input.dateSignature) || new Date().toISOString().slice(0, 10),
    dureeMois: isPositiveNumber(input.dureeMois) ? Number(input.dureeMois) : null,
    loyerMensuel: Number(input.loyerMensuel || bien.loyerMensuel || 0),
    chargesMensuelles: isPositiveNumber(input.chargesMensuelles) ? Number(input.chargesMensuelles) : Number(bien.chargesMensuelles || 0),
    depotGarantie: isPositiveNumber(input.depotGarantie) ? Number(input.depotGarantie) : Number(bien.depotGarantie || 0),
    modalitePaiement: ensureString(input.modalitePaiement) || 'virement',
    jourEcheance: isPositiveNumber(input.jourEcheance) ? Number(input.jourEcheance) : 5,
    penaliteRetard: ensureString(input.penaliteRetard),
    indexationLoyer: Boolean(input.indexationLoyer),
    conditionsResiliation: ensureString(input.conditionsResiliation),
    clausesParticulieres: ensureString(input.clausesParticulieres),
    statut: 'Signe',
    createdAt: new Date().toISOString(),
  })

  const updatedBien = updateBien(bienId, (item) => ({
    ...item,
    locataireId,
    statut: 'loue',
    updatedAt: new Date().toISOString(),
  }))
  return { data: { contrat, bien: updatedBien } }
}

export function getLocataireMe(tenantId) {
  const safeTenantId = ensureString(tenantId)
  const tenant = safeTenantId
    ? listLocataires().find((item) => item.id === safeTenantId)
    : listLocataires()[0]
  if (!tenant) return { error: { status: 404, message: 'Aucun locataire disponible.' } }

  const bien = listBiens().find((item) => item.locataireId === tenant.id) || null
  const demandes = listDemandesLocataires().filter((item) => item.locataireId === tenant.id)
  const quittances = listQuittances()
  const paiements = listPaiements()

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
    if (newRows.length > 0) writePaiements([...paiements, ...newRows])
  }

  const nextPaiements = listPaiements().filter((item) => item.locataireId === tenant.id)
  const quittanceByPaiementId = Object.fromEntries(
    quittances.filter((item) => item.locataireId === tenant.id).map((item) => [item.paiementId, item]),
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
  const montantMensuel = (
    Number(bien?.loyerMensuel || 0)
    + Number(bien?.chargesMensuelles || 0)
  )
  const prochaineEcheance = pendingPaiements[0]?.echeance || '-'
  const demandesOuvertes = demandes.filter((item) => !['Resolue', 'Cloturee'].includes(String(item.statut || ''))).length
  const paiementsRetard = nextPaiements.filter((item) => item.statut === 'En retard').length
  const quittancesGenerees = quittancesLocataire.length

  const feed = [
    ...(pendingPaiements.slice(0, 2).map((item) => ({
      t: item.echeance || 'A venir',
      msg: `${item.libelle}: ${Number(item.montant || 0).toLocaleString('fr-FR')} GNF a regler.`,
    }))),
    ...(demandes
      .slice(0, 2)
      .map((item) => ({
        t: item.date || new Date(item.createdAt || Date.now()).toLocaleDateString('fr-FR'),
        msg: `Demande ${item.type || '-'} - ${item.sujet || '-'} (${item.statut || '-'})`,
      }))),
    ...(historiquePaiements
      .slice(0, 2)
      .map((item) => ({
        t: item.date,
        msg: `Paiement confirme ${item.periode || '-'} - ${item.montant}`,
      }))),
  ].slice(0, 6)

  const etatsLieuxLocataire = listEtatsLieux().filter((e) => e.locataireId === tenant.id)

  return {
    data: {
      tenant,
      bien,
      demandes,
      etatsLieux: etatsLieuxLocataire,
      paiements: pendingPaiements,
      historiquePaiements,
      quittances: quittancesLocataire,
      kpis: [
        { label: 'Prochaine echeance', value: prochaineEcheance, sub: 'Date du prochain paiement attendu' },
        { label: 'Montant mensuel', value: `${montantMensuel.toLocaleString('fr-FR')} GNF`, sub: 'Loyer + charges' },
        { label: 'Demandes ouvertes', value: String(demandesOuvertes), sub: 'Suivi maintenance et assistance' },
        { label: 'Paiements en retard', value: String(paiementsRetard), sub: 'Regularisation recommandee' },
        { label: 'Quittances disponibles', value: String(quittancesGenerees), sub: 'Documents telechargeables' },
      ],
      feed,
    },
  }
}

export function createLocataireDemande(input) {
  const locataireId = ensureString(input.locataireId)
  const type = ensureString(input.type)
  const sujet = ensureString(input.sujet)
  const details = ensureString(input.details)
  if (!locataireId || !type || !sujet || !details) {
    return { error: { status: 400, message: 'locataireId, type, sujet et details sont obligatoires.' } }
  }
  if (!findLocataireById(locataireId)) return { error: { status: 404, message: 'Locataire introuvable.' } }

  const row = createDemandeLocataire({
    id: createId('demande'),
    locataireId,
    type,
    sujet,
    details,
    priorite: ensureString(input.priorite) || 'Normale',
    statut: 'Nouvelle',
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function reglerPaiementsLocataire(input) {
  const locataireId = ensureString(input.locataireId)
  const paiementIds = Array.isArray(input.paiementIds) ? input.paiementIds : []
  const moyen = ensureString(input.moyen) || 'Orange Money'
  const reference = ensureString(input.reference)
  if (!locataireId || paiementIds.length === 0 || !reference) {
    return { error: { status: 400, message: 'locataireId, paiementIds et reference sont obligatoires pour regler un paiement.' } }
  }

  const paiements = listPaiements()
  const targetRows = paiements.filter(
    (item) => item.locataireId === locataireId && paiementIds.includes(item.id) && item.statut === 'A payer',
  )
  if (targetRows.length === 0) {
    return { error: { status: 400, message: 'Aucune ligne payable trouvee pour cette selection.' } }
  }

  const now = new Date().toISOString()
  const updatedPaiements = paiements.map((item) => {
    if (targetRows.some((row) => row.id === item.id)) {
      return { ...item, statut: 'Confirme', moyen, reference, paidAt: now }
    }
    return item
  })
  writePaiements(updatedPaiements)

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
  appendQuittances(newQuittances)
  return { data: { paiementsRegles: targetRows.length, quittances: newQuittances } }
}

export function getGestionnaireQuittances() {
  return listQuittances()
}

export function getGestionnaireTickets() {
  const existing = listTickets()
  if (existing.length > 0) return existing

  const demandes = listDemandesLocataires()
  const biens = listBiens()
  const seeded = demandes.map((demande) => {
    const bien = biens.find((b) => b.locataireId === demande.locataireId)
    const createdAt = demande.createdAt || new Date().toISOString()
    const dueAt = new Date(new Date(createdAt).getTime() + (demande.priorite === 'Haute' || demande.priorite === 'Urgente' ? 4 : 24) * 3600000).toISOString()
    return createTicket({
      id: createId('ticket'),
      locataireId: demande.locataireId,
      bienId: bien?.id || null,
      agenceId: bien?.agenceId || null,
      gestionnaireId: null,
      sujet: demande.sujet || demande.type || 'Ticket',
      type: demande.type || 'Incident',
      priorite: demande.priorite || 'Normale',
      statut: 'Ouvert',
      slaHours: demande.priorite === 'Haute' || demande.priorite === 'Urgente' ? 4 : 24,
      dueAt,
      createdAt,
      source: 'demande-locataire',
    })
  })
  return seeded
}

export function createGestionnaireTicket(input) {
  const sujet = ensureString(input.sujet)
  if (!sujet) return { error: { status: 400, message: 'Le sujet du ticket est obligatoire.' } }
  const createdAt = new Date().toISOString()
  const slaHours = isPositiveNumber(input.slaHours) ? Number(input.slaHours) : (ensureString(input.priorite) === 'Haute' ? 4 : 24)
  const dueAt = new Date(Date.now() + slaHours * 3600000).toISOString()

  const row = createTicket({
    id: createId('ticket'),
    locataireId: ensureString(input.locataireId) || null,
    bienId: ensureString(input.bienId) || null,
    agenceId: ensureString(input.agenceId) || null,
    gestionnaireId: ensureString(input.gestionnaireId) || null,
    sujet,
    type: ensureString(input.type) || 'Incident',
    priorite: ensureString(input.priorite) || 'Normale',
    statut: ensureString(input.statut) || 'Ouvert',
    slaHours,
    dueAt,
    createdAt,
    source: 'manual',
  })
  return { data: row }
}

export function updateGestionnaireTicket(id, input) {
  const current = findTicketById(id)
  if (!current) return { error: { status: 404, message: 'Ticket introuvable.' } }
  const nextStatus = input.statut !== undefined ? ensureString(input.statut) || current.statut : current.statut
  const row = updateTicket(id, (item) => ({
    ...item,
    sujet: input.sujet !== undefined ? ensureString(input.sujet) || item.sujet : item.sujet,
    type: input.type !== undefined ? ensureString(input.type) || item.type : item.type,
    priorite: input.priorite !== undefined ? ensureString(input.priorite) || item.priorite : item.priorite,
    statut: nextStatus,
    agenceId: input.agenceId !== undefined ? ensureString(input.agenceId) || null : item.agenceId || null,
    gestionnaireId: input.gestionnaireId !== undefined ? ensureString(input.gestionnaireId) || null : item.gestionnaireId || null,
    dueAt: input.dueAt !== undefined ? ensureString(input.dueAt) || item.dueAt : item.dueAt,
    resolvedAt: ['resolu', 'clos', 'termine'].includes(nextStatus.toLowerCase()) ? new Date().toISOString() : item.resolvedAt || null,
    updatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function runSlaNotificationsNow(options = {}) {
  const tickets = getGestionnaireTickets()
  const now = new Date()
  const accessUsers = listAccessUsers()
  const biens = listBiens()
  const locataires = listLocataires()
  const proprietaires = listProprietaires()
  const createdLogs = []
  let updatedCount = 0

  const settings = getAppSettings()
  const warningLeadHours = Number(options.warningLeadHours ?? settings.slaNotifications?.warningLeadHours ?? 2)
  const templates = settings.slaNotifications?.templates || {}

  tickets.forEach((ticket) => {
    const status = String(ticket.statut || '').toLowerCase()
    if (['resolu', 'clos', 'termine'].includes(status)) return
    if (!ticket.dueAt) return

    const due = new Date(ticket.dueAt)
    const hoursToDue = (due.getTime() - now.getTime()) / 3600000
    let stage = null
    if (hoursToDue <= 0) stage = 'breach'
    else if (hoursToDue <= warningLeadHours) stage = 'warning'
    if (!stage) return

    const history = Array.isArray(ticket.notificationHistory) ? ticket.notificationHistory : []
    const alreadyEmail = history.some((h) => h.stage === stage && h.channel === 'email')
    const alreadySms = history.some((h) => h.stage === stage && h.channel === 'sms')
    if (alreadyEmail && alreadySms) return

    const bien = ticket.bienId ? biens.find((b) => b.id === ticket.bienId) : null
    const locataire = ticket.locataireId ? locataires.find((l) => l.id === ticket.locataireId) : null
    const proprietaire = bien?.proprietaireId ? proprietaires.find((p) => p.id === bien.proprietaireId) : null
    const gestionnaire = ticket.gestionnaireId ? accessUsers.find((u) => u.id === ticket.gestionnaireId) : null
    const severityLabel = stage === 'breach' ? 'HORS SLA' : 'SLA imminent'
    const vars = {
      ticketId: ticket.id,
      sujet: ticket.sujet || '-',
      dueAt: new Date(ticket.dueAt).toLocaleString('fr-FR'),
      severity: severityLabel,
    }
    const stageTpl = templates[stage] || {}
    const subject = renderTemplate(stageTpl.emailSubject, vars) || `[${severityLabel}] Ticket ${ticket.id} - ${ticket.sujet}`
    const emailMessage = renderTemplate(stageTpl.emailBody, vars) || `${subject}. Echeance: ${vars.dueAt}.`
    const smsMessage = renderTemplate(stageTpl.smsBody, vars) || `${severityLabel} ${ticket.id} - ${vars.dueAt}`

    const emailTargets = [locataire?.email, proprietaire?.email, gestionnaire?.email]
      .map((x) => ensureString(x))
      .filter(Boolean)
    const smsTargets = [locataire?.telephone, proprietaire?.telephone]
      .map((x) => ensureString(x))
      .filter(Boolean)

    if (!alreadyEmail) {
      emailTargets.forEach((to) => {
        const row = createEmailLog({
          id: createId('mail'),
          type: 'sla-ticket',
          channel: 'email',
          ticketId: ticket.id,
          to,
          subject,
          message: emailMessage,
          status: 'sent',
          createdAt: new Date().toISOString(),
        })
        createdLogs.push(row)
      })
    }

    if (!alreadySms) {
      smsTargets.forEach((to) => {
        const row = createEmailLog({
          id: createId('mail'),
          type: 'sla-ticket',
          channel: 'sms',
          ticketId: ticket.id,
          to,
          subject: `[SMS] ${severityLabel} ${ticket.id}`,
          message: smsMessage,
          status: 'sent_simulated',
          createdAt: new Date().toISOString(),
        })
        createdLogs.push(row)
      })
    }

    const nextHistory = [...history]
    if (!alreadyEmail) nextHistory.push({ stage, channel: 'email', at: new Date().toISOString() })
    if (!alreadySms) nextHistory.push({ stage, channel: 'sms', at: new Date().toISOString() })
    updateTicket(ticket.id, (row) => ({
      ...row,
      notificationHistory: nextHistory,
      updatedAt: new Date().toISOString(),
    }))
    updatedCount += 1
  })

  return {
    data: {
      ticketsEvaluated: tickets.length,
      ticketsUpdated: updatedCount,
      notificationsSent: createdLogs.length,
      logs: createdLogs,
    },
  }
}

export function getSlaNotificationLogs() {
  const rows = listEmailLogs()
    .filter((row) => row.type === 'sla-ticket')
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  return rows
}

export function getSlaNotificationSettings() {
  return getAppSettings().slaNotifications
}

export function updateSlaNotificationSettings(input) {
  const current = getAppSettings()
  const enabled = input.enabled !== undefined ? Boolean(input.enabled) : current.slaNotifications.enabled
  const warningLeadHours = input.warningLeadHours !== undefined ? Number(input.warningLeadHours) : current.slaNotifications.warningLeadHours
  const autoRunEveryMinutes = input.autoRunEveryMinutes !== undefined ? Number(input.autoRunEveryMinutes) : current.slaNotifications.autoRunEveryMinutes
  const resetTemplates = Boolean(input.resetTemplates)
  const currentTemplates = resetTemplates ? DEFAULT_SLA_TEMPLATES : (current.slaNotifications.templates || {})
  const inputTemplates = input.templates || {}
  const next = {
    ...current,
    slaNotifications: {
      ...current.slaNotifications,
      enabled,
      warningLeadHours: Number.isFinite(warningLeadHours) ? Math.max(1, Math.min(24, warningLeadHours)) : 2,
      autoRunEveryMinutes: Number.isFinite(autoRunEveryMinutes) ? Math.max(5, Math.min(120, autoRunEveryMinutes)) : 15,
      templates: {
        warning: {
          ...(currentTemplates.warning || {}),
          ...(inputTemplates.warning || {}),
        },
        breach: {
          ...(currentTemplates.breach || {}),
          ...(inputTemplates.breach || {}),
        },
      },
      updatedAt: new Date().toISOString(),
    },
  }
  updateAppSettings(next)
  return { data: next.slaNotifications }
}

export function getSlaNotificationPreview(input = {}) {
  const stage = String(input.stage || 'warning').toLowerCase() === 'breach' ? 'breach' : 'warning'
  const tickets = getGestionnaireTickets()
  const selected = ensureString(input.ticketId)
  const ticket = tickets.find((item) => item.id === selected) || tickets[0]
  if (!ticket) return { error: { status: 404, message: 'Aucun ticket disponible pour la previsualisation.' } }

  const severityLabel = stage === 'breach' ? 'HORS SLA' : 'SLA imminent'
  const vars = {
    ticketId: ticket.id,
    sujet: ticket.sujet || '-',
    dueAt: ticket.dueAt ? new Date(ticket.dueAt).toLocaleString('fr-FR') : '-',
    severity: severityLabel,
  }
  const settings = getAppSettings()
  const stageTpl = settings.slaNotifications?.templates?.[stage] || {}
  return {
    data: {
      stage,
      ticketId: ticket.id,
      emailSubject: renderTemplate(stageTpl.emailSubject, vars),
      emailBody: renderTemplate(stageTpl.emailBody, vars),
      smsBody: renderTemplate(stageTpl.smsBody, vars),
      variables: vars,
    },
  }
}

export function runSlaNotificationsAutoTick() {
  const settings = getAppSettings().slaNotifications
  if (!settings.enabled) return { data: { skipped: true, reason: 'disabled' } }
  const lastRun = settings.lastAutoRunAt ? new Date(settings.lastAutoRunAt).getTime() : 0
  const now = Date.now()
  const minIntervalMs = Number(settings.autoRunEveryMinutes || 15) * 60000
  if (lastRun && now - lastRun < minIntervalMs) {
    return { data: { skipped: true, reason: 'interval-not-reached' } }
  }
  const run = runSlaNotificationsNow({ warningLeadHours: settings.warningLeadHours })
  const current = getAppSettings()
  updateAppSettings({
    ...current,
    slaNotifications: {
      ...current.slaNotifications,
      lastAutoRunAt: new Date().toISOString(),
    },
  })
  return run
}

export function getContrats() {
  return listContrats()
}

export function updateContratStatus(id, statut) {
  const current = findContratById(id)
  if (!current) return { error: { status: 404, message: 'Contrat introuvable.' } }
  const nextStatus = ensureString(statut)
  if (!nextStatus) return { error: { status: 400, message: 'Le statut est obligatoire.' } }
  const updated = updateContrat(id, (row) => ({
    ...row,
    statut: nextStatus,
    updatedAt: new Date().toISOString(),
  }))
  return { data: updated }
}

export function deleteContratService(id) {
  const current = findContratById(id)
  if (!current) return { error: { status: 404, message: 'Contrat introuvable.' } }
  const removed = deleteContratById(id)
  if (!removed) return { error: { status: 404, message: 'Contrat introuvable.' } }

  recordAuditEvent({
    actor: 'api',
    action: 'delete.contrat',
    entityType: 'contrat',
    entityId: id,
    detail: `Suppression bail ${id}`,
    severity: 'warning',
  })

  if (current.bienId) {
    const property = findBienById(current.bienId)
    if (property && ensureString(property.locataireId) === ensureString(current.locataireId)) {
      updateBien(current.bienId, (row) => ({
        ...row,
        locataireId: '',
        statut: 'disponible',
        updatedAt: new Date().toISOString(),
      }))
    }
  }
  return { data: { id } }
}

export function getProprietaireMe(ownerId) {
  const safeOwnerId = ensureString(ownerId)
  const owner = safeOwnerId
    ? listProprietaires().find((item) => item.id === safeOwnerId)
    : listProprietaires()[0]
  if (!owner) return { error: { status: 404, message: 'Aucun proprietaire disponible.' } }

  const biens = listBiens().filter((item) => item.proprietaireId === owner.id)
  const ownerPayments = listPaiements().filter((item) => biens.some((b) => b.id === item.bienId))
  const confirmed = ownerPayments.filter((item) => item.statut !== 'A payer')
  const revenus = confirmed.reduce((sum, item) => sum + Number(item.montant || 0), 0)
  const lateCount = ownerPayments.filter((item) => item.statut === 'En retard').length
  const biensLoues = biens.filter((item) => item.statut === 'loue').length
  const biensDisponibles = biens.filter((item) => item.statut === 'disponible').length
  const biensMaintenance = biens.filter((item) => item.statut === 'maintenance').length
  const totalBiens = biens.length
  const tauxOccupation = totalBiens > 0 ? Math.round((biensLoues / totalBiens) * 100) : 0
  const loyerPotentielMensuel = biens.reduce((sum, item) => sum + Number(item.loyerMensuel || 0), 0)
  const loyerEncaisseMensuel = biens
    .filter((item) => item.statut === 'loue')
    .reduce((sum, item) => sum + Number(item.loyerMensuel || 0), 0)
  const manqueAGagnerMensuel = Math.max(0, loyerPotentielMensuel - loyerEncaisseMensuel)

  const activitesFinancieres = confirmed
    .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())
    .slice(0, 4)
    .map((item) => ({
      t: new Date(item.paidAt || item.createdAt).toLocaleDateString('fr-FR'),
      msg: `${item.libelle} - ${Number(item.montant || 0).toLocaleString('fr-FR')} GNF (${item.reference || '-'})`,
    }))

  const alertesPatrimoine = []
  if (biensDisponibles > 0) {
    alertesPatrimoine.push({
      t: 'Vacance',
      msg: `${biensDisponibles} bien(s) disponible(s) - manque estime ${manqueAGagnerMensuel.toLocaleString('fr-FR')} GNF / mois.`,
    })
  }
  if (biensMaintenance > 0) {
    alertesPatrimoine.push({
      t: 'Maintenance',
      msg: `${biensMaintenance} bien(s) en maintenance - verifier delais et budget travaux.`,
    })
  }
  if (lateCount > 0) {
    alertesPatrimoine.push({
      t: 'Risque',
      msg: `${lateCount} paiement(s) en retard - suivi recouvrement recommande.`,
    })
  }

  const feed = [...alertesPatrimoine, ...activitesFinancieres].slice(0, 8)
  const actions = []
  if (lateCount > 0) {
    actions.push({
      id: 'owner-action-recovery',
      priority: 'Haute',
      title: 'Lancer le recouvrement des impayes',
      detail: `${lateCount} paiement(s) en retard a traiter avec l'agence.`,
      target: 'historique-paiements',
    })
  }
  if (biensDisponibles > 0) {
    actions.push({
      id: 'owner-action-vacancy',
      priority: 'Moyenne',
      title: 'Relancer la commercialisation des biens vacants',
      detail: `${biensDisponibles} bien(s) disponible(s) reduisent le revenu locatif.`,
      target: 'biens',
    })
  }
  if (biensMaintenance > 0) {
    actions.push({
      id: 'owner-action-maintenance',
      priority: 'Moyenne',
      title: 'Suivre les interventions de maintenance',
      detail: `${biensMaintenance} bien(s) en maintenance: verifier delais et budget.`,
      target: 'demandes',
    })
  }
  if (actions.length === 0) {
    actions.push({
      id: 'owner-action-report',
      priority: 'Info',
      title: 'Portefeuille stable',
      detail: 'Aucune urgence detectee. Consultez les rapports pour optimiser le rendement.',
      target: 'revenus',
    })
  }

  const bienIdSet = new Set(biens.map((b) => b.id))
  const reversementsAgenda = listReversements()
    .filter((r) => r.proprietaireId === owner.id)
    .slice(0, 15)
  const etatsLieuxParc = listEtatsLieux()
    .filter((e) => bienIdSet.has(e.bienId))
    .slice(0, 20)

  return {
    data: {
      owner,
      reversementsAgenda,
      etatsLieuxParc,
      kpis: [
        { label: 'Encaissements cumules', value: `${revenus.toLocaleString('fr-FR')} GNF`, sub: 'Tous paiements confirmes' },
        { label: 'Occupation du parc', value: `${tauxOccupation}%`, sub: `${biensLoues}/${totalBiens} biens loues` },
        { label: 'Loyer securise / mois', value: `${loyerEncaisseMensuel.toLocaleString('fr-FR')} GNF`, sub: 'Selon biens actuellement loues' },
        { label: 'Vacance locative', value: String(biensDisponibles), sub: `${manqueAGagnerMensuel.toLocaleString('fr-FR')} GNF potentiel non capte` },
        { label: 'Paiements en retard', value: String(lateCount), sub: 'Priorite recouvrement' },
        { label: 'Biens en maintenance', value: String(biensMaintenance), sub: 'Impact possible sur rendement' },
      ],
      feed,
      actions,
    },
  }
}

export function sendQuittanceByEmail(quittanceId, email) {
  const quittance = findQuittanceById(quittanceId)
  if (!quittance) return { error: { status: 404, message: 'Quittance introuvable.' } }
  const tenant = listLocataires().find((item) => item.id === quittance.locataireId)
  const targetEmail = ensureString(email) || ensureString(tenant?.email)
  if (!targetEmail || !isEmail(targetEmail)) {
    return { error: { status: 400, message: 'Email destinataire invalide.' } }
  }
  const log = createEmailLog({
    id: createId('mail'),
    type: 'quittance',
    quittanceId: quittance.id,
    to: targetEmail,
    subject: `Quittance ${quittance.periode}`,
    status: 'sent',
    createdAt: new Date().toISOString(),
  })
  return { data: log }
}

