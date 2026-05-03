import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { propertyCardImageAttrs } from '../lib/responsiveImages'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'

export default function HomeParcStrip({ properties }) {
  const slice = (properties || []).filter((p) => p?.slug).slice(0, 4)
  if (slice.length === 0) return null

  return (
    <section className="border-y border-night-600 bg-night-950/90 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-white">Aperçu du catalogue</h2>
          <p className="text-sm text-gray-300 mt-1">Annonces publiées par les agences sur la plateforme.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {slice.map((property, i) => {
            const raw = property.images?.[0] || FALLBACK_IMG
            const img = propertyCardImageAttrs(raw)
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/nos-biens/${property.slug}`}
                  className="group block relative aspect-[4/3] rounded-xl overflow-hidden border border-night-600 hover:border-gold-500/40 transition-colors"
                >
                  <img
                    {...img}
                    alt={`Aperçu — ${property.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-gold-400/90 capitalize">{property.type}</p>
                    <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-gold-200 transition-colors">
                      {property.title}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
