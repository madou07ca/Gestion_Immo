import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import HeroCoverImage from '../components/HeroCoverImage'
import { HERO_UNSPLASH_SKYLINE, ogImageFromUnsplashBase } from '../lib/shareImages'
import { Shield, Target, Lock } from 'lucide-react'
import { HOME_TRUST_STATS } from '../data/homeContent'

const stats = HOME_TRUST_STATS

const commitments = [
  {
    icon: Shield,
    title: 'Clarté',
    text: 'Périmètre de la solution, accompagnement et facturation cadrés pour chaque structure partenaire.',
  },
  {
    icon: Target,
    title: 'Produit métier',
    text: 'Fonctionnalités pensées pour les flux des agences : parc, mandats, locataires, baux et vitrine en ligne.',
  },
  {
    icon: Lock,
    title: 'Données par agence',
    text: 'Chaque organisation travaille dans son espace : les dossiers d’une agence ne se mélangent pas avec ceux d’une autre.',
  },
]

export default function About() {
  return (
    <div>
      <Seo
        title="À propos"
        description="ImmoConnect_GN : l’éditeur de la plateforme de gestion immobilière pour agences en Guinée. Catalogue public, outil métier, engagements."
        ogImage={ogImageFromUnsplashBase(HERO_UNSPLASH_SKYLINE)}
        imageAlt="Immeubles et skyline — ImmoConnect_GN, plateforme immobilière"
      />
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden bg-night-800">
          <HeroCoverImage
            baseUrl={HERO_UNSPLASH_SKYLINE}
            alt="Perspective urbaine — ImmoConnect_GN"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-night-900/85" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
          >
            À propos d’ImmoConnect_GN
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-gray-300"
          >
            La plateforme qui permet aux agences immobilières de publier leurs annonces et piloter leur activité — avec un catalogue public pour les chercheurs de biens.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl font-bold text-white mb-6">Notre histoire et vision</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              ImmoConnect_GN est un projet guinéen qui répond à un constat simple : les agences ont besoin d’un
              outil unique pour structurer leurs mandats, leurs dossiers et leurs annonces, au lieu d’additionner
              tableurs, messageries et sites disparates. Nous bâtissons une plateforme web où chaque agence
              travaille dans son périmètre, tout en alimentant un catalogue public cohérent pour les
              visiteurs — notamment sur Conakry et la Grande Conakry.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Nous ne sommes pas une agence de courtage classique : nous sommes l’éditeur de l’outil. Les
              professionnels de terrain restent les agences partenaires ; notre rôle est de fournir un socle
              fiable (publication, suivi des baux, quittances, reporting, espaces sécurisés) et de l’enrichir
              avec les retours du terrain. L’estimation en ligne et le contact sur le site servent autant les
              particuliers que l’accompagnement des structures qui déploient la solution.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">
            En bref
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-8 text-sm">
            Chiffres d’ambiance : la valeur est dans l’usage collectif de la plateforme par les agences et leurs équipes.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {stats.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-night-700 border border-night-600"
              >
                <p className="text-4xl font-display font-bold text-gold-400">{item.value}</p>
                <p className="text-gray-400 mt-2">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white mb-4 text-center">
            Nos engagements
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-10">
            Ce que nous tenons lorsque nous faisons évoluer la plateforme et accompagnons les agences.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {commitments.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-night-800 border border-night-600 text-center"
              >
                <item.icon className="text-gold-400 w-10 h-10 mx-auto mb-3" />
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-2">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
