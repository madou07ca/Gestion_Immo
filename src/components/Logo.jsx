import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function LogoMark({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3d98e" />
          <stop offset="50%" stopColor="#e5b02d" />
          <stop offset="100%" stopColor="#c9971f" />
        </linearGradient>
        <linearGradient id="logoGoldSoft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ecc554" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a87619" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* Cadre arrondi premium */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="12"
        stroke="url(#logoGold)"
        strokeWidth="1.5"
        fill="url(#logoGoldSoft)"
      />
      {/* Maison stylisée */}
      <path
        d="M24 12L14 20v14h8v-8h4v8h8V20L24 12z"
        fill="url(#logoGold)"
        opacity="0.95"
      />
      {/* Lien / connexion (points reliés) */}
      <circle cx="34" cy="16" r="2.5" fill="#e5b02d" />
      <circle cx="38" cy="22" r="2" fill="#c9971f" />
      <path
        d="M34 18.5c2-1 3.5-1 4.5 0.5"
        stroke="#f3d98e"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function Logo({ compact = false }) {
  const iconClass = compact
    ? 'h-8 w-8 drop-shadow-[0_0_10px_rgba(229,176,45,0.2)]'
    : 'h-9 w-9 md:h-11 md:w-11 drop-shadow-[0_0_14px_rgba(229,176,45,0.28)]'

  return (
    <Link
      to="/"
      className={`group flex items-center outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 rounded-lg ${
        compact ? 'gap-2' : 'gap-2.5 md:gap-3'
      }`}
      aria-label="ImmoConnect_GN - Accueil"
    >
      <motion.div
        whileHover={{ scale: compact ? 1.04 : 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative shrink-0"
      >
        <LogoMark className={iconClass} />
      </motion.div>

      <div className="flex flex-col leading-none min-w-0">
        <span
          className={`font-display font-bold tracking-tight bg-gradient-to-r from-gold-50 via-gold-300 to-gold-500 bg-clip-text text-transparent ${
            compact ? 'text-base' : 'text-lg md:text-xl'
          }`}
        >
          ImmoConnect
        </span>
        <span className={`flex items-center gap-1.5 ${compact ? 'mt-0' : 'mt-0.5'}`}>
          <span className="inline-flex items-center rounded-md bg-gradient-to-r from-gold-500/20 to-gold-600/10 border border-gold-400/35 px-1.5 py-0.5 text-[10px] md:text-[11px] font-semibold text-gold-200 tabular-nums">
            _GN
          </span>
          {!compact && (
            <span className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wide hidden sm:inline">
              Conakry
            </span>
          )}
        </span>
      </div>
    </Link>
  )
}
