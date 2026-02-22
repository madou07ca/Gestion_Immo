import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const COOKIE_CONSENT_KEY = 'cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-night-800 border-t border-gold-500/30 shadow-lg"
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 text-sm">
            <p className="text-gray-300 flex-1">
              Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. En continuant, vous acceptez notre{' '}
              <Link to="/politique-confidentialite" className="text-gold-400 underline hover:no-underline">
                politique de confidentialité
              </Link>.
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                onClick={decline}
                className="px-4 py-2 rounded-lg border border-night-500 text-gray-400 hover:bg-night-600"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={accept}
                className="px-4 py-2 rounded-lg bg-gold-500 text-night-900 font-medium hover:bg-gold-400"
              >
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
