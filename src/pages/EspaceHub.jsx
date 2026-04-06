import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Seo from '../components/Seo'
import { espaceList } from '../data/espacePortals'

export default function EspaceHub() {
  return (
    <div className="relative overflow-hidden">
      <Seo
        title="Plateforme"
        description="Immo-Connect_GN : espaces connectés pour locataires, propriétaires, agences et gestionnaires."
      />

      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(229,176,45,0.15),transparent)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-medium text-gold-300 mb-6"
          >
            <Sparkles size={14} />
            Plateforme Immo-Connect_GN
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Un écosystème pour tout l’immobilier
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Quatre espaces dédiés pour connecter locataires, propriétaires, agences et équipes de gestion.
            Une vision unifiée, des parcours sur mesure.
          </motion.p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-5">
          {espaceList.map((portal, i) => {
            const Icon = portal.icon
            return (
              <motion.div
                key={portal.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <Link
                  to={`/espace/${portal.slug}`}
                  className={`group relative flex flex-col h-full rounded-2xl border ${portal.borderAccent} bg-gradient-to-br ${portal.accent} p-8 hover:border-gold-500/40 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(229,176,45,0.25)]`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="rounded-xl bg-night-900/60 p-3 border border-white/5">
                      <Icon className="w-8 h-8 text-gold-400" strokeWidth={1.5} />
                    </div>
                    <span className="rounded-full bg-night-900/80 px-3 py-1 text-xs text-gray-400 border border-night-600">
                      Portail dédié
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-gold-200 transition-colors">
                    {portal.title}
                  </h2>
                  <p className="text-gold-200/80 text-sm font-medium mb-3">{portal.tagline}</p>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-6">{portal.description}</p>
                  <span className="inline-flex items-center gap-2 text-gold-400 text-sm font-semibold group-hover:gap-3 transition-all">
                    Découvrir l’espace
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
