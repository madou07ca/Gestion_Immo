import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

const navItems = [
  { to: '/', label: 'Accueil' },
  { to: '/nos-biens', label: 'Nos Biens' },
  { to: '/gestion-locative', label: 'Gestion locative' },
  { to: '/estimation', label: 'Estimation' },
  { to: '/a-propos', label: 'À propos' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-night-900/95 backdrop-blur-md border-b border-night-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'text-gold-400'
                    : 'text-gray-300 hover:text-gold-300'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="md:hidden p-2 text-gray-300 hover:text-gold-400"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-night-800 border-t border-night-600"
          >
            <nav className="flex flex-col py-4 px-4 gap-2">
              {navItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`py-2 px-3 rounded-lg text-sm font-medium ${
                    location.pathname === to
                      ? 'bg-gold-500/20 text-gold-400'
                      : 'text-gray-300 hover:bg-night-600'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
