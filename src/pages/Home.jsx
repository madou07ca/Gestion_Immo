import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import HeroCoverImage from '../components/HeroCoverImage'
import HomeJsonLd from '../components/HomeJsonLd'
import HomeFaqAccordion from '../components/HomeFaqAccordion'
import HomeParcStrip from '../components/HomeParcStrip'
import { DEFAULT_OG_IMAGE_URL, HERO_UNSPLASH_HOME } from '../lib/shareImages'
import {
  Building2,
  LayoutDashboard,
  Globe,
  FileCheck,
  Shield,
  Lock,
  MapPin,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { getFeaturedProperties } from '../data/properties'
import { fetchPublicProperties } from '../lib/publicPropertiesApi'
import { HOME_TRUST_STATS, HOME_FAQ_ITEMS, HOME_STEPS } from '../data/homeContent'
import PropertyCard from '../components/PropertyCard'
import QuickEstimationForm from '../components/QuickEstimationForm'
import TestimonialsCarousel from '../components/TestimonialsCarousel'

const services = [
  {
    icon: Globe,
    title: 'Catalogue public',
    description:
      'Vitrine en ligne des annonces publiées par les agences : recherche, fiches détaillées et visibilité pour les prospects.',
  },
  {
    icon: LayoutDashboard,
    title: 'Pilotage pour les agences',
    description:
      'Parc, mandants, locataires et baux au même endroit : publication, suivi opérationnel et espaces sécurisés par organisation.',
  },
  {
    icon: Building2,
    title: 'Immobilier à Conakry',
    description:
      'Biens résidentiels et professionnels sur Conakry et Grande Conakry — annonces alimentées par le réseau d’agences.',
  },
]

const pillars = [
  {
    icon: Shield,
    title: 'Périmètre par agence',
    text: 'Chaque structure travaille sur ses biens et ses dossiers, avec des accès adaptés aux équipes.',
  },
  {
    icon: FileCheck,
    title: 'Processus structurés',
    text: 'Mandats, baux, quittances et pièces : une traçabilité utile au quotidien comme en contrôle.',
  },
  {
    icon: BarChart3,
    title: 'Visibilité opérationnelle',
    text: 'Suivi des loyers, échéances et activité pour piloter le portefeuille sans tableurs dispersés.',
  },
  {
    icon: Lock,
    title: 'Données maîtrisées',
    text: 'Hébergement des dossiers dans des espaces dédiés, avec les précautions attendues d’un outil métier.',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
}

function FeaturedSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-night-600 bg-night-800/40 overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-night-700" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-night-700 rounded w-1/4" />
            <div className="h-5 bg-night-700 rounded w-3/4" />
            <div className="h-3 bg-night-700 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function firstCatalogImageUrl(items) {
  const first = items?.[0]
  const url = first?.images?.[0]
  return typeof url === 'string' && url.startsWith('http') ? url : null
}

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [heroCatalogSrc, setHeroCatalogSrc] = useState(null)
  const [showParcStrip, setShowParcStrip] = useState(false)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setFeaturedLoading(true)
      try {
        const items = await fetchPublicProperties()
        if (!mounted) return
        const list = Array.isArray(items) ? items.filter((item) => item.featured || item.published) : []
        if (list.length > 0) {
          setFeatured(list)
          setHeroCatalogSrc(firstCatalogImageUrl(list))
          setShowParcStrip(true)
        } else {
          setFeatured(getFeaturedProperties())
          setHeroCatalogSrc(null)
          setShowParcStrip(false)
        }
      } catch {
        if (!mounted) return
        setFeatured(getFeaturedProperties())
        setHeroCatalogSrc(null)
        setShowParcStrip(false)
      } finally {
        if (mounted) setFeaturedLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="overflow-x-hidden">
      <Seo
        title="Accueil"
        description="ImmoConnect_GN — plateforme de gestion immobilière pour agences : publier, piloter le parc et servir mandants et locataires. Catalogue public à Conakry."
        ogImage={DEFAULT_OG_IMAGE_URL}
        imageAlt="Immobilier et pilotage — ImmoConnect_GN"
      />
      <HomeJsonLd />

      {/* Hero */}
      <section className="relative min-h-[78vh] sm:min-h-[85vh] flex flex-col justify-end sm:justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden bg-night-900">
          <HeroCoverImage
            baseUrl={HERO_UNSPLASH_HOME}
            catalogHeroSrc={heroCatalogSrc}
            alt="Visuel d'accueil — ImmoConnect_GN, plateforme immobilière"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/95 via-night-950/82 to-night-900/92" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.12),transparent)]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-14 sm:py-24 md:py-28">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex flex-wrap items-center justify-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/35 bg-night-900/60 px-3 py-1 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-gold-300/95">
                <Sparkles size={13} className="opacity-90" aria-hidden />
                Plateforme pour agences
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-night-950/70 px-3 py-1 text-[11px] sm:text-xs text-gray-200">
                <MapPin size={13} className="text-gold-500/80 shrink-0" aria-hidden />
                Grande Conakry
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.08] tracking-tight drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)]"
            >
              ImmoConnect_GN
              <span className="block mt-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gold-300 drop-shadow-sm">
                Pilotez votre parc immobilier
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto mb-10 leading-relaxed [text-shadow:0_1px_24px_rgba(0,0,0,0.45)]"
            >
              Nous mettons à disposition des agences un outil pour publier leurs annonces, structurer leurs dossiers et suivre location et gestion — avec un catalogue public pour les chercheurs de biens à Conakry.
            </motion.p>
          </div>

          {/* Stats band */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="mt-14 sm:mt-16 max-w-3xl mx-auto"
          >
            <div className="rounded-2xl border border-white/15 bg-night-950/75 backdrop-blur-md px-4 py-6 sm:px-8 shadow-xl shadow-black/25 ring-1 ring-white/5">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-300 text-center mb-5 font-medium">
                Pensé pour les agences
              </p>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {HOME_TRUST_STATS.map((s) => (
                  <div key={s.label} className="text-center border-r border-white/10 last:border-0">
                    <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gold-300 tabular-nums drop-shadow-sm">
                      {s.value}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-200 mt-1.5 leading-snug px-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {showParcStrip ? <HomeParcStrip properties={featured} /> : null}

      {/* Services */}
      <section className="relative py-20 md:py-28 bg-night-900">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold-400 text-xs font-semibold uppercase tracking-widest mb-3">Offre</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Catalogue public &amp; outil métier
            </h2>
            <p className="text-gray-200 text-lg leading-relaxed">
              Les visiteurs explorent les annonces ; les agences pilotent mandats, biens et locataires depuis la même plateforme.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((item, i) => (
              <motion.article
                key={item.title}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="group relative flex flex-col rounded-2xl border border-night-600 bg-gradient-to-b from-night-800/80 to-night-900/90 p-7 hover:border-gold-500/35 transition-colors duration-300"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(600px_circle_at_50%_-20%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400 mb-5 group-hover:scale-105 transition-transform duration-300">
                    <item.icon size={26} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-200 text-[15px] leading-relaxed flex-1">{item.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="py-16 md:py-24 bg-night-800/80 border-y border-night-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold-400 text-xs font-semibold uppercase tracking-widest mb-3">Méthode</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Comment nous travaillons ensemble
            </h2>
            <p className="text-gray-200">
              Trois étapes pour cadrer votre projet — sans engagement jusqu&apos;au mandat.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent pointer-events-none" aria-hidden />
            {HOME_STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="relative text-center md:text-left"
              >
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-gold-500/40 bg-night-900 text-gold-400 font-display font-bold text-sm mb-4 mx-auto md:mx-0">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-200 text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Biens en vedette */}
      <section className="py-16 md:py-28 bg-night-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12">
            <p className="text-gold-400 text-xs font-semibold uppercase tracking-widest mb-2">Sélection</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              Biens en vedette
            </h2>
            <p className="text-gray-200 text-lg max-w-xl">
              Extraits du catalogue public — biens publiés par les agences sur la plateforme.
            </p>
          </motion.div>
          {featuredLoading ? (
            <FeaturedSkeleton />
          ) : featured.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-night-600 bg-night-800/40 px-6 py-16 text-center">
              <p className="text-gray-300 mb-2 text-lg">Catalogue en cours d&apos;enrichissement</p>
              <p className="text-sm text-gray-300 mb-8 max-w-md mx-auto">
                Demandez une estimation ou laissez vos coordonnées : nous revenons vers vous avec des biens alignés sur votre critère.
              </p>
              <p className="text-sm text-gray-400">
                Utilisez le menu du site pour accéder à l&apos;estimation ou au catalogue des biens.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featured.slice(0, 6).map((property, i) => (
                <motion.div
                  key={property.id}
                  {...fadeUp}
                  transition={{ delay: i * 0.06 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pourquoi nous */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-night-800 to-night-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold-400 text-xs font-semibold uppercase tracking-widest mb-3">Engagement</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Pourquoi choisir la plateforme
            </h2>
            <p className="text-gray-200">
              Un socle commun pour les agences : organisation du travail, conformité des dossiers et visibilité pour le marché.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {pillars.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-night-600/90 bg-night-900/50 p-6 text-center hover:border-night-500 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold-500/12 flex items-center justify-center mx-auto mb-4 text-gold-400">
                  <item.icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-200 text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + estimation — deux colonnes sur grand écran */}
      <section className="py-16 md:py-28 bg-night-900 border-t border-night-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div {...fadeUp}>
              <HomeFaqAccordion
                items={HOME_FAQ_ITEMS}
                subtitle="Agences et visiteurs : les questions les plus fréquentes sur le fonctionnement de la plateforme."
              />
            </motion.div>
            <motion.div {...fadeUp} className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-night-600 bg-night-800/85 p-6 md:p-8 shadow-xl shadow-black/25 ring-1 ring-white/5">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                  Estimation rapide
                </h2>
                <p className="text-gray-200 mb-2">
                  Une première fourchette gratuite et sans engagement, sous 24 à 48h ouvrées en général.
                </p>
                <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                  Données traitées conformément à notre{' '}
                  <Link to="/politique-confidentialite" className="text-gold-500/90 hover:text-gold-400 underline underline-offset-2">
                    politique de confidentialité
                  </Link>
                  .
                </p>
                <QuickEstimationForm />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 md:py-24 bg-night-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="text-gold-400 text-xs font-semibold uppercase tracking-widest mb-3">Références</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              Témoignages
            </h2>
            <p className="text-gray-200 max-w-xl mx-auto">
              Ce que disent les directions d&apos;agences qui centralisent leur activité sur ImmoConnect_GN.
            </p>
          </motion.div>
          <motion.div {...fadeUp}>
            <TestimonialsCarousel />
          </motion.div>
        </div>
      </section>

      {/* Rappel — sans boutons (navigation via le menu) */}
      <section className="relative py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-600/20 via-night-900 to-night-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_55%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            {...fadeUp}
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Catalogue, estimation ou déploiement agence
          </motion.h2>
          <p className="text-gray-100 text-lg leading-relaxed max-w-2xl mx-auto">
            Parcourez les annonces, demandez une estimation ou contactez-nous pour en savoir plus sur la plateforme pour votre structure — via les entrées du menu en haut de page.
          </p>
        </div>
      </section>
    </div>
  )
}
