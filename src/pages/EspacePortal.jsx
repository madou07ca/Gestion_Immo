import { Link, useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Sparkles, AlertCircle, Info } from 'lucide-react'
import Seo from '../components/Seo'
import { espacePortals } from '../data/espacePortals'
import { isRoleAuthorized, setAuthSession } from '../lib/authSession'

const SESSION_EXPIRED_FLASH_KEY = 'immo_session_expired_flash'

function consumeSessionExpiredFlash(expectedRole) {
  try {
    const raw = sessionStorage.getItem(SESSION_EXPIRED_FLASH_KEY)
    if (!raw) return ''
    sessionStorage.removeItem(SESSION_EXPIRED_FLASH_KEY)
    const payload = JSON.parse(raw)
    if (!payload || payload.role !== expectedRole) return ''
    return payload.message || ''
  } catch {
    return ''
  }
}

export default function EspacePortal() {
  const { slug } = useParams()
  const portal = espacePortals[slug]
  const [authForm, setAuthForm] = useState({ email: '', code: '' })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(() => consumeSessionExpiredFlash(slug))
  const isSessionExpiredMessage = authError.toLowerCase().includes('session expiree')
  const alreadyAuthorized = isRoleAuthorized(slug)

  if (!portal) {
    return <Navigate to="/espace" replace />
  }

  const Icon = portal.icon

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: slug, email: authForm.email, code: authForm.code }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAuthError(payload?.error || 'Connexion impossible.')
        return
      }
      setAuthSession(payload.data)
      window.location.href = `/espace/${slug}/app`
    } catch {
      setAuthError('Connexion impossible au serveur API.')
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div>
      <Seo
        title={portal.title}
        description={portal.description}
      />

      <section className={`relative overflow-hidden border-b border-night-600 bg-gradient-to-br ${portal.accent}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
          <Link
            to="/espace"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Tous les espaces
          </Link>
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-5 border ${portal.borderAccent} bg-night-900/50 backdrop-blur-sm shrink-0`}
            >
              <Icon className="w-14 h-14 text-gold-400" strokeWidth={1.25} />
            </motion.div>
            <div className="flex-1">
              <p className="text-gold-400/90 text-sm font-semibold tracking-wide uppercase mb-2">
                Plateforme Immo-Connect_GN
              </p>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
                {portal.title}
              </h1>
              <p className="text-xl text-gold-200/90 font-medium mb-4">{portal.tagline}</p>
              <p className="text-gray-300 leading-relaxed max-w-2xl">{portal.description}</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10"
          >
            {alreadyAuthorized ? (
              <Link
                to={`/espace/${portal.slug}/app`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3.5 text-night-900 font-semibold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20"
              >
                <Lock size={18} />
                Entrer dans l espace
              </Link>
            ) : (
              <form onSubmit={handleLogin} className="max-w-xl rounded-xl border border-night-600 bg-night-900/50 p-4 md:p-5 grid md:grid-cols-3 gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-lg bg-night-800 border border-night-600 px-3 py-2 text-sm text-gray-200"
                  required
                />
                <input
                  type="password"
                  placeholder="Code (demo: 1234)"
                  value={authForm.code}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="rounded-lg bg-night-800 border border-night-600 px-3 py-2 text-sm text-gray-200"
                  required
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-night-900 font-semibold disabled:opacity-60"
                >
                  <Lock size={16} />
                  {authLoading ? 'Connexion...' : 'Se connecter'}
                </button>
                {authError && (
                  <p
                    className={`md:col-span-3 text-xs rounded-md border px-2.5 py-2 flex items-start gap-2 ${
                      isSessionExpiredMessage
                        ? 'text-amber-200 bg-amber-500/10 border-amber-500/30'
                        : 'text-red-300 bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    {isSessionExpiredMessage ? <Info size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
                    {authError}
                  </p>
                )}
              </form>
            )}
          </motion.div>
          <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
            <Sparkles size={12} className="text-gold-600" />
            La demo fonctionne sans compte : donnees fictives, navigation complete.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-10 text-center">
          Fonctionnalités prévues
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {portal.features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-xl border border-night-600 bg-night-800/50 p-6 hover:border-gold-500/25 transition-colors"
            >
              <h3 className="font-semibold text-gold-300 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {portal.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-night-600 bg-night-900/80 px-4 py-5 text-center"
            >
              <p className="font-display text-2xl font-bold text-gold-400">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
