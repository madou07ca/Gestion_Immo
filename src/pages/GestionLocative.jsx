import { useState } from 'react'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
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
  { title: 'Mise en location', desc: 'Évaluation du bien, fixation du loyer, mise en annonce.' },
  { title: 'Sélection du locataire', desc: 'Visites, vérifications, dossier locataire.' },
  { title: 'Signature', desc: 'Contrat, état des lieux d\'entrée, remise des clés.' },
  { title: 'Gestion quotidienne', desc: 'Encaissement des loyers, entretien, relation locataire.' },
]

const faq = [
  {
    q: 'Comment sont sélectionnés les locataires ?',
    a: 'Nous vérifions les revenus, les garanties et les références des candidats pour limiter les impayés et les litiges.',
  },
  {
    q: 'Quels frais pour la gestion locative ?',
    a: 'Nos honoraires sont communiqués sur devis personnalisé selon le type de bien et les prestations choisies.',
  },
  {
    q: 'Puis-je récupérer la gestion de mon bien plus tard ?',
    a: 'Oui. Le contrat de mandat de gestion peut être résilié dans le respect des délais prévus au contrat.',
  },
]

export default function GestionLocative() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div>
      <Seo title="Gestion locative" description="Confiez la gestion de vos biens à des professionnels. Encaissement des loyers, entretien, états des lieux, reporting. Devenir propriétaire géré." />
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
            Gestion locative
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-gray-300"
          >
            Confiez la gestion de vos biens à des professionnels. Sérénité et transparence.
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
            Notre offre de gestion
          </motion.h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Encaissement des loyers, gestion des incidents, états des lieux, reporting : nous prenons en charge l'essentiel pour vous.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, title: 'Encaissement des loyers', text: 'Paiements sécurisés et suivi des échéances.' },
              { icon: Wrench, title: 'Gestion des incidents', text: 'Entretien, dépannages, relation avec les prestataires.' },
              { icon: FileCheck, title: 'États des lieux', text: 'Entrée et sortie, constats contradictoires.' },
              { icon: BarChart3, title: 'Reporting', text: 'Comptes rendus réguliers et transparence.' },
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
            Les étapes du processus
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
            Avantages pour le propriétaire
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            {[
              { icon: Clock, title: 'Gain de temps', text: 'Plus de gestion des visites, des litiges ou des relances.' },
              { icon: Shield, title: 'Sécurité', text: 'Sélection des locataires et suivi des paiements.' },
              { icon: CheckCircle2, title: 'Transparence', text: 'Reporting clair et comptabilité à jour.' },
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
            FAQ Gestion locative
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
              Devenir propriétaire géré
            </h2>
            <p className="text-gray-400">
              Remplissez le formulaire ci-dessous. Nous vous recontactons sous 24h.
            </p>
          </motion.div>
          <GestionLocativeForm />
        </div>
      </section>
    </div>
  )
}
