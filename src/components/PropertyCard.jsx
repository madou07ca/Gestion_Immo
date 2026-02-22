import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Maximize2, BedDouble } from 'lucide-react'

export default function PropertyCard({ property, listView }) {
  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
  const url = `/nos-biens/${property.slug}`

  if (listView) {
    return (
      <motion.article
        whileHover={{ y: -2 }}
        className="group flex-1 flex min-w-0"
      >
        <Link to={url} className="flex flex-col sm:flex-row w-full">
          <div className="relative w-full sm:w-64 h-48 sm:h-auto sm:min-h-[180px] shrink-0 overflow-hidden">
            <img
              src={image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="p-4 flex-1 min-w-0">
            <span className="text-xs text-gold-400 font-medium capitalize">{property.type}</span>
            <h3 className="font-semibold text-white mt-1 line-clamp-1 group-hover:text-gold-300">{property.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{property.district}, {property.city}</p>
            <p className="text-gold-400 font-medium mt-2">{property.priceLabel}</p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{property.description}</p>
          </div>
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group rounded-xl overflow-hidden bg-night-700 border border-night-600 hover:border-gold-500/40 transition-all shadow-lg"
    >
      <Link to={url} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-night-900/80 text-gold-400 text-xs font-medium capitalize">
            {property.type}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <span className="text-white font-semibold text-lg drop-shadow-lg">
              {property.priceLabel}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-gold-300 transition-colors">
            {property.title}
          </h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {property.district}, {property.city}
            </span>
            {property.surface > 0 && (
              <span className="flex items-center gap-1">
                <Maximize2 size={14} />
                {property.surface} m²
              </span>
            )}
            {property.rooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble size={14} />
                {property.rooms} pièces
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{property.description}</p>
          <span className="inline-flex items-center gap-1 mt-3 text-gold-400 text-sm font-medium group-hover:gap-2 transition-all">
            Voir le bien
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
