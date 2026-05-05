import {
  ensureString,
  isEmail,
  createId,
  extractFirstName,
  generateTemporaryCode,
} from '../utils/common.js'
import {
  listAccessUsers,
  findAccessUserByRoleEmail,
  findAccessUserById,
  createAccessUser,
  updateAccessUser,
  deleteAccessUser,
} from '../repositories/accessRepository.js'
import { findLocataireByEmail, findProprietaireByEmail } from '../repositories/partyRepository.js'
import { upsertSession } from '../repositories/sessionRepository.js'
import { deleteSessionByToken } from '../repositories/sessionRepository.js'

function toSafeAccess(accessUser) {
  const { code, ...safe } = accessUser
  return safe
}

export function login({ role, email, code }) {
  const safeRole = ensureString(role)
  const safeEmail = ensureString(email).toLowerCase()
  const safeCode = ensureString(code)

  if (!safeRole || !safeEmail || !safeCode) {
    return { error: { status: 400, message: 'role, email et code sont obligatoires.' } }
  }

  if (safeCode === '1234') {
    if (safeRole === 'admin') {
      const token = createId('session')
      const data = {
        role: safeRole,
        userId: 'platform_admin_demo',
        name: 'Admin Plateforme Demo',
        email: safeEmail,
        token,
      }
      upsertSession({ ...data, createdAt: new Date().toISOString() })
      return {
        data,
      }
    }
    // Demo rapide proprietaire/locataire uniquement (pas agence/gestionnaire : ils passent par access-users).
    if (safeRole === 'proprietaire' || safeRole === 'locataire') {
      const person = safeRole === 'proprietaire'
        ? findProprietaireByEmail(safeEmail)
        : findLocataireByEmail(safeEmail)
      if (!person) {
        return {
          error: {
            status: 404,
            message:
              safeRole === 'locataire'
                ? 'Cet email ne correspond a aucun locataire dans les donnees de demonstration (code 1234). Exemple valide: mariama.bah@example.gn — pour un compte agence, utilisez /espace/agence avec centre@immo-connect.gn.'
                : 'Cet email ne correspond a aucun proprietaire dans les donnees de demonstration (code 1234). Exemple valide: fatou.barry@example.gn — pour un compte agence, utilisez /espace/agence.',
          },
        }
      }
      const token = createId('session')
      const data = {
        role: safeRole,
        userId: person.id,
        name: person.nom,
        email: person.email,
        token,
      }
      upsertSession({ ...data, createdAt: new Date().toISOString() })
      return { data }
    }
  }

  const accessUser = findAccessUserByRoleEmail(safeRole, safeEmail)
  if (!accessUser || accessUser.code !== safeCode || accessUser.statut !== 'Actif') {
    return { error: { status: 401, message: 'Code d acces invalide.' } }
  }
  if (safeRole === 'agence' && !ensureString(accessUser.linkedId)) {
    return { error: { status: 401, message: 'Compte agence non provisionne.' } }
  }
  if (safeRole === 'gestionnaire' && !ensureString(accessUser.agenceId)) {
    return { error: { status: 401, message: 'Gestionnaire non rattache a une agence.' } }
  }

  const resolvedAgenceId = safeRole === 'agence'
    ? ensureString(accessUser.linkedId)
    : ensureString(accessUser.agenceId)
  const token = createId('session')
  const data = {
    role: safeRole,
    userId: accessUser.linkedId || accessUser.id,
    agenceId: resolvedAgenceId || null,
    internalRole: ensureString(accessUser.internalRole)
      || (safeRole === 'agence' ? 'directeur_agence' : safeRole === 'gestionnaire' ? 'gestionnaire_agence' : null),
    name: accessUser.nom || extractFirstName(accessUser.email),
    email: accessUser.email,
    token,
  }
  upsertSession({ ...data, createdAt: new Date().toISOString() })
  return { data }
}

export function listAdminAccess() {
  return listAccessUsers().map(toSafeAccess)
}

export function createAdminAccess(input) {
  const role = ensureString(input.role)
  const email = ensureString(input.email).toLowerCase()
  const code = ensureString(input.code)
  const nom = ensureString(input.nom)
  const linkedId = ensureString(input.linkedId)
  const agenceId = ensureString(input.agenceId)
  const internalRole = ensureString(input.internalRole)
  const telephone = ensureString(input.telephone)
  const poste = ensureString(input.poste)

  if (!role || !email || !code) {
    return { error: { status: 400, message: 'role, email et code sont obligatoires.' } }
  }
  if (!isEmail(email)) {
    return { error: { status: 400, message: 'Email invalide.' } }
  }
  if (findAccessUserByRoleEmail(role, email)) {
    return { error: { status: 400, message: 'Un acces existe deja pour ce role et cet email.' } }
  }
  if (role === 'gestionnaire' && !agenceId) {
    return { error: { status: 400, message: 'agenceId est obligatoire pour un gestionnaire.' } }
  }

  const created = createAccessUser({
    id: createId('access'),
    role,
    agenceId: agenceId || null,
    email,
    code,
    nom,
    telephone,
    poste,
    linkedId: linkedId || null,
    internalRole: internalRole || (role === 'gestionnaire' ? 'gestionnaire_agence' : null),
    statut: 'Actif',
    createdAt: new Date().toISOString(),
  })
  return { data: toSafeAccess(created) }
}

export function updateAdminAccess(id, input) {
  const existing = findAccessUserById(id)
  if (!existing) return { error: { status: 404, message: 'Acces introuvable.' } }

  const nextEmail = input.email !== undefined ? ensureString(input.email).toLowerCase() : existing.email
  if (nextEmail && !isEmail(nextEmail)) {
    return { error: { status: 400, message: 'Email invalide.' } }
  }

  const updated = updateAccessUser(id, (current) => ({
    ...current,
    role: input.role !== undefined ? ensureString(input.role) || current.role : current.role,
    agenceId: input.agenceId !== undefined ? ensureString(input.agenceId) || null : current.agenceId || null,
    email: nextEmail || current.email,
    code: input.code !== undefined ? ensureString(input.code) || current.code : current.code,
    nom: input.nom !== undefined ? ensureString(input.nom) : current.nom || '',
    telephone: input.telephone !== undefined ? ensureString(input.telephone) : current.telephone || '',
    poste: input.poste !== undefined ? ensureString(input.poste) : current.poste || '',
    linkedId: input.linkedId !== undefined ? ensureString(input.linkedId) || null : current.linkedId || null,
    internalRole: input.internalRole !== undefined ? ensureString(input.internalRole) || null : current.internalRole || null,
    statut: input.statut !== undefined ? ensureString(input.statut) || current.statut : current.statut,
    updatedAt: new Date().toISOString(),
  }))
  return { data: toSafeAccess(updated) }
}

export function removeAdminAccess(id) {
  const ok = deleteAccessUser(id)
  if (!ok) return { error: { status: 404, message: 'Acces introuvable.' } }
  return { data: { ok: true } }
}

export function resetAdminAccessCode(id) {
  const existing = findAccessUserById(id)
  if (!existing) return { error: { status: 404, message: 'Acces introuvable.' } }

  const temporaryCode = generateTemporaryCode()
  const updated = updateAccessUser(id, (current) => ({
    ...current,
    code: temporaryCode,
    updatedAt: new Date().toISOString(),
  }))
  return { data: { access: toSafeAccess(updated), temporaryCode } }
}

export function logoutByToken(token) {
  const safeToken = ensureString(token)
  if (!safeToken) return { error: { status: 400, message: 'Token manquant.' } }
  deleteSessionByToken(safeToken)
  return { data: { ok: true } }
}

