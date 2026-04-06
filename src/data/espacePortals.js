import { User, Building2, Landmark, LayoutDashboard } from 'lucide-react'

export const espacePortals = {
  locataire: {
    slug: 'locataire',
    title: 'Espace locataire',
    tagline: 'Votre foyer, votre tableau de bord',
    description:
      'Suivez vos loyers, vos quittances et vos demandes en un seul endroit. Une experience fluide pour vivre serenement votre location.',
    icon: User,
    accent: 'from-emerald-500/20 to-cyan-500/10',
    borderAccent: 'border-emerald-500/30',
    features: [
      { title: 'Paiement et quittances', text: 'Historique des loyers, telechargement des quittances PDF, rappels des echeances.' },
      { title: 'Demandes et incidents', text: 'Signalez un probleme, suivez les interventions et echangez avec la gestion.' },
      { title: 'Documents et contrat', text: 'Acces securise a votre bail, etats des lieux et documents partages.' },
      { title: 'Messagerie', text: 'Canal direct avec votre proprietaire ou l agence pour vos questions du quotidien.' },
    ],
    stats: [
      { value: '24/7', label: 'Acces au portail' },
      { value: '100%', label: 'Tracabilite des paiements' },
    ],
  },
  proprietaire: {
    slug: 'proprietaire',
    title: 'Espace proprietaire',
    tagline: 'Pilotez votre patrimoine en toute transparence',
    description:
      'Visualisez vos encaissements, l etat d occupation de vos biens et les rapports de gestion. La tranquillite d esprit, chiffres a l appui.',
    icon: Building2,
    accent: 'from-amber-500/20 to-orange-500/10',
    borderAccent: 'border-amber-500/30',
    features: [
      { title: 'Encaissements et reversements', text: 'Tableaux de bord des loyers percus, charges et virements vers votre compte.' },
      { title: 'Biens et baux', text: 'Vue consolidée de vos locations, dates de fin de bail et documents associes.' },
      { title: 'Reporting', text: 'Syntheses mensuelles ou trimestrielles exportables pour votre comptabilite.' },
      { title: 'Vacance et mise en location', text: 'Suivi des candidatures et validation des dossiers locataires.' },
    ],
    stats: [
      { value: 'Temps reel', label: 'Suivi des encaissements' },
      { value: 'RGPD', label: 'Donnees protegees' },
    ],
  },
  agence: {
    slug: 'agence',
    title: 'Espace agence',
    tagline: 'L outil metier pour vos equipes commerciales',
    description:
      'Diffusez vos mandats, qualifiez les leads du site et coordonnez visites et signatures. Une vitrine Immo-Connect_GN connectee a votre activite.',
    icon: Landmark,
    accent: 'from-violet-500/20 to-fuchsia-500/10',
    borderAccent: 'border-violet-500/30',
    features: [
      { title: 'Mandats et annonces', text: 'Publication synchronisee, fiches enrichies et suivi des statuts.' },
      { title: 'Pipeline commercial', text: 'Leads issus du site Web, relances et prise de rendez-vous integree.' },
      { title: 'Equipe et permissions', text: 'Roles par collaborateur : commercial, administratif, direction.' },
      { title: 'Integration CRM / ERP', text: 'Connexion possible avec votre outil metier pour un flux unique des donnees.' },
    ],
    stats: [
      { value: '360', label: 'Vue mandats et leads' },
      { value: 'Multi-site', label: 'Plusieurs agences' },
    ],
  },
  gestionnaire: {
    slug: 'gestionnaire',
    title: 'Espace gestionnaire',
    tagline: 'Orchestrez le parc locatif a grande echelle',
    description:
      'Pense pour les equipes de gestion locative : incidents, fournisseurs, reporting proprietaires et conformite. Le cockpit operationnel Immo-Connect_GN.',
    icon: LayoutDashboard,
    accent: 'from-sky-500/20 to-blue-600/10',
    borderAccent: 'border-sky-500/30',
    features: [
      { title: 'Tickets et maintenance', text: 'File d attente des demandes, affectation aux prestataires, suivi des SLA.' },
      { title: 'Quittances et relances', text: 'Generation massive, relances automatiques et lettrage des paiements.' },
      { title: 'Reporting multi-proprietaires', text: 'Exports personnalises, tableaux de bord par immeuble ou par portefeuille.' },
      { title: 'Audit et conformite', text: 'Journal des actions, archivage et tracabilite pour vos obligations legales.' },
    ],
    stats: [
      { value: 'SLA', label: 'Suivi des interventions' },
      { value: 'API', label: 'Automatisations' },
    ],
  },
}

export const espaceList = Object.values(espacePortals)
