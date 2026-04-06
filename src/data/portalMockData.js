/** Données de démonstration — remplaçables par une API plus tard */

export const kpiBySlug = {
  locataire: [
    { label: 'Prochain loyer', value: '15 j', sub: 'Échéance 5 du mois' },
    { label: 'Dernier paiement', value: '2,5M GNF', sub: 'Mars 2026 — payé' },
    { label: 'Demandes ouvertes', value: '1', sub: 'Fuite salle de bain' },
  ],
  proprietaire: [
    { label: 'Revenus ce mois', value: '4,2M GNF', sub: '3 biens loués' },
    { label: 'Taux d’occupation', value: '92%', sub: 'Sur 4 lots' },
    { label: 'À reverser', value: '3,8M GNF', sub: 'Virement prévu le 10' },
  ],
  agence: [
    { label: 'Mandats actifs', value: '28', sub: '12 ventes, 16 locations' },
    { label: 'Leads ce mois', value: '47', sub: '+12% vs N-1' },
    { label: 'Visites planifiées', value: '9', sub: 'Cette semaine' },
  ],
  gestionnaire: [
    { label: 'Tickets ouverts', value: '14', sub: '3 urgents' },
    { label: 'Relances en cours', value: '6', sub: 'Loyers impayés' },
    { label: 'Biens suivis', value: '312', sub: '12 immeubles' },
  ],
}

export const activityFeed = {
  locataire: [
    { t: 'Il y a 2 h', msg: 'Votre demande de réparation #142 a été prise en charge.' },
    { t: 'Hier', msg: 'Quittance de mars disponible en téléchargement.' },
    { t: '3 j', msg: 'Message de l’agence : visite semestrielle planifiée.' },
  ],
  proprietaire: [
    { t: 'Aujourd’hui', msg: 'Encaissement enregistré — Villa Kaloum.' },
    { t: 'Hier', msg: 'Fin de bail prévue — Appartement Ratoma (90 j).' },
  ],
  agence: [
    { t: '10 min', msg: 'Nouveau lead site Web — Appartement 3 pièces Dixinn.' },
    { t: '1 h', msg: 'Mandat #M-2024-089 signé électroniquement.' },
  ],
  gestionnaire: [
    { t: 'Maintenant', msg: 'Ticket #T-882 escaladé — ascenseur Matam.' },
    { t: '30 min', msg: 'Relance automatique J+5 envoyée — Lot B12.' },
  ],
}

export const tables = {
  locataire: {
    loyers: [
      { id: 1, periode: 'Mars 2026', montant: '2 500 000 GNF', statut: 'Payé', quittance: 'PDF' },
      { id: 2, periode: 'Fév. 2026', montant: '2 500 000 GNF', statut: 'Payé', quittance: 'PDF' },
      { id: 3, periode: 'Janv. 2026', montant: '2 500 000 GNF', statut: 'Payé', quittance: 'PDF' },
    ],
    demandes: [
      { id: 142, sujet: 'Fuite salle de bain', date: '28/03/2026', statut: 'En cours', priorite: 'Normale' },
      { id: 138, sujet: 'Climatisation bruyante', date: '15/03/2026', statut: 'Résolu', priorite: 'Basse' },
    ],
    documents: [
      { nom: 'Bail signé 2025.pdf', type: 'Contrat', date: '01/01/2025' },
      { nom: 'État des lieux entrée.pdf', type: 'EDL', date: '01/01/2025' },
    ],
    messages: [
      { de: 'Agence Immo-Connect', apercu: 'Bonjour, nous confirmons la visite du...', date: '30/03/2026', lu: true },
      { de: 'Gestion technique', apercu: 'Intervention plombier prévue demain 9h.', date: '29/03/2026', lu: false },
    ],
  },
  proprietaire: {
    biens: [
      { ref: 'V-KLM-01', adresse: 'Kaloum — Villa lagune', loyer: '2,5M', locataire: 'M. Diallo', finBail: '12/2027' },
      { ref: 'A-RAT-04', adresse: 'Ratoma — T3', loyer: '850K', locataire: 'Mme Bah', finBail: '06/2026' },
    ],
    encaissements: [
      { date: '05/03/2026', bien: 'V-KLM-01', montant: '2 500 000', statut: 'Versé' },
      { date: '05/03/2026', bien: 'A-RAT-04', montant: '850 000', statut: 'Versé' },
    ],
    reporting: [],
    candidatures: [
      { candidat: 'K. Camara', bien: 'A-DIX-02', date: '27/03/2026', score: '88/100' },
    ],
  },
  agence: {
    mandats: [
      { ref: 'M-089', type: 'Location', adresse: 'Dixinn — Local 180m²', statut: 'Publié', mandant: 'SARL Horizon' },
      { ref: 'M-088', type: 'Vente', adresse: 'Kaloum — Penthouse', statut: 'Sous offre', mandant: 'M. Barry' },
    ],
    leads: [
      { nom: 'A. Sylla', source: 'Site Web', bien: 'Appart. 3 pièces Dixinn', etape: 'Qualification', date: '01/04/2026' },
      { nom: 'F. Keita', source: 'WhatsApp', bien: 'Terrain Matam', etape: 'Visite', date: '31/03/2026' },
    ],
    visites: [
      { date: '02/04/2026 10:00', bien: 'V-KLM-01', client: 'M. Soumah', agent: 'N. Diallo' },
    ],
    equipe: [
      { nom: 'N. Diallo', role: 'Commercial', email: 'n.diallo@immo-connect-gn.gn' },
      { nom: 'A. Touré', role: 'Administratif', email: 'a.toure@immo-connect-gn.gn' },
    ],
  },
  gestionnaire: {
    tickets: [
      { id: 'T-882', bien: 'Immeuble Matam — Lot 4', sujet: 'Ascenseur bloqué', sla: '4h', statut: 'Urgent' },
      { id: 'T-879', bien: 'Résidence Ratoma', sujet: 'Fuite toiture', sla: '24h', statut: 'En cours' },
    ],
    quittances: [
      { periode: 'Mars 2026', generees: '124', erreurs: '0', relances: '6' },
    ],
    reporting: [],
    audit: [
      { horodatage: '01/04/2026 08:12', user: 'sys.batch', action: 'Relances J+5', detail: '6 notifications' },
      { horodatage: '31/03/2026 18:00', user: 'a.toure', action: 'Modification bail', detail: 'REF-2024-002' },
    ],
  },
}
