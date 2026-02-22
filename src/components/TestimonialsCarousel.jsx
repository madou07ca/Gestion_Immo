import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'M. Diallo',
    role: 'Propriétaire, Kaloum',
    text: 'Une gestion impeccable depuis 3 ans. Les loyers sont encaissés à temps, les états des lieux sont rigoureux. Je recommande vivement.',
  },
  {
    id: 2,
    name: 'Mme Camara',
    role: 'Investisseuse',
    text: 'J\'ai fait estimer mon immeuble avant mise en location. Équipe professionnelle et discrète. Résultat au rendez-vous.',
  },
  {
    id: 3,
    name: 'M. Bah',
    role: 'Locataire',
    text: 'J\'ai trouvé mon appartement en un rien de temps grâce aux filtres et à la réactivité de l\'agence. Très satisfait.',
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
          className="rounded-xl bg-night-700 border border-night-600 p-8 md:p-10"
        >
          <Quote className="text-gold-500/50 w-12 h-12 mb-4" />
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed italic">
            "{testimonials[index].text}"
          </p>
          <p className="mt-4 font-semibold text-gold-400">{testimonials[index].name}</p>
          <p className="text-sm text-gray-500">{testimonials[index].role}</p>
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
