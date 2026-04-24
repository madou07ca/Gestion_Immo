import { useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { Menu, ArrowLeft, Sparkles, PanelLeftClose, PanelLeft } from 'lucide-react'
import { espacePortals } from '../../data/espacePortals'
import { portalAppMenus } from '../../data/portalAppMenus'
import { clearAuthSession, getAuthSession, isRoleAuthorized } from '../../lib/authSession'

export default function PortalShell() {
  const { slug } = useParams()
  const portal = espacePortals[slug]
  const menu = portalAppMenus[slug]
  const [mobileNav, setMobileNav] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const session = getAuthSession()

  if (!portal || !menu) {
    return (
      <div className="p-8 text-center text-gray-400">
        Espace inconnu. <Link to="/espace" className="text-gold-400">Retour</Link>
      </div>
    )
  }

  if (!isRoleAuthorized(slug)) {
    return (
      <div className="p-8 text-center text-gray-300">
        <p className="mb-3">Acces refuse. Connectez-vous a l espace {slug}.</p>
        <Link to={`/espace/${slug}`} className="text-gold-400 hover:underline">Retour a la connexion</Link>
      </div>
    )
  }

  const base = `/espace/${slug}/app`

  return (
    <div className="flex min-h-[calc(100vh-5rem)] relative">
      {mobileNav && (
        <button
          type="button"
          className="fixed inset-0 bg-night-900/70 z-40 md:hidden"
          aria-label="Fermer"
          onClick={() => setMobileNav(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 md:top-20 left-0 z-50 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] border-r border-night-600 bg-night-800/95 backdrop-blur-md flex flex-col transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${mobileNav ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className={`p-4 border-b border-night-600 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link to={`/espace/${slug}`} className="text-xs text-gray-500 hover:text-gold-400 flex items-center gap-1 truncate">
              <ArrowLeft size={14} />
              Présentation
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:bg-night-700 hover:text-gold-400"
            aria-label="Toggle menu"
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {menu.map((item) => {
            const Icon = item.icon
            const to = item.path ? `${base}/${item.path}` : base
            return (
              <NavLink
                key={item.path || 'index'}
                to={to}
                end={item.path === ''}
                onClick={() => setMobileNav(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                      : 'text-gray-400 hover:bg-night-700 hover:text-gray-200 border border-transparent'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0 opacity-90" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-night-600">
            <div className="rounded-lg bg-gold-500/10 border border-gold-500/20 px-3 py-2 text-[10px] text-gold-200/90 flex items-start gap-2">
              <Sparkles size={14} className="shrink-0 mt-0.5 text-gold-400" />
              <span>Connecte: {session?.name || session?.email || 'utilisateur'}.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAuthSession()
                window.location.href = `/espace/${slug}`
              }}
              className="mt-2 w-full rounded-lg border border-night-600 px-3 py-2 text-xs text-gray-300 hover:border-gold-500/40"
            >
              Se deconnecter
            </button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-16 md:top-20 z-30 flex items-center gap-3 px-4 py-3 border-b border-night-600 bg-night-900/90 backdrop-blur-md md:hidden">
          <button type="button" onClick={() => setMobileNav(true)} className="p-2 rounded-lg text-gray-300 hover:bg-night-800" aria-label="Menu">
            <Menu size={22} />
          </button>
          <span className="font-display font-semibold text-white truncate">{portal.title}</span>
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
