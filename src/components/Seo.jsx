import { useEffect } from 'react'

function setMeta(attr, key, content) {
  if (!content) return
  const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function Seo({ title, description, ogImage, ogUrl, ogType = 'website' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Prestige & Gestion Immobilière Conakry` : 'Prestige & Gestion Immobilière à Conakry'
    document.title = fullTitle

    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }

    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description || '')
    setMeta('property', 'og:type', ogType)
    if (ogImage) setMeta('property', 'og:image', ogImage)
    if (ogUrl) setMeta('property', 'og:url', ogUrl)

    setMeta('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary')
    setMeta('name', 'twitter:title', fullTitle)
    if (description) setMeta('name', 'twitter:description', description)
    if (ogImage) setMeta('name', 'twitter:image', ogImage)
  }, [title, description, ogImage, ogUrl, ogType])

  return null
}
