import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import { Shield, Target, Heart } from 'lucide-react'

const stats = [
  { value: '10+', label: 'Années d\'expérience' },
  { value: '150+', label: 'Biens gérés' },
  { value: '98%', label: 'Satisfaction clients' },
]

const commitments = [
  { icon: Shield, title: 'Transparence', text: 'Honoraires et processus clairement communiqués.' },
  { icon: Target, title: 'Réactivité', text: 'Réponse sous 24h et suivi personnalisé.' },
  { icon: Heart, title: 'Confidentialité', text: 'Vos données et transactions protégées.' },
]

export default function About() {
  return (
    <div>
      <Seo title="À propos" description="Découvrez Prestige & Gestion Immobilière : histoire, équipe, chiffres clés et engagements à Conakry." />
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 parallax-bg bg-night-800"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920)`,
          }}
        />
        <div className="absolute inset-0 bg-night-900/85" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
          >
            À propos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-gray-300"
          >
            Votre partenaire immobilier de confiance à Conakry.
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
              Prestige & Gestion Immobilière est née de la volonté d'offrir à Conakry et à la Guinée 
              un service immobilier haut de gamme : location de biens d'exception, gestion locative 
              rigoureuse et estimation transparente pour les propriétaires et investisseurs.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Notre équipe allie expertise locale et standards internationaux pour vous accompagner 
              en toute sérénité. Que vous soyez propriétaire ou locataire, nous mettons l'humain et 
              la qualité de service au cœur de notre métier.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">
            Chiffres clés
          </h2>
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
            Des valeurs qui guident chacune de nos actions.
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
