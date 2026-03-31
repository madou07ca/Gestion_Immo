import { motion } from 'framer-motion'

export default function PolitiqueConfidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-white mb-8">Politique de confidentialité</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <p>
            Immo-Connect_GN s'engage à protéger la vie privée des utilisateurs de son site. 
            Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles.
          </p>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">1. Données collectées</h2>
            <p>
              Nous pouvons collecter : nom, prénom, adresse email, numéro de téléphone, adresse ou quartier, 
              type de bien, surface, message libre, et toute donnée que vous nous communiquez volontairement 
              via les formulaires (estimation, gestion locative, contact).
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">2. Finalités</h2>
            <p>
              Vos données sont utilisées uniquement pour : traiter vos demandes (estimation, visite, gestion locative), 
              vous recontacter, améliorer nos services et, le cas échéant, vous envoyer des informations 
              relatives à nos offres (avec votre consentement).
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">3. Conservation et sécurité</h2>
            <p>
              Les données sont conservées pendant la durée nécessaire à la relation commerciale et aux obligations 
              légales. Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos 
              données contre tout accès non autorisé ou perte.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">4. Vos droits</h2>
            <p>
              Vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition au traitement 
              de vos données. Pour exercer ces droits ou pour toute question : contact@immo-connect-gn.gn
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">5. Cookies</h2>
            <p>
              Le site utilise des cookies pour le bon fonctionnement (session, préférences) et éventuellement 
              l'analyse d'audience. Vous pouvez refuser les cookies non essentiels via le bandeau d'information 
              ou les paramètres de votre navigateur.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-2">6. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. La date de dernière mise à jour sera indiquée en bas de page. 
              Nous vous invitons à la consulter régulièrement.
            </p>
          </section>
          <p className="text-gray-500 text-sm mt-12">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
