/**
 * URL d'envoi des formulaires (leads).
 * - En local avec le serveur Express : laisser vide (défaut) → envoi vers /api/leads/...
 * - Avec Netlify + fonction Odoo : VITE_LEADS_API_BASE=/.netlify/functions/odoo-lead
 */
export const LEADS_API_BASE = (import.meta.env.VITE_LEADS_API_BASE || '').replace(/\/$/, '')

/** URL pour soumettre un lead. path = 'estimation-rapide' | 'estimation' | 'gestion-locative' | 'contact-bien' */
export function getLeadsSubmitUrl(path) {
  if (LEADS_API_BASE) return LEADS_API_BASE // une seule URL pour Odoo, le type est dans le body
  return `/api/leads/${path}`
}

/** true si on envoie vers la fonction Odoo (body doit inclure { type, ...data }) */
export const isOdooLeads = Boolean(LEADS_API_BASE)
