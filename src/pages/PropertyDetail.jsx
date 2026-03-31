import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import {
  MapPin,
  Maximize2,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Share2,
  Calendar,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { getPropertyBySlug, filterProperties } from '../data/properties'
import PropertyCard from '../components/PropertyCard'
import PropertyContactForm from '../components/PropertyContactForm'
import PropertyMapWrapper from '../components/PropertyMapWrapper'

export default function PropertyDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const property = getPropertyBySlug(slug)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Ce bien n'existe pas ou a été retiré.</p>
        <Link to="/nos-biens" className="text-gold-400 hover:underline">Retour aux biens</Link>
      </div>
    )
  }

  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200']
  const similar = filterProperties({ type: property.type, district: property.district })
    .filter((p) => p.id !== property.id)
    .slice(0, 3)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = encodeURIComponent(`${property.title} - ${property.priceLabel}`)
  const ogImage = images[0]
  const seoDescription = `${property.title} - ${property.priceLabel} - ${property.district}, ${property.city}. ${property.description?.slice(0, 150)}...`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Seo
        title={property.title}
        description={seoDescription}
        ogImage={ogImage}
        ogUrl={shareUrl}
        ogType="article"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6"
        >
          <ChevronLeft size={20} />
          Retour
        </button>

        {/* Galerie */}
        <div className="relative rounded-xl overflow-hidden bg-night-800 aspect-[16/10] mb-8">
          <img
            src={images[galleryIndex]}
            alt={`${property.title} - vue ${galleryIndex + 1}`}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setGalleryIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-night-900/80 flex items-center justify-center text-white hover:bg-gold-500"
                aria-label="Image précédente"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => setGalleryIndex((i) => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-night-900/80 flex items-center justify-center text-white hover:bg-gold-500"
                aria-label="Image suivante"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full ${i === galleryIndex ? 'bg-gold-500' : 'bg-white/50'}`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-1 rounded bg-gold-500/20 text-gold-400 text-sm font-medium capitalize">
                {property.type}
              </span>
              <span className="text-gray-500 text-sm">Ref. {property.reference}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {property.title}
            </h1>
            <p className="flex items-center gap-2 text-gray-400 mb-6">
              <MapPin size={18} />
              {property.district}, {property.city}
            </p>
            <p className="text-2xl font-semibold text-gold-400 mb-6">{property.priceLabel}</p>
            <p className="text-gray-300 leading-relaxed mb-6">{property.description}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              {property.surface > 0 && (
                <span className="flex items-center gap-2 text-gray-400">
                  <Maximize2 size={18} />
                  {property.surface} m²
                </span>
              )}
              {property.surfaceLand > 0 && (
                <span className="flex items-center gap-2 text-gray-400">
                  Terrain {property.surfaceLand} m²
                </span>
              )}
              {property.rooms > 0 && (
                <span className="flex items-center gap-2 text-gray-400">
                  <BedDouble size={18} />
                  {property.rooms} pièces
                  {property.bedrooms > 0 && ` • ${property.bedrooms} chambres`}
                </span>
              )}
              {property.floor != null && (
                <span className="text-gray-400">Étage {property.floor}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {property.features?.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 rounded-full bg-night-700 border border-night-600 text-gray-300 text-sm"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Localisation sur carte */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Localisation</h3>
              <PropertyMapWrapper singleProperty={property} height="18rem" showPopups={false} />
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-xl bg-night-800 border border-night-600 p-6">
              <h3 className="font-semibold text-white mb-4">Intéressé par ce bien ?</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(true)}
                  className="w-full py-3 rounded-lg bg-gold-500 text-night-900 font-semibold hover:bg-gold-400 flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Demander plus d'informations
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(true)}
                  className="w-full py-3 rounded-lg border border-gold-500 text-gold-400 font-medium hover:bg-gold-500/10 flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Planifier une visite
                </button>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`https://wa.me/224600000000?text=${shareText}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-lg border border-night-500 text-gray-300 hover:border-gold-500/50 flex items-center justify-center gap-1 text-sm"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: property.title,
                          text: property.priceLabel,
                          url: shareUrl,
                        })
                      } else {
                        navigator.clipboard?.writeText(shareUrl)
                      }
                    }}
                    className="flex-1 py-2 rounded-lg border border-night-500 text-gray-300 hover:border-gold-500/50 flex items-center justify-center gap-1 text-sm"
                  >
                    <Share2 size={18} />
                    Partager
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showContactForm && (
          <PropertyContactForm
            property={property}
            onClose={() => setShowContactForm(false)}
          />
        )}

        {similar.length > 0 && (
          <section className="mt-16 pt-12 border-t border-night-600">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Biens similaires</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  )
}
