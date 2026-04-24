import { properties as fallbackProperties } from '../data/properties'

export async function fetchPublicProperties() {
  try {
    const res = await fetch('/api/public/biens')
    if (!res.ok) throw new Error('API unavailable')
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return fallbackProperties
    return data
  } catch {
    return fallbackProperties
  }
}

