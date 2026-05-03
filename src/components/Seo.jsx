import { useEffect } from 'react'
import { toAbsoluteUrl } from '../lib/siteUrl'
import { DEFAULT_OG_IMAGE_URL } from '../lib/shareImages'

const SITE_NAME = 'ImmoConnect_GN'

function setMeta(attr, key, content) {
  if (content === undefined || content === null || content === '') return
  const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', String(content))
}

function removeMeta(attr, key) {
  const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`
  document.querySelector(selector)?.remove()
}

function setCanonical(href) {
  if (!href) return
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/**
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.ogImage] — URL absolue ou relative de l’image de partage
 * @param {string} [props.ogUrl] — URL canonique de la page (défaut : URL courante)
 * @param {string} [props.ogType] — ex. website | article
 * @param {string} [props.imageAlt] — twitter:image:alt / accessibilité sociale
 * @param {boolean} [props.noIndex] — si true, meta robots noindex
 */
export default function Seo({
  title,
  description,
  ogImage,
  ogUrl,
  ogType = 'website',
  imageAlt,
  noIndex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME} Conakry` : `${SITE_NAME} - Immobilier à Conakry`
    document.title = fullTitle

    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      if (description) metaDesc.setAttribute('content', description)
    }

    const pageUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href.split('#')[0] : '')
    const absolutePageUrl = toAbsoluteUrl(pageUrl) || pageUrl

    const finalOgImage = ogImage
      ? (() => {
          const abs = toAbsoluteUrl(ogImage)
          return abs.startsWith('http') ? abs : DEFAULT_OG_IMAGE_URL
        })()
      : DEFAULT_OG_IMAGE_URL

    setCanonical(absolutePageUrl)

    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description || '')
    setMeta('property', 'og:type', ogType)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'fr_FR')
    setMeta('property', 'og:url', absolutePageUrl)
    setMeta('property', 'og:image', finalOgImage)

    const cardType = finalOgImage ? 'summary_large_image' : 'summary'
    setMeta('name', 'twitter:card', cardType)
    setMeta('name', 'twitter:title', fullTitle)
    if (description) setMeta('name', 'twitter:description', description)
    if (finalOgImage) setMeta('name', 'twitter:image', finalOgImage)
    if (imageAlt) setMeta('name', 'twitter:image:alt', imageAlt)
    else removeMeta('name', 'twitter:image:alt')

    if (noIndex) {
      setMeta('name', 'robots', 'noindex, nofollow')
    } else {
      removeMeta('name', 'robots')
    }
  }, [title, description, ogImage, ogUrl, ogType, imageAlt, noIndex])

  return null
}
