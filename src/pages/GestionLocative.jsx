import { useState } from 'react'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import HeroCoverImage from '../components/HeroCoverImage'
import { HERO_UNSPLASH_BUILDING, ogImageFromUnsplashBase } from '../lib/shareImages'
import {
  Wallet,
  FileCheck,
  Wrench,
  BarChart3,
  Shield,
  Clock,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import GestionLocativeForm from '../components/GestionLocativeForm'

const steps = [
  { title: 'Création du périmètre agence', desc: 'Paramétrage de l\'organisation, des utilisateurs et des droits d\'accès.' },
  { title: 'Saisie ou import du parc', desc: 'Biens, mandants, locataires et baux centralisés dans la même base.' },
  { title: 'Publication sur le catalogue', desc: 'Les annonces choisies alimentent la vitrine publique du site.' },
  { title: 'Pilotage au quotidien', desc: 'Quittances, relances, états des lieux et reporting selon vos processus.' },
]

const faq = [
  {
    q: 'La plateforme remplace-t-elle un logiciel métier complet ?',
    a: 'ImmoConnect_GN couvre publication, dossiers locataires/propriétaires, baux et opérations courantes ; le périmètre exact dépend des modules activés pour votre agence.',
  },
  {
    q: 'Les données d\'une agence sont-elles visibles par les autres ?',
    a: 'Non : chaque structure travaille dans son périmètre. Le catalogue public n\'expose que les annonces que vous publiez.',
  },
  {
    q: 'Comment obtenir un accès ou une démonstration ?',
    a: 'Utilisez le formulaire ci-dessous ou les coordonnées du site : nous revenons vers vous pour cadrer un déploiement ou une prise en main.',
  },
]

export default function GestionLocative() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div>
      <Seo
        title="Pour les agences"
        description="Plateforme de gestion immobilière pour agences : publier les annonces, piloter mandants, locataires et baux, avec catalogue public. ImmoConnect_GN."
        ogImage={ogImageFromUnsplashBase(HERO_UNSPLASH_BUILDING)}
        imageAlt="Pilotage immobilier pour agences — ImmoConnect_GN"
      />
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden bg-night-800">
          <HeroCoverImage
            baseUrl={HERO_UNSPLASH_BUILDING}
            alt="Gestion de patrimoine immobilier — ImmoConnect_GN"
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
            Une plateforme pour votre agence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-gray-300"
          >
            Publiez vos annonces, centralisez mandants, locataires et baux, et pilotez votre activité depuis des espaces sécurisés.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-white mb-4 text-center"
          >
            Modules au service des équipes
          </motion.h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Les briques pensées pour structurer le travail au sein de chaque agence et donner de la visibilité sur le portefeuille.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, title: 'Loyers & quittances', text: 'Suivi des encaissements, échéances et pièces associées aux dossiers.' },
              { icon: Wrench, title: 'Opérations & incidents', text: 'Suivi des demandes, intervenants et historique par bien ou bail.' },
              { icon: FileCheck, title: 'États des lieux', text: 'Constats et étapes liées aux entrées et sorties de location.' },
              { icon: BarChart3, title: 'Pilotage & reporting', text: 'Indicateurs et synthèses pour la direction et les gestionnaires.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-night-800 border border-night-600"
              >
                <item.icon className="text-gold-400 w-10 h-10 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">
            Déployer la plateforme
          </h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 items-start"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white mb-4 text-center">
            Ce que votre structure gagne
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            {[
              { icon: Clock, title: 'Moins de friction', text: 'Une seule base pour les équipes : moins de ressaisie et de fichiers éparpillés.' },
              { icon: Shield, title: 'Contrôle des accès', text: 'Répartition des rôles au sein de l\'agence selon vos règles internes.' },
              { icon: CheckCircle2, title: 'Alignement marché', text: 'Le catalogue reflète ce que vous publiez ; les prospects voient des annonces à jour.' },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-6 rounded-xl bg-night-800 border border-night-600"
              >
                <item.icon className="text-gold-400 w-10 h-10 mx-auto mb-3" />
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white mb-6 text-center">
            FAQ — solution agences
          </h2>
          <div className="space-y-2">
            {faq.map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-night-700 border border-night-600 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left text-white font-medium"
                >
                  {item.q}
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-gray-400 text-sm">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Contact &amp; mise en route
            </h2>
            <p className="text-gray-400">
              Décrivez votre agence ou votre besoin : nous revenons vers vous pour une démo ou un déploiement.
            </p>
          </motion.div>
          <GestionLocativeForm />
        </div>
      </section>
    </div>
  )
}
