import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'I. Sow',
    role: 'Directrice d\'agence, Kaloum',
    text: 'On a arrêté les fichiers Excel dispersés : mandats, quittances et annonces sont au même endroit. Les équipes ont gagné un temps fou sur le suivi des dossiers.',
  },
  {
    id: 2,
    name: 'M. Condé',
    role: 'Gérant, réseau immobilier',
    text: 'La vitrine publique tire nos annonces depuis la plateforme — plus de double saisie entre l’outil interne et le site. Le catalogue reflète ce qu’on publie réellement.',
  },
  {
    id: 3,
    name: 'Mme Barry',
    role: 'Responsable exploitation',
    text: 'Avoir un périmètre par agence avec des accès adaptés rassure direction et mandants. On sait qui fait quoi sur quel bien.',
  },
]

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={testimonials[index].id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-night-800 border border-night-500 p-8 md:p-10 shadow-lg shadow-black/20"
        >
          <Quote className="text-gold-400/70 w-12 h-12 mb-4" />
          <p className="text-gray-100 text-lg md:text-xl leading-relaxed italic">
            "{testimonials[index].text}"
          </p>
          <p className="mt-4 font-semibold text-gold-400">{testimonials[index].name}</p>
          <p className="text-sm text-gray-400">{testimonials[index].role}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-2 mt-6">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
          className="p-2 rounded-full border border-night-500 text-gray-400 hover:text-gold-400 hover:border-gold-500 transition-colors"
          aria-label="Témoignage précédent"
        >
          <ChevronLeft size={20} />
        </button>
        {testimonials.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === index ? 'bg-gold-500' : 'bg-night-500 hover:bg-night-400'
            }`}
            aria-label={`Témoignage ${i + 1}`}
          />
        ))}
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
          className="p-2 rounded-full border border-night-500 text-gray-400 hover:text-gold-400 hover:border-gold-500 transition-colors"
          aria-label="Témoignage suivant"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
