/** Chiffres confiance (accueil) — axe plateforme / agences */
export const HOME_TRUST_STATS = [
  { value: 'SaaS', label: 'Pilotage centralisé' },
  { value: 'Multi', label: 'Agences & équipes' },
  { value: '24/7', label: 'Espaces sécurisés' },
]

/** Déploiement : comment une agence démarre sur la plateforme */
export const HOME_STEPS = [
  {
    step: '01',
    title: 'Accès & paramétrage',
    text:
      'Chaque agence dispose de son espace : équipes, périmètre et préférences pour structurer le travail au quotidien.',
  },
  {
    step: '02',
    title: 'Parc & mandats',
    text:
      'Import ou saisie des biens, mandants, locataires et baux : une base unique pour suivre l’activité et les échéances.',
  },
  {
    step: '03',
    title: 'Publication & suivi',
    text:
      'Mise en ligne des annonces sur le catalogue public, suivi des prospects, quittances, reporting et opérations courantes.',
  },
]

/** FAQ accueil — cible agences + visiteurs catalogue */
export const HOME_FAQ_ITEMS = [
  {
    q: 'Qu’est-ce qu’ImmoConnect_GN concrètement ?',
    a: 'Une plateforme de gestion immobilière destinée aux agences : publier les annonces, gérer les biens, les acteurs, les baux et le pilotage opérationnel depuis des espaces dédiés.',
  },
  {
    q: 'Les données de mon agence sont-elles isolées ?',
    a: 'Chaque agence travaille dans son périmètre : ses biens, ses dossiers et ses utilisateurs. Le catalogue public agrège les annonces publiées selon vos choix.',
  },
  {
    q: 'Les biens affichés sur le site viennent-ils de la plateforme ?',
    a: 'Oui : le site met en avant un catalogue alimenté par les agences connectées. La visibilité dépend de la publication et des paramètres de chaque annonce.',
  },
  {
    q: 'Qui peut se connecter à l’espace agence ?',
    a: 'Les comptes autorisés par l’agence (direction, gestionnaires, etc.) via l’Espace client / portails — droits et rôles selon votre organisation.',
  },
  {
    q: 'Proposez-vous une démonstration ou un accompagnement au démarrage ?',
    a: 'Contactez-nous via le formulaire d’estimation ou les coordonnées du site : nous revenons vers vous pour cadrer un déploiement ou une prise en main des équipes.',
  },
]
