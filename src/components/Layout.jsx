import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CookieBanner from './CookieBanner'

export default function Layout() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}
