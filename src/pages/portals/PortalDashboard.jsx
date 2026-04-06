import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Bell } from 'lucide-react'
import { espacePortals } from '../../data/espacePortals'
import { portalAppMenus } from '../../data/portalAppMenus'
import { kpiBySlug, activityFeed } from '../../data/portalMockData'

export default function PortalDashboard() {
  const { slug } = useParams()
  const portal = espacePortals[slug]
  const menu = portalAppMenus[slug]
  const kpis = kpiBySlug[slug] || []
  const feed = activityFeed[slug] || []
  const quick = menu?.filter((m) => m.path) || []

  if (!portal) return null

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenue sur votre espace {portal.title.replace('Espace ', '').toLowerCase()}.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-night-600 px-4 py-2 text-sm text-gray-300 hover:border-gold-500/30 hover:text-gold-300 transition-colors self-start"
        >
          <Bell size={18} />
          Notifications
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {kpis.map((k, i) => (
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
