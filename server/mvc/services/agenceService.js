import { createId, ensureString, generateTemporaryCode, isEmail, isPositiveNumber, slugify } from '../utils/common.js'
import { listAgences, findAgenceById, createAgence, updateAgence, deleteAgence } from '../repositories/agenceRepository.js'
import { listProprietaires, findProprietaireById, createProprietaire, updateProprietaire, deleteProprietaire } from '../repositories/proprietaireRepository.js'
import { listLocataires, findLocataireById, createLocataire, updateLocataire, deleteLocataire } from '../repositories/locataireRepository.js'
import { listBiens, findBienById, createBien, updateBien, deleteBien } from '../repositories/bienRepository.js'
import { listAccessUsers, findAccessUserById, createAccessUser, updateAccessUser, deleteAccessUser } from '../repositories/accessRepository.js'

export function normalizeFileAttachment(input) {
  if (!input || typeof input !== 'object') return null
  const name = ensureString(input.name)
  const type = ensureString(input.type)
  const dataUrl = ensureString(input.dataUrl)
  const size = Number(input.size || 0)
  if (!name || !dataUrl) return null
  return {
    name,
    type,
    size: Number.isFinite(size) ? size : 0,
    dataUrl,
  }
}

export function normalizeImageList(images) {
  if (!Array.isArray(images)) return []
  return images
    .map((item) => ensureString(item))
    .filter((item) => item.startsWith('http://') || item.startsWith('https://') || item.startsWith('data:image/'))
}

function normalizeAgence(agence) {
  return {
    id: agence.id,
    nom: ensureString(agence.nom),
    adresse: ensureString(agence.adresse),
    email: ensureString(agence.email),
    telephone: ensureString(agence.telephone),
    ville: ensureString(agence.ville),
    pays: ensureString(agence.pays),
    codeAgence: ensureString(agence.codeAgence),
    numeroFiscal: ensureString(agence.numeroFiscal),
    registreCommerce: ensureString(agence.registreCommerce),
    deviseParDefaut: ensureString(agence.deviseParDefaut) || 'GNF',
    zonesCouvertes: Array.isArray(agence.zonesCouvertes) ? agence.zonesCouvertes : [],
    logoUrl: ensureString(agence.logoUrl),
    statut: ensureString(agence.statut) || 'Actif',
    createdAt: agence.createdAt,
    updatedAt: agence.updatedAt,
  }
}

export function listAgencesAdminService() {
  return listAgences().map(normalizeAgence)
}

export function createAgenceAdminService(input) {
  const nom = ensureString(input.nom)
  const email = ensureString(input.email).toLowerCase()
  if (!nom) return { error: { status: 400, message: "Le nom de l'agence est obligatoire." } }
  if (email && !isEmail(email)) return { error: { status: 400, message: "L'email de l'agence est invalide." } }

  const row = createAgence({
    id: createId('agency'),
    nom,
    slug: slugify(nom) || createId('agency'),
    adresse: ensureString(input.adresse),
    ville: ensureString(input.ville),
    pays: ensureString(input.pays) || 'Guinee',
    codeAgence: ensureString(input.codeAgence),
    email,
    telephone: ensureString(input.telephone),
    numeroFiscal: ensureString(input.numeroFiscal),
    registreCommerce: ensureString(input.registreCommerce),
    deviseParDefaut: ensureString(input.deviseParDefaut) || 'GNF',
    zonesCouvertes: Array.isArray(input.zonesCouvertes) ? input.zonesCouvertes : [],
    logoUrl: ensureString(input.logoUrl),
    statut: 'Actif',
    createdAt: new Date().toISOString(),
  })
  const onboardingEmail = ensureString(input.compteEmail || email).toLowerCase()
  const onboardingName = ensureString(input.compteNom || `${nom} - Admin agence`)
  const temporaryCode = generateTemporaryCode()
  if (onboardingEmail && isEmail(onboardingEmail)
    && !listAccessUsers().some((item) => item.role === 'agence' && ensureString(item.email).toLowerCase() === onboardingEmail)) {
    createAccessUser({
      id: createId('access'),
      role: 'agence',
      agenceId: row.id,
      email: onboardingEmail,
      nom: onboardingName,
      code: temporaryCode,
      linkedId: row.id,
      internalRole: 'directeur_agence',
      statut: 'Actif',
      createdAt: new Date().toISOString(),
    })
  }
  return {
    data: normalizeAgence(row),
    onboarding: {
      email: onboardingEmail || '',
      temporaryCode: onboardingEmail ? temporaryCode : '',
      internalRole: 'directeur_agence',
    },
  }
}

export function updateAgenceAdminService(id, input) {
  const current = findAgenceById(id)
  if (!current) return { error: { status: 404, message: 'Agence introuvable.' } }
  const nextNom = input.nom !== undefined ? ensureString(input.nom) : current.nom
  const nextEmail = input.email !== undefined ? ensureString(input.email).toLowerCase() : ensureString(current.email).toLowerCase()
  if (!nextNom) return { error: { status: 400, message: "Le nom de l'agence est obligatoire." } }
  if (nextEmail && !isEmail(nextEmail)) return { error: { status: 400, message: "L'email de l'agence est invalide." } }

  const row = updateAgence(id, (item) => ({
    ...item,
    nom: nextNom,
    adresse: input.adresse !== undefined ? ensureString(input.adresse) : item.adresse,
    ville: input.ville !== undefined ? ensureString(input.ville) : item.ville,
    pays: input.pays !== undefined ? ensureString(input.pays) : item.pays,
    codeAgence: input.codeAgence !== undefined ? ensureString(input.codeAgence) : item.codeAgence,
    email: nextEmail,
    telephone: input.telephone !== undefined ? ensureString(input.telephone) : item.telephone,
    numeroFiscal: input.numeroFiscal !== undefined ? ensureString(input.numeroFiscal) : item.numeroFiscal,
    registreCommerce: input.registreCommerce !== undefined ? ensureString(input.registreCommerce) : item.registreCommerce,
    deviseParDefaut: input.deviseParDefaut !== undefined ? ensureString(input.deviseParDefaut) || 'GNF' : (item.deviseParDefaut || 'GNF'),
    zonesCouvertes: input.zonesCouvertes !== undefined
      ? (Array.isArray(input.zonesCouvertes) ? input.zonesCouvertes : [])
      : (Array.isArray(item.zonesCouvertes) ? item.zonesCouvertes : []),
    logoUrl: input.logoUrl !== undefined ? ensureString(input.logoUrl) : item.logoUrl,
    statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
    updatedAt: new Date().toISOString(),
  }))
  return { data: normalizeAgence(row) }
}

export function deleteAgenceAdminService(id) {
  if (!findAgenceById(id)) return { error: { status: 404, message: 'Agence introuvable.' } }
  if (listProprietaires().some((item) => item.agenceId === id)
    || listLocataires().some((item) => item.agenceId === id)
    || listBiens().some((item) => item.agenceId === id)
    || listAccessUsers().some((item) => item.agenceId === id)) {
    return { error: { status: 400, message: 'Suppression impossible: des acteurs sont encore rattaches a cette agence.' } }
  }
  deleteAgence(id)
  return { data: { ok: true } }
}

function resolveAgenceId(agenceId) {
  const explicit = ensureString(agenceId)
  if (!explicit) return { error: { status: 401, message: 'Session agence manquante.' } }
  if (!findAgenceById(explicit)) return { error: { status: 404, message: 'Agence introuvable.' } }
  return { data: explicit }
}

function sameAgenceGuard(entity, agenceId, label) {
  if (!entity) return { error: { status: 404, message: `${label} introuvable.` } }
  if (ensureString(entity.agenceId) !== agenceId) {
    return { error: { status: 403, message: `${label} hors perimetre agence.` } }
  }
  return null
}

export function getAgenceWorkspaceService(inputAgenceId) {
  const resolved = resolveAgenceId(inputAgenceId)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const agence = findAgenceById(agenceId)
  if (!agence) return { error: { status: 404, message: 'Agence introuvable.' } }

  return {
    data: {
      agence: normalizeAgence(agence),
      proprietaires: listProprietaires().filter((item) => item.agenceId === agenceId),
      locataires: listLocataires().filter((item) => item.agenceId === agenceId),
      biens: listBiens().filter((item) => item.agenceId === agenceId),
      gestionnaires: listAccessUsers().filter((item) => item.role === 'gestionnaire' && item.agenceId === agenceId),
    },
  }
}

export function createAgenceProprietaireService(agenceIdInput, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const nom = ensureString(input.nom)
  const email = ensureString(input.email)
  if (!nom) return { error: { status: 400, message: 'Nom proprietaire obligatoire.' } }
  if (email && !isEmail(email)) return { error: { status: 400, message: 'Email proprietaire invalide.' } }
  return {
    data: createProprietaire({
      id: createId('owner'),
      agenceId,
      nom,
      email,
      telephone: ensureString(input.telephone),
      prenom: ensureString(input.prenom),
      type: ensureString(input.type) || 'personne',
      pieceIdentiteType: ensureString(input.pieceIdentiteType),
      pieceIdentiteNumero: ensureString(input.pieceIdentiteNumero),
      pieceIdentiteFile: normalizeFileAttachment(input.pieceIdentiteFile),
      statut: 'Actif',
      adressePostale: ensureString(input.adressePostale),
      createdAt: new Date().toISOString(),
    }),
  }
}

export function updateAgenceProprietaireService(agenceIdInput, id, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findProprietaireById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Proprietaire')
  if (guard) return guard
  const nextEmail = input.email !== undefined ? ensureString(input.email) : current.email
  if (nextEmail && !isEmail(nextEmail)) return { error: { status: 400, message: 'Email proprietaire invalide.' } }
  return {
    data: updateProprietaire(id, (item) => ({
      ...item,
      nom: input.nom !== undefined ? ensureString(input.nom) || item.nom : item.nom,
      email: nextEmail,
      telephone: input.telephone !== undefined ? ensureString(input.telephone) : item.telephone,
      prenom: input.prenom !== undefined ? ensureString(input.prenom) : item.prenom,
      type: input.type !== undefined ? ensureString(input.type) || 'personne' : item.type,
      pieceIdentiteType: input.pieceIdentiteType !== undefined ? ensureString(input.pieceIdentiteType) : item.pieceIdentiteType,
      pieceIdentiteNumero: input.pieceIdentiteNumero !== undefined ? ensureString(input.pieceIdentiteNumero) : item.pieceIdentiteNumero,
      pieceIdentiteFile: input.pieceIdentiteFile !== undefined ? normalizeFileAttachment(input.pieceIdentiteFile) : item.pieceIdentiteFile,
      adressePostale: input.adressePostale !== undefined ? ensureString(input.adressePostale) : item.adressePostale,
      statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
      updatedAt: new Date().toISOString(),
    })),
  }
}

export function deleteAgenceProprietaireService(agenceIdInput, id) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findProprietaireById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Proprietaire')
  if (guard) return guard
  if (listBiens().some((item) => item.agenceId === agenceId && item.proprietaireId === id)) {
    return { error: { status: 400, message: 'Suppression impossible: proprietaire associe a un bien agence.' } }
  }
  deleteProprietaire(id)
  return { data: { ok: true } }
}

export function createAgenceLocataireService(agenceIdInput, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const nom = ensureString(input.nom)
  const email = ensureString(input.email)
  if (!nom) return { error: { status: 400, message: 'Nom locataire obligatoire.' } }
  if (email && !isEmail(email)) return { error: { status: 400, message: 'Email locataire invalide.' } }
  return {
    data: createLocataire({
      id: createId('tenant'),
      agenceId,
      nom,
      email,
      telephone: ensureString(input.telephone),
      prenom: ensureString(input.prenom),
      dateNaissance: ensureString(input.dateNaissance),
      pieceIdentiteType: ensureString(input.pieceIdentiteType),
      pieceIdentiteNumero: ensureString(input.pieceIdentiteNumero),
      pieceIdentiteFile: normalizeFileAttachment(input.pieceIdentiteFile),
      statut: 'Actif',
      situationPro: ensureString(input.situationPro),
      adresseActuelle: ensureString(input.adresseActuelle),
      createdAt: new Date().toISOString(),
    }),
  }
}

export function updateAgenceLocataireService(agenceIdInput, id, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findLocataireById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Locataire')
  if (guard) return guard
  const nextEmail = input.email !== undefined ? ensureString(input.email) : current.email
  if (nextEmail && !isEmail(nextEmail)) return { error: { status: 400, message: 'Email locataire invalide.' } }
  return {
    data: updateLocataire(id, (item) => ({
      ...item,
      nom: input.nom !== undefined ? ensureString(input.nom) || item.nom : item.nom,
      email: nextEmail,
      telephone: input.telephone !== undefined ? ensureString(input.telephone) : item.telephone,
      prenom: input.prenom !== undefined ? ensureString(input.prenom) : item.prenom,
      dateNaissance: input.dateNaissance !== undefined ? ensureString(input.dateNaissance) : item.dateNaissance,
      pieceIdentiteType: input.pieceIdentiteType !== undefined ? ensureString(input.pieceIdentiteType) : item.pieceIdentiteType,
      pieceIdentiteNumero: input.pieceIdentiteNumero !== undefined ? ensureString(input.pieceIdentiteNumero) : item.pieceIdentiteNumero,
      pieceIdentiteFile: input.pieceIdentiteFile !== undefined ? normalizeFileAttachment(input.pieceIdentiteFile) : item.pieceIdentiteFile,
      situationPro: input.situationPro !== undefined ? ensureString(input.situationPro) : item.situationPro,
      adresseActuelle: input.adresseActuelle !== undefined ? ensureString(input.adresseActuelle) : item.adresseActuelle,
      statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
      updatedAt: new Date().toISOString(),
    })),
  }
}

export function deleteAgenceLocataireService(agenceIdInput, id) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findLocataireById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Locataire')
  if (guard) return guard
  if (listBiens().some((item) => item.agenceId === agenceId && item.locataireId === id)) {
    return { error: { status: 400, message: 'Suppression impossible: locataire associe a un bien agence.' } }
  }
  deleteLocataire(id)
  return { data: { ok: true } }
}

export function createAgenceGestionnaireService(agenceIdInput, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const email = ensureString(input.email).toLowerCase()
  const code = ensureString(input.code) || '1234'
  if (!email || !isEmail(email)) return { error: { status: 400, message: 'Email gestionnaire invalide.' } }
  if (listAccessUsers().some((item) => item.role === 'gestionnaire' && ensureString(item.email).toLowerCase() === email)) {
    return { error: { status: 400, message: 'Un gestionnaire existe deja avec cet email.' } }
  }
  return {
    data: createAccessUser({
      id: createId('access'),
      role: 'gestionnaire',
      agenceId,
      nom: ensureString(input.nom),
      telephone: ensureString(input.telephone),
      poste: ensureString(input.poste),
      email,
      code,
      linkedId: ensureString(input.linkedId) || null,
      statut: 'Actif',
      createdAt: new Date().toISOString(),
    }),
  }
}

export function updateAgenceGestionnaireService(agenceIdInput, id, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findAccessUserById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Gestionnaire')
  if (guard) return guard
  if (current.role !== 'gestionnaire') return { error: { status: 400, message: 'Compte non gestionnaire.' } }
  const nextEmail = input.email !== undefined ? ensureString(input.email).toLowerCase() : current.email
  if (nextEmail && !isEmail(nextEmail)) return { error: { status: 400, message: 'Email gestionnaire invalide.' } }
  return {
    data: updateAccessUser(id, (item) => ({
      ...item,
      nom: input.nom !== undefined ? ensureString(input.nom) : item.nom,
      telephone: input.telephone !== undefined ? ensureString(input.telephone) : item.telephone,
      poste: input.poste !== undefined ? ensureString(input.poste) : item.poste,
      email: nextEmail || item.email,
      statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
      code: input.code !== undefined ? ensureString(input.code) || item.code : item.code,
      internalRole: input.internalRole !== undefined ? ensureString(input.internalRole) || item.internalRole : item.internalRole,
      updatedAt: new Date().toISOString(),
    })),
  }
}

export function deleteAgenceGestionnaireService(agenceIdInput, id) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findAccessUserById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Gestionnaire')
  if (guard) return guard
  if (current.role !== 'gestionnaire') return { error: { status: 400, message: 'Compte non gestionnaire.' } }
  deleteAccessUser(id)
  return { data: { ok: true } }
}

export function createAgenceBienService(agenceIdInput, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const proprietaireId = ensureString(input.proprietaireId)
  const locataireId = ensureString(input.locataireId)
  const owner = findProprietaireById(proprietaireId)
  const ownerGuard = sameAgenceGuard(owner, agenceId, 'Proprietaire')
  if (ownerGuard) return ownerGuard
  if (locataireId) {
    const tenant = findLocataireById(locataireId)
    const tenantGuard = sameAgenceGuard(tenant, agenceId, 'Locataire')
    if (tenantGuard) return tenantGuard
  }
  if (!isPositiveNumber(input.loyerMensuel)) return { error: { status: 400, message: 'Loyer mensuel invalide.' } }

  return {
    data: createBien({
      id: createId('property'),
      agenceId,
      titre: ensureString(input.titre),
      type: ensureString(input.type) || 'appartement',
      slug: slugify(`${ensureString(input.titre)}-${Date.now()}`),
      adresse: ensureString(input.adresse),
      quartier: ensureString(input.quartier),
      ville: ensureString(input.ville),
      codePostal: ensureString(input.codePostal),
      loyerMensuel: Number(input.loyerMensuel),
      usage: ensureString(input.usage) || 'habitation',
      surface: isPositiveNumber(input.surface) ? Number(input.surface) : null,
      nbPieces: isPositiveNumber(input.nbPieces) ? Number(input.nbPieces) : null,
      nbChambres: isPositiveNumber(input.nbChambres) ? Number(input.nbChambres) : null,
      nbSdb: isPositiveNumber(input.nbSdb) ? Number(input.nbSdb) : null,
      chargesMensuelles: isPositiveNumber(input.chargesMensuelles) ? Number(input.chargesMensuelles) : 0,
      depotGarantie: isPositiveNumber(input.depotGarantie) ? Number(input.depotGarantie) : 0,
      fraisGestionMensuels: isPositiveNumber(input.fraisGestionMensuels) ? Number(input.fraisGestionMensuels) : 0,
      taxeFonciereAnnuelle: isPositiveNumber(input.taxeFonciereAnnuelle) ? Number(input.taxeFonciereAnnuelle) : 0,
      assuranceAnnuelle: isPositiveNumber(input.assuranceAnnuelle) ? Number(input.assuranceAnnuelle) : 0,
      proprietaireId,
      locataireId: locataireId || null,
      statut: ensureString(input.statut) || 'disponible',
      published: Boolean(input.published),
      operation: 'location',
      images: normalizeImageList(input.images),
      createdAt: new Date().toISOString(),
    }),
  }
}

export function updateAgenceBienService(agenceIdInput, id, input) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findBienById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Bien')
  if (guard) return guard
  const nextOwnerId = input.proprietaireId !== undefined ? ensureString(input.proprietaireId) : ensureString(current.proprietaireId)
  const nextTenantId = input.locataireId !== undefined ? ensureString(input.locataireId) : ensureString(current.locataireId)
  if (nextOwnerId) {
    const owner = findProprietaireById(nextOwnerId)
    const ownerGuard = sameAgenceGuard(owner, agenceId, 'Proprietaire')
    if (ownerGuard) return ownerGuard
  }
  if (nextTenantId) {
    const tenant = findLocataireById(nextTenantId)
    const tenantGuard = sameAgenceGuard(tenant, agenceId, 'Locataire')
    if (tenantGuard) return tenantGuard
  }
  return {
    data: updateBien(id, (item) => ({
      ...item,
      titre: input.titre !== undefined ? ensureString(input.titre) || item.titre : item.titre,
      adresse: input.adresse !== undefined ? ensureString(input.adresse) || item.adresse : item.adresse,
      quartier: input.quartier !== undefined ? ensureString(input.quartier) : item.quartier,
      ville: input.ville !== undefined ? ensureString(input.ville) : item.ville,
      codePostal: input.codePostal !== undefined ? ensureString(input.codePostal) : item.codePostal,
      type: input.type !== undefined ? ensureString(input.type) || item.type : item.type,
      usage: input.usage !== undefined ? ensureString(input.usage) || 'habitation' : (item.usage || 'habitation'),
      surface: input.surface !== undefined ? Number(input.surface || 0) : item.surface,
      nbPieces: input.nbPieces !== undefined ? Number(input.nbPieces || 0) : item.nbPieces,
      nbChambres: input.nbChambres !== undefined ? Number(input.nbChambres || 0) : item.nbChambres,
      nbSdb: input.nbSdb !== undefined ? Number(input.nbSdb || 0) : item.nbSdb,
      loyerMensuel: input.loyerMensuel !== undefined ? Number(input.loyerMensuel || 0) : item.loyerMensuel,
      chargesMensuelles: input.chargesMensuelles !== undefined ? Number(input.chargesMensuelles || 0) : item.chargesMensuelles,
      depotGarantie: input.depotGarantie !== undefined ? Number(input.depotGarantie || 0) : item.depotGarantie,
      fraisGestionMensuels: input.fraisGestionMensuels !== undefined ? Number(input.fraisGestionMensuels || 0) : item.fraisGestionMensuels,
      taxeFonciereAnnuelle: input.taxeFonciereAnnuelle !== undefined ? Number(input.taxeFonciereAnnuelle || 0) : item.taxeFonciereAnnuelle,
      assuranceAnnuelle: input.assuranceAnnuelle !== undefined ? Number(input.assuranceAnnuelle || 0) : item.assuranceAnnuelle,
      statut: input.statut !== undefined ? ensureString(input.statut) || item.statut : item.statut,
      published: input.published !== undefined ? Boolean(input.published) : item.published,
      images: input.images !== undefined ? normalizeImageList(input.images) : item.images,
      proprietaireId: nextOwnerId || item.proprietaireId,
      locataireId: nextTenantId || null,
      updatedAt: new Date().toISOString(),
    })),
  }
}

export function deleteAgenceBienService(agenceIdInput, id) {
  const resolved = resolveAgenceId(agenceIdInput)
  if (resolved.error) return resolved
  const agenceId = resolved.data
  const current = findBienById(id)
  const guard = sameAgenceGuard(current, agenceId, 'Bien')
  if (guard) return guard
  deleteBien(id)
  return { data: { ok: true } }
}
