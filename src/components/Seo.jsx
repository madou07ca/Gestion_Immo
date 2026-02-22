import { useEffect } from 'react'

export default function Seo({ title, description }) {
  useEffect(() => {
    if (title) document.title = `${title} | Prestige & Gestion Immobilière Conakry`
    const meta = document.querySelector('meta[name="description"]')
    if (meta && description) meta.setAttribute('content', description)
  }, [title, description])
  return null
}
