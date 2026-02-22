import { lazy, Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary'

const PropertyMap = lazy(() => import('./PropertyMap'))

const MapFallback = ({ height = '20rem' }) => (
  <div
    className="rounded-xl bg-night-700 border border-night-600 flex items-center justify-center text-gray-500"
    style={{ height }}
  >
    <span>Chargement de la carte…</span>
  </div>
)

export default function PropertyMapWrapper(props) {
  return (
    <ErrorBoundary
      fallback={
        <div
          className="rounded-xl bg-night-700 border border-night-600 flex items-center justify-center text-gray-500"
          style={{ height: props.height || '20rem' }}
        >
          <span>Carte temporairement indisponible</span>
        </div>
      }
    >
      <Suspense fallback={<MapFallback height={props.height} />}>
        <PropertyMap {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}
