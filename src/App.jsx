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
const EspaceHub = lazy(() => import('./pages/EspaceHub'))
const EspacePortal = lazy(() => import('./pages/EspacePortal'))
const PortalShell = lazy(() => import('./pages/portals/PortalShell'))
const PortalDashboard = lazy(() => import('./pages/portals/PortalDashboard'))
const PortalSectionPage = lazy(() => import('./pages/portals/PortalSectionPage'))

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
              <Route path="espace" element={<EspaceHub />} />
              <Route path="espace/:slug/app" element={<PortalShell />}>
                <Route index element={<PortalDashboard />} />
                <Route path=":section" element={<PortalSectionPage />} />
              </Route>
              <Route path="espace/:slug" element={<EspacePortal />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
