import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { espaceList } from '../data/espacePortals'

export default function PlatformMenu({ mobile = false, onNavigate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const isActive =
    location.pathname.startsWith('/espace') && location.pathname !== '/espace'

  if (mobile) {
    return (
      <div className="border-t border-night-600 pt-3 mt-2">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gold-500/80 mb-2">
          Plateforme
        </p>
        <Link
          to="/espace"
          onClick={onNavigate}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm ${
            location.pathname === '/espace'
              ? 'bg-gold-500/20 text-gold-400'
              : 'text-gray-300 hover:bg-night-600'
          }`}
        >
          <LayoutGrid size={18} />
          Vue d’ensemble
        </Link>
        {espaceList.map((p) => {
          const Icon = p.icon
          const active = location.pathname === `/espace/${p.slug}`
          return (
            <Link
              key={p.slug}
              to={`/espace/${p.slug}`}
              onClick={onNavigate}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm ${
                active ? 'bg-gold-500/20 text-gold-400' : 'text-gray-300 hover:bg-night-600'
              }`}
            >
              <Icon size={18} />
              {p.title.replace('Espace ', '')}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors py-2 ${
          isActive || open ? 'text-gold-400' : 'text-gray-300 hover:text-gold-300'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Plateforme
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            onMouseLeave={() => setOpen(false)}
            className="absolute right-0 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 top-full pt-2 z-[60] min-w-[280px] max-w-[calc(100vw-1rem)]"
          >
            <div className="rounded-xl border border-night-500 bg-night-800/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
              <Link
                to="/espace"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gold-300 hover:bg-gold-500/10 border-b border-night-600 transition-colors"
              >
                <LayoutGrid size={20} className="text-gold-400 shrink-0" />
                <span>
                  <span className="font-semibold block">Vue d’ensemble</span>
                  <span className="text-xs text-gray-500">Les 4 espaces de la plateforme</span>
                </span>
              </Link>
              {espaceList.map((p) => {
                const Icon = p.icon
                return (
                  <Link
                    key={p.slug}
                    to={`/espace/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-night-700 hover:text-white border-b border-night-700/80 last:border-0 transition-colors"
                  >
                    <Icon size={20} className="text-gold-500/90 mt-0.5 shrink-0" />
                    <span>
                      <span className="font-medium text-gray-200 block">{p.title}</span>
                      <span className="text-xs text-gray-500 leading-snug">{p.tagline}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
