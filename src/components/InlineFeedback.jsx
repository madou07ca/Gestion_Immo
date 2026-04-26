import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

function detectFeedbackTone(message) {
  const text = String(message || '').toLowerCase()
  if (!text) return 'info'
  if (text.includes('impossible')
    || text.includes('refuse')
    || text.includes('obligatoire')
    || text.includes('renseignez')
    || text.includes('indisponible')
    || text.includes('introuvable')
    || text.includes('invalide')
    || text.includes('connexion api')
    || text.includes('connexion impossible')) {
    return 'error'
  }
  if (text.includes('succes')
    || text.includes('cree')
    || text.includes('enregistre')
    || text.includes('mis a jour')
    || text.includes('supprime')
    || text.includes('publie')
    || text.includes('envoye')
    || text.includes('signe')
    || text.includes('converti')) {
    return 'success'
  }
  return 'info'
}

export default function InlineFeedback({ message, className = '' }) {
  if (!message) return null
  const tone = detectFeedbackTone(message)
  const styles = tone === 'success'
    ? 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30'
    : tone === 'error'
      ? 'text-red-200 bg-red-500/10 border-red-500/30'
      : 'text-amber-200 bg-amber-500/10 border-amber-500/30'
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info
  return (
    <p className={`text-xs rounded-md border px-2.5 py-2 flex items-start gap-2 ${styles} ${className}`}>
      <Icon size={14} className="mt-0.5 shrink-0" />
      {message}
    </p>
  )
}
