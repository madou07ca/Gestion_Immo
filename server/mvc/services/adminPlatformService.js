import { listAgences } from '../repositories/agenceRepository.js'
import { listProprietaires } from '../repositories/proprietaireRepository.js'
import { listLocataires } from '../repositories/locataireRepository.js'
import { listBiens } from '../repositories/bienRepository.js'
import { listAccessUsers } from '../repositories/accessRepository.js'
import { listProspects } from '../repositories/prospectRepository.js'
import { listPaiements } from '../repositories/paiementRepository.js'
import { listQuittances } from '../repositories/quittanceRepository.js'
import { listContrats } from '../repositories/contratRepository.js'
import { listTickets } from '../repositories/ticketRepository.js'
import { listAuditEvents } from '../repositories/auditEventRepository.js'
import { formatAuditEventsForAdmin } from './auditService.js'

/** Parse YYYY-MM-DD en date locale (évite les décalages UTC). */
function parseYmd(value) {
  if (!value || typeof value !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isLeaseActive(contrat, todayStart) {
  const fin = parseYmd(contrat.dateFin)
  const deb = parseYmd(contrat.dateDebut)
  if (!fin) return false
  if (fin < todayStart) return false
  if (deb && deb > todayStart) return false
  const st = String(contrat.statut || '').toLowerCase()
  if (st.includes('resil') || st.includes('annul')) return false
  return st.includes('sign') || st === '' || st.includes('actif')
}

function parseFrDate(value) {
  if (!value || typeof value !== 'string') return null
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

function bucketLabel(days) {
  if (days <= 3) return 'J+3'
  if (days <= 7) return 'J+7'
  if (days <= 15) return 'J+15'
  return 'J+30'
}

export function getAdminOverview() {
  const agences = listAgences()
  const proprietaires = listProprietaires()
  const locataires = listLocataires()
  const biens = listBiens()
  const access = listAccessUsers()
  const prospects = listProspects()
  const paiements = listPaiements()
  const quittances = listQuittances()
  const contrats = listContrats()
  const tickets = listTickets()

  const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
  const today = startOfLocalDay(new Date())
  const horizon90 = new Date(today)
  horizon90.setDate(horizon90.getDate() + 90)
  const horizon365 = new Date(today)
  horizon365.setDate(horizon365.getDate() + 365)

  let contratsActifs = 0
  let bauxExpirant90j = 0
  let bauxExpires = 0
  const expiringLeaseRows = []

  for (const c of contrats) {
    const fin = parseYmd(c.dateFin)
    if (!fin) continue
    if (fin < today) {
      const st = String(c.statut || '').toLowerCase()
      if (st.includes('sign') || st.includes('actif')) bauxExpires += 1
      continue
    }
    if (!isLeaseActive(c, today)) continue
    contratsActifs += 1
    if (fin <= horizon90) bauxExpirant90j += 1
    if (fin <= horizon365) {
      const bien = bienById[c.bienId]
      const jours = Math.ceil((fin - today) / 86400000)
      expiringLeaseRows.push({
        id: c.id,
        dateFin: c.dateFin,
        bien: bien?.titre || bien?.adresse || c.bienId || '-',
        agenceId: bien?.agenceId || '-',
        loyerMensuel: Number(c.loyerMensuel) || 0,
        joursRestants: jours,
      })
    }
  }

  expiringLeaseRows.sort((a, b) => a.joursRestants - b.joursRestants)
  const expiringLeases = expiringLeaseRows.slice(0, 25)

  const biensLoues = biens.filter((item) => item.statut === 'loue').length
  const biensDisponibles = biens.filter((item) => item.statut === 'disponible').length
  const biensMaintenance = biens.filter((item) => item.statut === 'maintenance').length
  const tauxOccupation = biens.length > 0 ? Math.round((biensLoues / biens.length) * 100) : 0
  const paiementsRetard = paiements.filter((item) => item.statut === 'En retard').length
  const openTickets = tickets.filter((t) => !['resolu', 'clos', 'termine'].includes(String(t.statut || '').toLowerCase()))
  const horsSlaTickets = openTickets.filter((t) => t.dueAt && new Date(t.dueAt) < today)
  const totalEncaisse = paiements
    .filter((item) => item.statut !== 'A payer')
    .reduce((sum, item) => sum + Number(item.montant || 0), 0)

  const comptesInactifs = access.filter((item) => String(item.statut || 'Actif').toLowerCase() !== 'actif').length

  const retardBuckets = { 'J+3': 0, 'J+7': 0, 'J+15': 0, 'J+30': 0 }
  paiements.forEach((payment) => {
    if (payment.statut !== 'En retard') return
    const due = parseFrDate(payment.echeance)
    const days = due ? Math.max(1, Math.ceil((today - due) / 86400000)) : 30
    retardBuckets[bucketLabel(days)] += 1
  })

  const byAgence = agences.map((agence) => {
    const agenceId = agence.id
    const agenceBiens = biens.filter((item) => item.agenceId === agenceId)
    const agenceLocataires = locataires.filter((item) => item.agenceId === agenceId)
    const agenceProprietaires = proprietaires.filter((item) => item.agenceId === agenceId)
    const agenceGestionnaires = access.filter((item) => item.role === 'gestionnaire' && item.agenceId === agenceId)
    const loues = agenceBiens.filter((item) => item.statut === 'loue').length
    const totalBiens = agenceBiens.length
    const taux = totalBiens > 0 ? Math.round((loues / totalBiens) * 100) : 0
    const paiementsRetardAgence = paiements.filter((p) => {
      if (p.statut !== 'En retard') return false
      const bien = bienById[p.bienId]
      return bien && bien.agenceId === agenceId
    }).length
    const agenceOpenTickets = openTickets.filter((t) => t.agenceId === agenceId).length
    const agenceHorsSla = horsSlaTickets.filter((t) => t.agenceId === agenceId).length
    return {
      agenceId,
      agence: agence.nom || agence.id,
      biens: totalBiens,
      loues,
      tauxOccupation: `${taux}%`,
      locataires: agenceLocataires.length,
      proprietaires: agenceProprietaires.length,
      gestionnaires: agenceGestionnaires.length,
      paiementsRetard: paiementsRetardAgence,
      ticketsOuverts: agenceOpenTickets,
      ticketsHorsSla: agenceHorsSla,
    }
  })

  const signals = []
  if (paiementsRetard > 0) {
    signals.push({
      severity: 'high',
      label: 'Impayes',
      value: String(paiementsRetard),
      hint: 'Paiements en retard — relances et recouvrement transverse.',
    })
  }

  const recoveryPlan = Object.entries(retardBuckets).map(([bucket, count]) => ({
    bucket,
    count,
    action: count > 0 ? 'Relance ciblee requise' : 'RAS',
  }))
  if (bauxExpirant90j > 0) {
    signals.push({
      severity: 'medium',
      label: 'Renouvellements',
      value: String(bauxExpirant90j),
      hint: 'Baux actifs expirant dans les 90 prochains jours.',
    })
  }
  if (biensMaintenance > 0) {
    signals.push({
      severity: 'medium',
      label: 'Maintenance',
      value: String(biensMaintenance),
      hint: 'Biens en maintenance (vacance partielle ou travaux).',
    })
  }
  if (comptesInactifs > 0) {
    signals.push({
      severity: 'low',
      label: 'Comptes inactifs',
      value: String(comptesInactifs),
      hint: 'Acces plateforme non actifs — revue securite.',
    })
  }
  if (biensDisponibles > 0 && tauxOccupation < 70) {
    signals.push({
      severity: 'low',
      label: 'Vacance commerciale',
      value: String(biensDisponibles),
      hint: `${biensDisponibles} bien(s) disponible(s) — pilotage commercial.`,
    })
  }
  if (horsSlaTickets.length > 0) {
    signals.push({
      severity: 'high',
      label: 'Tickets hors SLA',
      value: String(horsSlaTickets.length),
      hint: 'Interventions depassant le delai contractuel.',
    })
  }

  const feed = [
    { t: 'Temps reel', msg: `${prospects.length} prospects suivis sur la plateforme.` },
    { t: 'Temps reel', msg: `${quittances.length} quittances generees au global.` },
    { t: 'Temps reel', msg: `${paiementsRetard} paiements en retard necessitent un suivi.` },
    { t: 'Temps reel', msg: `${access.filter((item) => item.role === 'agence').length} comptes agences provisionnes.` },
    { t: 'Contrats', msg: `${contratsActifs} bail(aux) actif(s), ${bauxExpirant90j} echeance(s) sous 90 jours, ${bauxExpires} termine(s) non clotures en base.` },
    { t: 'Patrimoine', msg: `${biensDisponibles} disponible(s), ${biensMaintenance} en maintenance, ${biensLoues} loues sur ${biens.length} biens.` },
  ]

  const alerts = []
  if (paiementsRetard > 0) {
    alerts.push({
      id: 'alert-retards',
      severity: 'high',
      title: `${paiementsRetard} impaye(s) a traiter`,
      detail: 'Lancer la sequence de recouvrement et suivre les promesses.',
      ctaSection: 'reporting',
      ctaLabel: 'Ouvrir recouvrement',
    })
  }
  if (horsSlaTickets.length > 0) {
    alerts.push({
      id: 'alert-sla',
      severity: 'high',
      title: `${horsSlaTickets.length} ticket(s) hors SLA`,
      detail: `${openTickets.length} ticket(s) ouverts, prioriser les urgences par agence.`,
      ctaSection: 'tickets',
      ctaLabel: 'Ouvrir backlog SLA',
    })
  }
  if (bauxExpirant90j > 0) {
    alerts.push({
      id: 'alert-baux-expirants',
      severity: 'medium',
      title: `${bauxExpirant90j} bail(aux) expirent sous 90 jours`,
      detail: 'Prioriser renegociation, renouvellement ou remise en marche.',
      ctaSection: 'pilotage',
      ctaLabel: 'Voir les baux',
    })
  }
  if (biensDisponibles > 0) {
    alerts.push({
      id: 'alert-vacance',
      severity: 'medium',
      title: `${biensDisponibles} bien(s) vacants`,
      detail: 'Risque de manque a gagner commercial sur le parc locatif.',
      ctaSection: 'biens',
      ctaLabel: 'Voir les biens',
    })
  }
  if (comptesInactifs > 0) {
    alerts.push({
      id: 'alert-securite',
      severity: 'low',
      title: `${comptesInactifs} compte(s) inactif(s)`,
      detail: 'Verifier roles, habilitations et comptes dormants.',
      ctaSection: 'acces',
      ctaLabel: 'Auditer les acces',
    })
  }

  const actionsToday = alerts.slice(0, 5).map((item, index) => ({
    id: `action-${index + 1}`,
    priority: item.severity === 'high' ? 'Haute' : item.severity === 'medium' ? 'Moyenne' : 'Normale',
    title: item.title,
    detail: item.detail,
    section: item.ctaSection,
  }))
  if (openTickets.length > 0) {
    actionsToday.push({
      id: 'action-sla-review',
      priority: 'Haute',
      title: 'Revue quotidienne SLA tickets',
      detail: `${openTickets.length} ticket(s) ouverts a suivre`,
      section: 'tickets',
    })
  }

  const ranking = [...byAgence].sort((a, b) => {
    const ta = Number(String(a.tauxOccupation).replace('%', '')) || 0
    const tb = Number(String(b.tauxOccupation).replace('%', '')) || 0
    if (tb !== ta) return tb - ta
    return Number(a.paiementsRetard || 0) - Number(b.paiementsRetard || 0)
  })
  const agencyComparison = {
    top: ranking.slice(0, 3),
    bottom: [...ranking].reverse().slice(0, 3),
  }

  const monthlyPotential = biens.reduce((sum, b) => sum + Number(b.loyerMensuel || 0), 0)
  const monthlySecured = biens
    .filter((b) => b.statut === 'loue')
    .reduce((sum, b) => sum + Number(b.loyerMensuel || 0), 0)
  const forecast = [
    { horizon: '30j', expected: Math.round(monthlySecured), risk: Math.round(monthlyPotential - monthlySecured), focus: 'Recouvrement + vacance' },
    { horizon: '60j', expected: Math.round(monthlySecured * 2), risk: Math.round((monthlyPotential - monthlySecured) * 2), focus: 'Renouvellements baux' },
    { horizon: '90j', expected: Math.round(monthlySecured * 3), risk: Math.round((monthlyPotential - monthlySecured) * 3), focus: 'Pipeline commercial' },
  ]

  const complianceByAgence = byAgence.map((row) => ({
    agenceId: row.agenceId,
    agence: row.agence,
    score: Math.max(0, Math.min(100,
      100
      - Number(row.paiementsRetard || 0) * 8
      - Math.max(0, 2 - Number(row.gestionnaires || 0)) * 10
      - Math.max(0, Number(row.biens || 0) - Number(row.loues || 0)) * 3)),
    incidents: Number(row.paiementsRetard || 0),
    accesInactifs: access.filter((a) => a.agenceId === row.agenceId && String(a.statut) !== 'Actif').length,
  }))

  const persistedAudit = formatAuditEventsForAdmin(listAuditEvents()).slice(0, 40)
  const syntheticAudit = [
    ...alerts.map((a, idx) => ({
      horodatage: new Date(Date.now() - idx * 3600000).toLocaleString('fr-FR'),
      user: 'system.alerts',
      action: 'Alerte',
      detail: a.title,
      objectType: 'alert',
      severity: a.severity,
    })),
    ...recoveryPlan.filter((r) => r.count > 0).map((r) => ({
      horodatage: new Date().toLocaleString('fr-FR'),
      user: 'system.recovery',
      action: 'Recouvrement',
      detail: `${r.count} dossier(s) ${r.bucket}`,
      objectType: 'paiement',
      severity: 'medium',
    })),
  ]
  const auditEvents = [...persistedAudit, ...syntheticAudit].slice(0, 60)

  return {
    data: {
      kpis: [
        { label: 'Agences actives', value: String(agences.length), sub: 'Gouvernance multi-agence' },
        { label: 'Taux occupation global', value: `${tauxOccupation}%`, sub: `${biensLoues}/${biens.length} biens loues` },
        { label: 'Encaissements confirms', value: `${totalEncaisse.toLocaleString('fr-FR')} GNF`, sub: 'Tous portefeuilles' },
        { label: 'Paiements en retard', value: String(paiementsRetard), sub: 'Action operationnelle' },
        { label: 'Baux actifs', value: String(contratsActifs), sub: `${bauxExpirant90j} echeances < 90 j` },
        { label: 'Biens disponibles', value: String(biensDisponibles), sub: `${biensMaintenance} en maintenance` },
        { label: 'Acteurs actifs', value: String(proprietaires.length + locataires.length), sub: 'Proprietaires + locataires' },
        { label: 'Gestionnaires agences', value: String(access.filter((item) => item.role === 'gestionnaire').length), sub: 'Capacite operationnelle' },
        { label: 'Baux termines (base)', value: String(bauxExpires), sub: 'Fin passee — verification renouvellement' },
      ],
      feed,
      byAgence,
      signals,
      expiringLeases,
      alerts,
      actionsToday,
      recoveryPlan,
      agencyComparison,
      forecast,
      complianceByAgence,
      auditEvents,
      ticketSla: {
        ouverts: openTickets.length,
        horsSla: horsSlaTickets.length,
      },
    },
  }
}

export function searchAdminEntities(query) {
  const term = String(query || '').trim().toLowerCase()
  if (!term) return { data: [] }

  const agences = listAgences()
  const proprietaires = listProprietaires()
  const locataires = listLocataires()
  const biens = listBiens()
  const contrats = listContrats()
  const access = listAccessUsers()

  const matches = []
  agences.forEach((item) => {
    const hay = `${item.id} ${item.nom} ${item.email}`.toLowerCase()
    if (hay.includes(term)) matches.push({ type: 'agence', id: item.id, label: item.nom || item.id, detail: item.email || '-' })
  })
  proprietaires.forEach((item) => {
    const hay = `${item.id} ${item.nom} ${item.email}`.toLowerCase()
    if (hay.includes(term)) matches.push({ type: 'proprietaire', id: item.id, label: item.nom || item.id, detail: item.agenceId || '-' })
  })
  locataires.forEach((item) => {
    const hay = `${item.id} ${item.nom} ${item.email}`.toLowerCase()
    if (hay.includes(term)) matches.push({ type: 'locataire', id: item.id, label: item.nom || item.id, detail: item.agenceId || '-' })
  })
  biens.forEach((item) => {
    const hay = `${item.id} ${item.titre} ${item.adresse}`.toLowerCase()
    if (hay.includes(term)) matches.push({ type: 'bien', id: item.id, label: item.titre || item.id, detail: item.adresse || '-' })
  })
  contrats.forEach((item) => {
    const hay = `${item.id} ${item.bienId} ${item.locataireId} ${item.statut}`.toLowerCase()
    if (hay.includes(term)) matches.push({ type: 'contrat', id: item.id, label: item.id, detail: item.statut || '-' })
  })
  access.forEach((item) => {
    const hay = `${item.id} ${item.role} ${item.nom} ${item.email}`.toLowerCase()
    if (hay.includes(term)) matches.push({ type: 'acces', id: item.id, label: item.nom || item.email || item.id, detail: item.role || '-' })
  })
  return { data: matches.slice(0, 60) }
}

/**
 * Vue admin restreinte a une agence (directeur / gestionnaire).
 * Ne renvoie pas les signaux / alertes agrégés sans perimeter agenceId.
 */
export function scopeAdminOverviewForAgence(data, agenceId) {
  if (!data || !agenceId) return data
  const aid = String(agenceId)
  const matchesAgence = (row) =>
    !row || row.agenceId === undefined || row.agenceId === null || String(row.agenceId) === aid

  const byAgenceFiltered = (data.byAgence || []).filter((r) => String(r.agenceId) === aid)
  const row = byAgenceFiltered[0]

  const signals = []
  if (row) {
    if (Number(row.paiementsRetard || 0) > 0) {
      signals.push({
        severity: 'high',
        label: 'Impayes',
        value: String(row.paiementsRetard),
        hint: 'Paiements en retard sur le portefeuille agence.',
        agenceId: aid,
      })
    }
    if (Number(row.ticketsHorsSla || 0) > 0) {
      signals.push({
        severity: 'high',
        label: 'Tickets hors SLA',
        value: String(row.ticketsHorsSla),
        hint: 'Tickets agence depassant le delai SLA.',
        agenceId: aid,
      })
    }
    if (Number(row.ticketsOuverts || 0) > 0) {
      signals.push({
        severity: 'medium',
        label: 'Tickets ouverts',
        value: String(row.ticketsOuverts),
        hint: 'Backlog operationnel agence.',
        agenceId: aid,
      })
    }
  }

  const alerts = []
  if (row && Number(row.paiementsRetard || 0) > 0) {
    alerts.push({
      id: 'alert-retards-agence',
      severity: 'high',
      title: `${row.paiementsRetard} impaye(s) agence`,
      detail: 'Relances et recouvrement sur votre portefeuille.',
      ctaSection: 'reporting',
      ctaLabel: 'Voir reporting',
      agenceId: aid,
    })
  }
  if (row && Number(row.ticketsHorsSla || 0) > 0) {
    alerts.push({
      id: 'alert-sla-agence',
      severity: 'high',
      title: `${row.ticketsHorsSla} ticket(s) hors SLA`,
      detail: 'Prioriser le traitement des dossiers agence.',
      ctaSection: 'tickets',
      ctaLabel: 'Tickets',
      agenceId: aid,
    })
  }

  const kpis = row
    ? [
        { label: 'Agence', value: row.agence, sub: 'Vue restreinte' },
        { label: 'Biens', value: String(row.biens), sub: `${row.loues} loues` },
        { label: 'Occupation', value: row.tauxOccupation, sub: 'Taux local' },
        { label: 'Retards', value: String(row.paiementsRetard), sub: 'Paiements en retard' },
        { label: 'Locataires', value: String(row.locataires), sub: 'Effectifs' },
        { label: 'Gestionnaires', value: String(row.gestionnaires), sub: 'Equipe operationnelle' },
      ]
    : data.kpis

  const actionsToday = alerts.slice(0, 5).map((item, index) => ({
    id: `action-ag-${index + 1}`,
    priority: item.severity === 'high' ? 'Haute' : item.severity === 'medium' ? 'Moyenne' : 'Normale',
    title: item.title,
    detail: item.detail,
    section: item.ctaSection,
  }))

  return {
    ...data,
    kpis,
    byAgence: byAgenceFiltered,
    signals,
    expiringLeases: (data.expiringLeases || []).filter(matchesAgence),
    alerts,
    actionsToday,
    recoveryPlan: row && Number(row.paiementsRetard) > 0
      ? [{ bucket: 'Retards agence', count: Number(row.paiementsRetard), action: 'Relances ciblees' }]
      : [],
    agencyComparison: {
      top: byAgenceFiltered.slice(0, 3),
      bottom: [...byAgenceFiltered].reverse().slice(0, 3),
    },
    forecast: data.forecast,
    complianceByAgence: (data.complianceByAgence || []).filter((r) => String(r.agenceId) === aid),
    auditEvents: (data.auditEvents || []).filter(matchesAgence),
    feed: row
      ? [
          { t: 'Agence', msg: `${row.agence}: ${row.biens} biens, occupation ${row.tauxOccupation}.` },
          { t: 'Tickets', msg: `${row.ticketsOuverts} ouvert(s), ${row.ticketsHorsSla} hors SLA.` },
        ]
      : [],
    ticketSla: row
      ? { ouverts: row.ticketsOuverts, horsSla: row.ticketsHorsSla }
      : { ouverts: 0, horsSla: 0 },
  }
}

export function scopeAdminSearchMatches(matches, agenceId) {
  if (!agenceId || !Array.isArray(matches)) return matches
  const aid = String(agenceId)
  const biens = listBiens()
  const proprietaires = listProprietaires()
  const locataires = listLocataires()
  const contrats = listContrats()
  const access = listAccessUsers()
  const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))

  return matches.filter((m) => {
    if (m.type === 'agence') return m.id === aid
    if (m.type === 'proprietaire') {
      const p = proprietaires.find((x) => x.id === m.id)
      return p && String(p.agenceId || '') === aid
    }
    if (m.type === 'locataire') {
      const p = locataires.find((x) => x.id === m.id)
      return p && String(p.agenceId || '') === aid
    }
    if (m.type === 'bien') {
      const p = biens.find((x) => x.id === m.id)
      return p && String(p.agenceId || '') === aid
    }
    if (m.type === 'contrat') {
      const c = contrats.find((x) => x.id === m.id)
      const b = c ? bienById[c.bienId] : null
      return Boolean(b && String(b.agenceId || '') === aid)
    }
    if (m.type === 'acces') {
      const a = access.find((x) => x.id === m.id)
      if (!a) return false
      return String(a.agenceId || '') === aid || String(a.linkedId || '') === aid
    }
    return false
  })
}
