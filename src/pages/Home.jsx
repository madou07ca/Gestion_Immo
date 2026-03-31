import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import { Home as HomeIcon, Key, Building2, FileCheck, Shield, Star, ChevronRight } from 'lucide-react'
import { getFeaturedProperties } from '../data/properties'
import PropertyCard from '../components/PropertyCard'
import QuickEstimationForm from '../components/QuickEstimationForm'
import TestimonialsCarousel from '../components/TestimonialsCarousel'

const services = [
  {
    icon: HomeIcon,
    title: 'Vente de biens d\'exception',
    description: 'Accompagnement personnalisé pour la vente de votre patrimoine immobilier.',
  },
  {
    icon: Key,
    title: 'Location haut de gamme',
    description: 'Sélection de biens premium pour locataires exigeants à Conakry et ailleurs.',
  },
  {
    icon: Building2,
    title: 'Gestion locative sur mesure',
    description: 'Encaissement des loyers, entretien, états des lieux et reporting transparent.',
  },
]

const pillars = [
  { icon: Shield, title: 'Expertise locale', text: 'Connaissance fine du marché de Conakry et des quartiers.' },
  { icon: FileCheck, title: 'Sélection rigoureuse', text: 'Biens et locataires sélectionnés selon des critères stricts.' },
  { icon: Star, title: 'Service personnalisé', text: 'Un interlocuteur dédié pour chaque propriétaire et locataire.' },
  { icon: Shield, title: 'Confidentialité assurée', text: 'Vos données et transactions restent strictement confidentielles.' },
]

export default function HomePage() {
  const featured = getFeaturedProperties()

  return (
    <div>
      <Seo title="Accueil" description="Immo-Connect_GN - Immobilier à Conakry. Location et gestion locative haut de gamme. Estimation gratuite et confidentielle." />
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 parallax-bg bg-night-900"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-900/80 via-night-900/60 to-night-900" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
          >
            Immo-Connect_GN - Immobilier à Conakry
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-xl md:text-2xl text-gray-300 mb-10"
          >
            Location et gestion de biens d'exception. Votre sérénité, notre priorité.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/nos-biens"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gold-500 text-night-900 font-semibold hover:bg-gold-400 transition-colors shadow-lg"
            >
              Voir nos biens
              <ChevronRight size={20} />
            </Link>
            <Link
              to="/estimation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-gold-500 text-gold-400 font-semibold hover:bg-gold-500/10 transition-colors"
            >
              Demander une estimation confidentielle
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center text-white mb-4"
          >
            Nos Services Premium
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-gray-400 max-w-2xl mx-auto mb-12"
          >
            Une offre complète pour propriétaires et investisseurs.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-night-700/50 border border-night-600 hover:border-gold-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400 mb-4 group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Biens en vedette */}
      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Biens en vedette
              </h2>
              <p className="text-gray-400">Une sélection de nos biens d'exception.</p>
            </div>
            <Link
              to="/nos-biens"
              className="inline-flex items-center gap-2 text-gold-400 font-medium hover:text-gold-300"
            >
              Voir tous les biens
              <ChevronRight size={18} />
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 6).map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center text-white mb-4"
          >
            Pourquoi nous choisir ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-gray-400 max-w-2xl mx-auto mb-12"
          >
            Quatre piliers au cœur de notre engagement.
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-night-700/30 border border-night-600"
              >
                <div className="w-14 h-14 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4 text-gold-400">
                  <item.icon size={28} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire estimation rapide */}
      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              Estimation rapide
            </h2>
            <p className="text-gray-400">
              En 30 secondes, recevez une première estimation gratuite et confidentielle.
            </p>
          </motion.div>
          <QuickEstimationForm />
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center text-white mb-4"
          >
            Témoignages
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-gray-400 mb-12"
          >
            Ce que disent nos propriétaires et investisseurs.
          </motion.p>
          <TestimonialsCarousel />
        </div>
      </section>
    </div>
  )
}
