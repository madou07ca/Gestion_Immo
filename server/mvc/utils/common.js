export function ensureString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0
}

export function createId(prefix) {
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now()}_${randomPart}`
}

export function extractFirstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || 'Utilisateur'
}

export function generateTemporaryCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

