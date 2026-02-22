import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, List, SlidersHorizontal } from 'lucide-react'
import Seo from '../components/Seo'
import PropertyMapWrapper from '../components/PropertyMapWrapper'
import { propertyTypes, districts, filterProperties } from '../data/properties'
import PropertyCard from '../components/PropertyCard'

const sortOptions = [
  { value: 'date', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'surface-desc', label: 'Surface décroissante' },
]

export default function Properties() {
  const [view, setView] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    minSurface: '',
    rooms: '',
    sort: 'date',
  })

  const filtered = useMemo(() => {
    let list = filterProperties({
      type: filters.type || undefined,
      district: filters.district || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minSurface: filters.minSurface ? Number(filters.minSurface) : undefined,
      rooms: filters.rooms ? Number(filters.rooms) : undefined,
    })
    if (filters.sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (filters.sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (filters.sort === 'surface-desc') list = [...list].sort((a, b) => (b.surface || b.surfaceLand || 0) - (a.surface || a.surfaceLand || 0))
    return list
  }, [filters])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Seo title="Nos Biens" description="Recherchez parmi nos appartements, maisons, magasins, immeubles et terrains à Conakry. Filtres avancés et fiches détaillées." />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
          Nos Biens
        </h1>
        <p className="text-gray-400">
          Recherchez parmi nos appartements, maisons, magasins, immeubles et terrains à Conakry.
        </p>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-gray-300 hover:border-gold-500/50 md:hidden"
        >
          <SlidersHorizontal size={18} />
          Filtres
        </button>
        <div
          className={`rounded-xl bg-night-800 border border-night-600 p-4 md:p-6 ${
            showFilters ? 'block' : 'hidden'
          } md:block`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-night-700 border border-night-500 text-white text-sm"
              >
                <option value="">Tous</option>
                {propertyTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quartier</label>
              <select
                value={filters.district}
                onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-night-700 border border-night-500 text-white text-sm"
              >
                <option value="">Tous</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Budget min (GNF)</label>
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-night-700 border border-night-500 text-white text-sm placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Budget max (GNF)</label>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                placeholder="—"
                className="w-full px-3 py-2 rounded-lg bg-night-700 border border-night-500 text-white text-sm placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Surface min (m²)</label>
              <input
                type="number"
                min="0"
                value={filters.minSurface}
                onChange={(e) => setFilters((f) => ({ ...f, minSurface: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-night-700 border border-night-500 text-white text-sm placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tri</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-night-700 border border-night-500 text-white text-sm"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barre résultats + vue */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="text-gray-400">
          <span className="text-white font-medium">{filtered.length}</span> bien{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg ${view === 'grid' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400 hover:text-white'}`}
            aria-label="Vue grille"
          >
            <Grid3X3 size={20} />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`p-2 rounded-lg ${view === 'list' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400 hover:text-white'}`}
            aria-label="Vue liste"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Liste des biens */}
      <div
        className={
          view === 'grid'
            ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
        }
      >
        {filtered.length === 0 ? (
          <p className="text-gray-400 col-span-full py-12 text-center">
            Aucun bien ne correspond à vos critères. Modifiez les filtres.
          </p>
        ) : (
          filtered.map((property, i) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={view === 'list' ? 'flex gap-4 rounded-xl bg-night-700 border border-night-600 overflow-hidden' : ''}
            >
              <PropertyCard property={property} listView={view === 'list'} />
            </motion.div>
          ))
        )}
      </div>

      {/* Carte des biens (chargée après la liste pour ne pas bloquer l'affichage) */}
      <div className="mt-8">
        <PropertyMapWrapper properties={filtered} height="20rem" showPopups={true} />
      </div>
    </div>
  )
}
