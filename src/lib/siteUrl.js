/**
 * URL publique du site (Open Graph, Twitter, canonical).
 * En production, définir VITE_PUBLIC_SITE_URL=https://www.votredomaine.com pour des liens
 * de partage corrects même si l’app est servie derrière un reverse proxy.
 */
export function getSiteOrigin() {
  if (typeof window !== 'undefined') {
    return (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '')
  }
  return (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '')
}

/** Transforme une URL relative en absolue ; laisse les URLs déjà absolues inchangées. */
export function toAbsoluteUrl(href) {
  if (!href) return ''
  const h = String(href).trim()
  if (h.startsWith('http://') || h.startsWith('https://')) return h
  const origin = getSiteOrigin()
  if (!origin) return h
  const path = h.startsWith('/') ? h : `/${h}`
  return `${origin}${path}`
}
