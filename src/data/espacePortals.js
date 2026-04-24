import { User, Building2, Landmark, LayoutDashboard } from 'lucide-react'

export const espacePortals = {
  locataire: {
    slug: 'locataire',
    title: 'Espace locataire',
    tagline: 'Votre foyer, votre tableau de bord',
    description:
      'Centralisez vos loyers, documents, demandes techniques et echanges dans un espace unique. Une experience claire pour gerer votre location en toute autonomie.',
    icon: User,
    accent: 'from-emerald-500/20 to-cyan-500/10',
    borderAccent: 'border-emerald-500/30',
    features: [
      { title: 'Paiement et quittances', text: 'Historique des loyers, telechargement des quittances PDF et alertes avant echeance.' },
      { title: 'Tickets techniques', text: 'Declaration d incident avec photos, priorite et suivi du delai de resolution.' },
      { title: 'Documents personnels', text: 'Bail, etat des lieux, attestations et annexes accessibles a tout moment.' },
      { title: 'Messagerie contextuelle', text: 'Echange direct avec agence ou gestionnaire sur un dossier precis.' },
      { title: 'Suivi de compte', text: 'Vue des soldes, regularisations de charges et historique des operations.' },
      { title: 'Parcours d entree/sortie', text: 'Checklists numeriques pour emmenagement, preavis et restitution des cles.' },
    ],
    stats: [
      { value: '24/7', label: 'Acces aux informations' },
      { value: '< 2 min', label: 'Creation d une demande' },
      { value: '0 papier', label: 'Documents dematerialises' },
      { value: 'Temps reel', label: 'Suivi des incidents' },
    ],
  },
  proprietaire: {
    slug: 'proprietaire',
    title: 'Espace proprietaire',
    tagline: 'Pilotez votre patrimoine en toute transparence',
    description:
      'Suivez la performance de votre patrimoine locatif avec des indicateurs fiables, des rapports automatiques et une vision detaillee par bien.',
    icon: Building2,
    accent: 'from-amber-500/20 to-orange-500/10',
    borderAccent: 'border-amber-500/30',
    features: [
      { title: 'Encaissements et reversements', text: 'Suivi des loyers encaisses, charges, honoraires et virements net proprietaire.' },
      { title: 'Vision parc immobilier', text: 'Occupation, loyers hors charges, prochaine echeance de bail et rendement par lot.' },
      { title: 'Comptes-rendus periodiques', text: 'Reporting mensuel ou trimestriel avec exports PDF/CSV pour la comptabilite.' },
      { title: 'Pilotage vacance locative', text: 'Alertes sur les lots vacants et suivi des remises en location.' },
      { title: 'Validation des actions', text: 'Workflow de validation pour devis, gros travaux et arbitrages de gestion.' },
      { title: 'Archive patrimoniale', text: 'Conservation centralisee des diagnostics, contrats et historiques d intervention.' },
    ],
    stats: [
      { value: 'Temps reel', label: 'Suivi financier' },
      { value: 'Par bien', label: 'Rentabilite detaillee' },
      { value: 'Mensuel', label: 'Rapport automatique' },
      { value: 'RGPD', label: 'Donnees securisees' },
    ],
  },
  agence: {
    slug: 'agence',
    title: 'Espace agence',
    tagline: 'L outil metier pour vos equipes commerciales',
    description:
      'Accederez a un espace metier pour gerer vos mandats, accelerer la conversion des leads et synchroniser vos equipes commerciales.',
    icon: Landmark,
    accent: 'from-violet-500/20 to-fuchsia-500/10',
    borderAccent: 'border-violet-500/30',
    features: [
      { title: 'Mandats et annonces', text: 'Publication multicanale, statut en temps reel et enrichissement automatique des fiches.' },
      { title: 'Pipeline commercial', text: 'Scoring des leads, relances automatisees et suivi des etapes jusqu a la signature.' },
      { title: 'Agenda de visites', text: 'Coordination des visites, rappels clients et comptes-rendus terrain centralises.' },
      { title: 'Gestion equipe', text: 'Permissions par role, objectifs individuels et tableaux de bord manager.' },
      { title: 'Documents transactionnels', text: 'Generation de documents pre-remplis et signature electronique des dossiers.' },
      { title: 'Connecteurs CRM / ERP', text: 'Synchronisation avec vos outils metiers pour eviter les doubles saisies.' },
    ],
    stats: [
      { value: '360 deg', label: 'Vision client complete' },
      { value: 'Omnicanal', label: 'Leads unifies' },
      { value: 'Multi-site', label: 'Reseau d agences' },
      { value: 'API', label: 'Interoperabilite metier' },
    ],
  },
  gestionnaire: {
    slug: 'gestionnaire',
    title: 'Espace gestionnaire',
    tagline: 'Orchestrez le parc locatif a grande echelle',
    description:
      'Un cockpit de gestion locative pour industrialiser les operations, standardiser les process et offrir un haut niveau de service aux proprietaires.',
    icon: LayoutDashboard,
    accent: 'from-sky-500/20 to-blue-600/10',
    borderAccent: 'border-sky-500/30',
    features: [
      { title: 'Centre de tickets', text: 'Priorisation des demandes, affectation fournisseur et suivi SLA jusqu a cloture.' },
      { title: 'Maintenance planifiee', text: 'Gestion preventive, calendrier des interventions et controle des couts.' },
      { title: 'Flux quittancement', text: 'Generation des quittances, relances automatiques et rapprochement des paiements.' },
      { title: 'Reporting portefeuille', text: 'Tableaux de bord par immeuble, proprietaire, zone et typologie de lot.' },
      { title: 'Gestion fournisseurs', text: 'Base prestataires, devis, bons de commande et controle qualite des interventions.' },
      { title: 'Conformite et audit', text: 'Tracabilite complete des actions et archivage pour les obligations legales.' },
    ],
    stats: [
      { value: 'SLA', label: 'Interventions tracees' },
      { value: 'Multi-portefeuille', label: 'Pilotage centralise' },
      { value: 'Automatise', label: 'Process recurrent' },
      { value: 'Audit ready', label: 'Conformite documentaire' },
    ],
  },
}

export const espaceList = Object.values(espacePortals)
