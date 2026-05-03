import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Bell } from 'lucide-react'
import { espacePortals } from '../../data/espacePortals'
import { portalAppMenus } from '../../data/portalAppMenus'
import { kpiBySlug, activityFeed } from '../../data/portalMockData'
import { getAuthSession } from '../../lib/authSession'
import InlineFeedback from '../../components/InlineFeedback'

export default function PortalDashboard() {
  const { slug } = useParams()
  const isAgencyPortal = slug === 'agence'
  const isAdminDashboard = slug === 'admin' || isAgencyPortal
  const dashboardSlug = slug === 'admin' ? 'gestionnaire' : slug
  const portal = espacePortals[slug]
  const menu = portalAppMenus[slug]
  const [kpis, setKpis] = useState(
    isAdminDashboard ? kpiBySlug.admin || [] : kpiBySlug[dashboardSlug] || [],
  )
  const [feed, setFeed] = useState(
    isAdminDashboard ? activityFeed.admin || [] : activityFeed[dashboardSlug] || [],
  )
  const [adminOverviewNotice, setAdminOverviewNotice] = useState('')
  const [adminSignals, setAdminSignals] = useState([])
  const [adminExpiring, setAdminExpiring] = useState([])
  const [adminByAgence, setAdminByAgence] = useState([])
  const [adminAlerts, setAdminAlerts] = useState([])
  const [adminActionsToday, setAdminActionsToday] = useState([])
  const [ownerActions, setOwnerActions] = useState([
    {
      id: 'owner-default-vacancy',
      priority: 'Moyenne',
      title: 'Verifier les biens vacants',
      detail: 'Prioriser la remise sur le marche pour limiter la vacance.',
      target: 'biens',
    },
    {
      id: 'owner-default-cash',
      priority: 'Info',
      title: 'Suivre les encaissements',
      detail: 'Controler les virements recents et les references bancaires.',
      target: 'historique-paiements',
    },
  ])
  const [adminDashboardFilters, setAdminDashboardFilters] = useState({
    agenceId: 'all',
    severity: 'all',
    horizon: '90',
  })
  const quick = menu?.filter((m) => m.path) || []

  const scopedAgenceId = useMemo(() => {
    if (!isAgencyPortal) return null
    const session = getAuthSession()
    return session?.agenceId ? String(session.agenceId) : null
  }, [isAgencyPortal, slug])

  useEffect(() => {
    if (slug !== 'locataire') return
    const session = getAuthSession()
    const tenantId = session?.role === 'locataire' ? session.userId : ''

    const loadTenantDashboard = async () => {
      try {
        const res = await fetch(`/api/locataire/me${tenantId ? `?tenantId=${tenantId}` : ''}`)
        const payload = await res.json().catch(() => ({}))
        if (!res.ok || !payload?.ok) return
        if (Array.isArray(payload.data.kpis) && payload.data.kpis.length > 0) {
          setKpis(payload.data.kpis)
        }
        if (Array.isArray(payload.data.feed)) {
          setFeed(payload.data.feed)
        }
      } catch {
        // fallback demo
      }
    }

    loadTenantDashboard()
  }, [slug])

  useEffect(() => {
    if (slug !== 'proprietaire') return
    const session = getAuthSession()
    const ownerId = session?.role === 'proprietaire' ? session.userId : ''

    const loadOwnerDashboard = async () => {
      try {
        const res = await fetch(`/api/proprietaire/me${ownerId ? `?ownerId=${ownerId}` : ''}`)
        const payload = await res.json().catch(() => ({}))
        if (!res.ok || !payload?.ok) return
        if (Array.isArray(payload.data.kpis) && payload.data.kpis.length > 0) {
          setKpis(payload.data.kpis)
        }
        if (Array.isArray(payload.data.feed)) {
          setFeed(payload.data.feed)
        }
        if (Array.isArray(payload.data.actions)) {
          setOwnerActions(payload.data.actions)
        }
      } catch {
        // fallback demo
      }
    }

    loadOwnerDashboard()
  }, [slug])

  useEffect(() => {
    if (!isAdminDashboard) return
    const loadAdminOverview = async () => {
      const aid = isAgencyPortal && scopedAgenceId ? scopedAgenceId : null
      const matchesAgence = (row) =>
        !aid || !row || row.agenceId === undefined || row.agenceId === null || String(row.agenceId) === aid
      try {
        const session = getAuthSession()
        const headers = session?.token ? { Authorization: `Bearer ${session.token}` } : {}
        const res = await fetch('/api/admin/overview', { headers })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok || !payload?.ok) {
          setAdminOverviewNotice(
            res.status === 404
              ? 'API admin introuvable sur ce serveur (souvent: process Node non redemarre). Arretez puis relancez: npm run server.'
              : `Vue admin indisponible (${res.status}). Les KPI ci-dessous restent en demonstration.`,
          )
          setAdminSignals([])
          setAdminExpiring([])
          setAdminByAgence([])
          setAdminAlerts([])
          setAdminActionsToday([])
          return
        }
        setAdminOverviewNotice('')
        let nextKpis = Array.isArray(payload.data.kpis) ? payload.data.kpis : []
        let nextFeed = Array.isArray(payload.data.feed) ? payload.data.feed : []
        let nextSignals = Array.isArray(payload.data.signals) ? payload.data.signals : []
        let nextExpiring = Array.isArray(payload.data.expiringLeases) ? payload.data.expiringLeases : []
        let nextByAgence = Array.isArray(payload.data.byAgence) ? payload.data.byAgence : []
        let nextAlerts = Array.isArray(payload.data.alerts) ? payload.data.alerts : []
        let nextActions = Array.isArray(payload.data.actionsToday) ? payload.data.actionsToday : []
        if (aid) {
          nextByAgence = nextByAgence.filter((r) => String(r.agenceId) === aid)
          nextSignals = nextSignals.filter(matchesAgence)
          nextExpiring = nextExpiring.filter(matchesAgence)
          nextAlerts = nextAlerts.filter(matchesAgence)
          nextActions = nextActions.filter(matchesAgence)
        }
        setKpis(nextKpis)
        setFeed(nextFeed)
        setAdminSignals(nextSignals)
        setAdminExpiring(nextExpiring)
        setAdminByAgence(nextByAgence)
        setAdminAlerts(nextAlerts)
        setAdminActionsToday(nextActions)
      } catch {
        setAdminOverviewNotice('Connexion impossible au serveur API: affichage des KPI en demonstration.')
        setAdminSignals([])
        setAdminExpiring([])
        setAdminByAgence([])
        setAdminAlerts([])
        setAdminActionsToday([])
      }
    }
    loadAdminOverview()
  }, [isAdminDashboard, isAgencyPortal, scopedAgenceId, slug])

  useEffect(() => {
    if (!isAgencyPortal || !scopedAgenceId) return
    setAdminDashboardFilters((prev) => ({ ...prev, agenceId: scopedAgenceId }))
  }, [isAgencyPortal, scopedAgenceId])

  const filteredSignals = useMemo(() => {
    if (!isAdminDashboard) return adminSignals
    if (adminDashboardFilters.severity === 'all') return adminSignals
    return adminSignals.filter((signal) => signal.severity === adminDashboardFilters.severity)
  }, [isAdminDashboard, adminSignals, adminDashboardFilters.severity])

  const filteredExpiring = useMemo(() => {
    if (!isAdminDashboard) return adminExpiring
    const horizonDays = Number(adminDashboardFilters.horizon || 90)
    return adminExpiring.filter((row) => {
      const matchesAgency =
        isAgencyPortal
          ? scopedAgenceId && String(row.agenceId) === scopedAgenceId
          : adminDashboardFilters.agenceId === 'all' || row.agenceId === adminDashboardFilters.agenceId
      const matchesHorizon = Number(row.joursRestants || 9999) <= horizonDays
      return matchesAgency && matchesHorizon
    })
  }, [
    isAdminDashboard,
    isAgencyPortal,
    scopedAgenceId,
    adminExpiring,
    adminDashboardFilters.agenceId,
    adminDashboardFilters.horizon,
  ])

  const displayedKpis = useMemo(() => {
    if (!isAdminDashboard) return kpis
    if (isAgencyPortal && scopedAgenceId) {
      const agenceRow = adminByAgence.find((row) => String(row.agenceId) === scopedAgenceId)
      if (!agenceRow) return kpis
      return [
        { label: 'Votre agence', value: agenceRow.agence, sub: 'Vue restreinte au portefeuille rattache' },
        { label: 'Biens agence', value: String(agenceRow.biens), sub: `${agenceRow.loues} loues` },
        { label: 'Occupation agence', value: agenceRow.tauxOccupation, sub: 'Taux local' },
        { label: 'Retards agence', value: String(agenceRow.paiementsRetard), sub: 'Paiements en retard' },
        { label: 'Locataires agence', value: String(agenceRow.locataires), sub: 'Portefeuille locatif' },
        { label: 'Gestionnaires agence', value: String(agenceRow.gestionnaires), sub: 'Capacite operationnelle' },
      ]
    }
    if (adminDashboardFilters.agenceId === 'all') return kpis
    const agenceRow = adminByAgence.find((row) => row.agenceId === adminDashboardFilters.agenceId)
    if (!agenceRow) return kpis
    return [
      { label: 'Agence cible', value: agenceRow.agence, sub: 'Filtre actif sur le tableau de bord' },
      { label: 'Biens agence', value: String(agenceRow.biens), sub: `${agenceRow.loues} loues` },
      { label: 'Occupation agence', value: agenceRow.tauxOccupation, sub: 'Taux local' },
      { label: 'Retards agence', value: String(agenceRow.paiementsRetard), sub: 'Paiements en retard' },
      { label: 'Locataires agence', value: String(agenceRow.locataires), sub: 'Portefeuille locatif' },
      { label: 'Gestionnaires agence', value: String(agenceRow.gestionnaires), sub: 'Capacite operationnelle' },
    ]
  }, [isAdminDashboard, isAgencyPortal, scopedAgenceId, kpis, adminDashboardFilters.agenceId, adminByAgence])

  if (!portal) return null

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenue sur votre espace {portal.title.replace('Espace ', '').toLowerCase()}.
          </p>
          {isAdminDashboard && adminOverviewNotice ? (
            <InlineFeedback message={adminOverviewNotice} className="mt-3" />
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-night-600 px-4 py-2 text-sm text-gray-300 hover:border-gold-500/30 hover:text-gold-300 transition-colors self-start"
        >
          <Bell size={18} />
          Notifications
        </button>
      </div>

      {slug === 'admin' && (
        <div className="mb-6 rounded-xl border border-night-600 bg-night-800/30 p-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            <span className="text-gray-400">Agence</span>
            <select
              value={adminDashboardFilters.agenceId}
              onChange={(e) => setAdminDashboardFilters((prev) => ({ ...prev, agenceId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
            >
              <option value="all">Toutes les agences</option>
              {adminByAgence.map((row) => (
                <option key={row.agenceId} value={row.agenceId}>{row.agence}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Severite signaux</span>
            <select
              value={adminDashboardFilters.severity}
              onChange={(e) => setAdminDashboardFilters((prev) => ({ ...prev, severity: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
            >
              <option value="all">Toutes</option>
              <option value="high">Critique</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Horizon baux</span>
            <select
              value={adminDashboardFilters.horizon}
              onChange={(e) => setAdminDashboardFilters((prev) => ({ ...prev, horizon: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
            >
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="365">12 mois</option>
            </select>
          </label>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={() => setAdminDashboardFilters({ agenceId: 'all', severity: 'all', horizon: '90' })}
              className="rounded-lg border border-night-500 px-3 py-2 text-xs text-gray-300 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
            >
              Reinitialiser les filtres
            </button>
          </div>
        </div>
      )}
      {isAgencyPortal && (
        <div className="mb-6 rounded-xl border border-night-600 bg-night-800/30 p-4 grid gap-3 md:grid-cols-2">
          <p className="md:col-span-2 text-sm text-gray-500">
            Pilotage limite a votre agence (memes indicateurs que la vue plateforme, sans acces aux autres agences).
          </p>
          <label className="text-sm">
            <span className="text-gray-400">Severite signaux</span>
            <select
              value={adminDashboardFilters.severity}
              onChange={(e) => setAdminDashboardFilters((prev) => ({ ...prev, severity: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
            >
              <option value="all">Toutes</option>
              <option value="high">Critique</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Horizon baux</span>
            <select
              value={adminDashboardFilters.horizon}
              onChange={(e) => setAdminDashboardFilters((prev) => ({ ...prev, horizon: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
            >
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="365">12 mois</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setAdminDashboardFilters((prev) => ({
                  ...prev,
                  severity: 'all',
                  horizon: '90',
                  agenceId: scopedAgenceId || prev.agenceId,
                }))
              }
              className="rounded-lg border border-night-500 px-3 py-2 text-xs text-gray-300 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
            >
              Reinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {displayedKpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-xl border border-night-600 bg-night-800/50 p-5 hover:border-gold-500/20 transition-colors"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{k.label}</p>
            <p className="font-display text-2xl font-bold text-gold-400 mt-1">{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {isAdminDashboard ? (
        <div className="mb-10 rounded-xl border border-night-600 bg-night-800/25 p-5">
          <h2 className="font-semibold text-white mb-3">Centre d alertes actionnables</h2>
          {adminAlerts.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune alerte critique en ce moment.</p>
          ) : (
            <ul className="space-y-3">
              {adminAlerts.slice(0, 5).map((item) => (
                <li key={item.id} className="rounded-lg border border-night-600 bg-night-900/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <span className="text-[10px] uppercase text-gold-300">{item.severity}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.detail}</p>
                  <Link to={`/espace/${slug}/app/${item.ctaSection}`} className="mt-2 inline-flex text-xs text-sky-300 hover:text-sky-200">
                    {item.ctaLabel}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {isAdminDashboard ? (
        <div className="mb-10 rounded-xl border border-night-600 bg-night-800/25 p-5">
          <h2 className="font-semibold text-white mb-3">Actions du jour</h2>
          {adminActionsToday.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune action prioritaire detectee.</p>
          ) : (
            <ul className="space-y-2">
              {adminActionsToday.map((action) => (
                <li key={action.id} className="text-sm text-gray-300 flex items-start justify-between gap-3">
                  <span>{action.title}</span>
                  <Link to={`/espace/${slug}/app/${action.section}`} className="text-xs text-gold-300 hover:text-gold-200">
                    Ouvrir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {isAdminDashboard ? (
        <div className="mb-10 rounded-xl border border-night-600 bg-night-800/25 p-5">
          <h2 className="font-semibold text-white mb-3">Backlog SLA tickets</h2>
          <Link to={`/espace/${slug}/app/tickets`} className="text-xs text-sky-300 hover:text-sky-200">
            Ouvrir le backlog operationnel
          </Link>
        </div>
      ) : null}

      {isAdminDashboard ? (
        <div className="mb-10">
          <h2 className="font-semibold text-white mb-3">
            {isAgencyPortal ? 'Signaux agence' : 'Signaux plateforme'} ({filteredSignals.length})
          </h2>
          {filteredSignals.length === 0 ? (
            <p className="text-sm text-gray-500 rounded-xl border border-dashed border-night-600 px-4 py-6">
              Aucun signal pour les filtres selectionnes.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {filteredSignals.map((s, idx) => {
                const border =
                  s.severity === 'high'
                    ? 'border-l-rose-500'
                    : s.severity === 'medium'
                      ? 'border-l-amber-500'
                      : 'border-l-sky-500'
                return (
                  <div
                    key={`${s.label}-${idx}`}
                    className={`rounded-xl border border-night-600 bg-night-800/35 pl-3 border-l-4 ${border}`}
                  >
                    <div className="p-4">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">{s.label}</p>
                      <p className="mt-1 text-xl font-bold text-white">{s.value}</p>
                      <p className="mt-2 text-xs text-gray-500 leading-snug">{s.hint}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null}

      {isAdminDashboard ? (
        <div className="mb-10 rounded-xl border border-night-600 bg-night-800/25 overflow-hidden">
          <div className="px-5 py-3 border-b border-night-600 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-white text-sm">Prochaines echeances de baux ({filteredExpiring.length})</h2>
            <Link to={`/espace/${slug}/app/pilotage`} className="text-xs text-gold-400 hover:text-gold-300">
              Detail pilotage
            </Link>
          </div>
          {filteredExpiring.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500">Aucune echeance pour les filtres selectionnes.</p>
          ) : (
            <ul className="divide-y divide-night-600">
              {filteredExpiring.slice(0, 6).map((row) => (
                <li key={row.id} className="px-5 py-3 flex flex-wrap gap-3 text-sm text-gray-300">
                  <span className="font-medium text-white min-w-[8rem]">{row.bien}</span>
                  <span className="text-gray-500">Fin {row.dateFin}</span>
                  <span className={row.joursRestants <= 30 ? 'text-amber-400' : 'text-gray-400'}>
                    J-{row.joursRestants}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {slug === 'proprietaire' && ownerActions.length > 0 ? (
        <div className="mb-10 rounded-xl border border-night-600 bg-night-800/30 p-5">
          <h2 className="font-semibold text-white mb-4">Actions recommandees</h2>
          <ul className="space-y-3">
            {ownerActions.slice(0, 4).map((action) => (
              <li key={action.id} className="rounded-lg border border-night-600 bg-night-900/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{action.title}</p>
                  <span className="text-[10px] uppercase tracking-wide text-gold-300">{action.priority}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">{action.detail}</p>
                <Link to={`/espace/${slug}/app/${action.target}`} className="mt-2 inline-flex text-xs text-sky-300 hover:text-sky-200">
                  Ouvrir la section
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-xl border border-night-600 bg-night-800/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-night-600">
            <h2 className="font-semibold text-white">Activite recente</h2>
          </div>
          <ul className="divide-y divide-night-600">
            {feed.map((item, i) => (
              <li key={i} className="px-5 py-4 flex gap-4">
                <span className="text-xs text-gray-600 whitespace-nowrap w-20 shrink-0">{item.t}</span>
                <p className="text-sm text-gray-300">{item.msg}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
          <h2 className="font-semibold text-white mb-4">Acces rapide</h2>
          <ul className="space-y-2">
            {quick.slice(0, 5).map((item) => (
              <li key={item.path}>
                <Link
                  to={`/espace/${slug}/app/${item.path}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-night-700 hover:text-gold-300 transition-colors group"
                >
                  {item.label}
                  <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
