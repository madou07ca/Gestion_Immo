import { useEffect } from 'react'
import { getSiteOrigin } from '../lib/siteUrl'

const SCRIPT_ID = 'jsonld-home-organization'

export default function HomeJsonLd() {
  useEffect(() => {
    const origin = getSiteOrigin() || (typeof window !== 'undefined' ? window.location.origin : '')
    const payload = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'ImmoConnect_GN',
          url: origin || undefined,
          description:
            'Plateforme de gestion immobilière pour agences : publication, pilotage du parc, baux et opérations. Catalogue public des annonces.',
          areaServed: {
            '@type': 'Country',
            name: 'Guinée',
          },
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${origin}/#platform`,
          name: 'ImmoConnect_GN',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description:
            'Outil métier pour agences immobilières : biens, mandats, locataires, baux, quittances et vitrine en ligne.',
          provider: { '@id': `${origin}/#organization` },
          url: origin || undefined,
        },
      ],
    }

    let el = document.getElementById(SCRIPT_ID)
    if (!el) {
      el = document.createElement('script')
      el.id = SCRIPT_ID
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(payload)

    return () => {
      document.getElementById(SCRIPT_ID)?.remove()
    }
  }, [])

  return null
}
