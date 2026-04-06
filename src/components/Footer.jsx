import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-night-800 border-t border-night-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo compact />
            </div>
            <p className="text-gray-400 text-sm">
              Location et gestion locative haut de gamme à Conakry. Votre partenaire de confiance.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-4">Coordonnées</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-gold-500 shrink-0" />
                Conakry, Guinée
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-500 shrink-0" />
                <a href="tel:+224600000000" className="hover:text-gold-400">+224 600 00 00 00</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-500 shrink-0" />
                <a href="mailto:contact@immo-connect-gn.gn" className="hover:text-gold-400">contact@immo-connect-gn.gn</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} className="text-gold-500 shrink-0" />
                <a href="https://wa.me/224600000000" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">WhatsApp</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                { path: '/', label: 'Accueil' },
                { path: '/nos-biens', label: 'Nos Biens' },
                { path: '/espace', label: 'Plateforme (espaces)' },
                { path: '/gestion-locative', label: 'Gestion locative' },
                { path: '/estimation', label: 'Estimation' },
                { path: '/a-propos', label: 'À propos' },
              ].map(({ path, label }) => (
                <li key={path}>
                  <Link to={path} className="text-gray-400 hover:text-gold-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-4">Mentions légales</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/mentions-legales" className="hover:text-gold-400">Mentions légales</Link>
              </li>
              <li>
                <Link to="/politique-confidentialite" className="hover:text-gold-400">Politique de confidentialité</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-night-600 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Immo-Connect_GN. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
