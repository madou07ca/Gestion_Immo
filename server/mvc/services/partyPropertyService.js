import { createId, ensureString, isEmail, isPositiveNumber, slugify } from '../utils/common.js'
import {
  listProprietaires,
  findProprietaireById,
  createProprietaire,
  updateProprietaire,
  deleteProprietaire,
} from '../repositories/proprietaireRepository.js'
import {
  listLocataires,
  findLocataireById,
  createLocataire,
  updateLocataire,
  deleteLocataire,
} from '../repositories/locataireRepository.js'
import {
  listBiens,
  findBienById,
  createBien,
  updateBien,
  deleteBien,
} from '../repositories/bienRepository.js'
import { findAgenceById } from '../repositories/agenceRepository.js'
import { normalizeFileAttachment, normalizeImageList } from './agenceService.js'
import { recordAuditEvent } from './auditService.js'

function parseArrayInput(value) {
  if (Array.isArray(value)) return value.map((item) => ensureString(item)).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => ensureString(item))
      .filter(Boolean)
  }
  return []
}

export function getProprietaires() {
  return listProprietaires()
}

export function createProprietaireService(input) {
  const nom = ensureString(input.nom)
  const email = ensureString(input.email)
  const agenceId = ensureString(input.agenceId)
  if (!nom) return { error: { status: 400, message: 'Le nom du proprietaire est obligatoire.' } }
  if (email && !isEmail(email)) return { error: { status: 400, message: "L'email du proprietaire est invalide." } }
  if (!agenceId) return { error: { status: 400, message: 'agenceId est obligatoire pour creer un proprietaire.' } }
  if (!findAgenceById(agenceId)) return { error: { status: 400, message: 'agenceId introuvable.' } }

  const row = createProprietaire({
    id: createId('owner'),
    agenceId: agenceId || null,
    nom,
    email,
    telephone: ensureString(input.telephone),
    prenom: ensureString(input.prenom),
    type: ensureString(input.type) || 'personne',
    dateNaissance: ensureString(input.dateNaissance),
    pieceIdentiteType: ensureString(input.pieceIdentiteType),
    pieceIdentiteNumero: ensureString(input.pieceIdentiteNumero),
    pieceIdentiteExpiration: ensureString(input.pieceIdentiteExpiration),
    pieceIdentiteFile: normalizeFileAttachment(input.pieceIdentiteFile),
    statut: 'Actif',
    adresse: ensureString(input.adresse),
    adressePostale: ensureString(input.adressePostale),
    modeVersement: ensureString(input.modeVersement),
    iban: ensureString(input.iban),
    numeroFiscal: ensureString(input.numeroFiscal),
    notes: ensureString(input.notes),
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function updateProprietaireService(id, input) {
  const current = findProprietaireById(id)
  if (!current) return { error: { status: 404, message: 'Proprietaire introuvable.' } }
  const nextNom = input.nom !== undefined ? ensureString(input.nom) : current.nom
  const nextEmail = input.email !== undefined ? ensureString(input.email) : current.email
  if (!nextNom) return { error: { status: 400, message: 'Le nom du proprietaire est obligatoire.' } }
  if (nextEmail && !isEmail(nextEmail)) return { error: { status: 400, message: "L'email du proprietaire est invalide." } }

  const row = updateProprietaire(id, (item) => ({
    ...item,
    nom: nextNom,
    email: nextEmail,
    telephone: input.telephone !== undefined ? ensureString(input.telephone) : item.telephone,
    prenom: input.prenom !== undefined ? ensureString(input.prenom) : item.prenom,
    type: input.type !== undefined ? ensureString(input.type) || 'personne' : item.type,
    dateNaissance: input.dateNaissance !== undefined ? ensureString(input.dateNaissance) : item.dateNaissance,
    pieceIdentiteType: input.pieceIdentiteType !== undefined ? ensureString(input.pieceIdentiteType) : item.pieceIdentiteType,
    pieceIdentiteNumero: input.pieceIdentiteNumero !== undefined ? ensureString(input.pieceIdentiteNumero) : item.pieceIdentiteNumero,
    pieceIdentiteExpiration: input.pieceIdentiteExpiration !== undefined ? ensureString(input.pieceIdentiteExpiration) : item.pieceIdentiteExpiration,
    pieceIdentiteFile: input.pieceIdentiteFile !== undefined ? normalizeFileAttachment(input.pieceIdentiteFile) : item.pieceIdentiteFile,
    statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
    adresse: input.adresse !== undefined ? ensureString(input.adresse) : item.adresse,
    adressePostale: input.adressePostale !== undefined ? ensureString(input.adressePostale) : item.adressePostale,
    modeVersement: input.modeVersement !== undefined ? ensureString(input.modeVersement) : item.modeVersement,
    iban: input.iban !== undefined ? ensureString(input.iban) : item.iban,
    numeroFiscal: input.numeroFiscal !== undefined ? ensureString(input.numeroFiscal) : item.numeroFiscal,
    notes: input.notes !== undefined ? ensureString(input.notes) : item.notes,
    updatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function deleteProprietaireService(id) {
  if (!findProprietaireById(id)) return { error: { status: 404, message: 'Proprietaire introuvable.' } }
  if (listBiens().some((item) => item.proprietaireId === id)) {
    return { error: { status: 400, message: 'Suppression impossible: ce proprietaire est associe a un ou plusieurs biens.' } }
  }
  deleteProprietaire(id)
  recordAuditEvent({
    actor: 'api',
    action: 'delete.proprietaire',
    entityType: 'proprietaire',
    entityId: id,
    detail: `Suppression proprietaire ${id}`,
    severity: 'warning',
  })
  return { data: { ok: true } }
}

export function getLocataires() {
  return listLocataires()
}

export function createLocataireService(input) {
  const nom = ensureString(input.nom)
  const email = ensureString(input.email)
  const agenceId = ensureString(input.agenceId)
  if (!nom) return { error: { status: 400, message: 'Le nom du locataire est obligatoire.' } }
  if (email && !isEmail(email)) return { error: { status: 400, message: "L'email du locataire est invalide." } }
  if (!agenceId) return { error: { status: 400, message: 'agenceId est obligatoire pour creer un locataire.' } }
  if (!findAgenceById(agenceId)) return { error: { status: 400, message: 'agenceId introuvable.' } }

  const row = createLocataire({
    id: createId('tenant'),
    agenceId: agenceId || null,
    nom,
    email,
    telephone: ensureString(input.telephone),
    prenom: ensureString(input.prenom),
    dateNaissance: ensureString(input.dateNaissance),
    pieceIdentiteType: ensureString(input.pieceIdentiteType),
    pieceIdentiteNumero: ensureString(input.pieceIdentiteNumero),
    pieceIdentiteExpiration: ensureString(input.pieceIdentiteExpiration),
    pieceIdentiteFile: normalizeFileAttachment(input.pieceIdentiteFile),
    statut: 'Actif',
    profession: ensureString(input.profession),
    situationPro: ensureString(input.situationPro),
    adresseActuelle: ensureString(input.adresseActuelle || input.adresse),
    revenuMensuel: isPositiveNumber(input.revenuMensuel) ? Number(input.revenuMensuel) : null,
    contactUrgenceNom: ensureString(input.contactUrgenceNom),
    contactUrgenceTelephone: ensureString(input.contactUrgenceTelephone),
    preferencesCommunication: parseArrayInput(input.preferencesCommunication),
    notes: ensureString(input.notes),
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function updateLocataireService(id, input) {
  const current = findLocataireById(id)
  if (!current) return { error: { status: 404, message: 'Locataire introuvable.' } }
  const nextNom = input.nom !== undefined ? ensureString(input.nom) : current.nom
  const nextEmail = input.email !== undefined ? ensureString(input.email) : current.email
  if (!nextNom) return { error: { status: 400, message: 'Le nom du locataire est obligatoire.' } }
  if (nextEmail && !isEmail(nextEmail)) return { error: { status: 400, message: "L'email du locataire est invalide." } }

  const row = updateLocataire(id, (item) => ({
    ...item,
    nom: nextNom,
    email: nextEmail,
    telephone: input.telephone !== undefined ? ensureString(input.telephone) : item.telephone,
    prenom: input.prenom !== undefined ? ensureString(input.prenom) : item.prenom,
    dateNaissance: input.dateNaissance !== undefined ? ensureString(input.dateNaissance) : item.dateNaissance,
    pieceIdentiteType: input.pieceIdentiteType !== undefined ? ensureString(input.pieceIdentiteType) : item.pieceIdentiteType,
    pieceIdentiteNumero: input.pieceIdentiteNumero !== undefined ? ensureString(input.pieceIdentiteNumero) : item.pieceIdentiteNumero,
    pieceIdentiteExpiration: input.pieceIdentiteExpiration !== undefined ? ensureString(input.pieceIdentiteExpiration) : item.pieceIdentiteExpiration,
    pieceIdentiteFile: input.pieceIdentiteFile !== undefined ? normalizeFileAttachment(input.pieceIdentiteFile) : item.pieceIdentiteFile,
    statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
    profession: input.profession !== undefined ? ensureString(input.profession) : item.profession,
    situationPro: input.situationPro !== undefined ? ensureString(input.situationPro) : item.situationPro,
    adresseActuelle: input.adresseActuelle !== undefined ? ensureString(input.adresseActuelle) : item.adresseActuelle,
    revenuMensuel: input.revenuMensuel !== undefined
      ? (isPositiveNumber(input.revenuMensuel) ? Number(input.revenuMensuel) : null)
      : item.revenuMensuel,
    contactUrgenceNom: input.contactUrgenceNom !== undefined ? ensureString(input.contactUrgenceNom) : item.contactUrgenceNom,
    contactUrgenceTelephone: input.contactUrgenceTelephone !== undefined ? ensureString(input.contactUrgenceTelephone) : item.contactUrgenceTelephone,
    preferencesCommunication: input.preferencesCommunication !== undefined
      ? parseArrayInput(input.preferencesCommunication)
      : (Array.isArray(item.preferencesCommunication) ? item.preferencesCommunication : []),
    notes: input.notes !== undefined ? ensureString(input.notes) : item.notes,
    updatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function deleteLocataireService(id) {
  if (!findLocataireById(id)) return { error: { status: 404, message: 'Locataire introuvable.' } }
  if (listBiens().some((item) => item.locataireId === id)) {
    return { error: { status: 400, message: 'Suppression impossible: ce locataire est associe a un ou plusieurs biens.' } }
  }
  deleteLocataire(id)
  recordAuditEvent({
    actor: 'api',
    action: 'delete.locataire',
    entityType: 'locataire',
    entityId: id,
    detail: `Suppression locataire ${id}`,
    severity: 'warning',
  })
  return { data: { ok: true } }
}

export function getBiens() {
  return listBiens()
}

export function createBienService(input) {
  const titre = ensureString(input.titre)
  const type = ensureString(input.type)
  const adresse = ensureString(input.adresse)
  const proprietaireId = ensureString(input.proprietaireId)
  if (!titre || !type || !adresse || !proprietaireId) {
    return { error: { status: 400, message: 'titre, type, adresse et proprietaireId sont obligatoires pour un bien.' } }
  }
  if (!isPositiveNumber(input.loyerMensuel)) {
    return { error: { status: 400, message: 'Le loyerMensuel doit etre un nombre positif.' } }
  }
  if (!findProprietaireById(proprietaireId)) return { error: { status: 400, message: 'proprietaireId introuvable.' } }
  const locataireId = ensureString(input.locataireId)
  if (locataireId && !findLocataireById(locataireId)) return { error: { status: 400, message: 'locataireId introuvable.' } }

  const row = createBien({
    id: createId('property'),
    titre,
    type,
    slug: slugify(`${titre}-${Date.now()}`),
    adresse,
    ville: ensureString(input.ville),
    quartier: ensureString(input.quartier),
    codePostal: ensureString(input.codePostal),
    surface: isPositiveNumber(input.surface) ? Number(input.surface) : null,
    nbPieces: isPositiveNumber(input.nbPieces) ? Number(input.nbPieces) : null,
    nbChambres: isPositiveNumber(input.nbChambres) ? Number(input.nbChambres) : null,
    nbSdb: isPositiveNumber(input.nbSdb) ? Number(input.nbSdb) : null,
    usage: ensureString(input.usage) || 'habitation',
    loyerMensuel: Number(input.loyerMensuel),
    chargesMensuelles: isPositiveNumber(input.chargesMensuelles) ? Number(input.chargesMensuelles) : 0,
    depotGarantie: isPositiveNumber(input.depotGarantie) ? Number(input.depotGarantie) : 0,
    fraisGestionMensuels: isPositiveNumber(input.fraisGestionMensuels) ? Number(input.fraisGestionMensuels) : 0,
    taxeFonciereAnnuelle: isPositiveNumber(input.taxeFonciereAnnuelle) ? Number(input.taxeFonciereAnnuelle) : 0,
    assuranceAnnuelle: isPositiveNumber(input.assuranceAnnuelle) ? Number(input.assuranceAnnuelle) : 0,
    dateDisponibilite: ensureString(input.dateDisponibilite),
    anneeConstruction: isPositiveNumber(input.anneeConstruction) ? Number(input.anneeConstruction) : null,
    equipements: parseArrayInput(input.equipements),
    statut: ensureString(input.statut) || 'disponible',
    operation: 'location',
    published: Boolean(input.published),
    images: normalizeImageList(input.images),
    proprietaireId,
    locataireId: locataireId || null,
    description: ensureString(input.description),
    createdAt: new Date().toISOString(),
  })
  return { data: row }
}

export function updateBienService(id, input) {
  const current = findBienById(id)
  if (!current) return { error: { status: 404, message: 'Bien introuvable.' } }
  const nextTitre = input.titre !== undefined ? ensureString(input.titre) : current.titre
  const nextType = input.type !== undefined ? ensureString(input.type) : current.type
  const nextAdresse = input.adresse !== undefined ? ensureString(input.adresse) : current.adresse
  const nextOwnerId = input.proprietaireId !== undefined ? ensureString(input.proprietaireId) : current.proprietaireId
  if (!nextTitre || !nextType || !nextAdresse || !nextOwnerId) {
    return { error: { status: 400, message: 'titre, type, adresse et proprietaireId sont obligatoires pour un bien.' } }
  }
  if (input.loyerMensuel !== undefined && !isPositiveNumber(input.loyerMensuel)) {
    return { error: { status: 400, message: 'Le loyerMensuel doit etre un nombre positif.' } }
  }
  if (!findProprietaireById(nextOwnerId)) return { error: { status: 400, message: 'proprietaireId introuvable.' } }
  const nextLocataireId = input.locataireId !== undefined ? ensureString(input.locataireId) : ensureString(current.locataireId)
  if (nextLocataireId && !findLocataireById(nextLocataireId)) return { error: { status: 400, message: 'locataireId introuvable.' } }

  const row = updateBien(id, (item) => ({
    ...item,
    titre: nextTitre,
    type: nextType,
    slug: input.slug !== undefined ? ensureString(input.slug) : item.slug || slugify(`${nextTitre}-${item.id}`),
    adresse: nextAdresse,
    ville: input.ville !== undefined ? ensureString(input.ville) : item.ville,
    quartier: input.quartier !== undefined ? ensureString(input.quartier) : item.quartier,
    codePostal: input.codePostal !== undefined ? ensureString(input.codePostal) : item.codePostal,
    surface: input.surface !== undefined ? (isPositiveNumber(input.surface) ? Number(input.surface) : null) : item.surface,
    nbPieces: input.nbPieces !== undefined ? (isPositiveNumber(input.nbPieces) ? Number(input.nbPieces) : null) : item.nbPieces,
    nbChambres: input.nbChambres !== undefined ? (isPositiveNumber(input.nbChambres) ? Number(input.nbChambres) : null) : item.nbChambres,
    nbSdb: input.nbSdb !== undefined ? (isPositiveNumber(input.nbSdb) ? Number(input.nbSdb) : null) : item.nbSdb,
    usage: input.usage !== undefined ? ensureString(input.usage) || 'habitation' : (item.usage || 'habitation'),
    loyerMensuel: input.loyerMensuel !== undefined ? Number(input.loyerMensuel) : Number(item.loyerMensuel),
    chargesMensuelles: input.chargesMensuelles !== undefined
      ? (isPositiveNumber(input.chargesMensuelles) ? Number(input.chargesMensuelles) : 0)
      : Number(item.chargesMensuelles ?? 0),
    depotGarantie: input.depotGarantie !== undefined
      ? (isPositiveNumber(input.depotGarantie) ? Number(input.depotGarantie) : 0)
      : Number(item.depotGarantie ?? 0),
    fraisGestionMensuels: input.fraisGestionMensuels !== undefined
      ? (isPositiveNumber(input.fraisGestionMensuels) ? Number(input.fraisGestionMensuels) : 0)
      : Number(item.fraisGestionMensuels ?? 0),
    taxeFonciereAnnuelle: input.taxeFonciereAnnuelle !== undefined
      ? (isPositiveNumber(input.taxeFonciereAnnuelle) ? Number(input.taxeFonciereAnnuelle) : 0)
      : Number(item.taxeFonciereAnnuelle ?? 0),
    assuranceAnnuelle: input.assuranceAnnuelle !== undefined
      ? (isPositiveNumber(input.assuranceAnnuelle) ? Number(input.assuranceAnnuelle) : 0)
      : Number(item.assuranceAnnuelle ?? 0),
    statut: input.statut !== undefined ? ensureString(input.statut) || 'disponible' : item.statut || 'disponible',
    published: input.published !== undefined ? Boolean(input.published) : Boolean(item.published),
    operation: input.operation !== undefined ? ensureString(input.operation) || 'location' : item.operation || 'location',
    images: input.images !== undefined ? normalizeImageList(input.images) : (Array.isArray(item.images) ? item.images : []),
    dateDisponibilite: input.dateDisponibilite !== undefined ? ensureString(input.dateDisponibilite) : item.dateDisponibilite,
    anneeConstruction: input.anneeConstruction !== undefined
      ? (isPositiveNumber(input.anneeConstruction) ? Number(input.anneeConstruction) : null)
      : item.anneeConstruction,
    equipements: input.equipements !== undefined
      ? parseArrayInput(input.equipements)
      : (Array.isArray(item.equipements) ? item.equipements : []),
    proprietaireId: nextOwnerId,
    locataireId: nextLocataireId || null,
    description: input.description !== undefined ? ensureString(input.description) : item.description,
    updatedAt: new Date().toISOString(),
  }))
  return { data: row }
}

export function deleteBienService(id) {
  if (!findBienById(id)) return { error: { status: 404, message: 'Bien introuvable.' } }
  deleteBien(id)
  recordAuditEvent({
    actor: 'api',
    action: 'delete.bien',
    entityType: 'bien',
    entityId: id,
    detail: `Suppression bien ${id}`,
    severity: 'warning',
  })
  return { data: { ok: true } }
}

