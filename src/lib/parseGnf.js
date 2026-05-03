/** Extrait un entier GNF depuis un libellé type "2 850 000 GNF" ou nombre. */
export function parseAmountGnf(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value == null) return 0
  const cleaned = String(value).replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}
