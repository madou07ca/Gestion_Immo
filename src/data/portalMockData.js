/** Données de démonstration — remplaçables par une API plus tard */

export const kpiBySlug = {
  locataire: [
    { label: 'Prochaine echeance', value: '05/04/2026', sub: 'Loyer + charges a payer' },
    { label: 'Montant du mois', value: '2 850 000 GNF', sub: 'Loyer 2 500 000 + charges 350 000' },
    { label: 'Demandes ouvertes', value: '1', sub: 'Incident plomberie en cours' },
  ],
  proprietaire: [
    { label: 'Encaissements cumules', value: '44 300 000 GNF', sub: 'Tous paiements confirmes' },
    { label: 'Occupation du parc', value: '75%', sub: '3/4 biens loues' },
    { label: 'Loyer securise / mois', value: '4 550 000 GNF', sub: 'Flux recurrent estime' },
    { label: 'Vacance locative', value: '1', sub: 'Manque potentiel 850 000 GNF / mois' },
    { label: 'Paiements en retard', value: '1', sub: 'Priorite recouvrement' },
    { label: 'Biens en maintenance', value: '1', sub: 'Impact possible sur rendement' },
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
  admin: [
    { label: 'Vue plateforme', value: 'Demo', sub: 'Redemarrez le backend pour charger les KPI reels' },
    { label: 'Agences', value: '-', sub: 'Endpoint /api/admin/overview' },
    { label: 'Occupation', value: '-', sub: 'Indicateur global' },
  ],
}

export const activityFeed = {
  locataire: [
    { t: 'Il y a 1 h', msg: 'Rappel: echeance de paiement le 05/04/2026.' },
    { t: 'Hier', msg: 'Confirmation paiement Mars 2026 recue et validee.' },
    { t: '3 j', msg: 'Votre demande #142 (incident) est en cours de traitement.' },
  ],
  proprietaire: [
    { t: 'Vacance', msg: '1 bien disponible - manque estime 850 000 GNF / mois.' },
    { t: 'Risque', msg: 'Retard detecte sur Appartement Ratoma - relance en cours.' },
    { t: "Aujourd'hui", msg: 'Paiement recu pour Villa Kaloum - 2 500 000 GNF.' },
    { t: '3 j', msg: 'Rapport mensuel Mars 2026 disponible en PDF.' },
  ],
  agence: [
    { t: '10 min', msg: 'Nouveau lead site Web — Appartement 3 pièces Dixinn.' },
    { t: '1 h', msg: 'Mandat #M-2024-089 signé électroniquement.' },
  ],
  gestionnaire: [
    { t: 'Maintenant', msg: 'Ticket #T-882 escaladé — ascenseur Matam.' },
    { t: '30 min', msg: 'Relance automatique J+5 envoyée — Lot B12.' },
  ],
  admin: [
    { t: 'Info', msg: 'Si les KPI restent en demo, verifiez que npm run server tourne sur le dernier code.' },
    { t: 'Info', msg: 'Endpoint attendu: GET /api/admin/overview' },
  ],
}

export const tables = {
  locataire: {
    bien: {
      reference: 'B-KLM-APT-03',
      adresse: 'Kaloum, Conakry - Immeuble Palmier, 3e etage',
      type: 'Appartement T3',
      surface: '98 m2',
      bailDebut: '01/01/2025',
      bailFin: '31/12/2027',
      loyerMensuel: '2 500 000 GNF',
      chargesMensuelles: '350 000 GNF',
      statutOccupation: 'Occupe',
    },
    contrat: {
      reference: 'CTR-LOC-2025-0018',
      titulaire: 'M. Mamadou Diallo',
      proprietaire: 'SCI Kaloum Residence',
      agence: 'Immo-Connect_GN',
      dateSignature: '28/12/2024',
      dateEffet: '01/01/2025',
      depotGarantie: '2 500 000 GNF',
      periodicite: 'Mensuelle',
      echeance: 'Le 05 de chaque mois',
      modePaiementPrincipal: 'Orange Money',
      statut: 'Actif',
    },
    paiements: [
      { id: 1, libelle: 'Loyer Avril 2026', type: 'Loyer', echeance: '05/04/2026', montant: 2500000, statut: 'A payer' },
      { id: 2, libelle: 'Charges Avril 2026', type: 'Charges', echeance: '05/04/2026', montant: 350000, statut: 'A payer' },
    ],
    'historique-paiements': [
      { id: 101, date: '05/03/2026', periode: 'Mars 2026', moyen: 'Orange Money', montant: '2 850 000 GNF', reference: 'OM-903811', statut: 'Confirme' },
      { id: 102, date: '05/02/2026', periode: 'Fev. 2026', moyen: 'Orange Money', montant: '2 850 000 GNF', reference: 'OM-891245', statut: 'Confirme' },
      { id: 103, date: '05/01/2026', periode: 'Janv. 2026', moyen: 'Orange Money', montant: '2 850 000 GNF', reference: 'OM-874002', statut: 'Confirme' },
    ],
    demandes: [
      { id: 142, type: 'Incident', sujet: 'Fuite salle de bain', date: '28/03/2026', statut: 'En cours', priorite: 'Normale' },
      { id: 138, type: 'Renovation', sujet: 'Climatisation bruyante', date: '15/03/2026', statut: 'Resolue', priorite: 'Basse' },
    ],
    documents: [
      { nom: 'Contrat de bail signe.pdf', type: 'Contrat', date: '01/01/2025', categorie: 'Contrat', taille: '1.2 MB' },
      { nom: 'Etat des lieux entree.pdf', type: 'EDL', date: '01/01/2025', categorie: 'Documents', taille: '780 KB' },
      { nom: 'Recu paiement Mars 2026.pdf', type: 'Recu', date: '05/03/2026', categorie: 'Recus', taille: '240 KB' },
      { nom: 'Recu paiement Fev 2026.pdf', type: 'Recu', date: '05/02/2026', categorie: 'Recus', taille: '236 KB' },
    ],
    notifications: [
      { id: 'N-1', type: 'Rappel de paiement', titre: 'Echeance du loyer approche', message: 'Le paiement du loyer et des charges est attendu au 05/04/2026.', date: '04/04/2026 09:00', statut: 'Non lu', canal: 'In-app + SMS' },
      { id: 'N-2', type: 'Confirmation paiement', titre: 'Paiement recu', message: 'Votre paiement Orange Money de 2 850 000 GNF a ete confirme.', date: '05/03/2026 10:13', statut: 'Lu', canal: 'In-app + Email' },
    ],
  },
  proprietaire: {
    biens: [
      { ref: 'V-KLM-01', adresse: 'Kaloum - Villa lagune', type: 'Villa', loyer: '2 500 000 GNF', locataire: 'M. Diallo', statut: 'Loue', finBail: '12/2027' },
      { ref: 'A-RAT-04', adresse: 'Ratoma - Appartement T3', type: 'Appartement', loyer: '850 000 GNF', locataire: 'Mme Bah', statut: 'Retard paiement', finBail: '06/2026' },
      { ref: 'A-MTM-08', adresse: 'Matam - Appartement T2', type: 'Appartement', loyer: '750 000 GNF', locataire: '-', statut: 'Disponible', finBail: '-' },
      { ref: 'C-DIX-02', adresse: 'Dixinn - Commerce 120m2', type: 'Local commercial', loyer: '1 200 000 GNF', locataire: 'SARL Horizon', statut: 'Maintenance', finBail: '03/2027' },
    ],
    revenus: [
      { mois: 'Janv. 2026', brut: '4 050 000 GNF', charges: '320 000 GNF', net: '3 730 000 GNF', statut: 'Cloture' },
      { mois: 'Fev. 2026', brut: '4 050 000 GNF', charges: '280 000 GNF', net: '3 770 000 GNF', statut: 'Cloture' },
      { mois: 'Mars 2026', brut: '4 200 000 GNF', charges: '340 000 GNF', net: '3 860 000 GNF', statut: 'Cloture' },
      { mois: 'Avril 2026', brut: '2 500 000 GNF', charges: '90 000 GNF', net: '2 410 000 GNF', statut: 'Partiel' },
    ],
    'historique-paiements': [
      { id: 201, date: '05/04/2026', bien: 'V-KLM-01', locataire: 'M. Diallo', montant: '2 500 000 GNF', mode: 'Virement', reference: 'TRX-OP-33421', statut: 'Recu' },
      { id: 202, date: '06/04/2026', bien: 'C-DIX-02', locataire: 'SARL Horizon', montant: '1 200 000 GNF', mode: 'Virement', reference: 'TRX-OP-33444', statut: 'Recu' },
      { id: 203, date: '08/04/2026', bien: 'A-RAT-04', locataire: 'Mme Bah', montant: '850 000 GNF', mode: 'Mobile Money', reference: 'TRX-OM-99812', statut: 'Retard' },
    ],
    revenusParBien: [
      { bien: 'V-KLM-01', revenusAnnuels: '30 000 000 GNF', vacance: '0 mois', rendement: '7.8%' },
      { bien: 'A-RAT-04', revenusAnnuels: '10 200 000 GNF', vacance: '1 mois', rendement: '6.1%' },
      { bien: 'A-MTM-08', revenusAnnuels: '6 000 000 GNF', vacance: '2 mois', rendement: '4.9%' },
      { bien: 'C-DIX-02', revenusAnnuels: '14 400 000 GNF', vacance: '0 mois', rendement: '8.4%' },
    ],
    documents: [
      { nom: 'Contrat bail Villa Kaloum.pdf', type: 'Contrat', bien: 'V-KLM-01', date: '12/2025', taille: '1.1 MB' },
      { nom: 'Recu Avril Villa Kaloum.pdf', type: 'Recu', bien: 'V-KLM-01', date: '04/2026', taille: '210 KB' },
      { nom: 'Recu Avril Commerce Dixinn.pdf', type: 'Recu', bien: 'C-DIX-02', date: '04/2026', taille: '208 KB' },
      { nom: 'Rapport mensuel Mars 2026.pdf', type: 'Rapport', bien: 'Portefeuille', date: '03/2026', taille: '960 KB' },
    ],
    notifications: [
      { id: 'P-N1', type: 'Paiement recu', titre: 'Paiement confirme - Villa Kaloum', message: 'Le paiement de 2 500 000 GNF a ete recu et comptabilise.', date: '05/04/2026 10:20', statut: 'Non lu', canal: 'In-app + Email' },
      { id: 'P-N2', type: 'Retard de paiement', titre: 'Retard detecte - Appartement Ratoma', message: 'Le paiement attendu au 05/04/2026 est en retard. Relance automatique envoyee.', date: '08/04/2026 08:10', statut: 'Lu', canal: 'In-app + SMS' },
    ],
    demandes: [
      { id: 3012, type: 'Incident', sujet: 'Infiltration toiture commerce', bien: 'C-DIX-02', date: '01/04/2026', statut: 'En cours', priorite: 'Haute' },
      { id: 3004, type: 'Informations', sujet: 'Question sur regularisation charges', bien: 'V-KLM-01', date: '25/03/2026', statut: 'Resolue', priorite: 'Normale' },
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
    proprietaires: [
      { id: 'PR-001', nom: 'M. Camara', email: 'camara@invest.gn', telephone: '+224 620 00 11 22', statut: 'Actif' },
      { id: 'PR-002', nom: 'Mme Bah', email: 'bah@holding.gn', telephone: '+224 621 00 22 33', statut: 'Actif' },
    ],
    locataires: [
      { id: 'LC-101', nom: 'M. Diallo', email: 'diallo.loc@gmail.com', telephone: '+224 622 11 22 33', statut: 'Actif' },
      { id: 'LC-102', nom: 'Mme Barry', email: 'barry.loc@gmail.com', telephone: '+224 623 11 22 33', statut: 'Suspendu' },
    ],
    'roles-permissions': [
      { id: 'RP-1', acteur: 'M. Camara', typeCompte: 'Proprietaire', role: 'Lecture finance', permissions: 'Voir biens, voir revenus, telecharger rapports' },
      { id: 'RP-2', acteur: 'M. Diallo', typeCompte: 'Locataire', role: 'Locataire standard', permissions: 'Payer loyer, voir contrat, soumettre demandes' },
    ],
    biens: [
      { ref: 'B-GES-01', adresse: 'Kaloum - Villa C12', type: 'Villa', proprietaire: 'M. Camara', statut: 'Loue', loyer: '2 500 000 GNF' },
      { ref: 'B-GES-02', adresse: 'Ratoma - Apt B5', type: 'Appartement', proprietaire: 'Mme Bah', statut: 'Disponible', loyer: '850 000 GNF' },
    ],
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
