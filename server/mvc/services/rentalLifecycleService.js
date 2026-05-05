import { createId, ensureString, isPositiveNumber } from '../utils/common.js'
import { listContrats, findContratById, updateContrat } from '../repositories/contratRepository.js'
import { listBiens, findBienById } from '../repositories/bienRepository.js'
import { listPaiements, writePaiements } from '../repositories/paiementRepository.js'
import { listLocataires, findLocataireById } from '../repositories/locataireRepository.js'
import { listProprietaires, findProprietaireById } from '../repositories/proprietaireRepository.js'
import { listQuittances } from '../repositories/quittanceRepository.js'
import { listDemandesLocataires } from '../repositories/demandeLocataireRepository.js'
import {
  createReversement,
  findReversementById,
  listReversements,
  updateReversement,
} from '../repositories/reversementRepository.js'
import {
  createEtatLieu,
  deleteEtatLieu,
  findEtatLieuById,
  listEtatsLieux,
  updateEtatLieu,
} from '../repositories/etatLieuRepository.js'
import { createCaution, findCautionById, listCautions, updateCaution } from '../repositories/cautionRepository.js'
import {
  appendNotification,
  listNotificationQueue,
  writeNotificationQueue,
} from '../repositories/notificationQueueRepository.js'
import { createSignatureRequest } from '../repositories/signatureRequestRepository.js'
import { appendRelance, listRelances } from '../repositories/relanceRepository.js'
import { recordAuditEvent } from './auditService.js'

function periodLabelFromYearMonth(ym) {
  const parts = String(ym || '').split('-')
  const y = Number(parts[0])
  const m = Number(parts[1])
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return ''
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function contratActif(c) {
  const s = String(c.statut || '')
  return s === 'En cours' || s === 'Signe'
}

export function generateEcheancesForMonth(input) {
  const ym = ensureString(input.yearMonth)
  if (!/^\d{4}-\d{2}$/.test(ym)) {
    return { error: { status: 400, message: 'yearMonth attendu au format YYYY-MM.' } }
  }
  const periode = periodLabelFromYearMonth(ym)
  if (!periode) return { error: { status: 400, message: 'Periode invalide.' } }

  const contrats = listContrats().filter(contratActif)
  const paiements = listPaiements()
  const newRows = []
  const [y, mo] = ym.split('-').map(Number)
  const midMonth = new Date(y, mo - 1, 15)

  for (const c of contrats) {
    const bien = findBienById(c.bienId)
    if (!bien) continue
    const start = new Date(c.dateDebut)
    const end = new Date(c.dateFin)
    if (midMonth < start || midMonth > end) continue

    const jour = isPositiveNumber(c.jourEcheance) ? Number(c.jourEcheance) : 5
    const lastDay = new Date(y, mo, 0).getDate()
    const day = Math.min(jour, lastDay)
    const echeance = `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const tuples = [
      ['Loyer', Number(c.loyerMensuel || 0), 'Loyer'],
      ['Charges', Number(c.chargesMensuelles || 0), 'Charges'],
    ]
    for (const [type, montant, prefix] of tuples) {
      if (montant <= 0) continue
      const dup =
        paiements.some(
          (p) =>
            p.locataireId === c.locataireId &&
            p.bienId === c.bienId &&
            p.periode === periode &&
            p.type === type,
        ) ||
        newRows.some(
          (p) =>
            p.locataireId === c.locataireId &&
            p.bienId === c.bienId &&
            p.periode === periode &&
            p.type === type,
        )
      if (dup) continue
      newRows.push({
        id: createId('pay'),
        contratId: c.id,
        locataireId: c.locataireId,
        bienId: c.bienId,
        libelle: `${prefix} ${periode}`,
        type,
        periode,
        echeance,
        montant,
        statut: 'A payer',
        createdAt: new Date().toISOString(),
      })
    }
  }

  if (newRows.length > 0) writePaiements([...paiements, ...newRows])
  recordAuditEvent({
    actor: ensureString(input.actor) || 'gestionnaire',
    action: 'echeances.generate',
    entityType: 'periode',
    entityId: ym,
    detail: `${newRows.length} ligne(s) creees pour ${periode}`,
    severity: 'info',
  })
  return { data: { created: newRows.length, items: newRows } }
}

export function markPaiementsOverdue() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const paiements = listPaiements()
  let n = 0
  const updated = paiements.map((p) => {
    if (p.statut !== 'A payer') return p
    const raw = p.echeance
    let d = null
    if (raw && /^\d{4}-\d{2}-\d{2}/.test(String(raw))) {
      d = new Date(String(raw).slice(0, 10))
    } else if (raw) {
      const ts = Date.parse(raw)
      if (Number.isFinite(ts)) d = new Date(ts)
    }
    if (!d) return p
    d.setHours(0, 0, 0, 0)
    if (d < today) {
      n += 1
      return { ...p, statut: 'En retard' }
    }
    return p
  })
  writePaiements(updated)
  return { data: { marked: n } }
}

export function listComplianceAlerts() {
  const now = new Date()
  const in90 = new Date(now.getTime() + 90 * 86400000)
  const alerts = []

  for (const c of listContrats()) {
    const end = new Date(c.dateFin)
    if (Number.isFinite(end.getTime()) && end <= in90 && end >= now) {
      alerts.push({
        type: 'bail_echeance',
        severity: 'medium',
        contratId: c.id,
        bienId: c.bienId,
        locataireId: c.locataireId,
        message: `Bail se termine le ${c.dateFin}`,
        dateRef: c.dateFin,
      })
    }
  }

  for (const loc of listLocataires()) {
    const exp = ensureString(loc.pieceIdentiteExpiration)
    if (exp) {
      const d = new Date(exp)
      if (Number.isFinite(d.getTime()) && d <= in90 && d >= now) {
        alerts.push({
          type: 'piece_identite',
          severity: 'high',
          locataireId: loc.id,
          message: `Piece identite locataire ${loc.nom} expire le ${exp}`,
          dateRef: exp,
        })
      }
    }
  }

  for (const prop of listProprietaires()) {
    const exp = ensureString(prop.pieceIdentiteExpiration)
    if (exp) {
      const d = new Date(exp)
      if (Number.isFinite(d.getTime()) && d <= in90 && d >= now) {
        alerts.push({
          type: 'piece_identite_proprio',
          severity: 'medium',
          proprietaireId: prop.id,
          message: `Piece identite proprietaire ${prop.nom} expire le ${exp}`,
          dateRef: exp,
        })
      }
    }
  }

  for (const b of listBiens()) {
    const a = ensureString(b.assuranceExpiresAt)
    if (a) {
      const d = new Date(a)
      if (Number.isFinite(d.getTime()) && d <= in90 && d >= now) {
        alerts.push({
          type: 'assurance_bien',
          severity: 'medium',
          bienId: b.id,
          message: `Assurance / garantie bien ${b.titre || b.id}: echeance ${a}`,
          dateRef: a,
        })
      }
    }
  }

  alerts.sort((x, y) => String(x.dateRef).localeCompare(String(y.dateRef)))
  return { data: { alerts } }
}

export function computeReversement(input) {
  const proprietaireId = ensureString(input.proprietaireId)
  const periode = ensureString(input.periode)
  const taux = input.tauxCommission != null ? Number(input.tauxCommission) : 0.08
  if (!proprietaireId || !periode) {
    return { error: { status: 400, message: 'proprietaireId et periode sont obligatoires.' } }
  }
  if (!findProprietaireById(proprietaireId)) return { error: { status: 404, message: 'Proprietaire introuvable.' } }

  const biens = listBiens().filter((b) => b.proprietaireId === proprietaireId)
  const bienIds = new Set(biens.map((b) => b.id))
  const paiements = listPaiements().filter(
    (p) => bienIds.has(p.bienId) && p.statut === 'Confirme' && String(p.periode) === periode,
  )

  let brutLoyer = 0
  let brutCharges = 0
  const ids = []
  for (const p of paiements) {
    ids.push(p.id)
    if (p.type === 'Charges') brutCharges += Number(p.montant || 0)
    else brutLoyer += Number(p.montant || 0)
  }

  const commission = brutLoyer * taux
  const montantNet = brutLoyer - commission + brutCharges

  const row = createReversement({
    id: createId('rev'),
    proprietaireId,
    agenceId: biens[0]?.agenceId || null,
    periode,
    montantBrut: brutLoyer + brutCharges,
    montantLoyer: brutLoyer,
    montantCharges: brutCharges,
    commissionAgence: commission,
    montantNet,
    tauxCommission: taux,
    paiementIds: ids,
    statut: 'Propose',
    createdAt: new Date().toISOString(),
  })

  recordAuditEvent({
    actor: ensureString(input.actor) || 'gestionnaire',
    action: 'reversement.create',
    entityType: 'reversement',
    entityId: row.id,
    detail: `Net proprietaire ${montantNet.toFixed(0)} GNF (${periode})`,
    severity: 'info',
  })

  return { data: row }
}

export function listReversementsService() {
  return { data: listReversements() }
}

export function validateReversement(id) {
  const current = findReversementById(id)
  if (!current) return { error: { status: 404, message: 'Reversement introuvable.' } }
  const row = updateReversement(id, (item) => ({
    ...item,
    statut: 'Valide',
    validatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function createEtatLieuService(input) {
  const contratId = ensureString(input.contratId)
  const type = ensureString(input.type) || 'entree'
  if (!contratId) return { error: { status: 400, message: 'contratId obligatoire.' } }
  const c = findContratById(contratId)
  if (!c) return { error: { status: 404, message: 'Contrat introuvable.' } }

  const row = createEtatLieu({
    id: createId('edl'),
    contratId,
    bienId: c.bienId,
    locataireId: c.locataireId,
    type,
    checklist: Array.isArray(input.checklist) ? input.checklist : [],
    photos: Array.isArray(input.photos) ? input.photos : [],
    observations: ensureString(input.observations),
    statut: ensureString(input.statut) || 'brouillon',
    pdfUrl: ensureString(input.pdfUrl) || null,
    createdAt: new Date().toISOString(),
  })
  recordAuditEvent({
    actor: ensureString(input.actor) || 'gestionnaire',
    action: 'etat_lieu.create',
    entityType: 'etat_lieu',
    entityId: row.id,
    detail: `${type} — bail ${contratId}`,
    severity: 'info',
  })
  return { data: row }
}

export function listEtatsLieuxService() {
  return { data: listEtatsLieux() }
}

export function updateEtatLieuService(id, input) {
  if (!findEtatLieuById(id)) return { error: { status: 404, message: 'Etat des lieux introuvable.' } }
  const row = updateEtatLieu(id, (item) => ({
    ...item,
    checklist: input.checklist !== undefined ? input.checklist : item.checklist,
    photos: input.photos !== undefined ? input.photos : item.photos,
    observations: input.observations !== undefined ? ensureString(input.observations) : item.observations,
    statut: input.statut !== undefined ? ensureString(input.statut) : item.statut,
    pdfUrl: input.pdfUrl !== undefined ? ensureString(input.pdfUrl) : item.pdfUrl,
    updatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function deleteEtatLieuService(id) {
  if (!findEtatLieuById(id)) return { error: { status: 404, message: 'Etat des lieux introuvable.' } }
  deleteEtatLieu(id)
  return { data: { ok: true } }
}

export function createCautionService(input) {
  const contratId = ensureString(input.contratId)
  if (!contratId) return { error: { status: 400, message: 'contratId obligatoire.' } }
  const c = findContratById(contratId)
  if (!c) return { error: { status: 404, message: 'Contrat introuvable.' } }
  const montant = Number(input.montantEncaisse ?? c.depotGarantie ?? 0)
  const row = createCaution({
    id: createId('caution'),
    contratId,
    bienId: c.bienId,
    locataireId: c.locataireId,
    montantEncaisse: montant,
    statut: ensureString(input.statut) || 'detenu',
    lignesRetenue: Array.isArray(input.lignesRetenue) ? input.lignesRetenue : [],
    dateRestitution: ensureString(input.dateRestitution) || null,
    notes: ensureString(input.notes),
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function listCautionsService() {
  return { data: listCautions() }
}

export function updateCautionService(id, input) {
  if (!findCautionById(id)) return { error: { status: 404, message: 'Caution introuvable.' } }
  const row = updateCaution(id, (item) => ({
    ...item,
    montantEncaisse: input.montantEncaisse !== undefined ? Number(input.montantEncaisse) : item.montantEncaisse,
    statut: input.statut !== undefined ? ensureString(input.statut) : item.statut,
    lignesRetenue: input.lignesRetenue !== undefined ? input.lignesRetenue : item.lignesRetenue,
    dateRestitution: input.dateRestitution !== undefined ? ensureString(input.dateRestitution) : item.dateRestitution,
    montantRestitue: input.montantRestitue !== undefined ? Number(input.montantRestitue) : item.montantRestitue,
    notes: input.notes !== undefined ? ensureString(input.notes) : item.notes,
    updatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function enqueueNotification(input) {
  const row = appendNotification({
    id: createId('notif'),
    channel: ensureString(input.channel) || 'email',
    to: ensureString(input.to),
    subject: ensureString(input.subject),
    body: ensureString(input.body),
    statut: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function processNotificationQueueStub() {
  const rows = listNotificationQueue()
  const now = new Date().toISOString()
  let processed = 0
  const next = rows.map((r) => {
    if (r.statut !== 'pending') return r
    processed += 1
    return {
      ...r,
      statut: 'sent',
      sentAt: now,
      lastError: null,
    }
  })
  writeNotificationQueue(next)
  return { data: { processed } }
}

export function exportRgpdTenant(locataireId) {
  const id = ensureString(locataireId)
  const tenant = findLocataireById(id)
  if (!tenant) return { error: { status: 404, message: 'Locataire introuvable.' } }
  const bundle = {
    exportedAt: new Date().toISOString(),
    locataire: tenant,
    paiements: listPaiements().filter((p) => p.locataireId === id),
    quittances: listQuittances().filter((q) => q.locataireId === id),
    demandes: listDemandesLocataires().filter((d) => d.locataireId === id),
    etatsLieux: listEtatsLieux().filter((e) => e.locataireId === id),
  }
  return { data: bundle }
}

export function exportRgpdOwner(proprietaireId) {
  const id = ensureString(proprietaireId)
  const owner = findProprietaireById(id)
  if (!owner) return { error: { status: 404, message: 'Proprietaire introuvable.' } }
  const biens = listBiens().filter((b) => b.proprietaireId === id)
  const bienIds = new Set(biens.map((b) => b.id))
  const bundle = {
    exportedAt: new Date().toISOString(),
    proprietaire: owner,
    biens,
    paiements: listPaiements().filter((p) => bienIds.has(p.bienId)),
    reversements: listReversements().filter((r) => r.proprietaireId === id),
  }
  return { data: bundle }
}

export function applyRentRevisionService(contratId, input) {
  const id = ensureString(contratId)
  const current = findContratById(id)
  if (!current) return { error: { status: 404, message: 'Contrat introuvable.' } }
  const pct = Number(input.pourcentAugmentation ?? input.percent ?? 0)
  if (!Number.isFinite(pct) || pct <= 0) {
    return { error: { status: 400, message: 'pourcentAugmentation doit etre > 0.' } }
  }
  const factor = 1 + pct / 100
  const nextLoyer = Math.round(Number(current.loyerMensuel || 0) * factor)
  const nextCharges = Math.round(Number(current.chargesMensuelles || 0) * factor)
  const history = Array.isArray(current.revisionHistorique) ? current.revisionHistorique : []
  history.push({
    at: new Date().toISOString(),
    pourcent: pct,
    ancienLoyer: current.loyerMensuel,
    nouveauLoyer: nextLoyer,
  })
  const row = updateContrat(id, (item) => ({
    ...item,
    loyerMensuel: nextLoyer,
    chargesMensuelles: nextCharges,
    revisionHistorique: history,
    updatedAt: new Date().toISOString(),
  }))
  recordAuditEvent({
    actor: ensureString(input.actor) || 'gestionnaire',
    action: 'contrat.revision_loyer',
    entityType: 'contrat',
    entityId: id,
    detail: `+${pct}% => loyer ${nextLoyer} GNF`,
    severity: 'info',
  })
  return { data: row }
}

export function requestSignatureService(contratId, input) {
  const id = ensureString(contratId)
  if (!findContratById(id)) return { error: { status: 404, message: 'Contrat introuvable.' } }
  const row = createSignatureRequest({
    id: createId('sig'),
    contratId: id,
    statut: 'pending',
    provider: ensureString(input.provider) || 'stub',
    signUrl: ensureString(input.signUrl) || `/api/contrats/${id}/signature`,
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function recordRelanceService(input) {
  const paiementId = ensureString(input.paiementId)
  const canal = ensureString(input.canal) || 'email'
  if (!paiementId) return { error: { status: 400, message: 'paiementId obligatoire.' } }
  const p = listPaiements().find((x) => x.id === paiementId)
  if (!p) return { error: { status: 404, message: 'Paiement introuvable.' } }

  const row = appendRelance({
    id: createId('rel'),
    paiementId,
    canal,
    message: ensureString(input.message) || 'Relance standard',
    createdAt: new Date().toISOString(),
  })
  enqueueNotification({
    channel: canal,
    to: ensureString(input.emailCible) || 'gestion@example.local',
    subject: `[Relance] ${p.libelle}`,
    body: row.message,
  })
  recordAuditEvent({
    actor: ensureString(input.actor) || 'gestionnaire',
    action: 'relance.paiement',
    entityType: 'paiement',
    entityId: paiementId,
    detail: `${canal} — ${p.libelle}`,
    severity: 'warning',
  })
  return { data: row }
}

export function listRelancesService() {
  return { data: listRelances().slice(0, 200) }
}
