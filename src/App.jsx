import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PageLoader from './components/PageLoader'
import AppErrorBoundary from './components/AppErrorBoundary'

const HomePage = lazy(() => import('./pages/Home'))
const Properties = lazy(() => import('./pages/Properties'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const GestionLocative = lazy(() => import('./pages/GestionLocative'))
const Estimation = lazy(() => import('./pages/Estimation'))
const About = lazy(() => import('./pages/About'))
const MentionsLegales = lazy(() => import('./pages/MentionsLegales'))
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite'))

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="nos-biens" element={<Properties />} />
              <Route path="nos-biens/:slug" element={<PropertyDetail />} />
              <Route path="gestion-locative" element={<GestionLocative />} />
              <Route path="estimation" element={<Estimation />} />
              <Route path="a-propos" element={<About />} />
              <Route path="mentions-legales" element={<MentionsLegales />} />
              <Route path="politique-confidentialite" element={<PolitiqueConfidentialite />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
