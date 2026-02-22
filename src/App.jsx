import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import GestionLocative from './pages/GestionLocative'
import Estimation from './pages/Estimation'
import About from './pages/About'
import MentionsLegales from './pages/MentionsLegales'
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite'

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
