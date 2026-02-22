import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import EstimationForm from '../components/EstimationForm'
import { Shield } from 'lucide-react'

export default function Estimation() {
  return (
    <div>
      <Seo title="Estimation gratuite" description="Demandez une estimation gratuite et confidentielle de votre bien. Sans engagement. Réponse sous 48h." />
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 parallax-bg bg-night-800"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920)`,
          }}
        />
        <div className="absolute inset-0 bg-night-900/85" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Estimation gratuite et confidentielle
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-gray-300"
          >
            Faites estimer votre bien par nos experts. Sans engagement.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 p-6 rounded-xl bg-night-800 border border-night-600 mb-10"
          >
            <Shield className="text-gold-400 w-10 h-10 shrink-0" />
            <div>
              <h2 className="font-semibold text-white mb-2">Confidentialité et gratuité</h2>
              <p className="text-gray-400 text-sm">
                Votre demande est traitée de manière strictement confidentielle. L'estimation est gratuite et sans engagement. 
                Nous ne transmettons vos données à aucun tiers à des fins commerciales.
              </p>
            </div>
          </motion.div>

          <EstimationForm />
        </div>
      </section>
    </div>
  )
}
