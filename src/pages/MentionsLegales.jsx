import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import { DEFAULT_OG_IMAGE_URL } from '../lib/shareImages'

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Seo
        title="Mentions légales"
        description="Mentions légales du site ImmoConnect_GN : éditeur, hébergement, propriété intellectuelle et contact."
        ogImage={DEFAULT_OG_IMAGE_URL}
        imageAlt="ImmoConnect_GN — mentions légales"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-white mb-8">Mentions légales</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">1. Éditeur du site</h2>
            <p>
              Le site est édité par ImmoConnect_GN (ou la raison sociale de votre structure).
              Siège : Conakry, Guinée.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">2. Hébergement</h2>
            <p>
              Le site est hébergé par [nom de l'hébergeur]. Pour toute question relative à l'hébergement, 
              contactez [coordonnées hébergeur].
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus (textes, images, logos, structure) est protégé par le droit d'auteur 
              et appartient à ImmoConnect_GN ou à ses partenaires. Toute reproduction 
              non autorisée est interdite.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">4. Données personnelles</h2>
            <p>
              Les données collectées via les formulaires sont traitées conformément à notre politique 
              de confidentialité et aux réglementations en vigueur. Vous disposez d'un droit d'accès, 
              de rectification et d'opposition.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">5. Cookies</h2>
            <p>
              Le site peut utiliser des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
              Vous pouvez gérer vos préférences via le bandeau cookies ou les paramètres de votre navigateur.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">6. Contact</h2>
            <p>
              Pour toute question relative aux mentions légales : contact@immo-connect-gn.gn
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
