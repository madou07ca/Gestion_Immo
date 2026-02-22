import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CONAKRY_CENTER = [9.6412, -13.5784]
const DEFAULT_ZOOM = 12

function getDefaultIcon() {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

export default function PropertyMap({ properties, singleProperty, height = '16rem', showPopups = true }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  const list = singleProperty ? [singleProperty] : properties || []
  const hasCoords = list.filter((p) => p?.lat != null && p?.lng != null)

  useEffect(() => {
    if (hasCoords.length === 0 || !containerRef.current) return

    const center = singleProperty
      ? [singleProperty.lat, singleProperty.lng]
      : CONAKRY_CENTER
    const zoom = singleProperty ? 15 : DEFAULT_ZOOM

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const icon = getDefaultIcon()

    hasCoords.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map)
      if (showPopups) {
        const isSingle = singleProperty && singleProperty.id === p.id
        const popupContent = `
          <div class="text-sm text-gray-800 min-w-[180px]">
            <p class="font-semibold">${escapeHtml(p.title)}</p>
            <p class="text-gray-600">${escapeHtml(p.district)}, ${escapeHtml(p.city)}</p>
            <p class="font-medium mt-1" style="color:#a87619">${escapeHtml(p.priceLabel)}</p>
            ${!isSingle ? `<a href="/nos-biens/${p.slug}" class="inline-block mt-2 text-sm text-blue-600 hover:underline">Voir le bien →</a>` : ''}
          </div>
        `
        marker.bindPopup(popupContent)
      }
    })

    if (hasCoords.length === 1) {
      map.setView([hasCoords[0].lat, hasCoords[0].lng], 15)
    } else if (hasCoords.length > 1) {
      const bounds = L.latLngBounds(hasCoords.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
    }

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [hasCoords.map((p) => p.id).join(','), showPopups])

  if (hasCoords.length === 0) {
    return (
      <div
        className="rounded-xl bg-night-700 border border-night-600 flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        <span>Localisation non disponible</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-night-600 bg-night-700 [&_.leaflet-popup-content]:m-3"
      style={{ height }}
    />
  )
}

function escapeHtml(text) {
  if (text == null) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
