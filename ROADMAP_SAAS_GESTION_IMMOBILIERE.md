# Roadmap SaaS - Gestion Immobiliere

## Contexte

Ce document sert de plan de mise en production d une plateforme SaaS de gestion immobiliere a partir de la base actuelle (espaces locataire, proprietaire, gestionnaire, integration Odoo).

Objectif: passer d une demo avancee a une plateforme fiable, securisee, multi-tenant et exploitable en production.

---

## Vision produit

Construire une plateforme SaaS professionnelle qui permet:

- aux locataires de payer, suivre leurs obligations et ouvrir des demandes,
- aux proprietaires de piloter leur patrimoine et leurs revenus,
- aux gestionnaires d administrer les acteurs, biens, roles, operations et conformite,
- aux agences de centraliser l activite commerciale et operationnelle.

---

## Principes de construction

- Backend first: jamais d appel direct sensible depuis le navigateur vers Odoo.
- Securite by design: auth, RBAC, audit, validation et chiffrement.
- Multi-tenant nativement: separation stricte des donnees par client.
- API contract stable: DTO clairs, pagination standard, codes erreur coherents.
- Observabilite obligatoire: logs, metrics, traces, alerting.

---

## Architecture cible (macro)

```text
Frontend React
   -> API SaaS (Node/Express ou autre)
      -> Service metier (auth, biens, paiements, demandes, documents)
      -> Adaptateur Odoo (JSON-RPC/API)
      -> Base de donnees applicative (metadonnees SaaS, audit, cache metier)
      -> Stockage documents (S3 compatible)
      -> Notifications (email/SMS/in-app)
```

---

## Plan 12 semaines

## Phase 1 (S1-S2) - Fondations techniques

### Objectifs

- Stabiliser architecture technique et domaines metier.
- Definir les standards API et schema de donnees.
- Mettre en place les environnements dev/staging.

### Travaux

- Definir domaines:
  - auth
  - users
  - roles-permissions
  - biens
  - baux
  - paiements
  - demandes
  - documents
  - notifications
- Creer conventions API:
  - format response success/error
  - pagination (`page`, `pageSize`, `total`)
  - tri/filtrage
  - codes erreurs metier
- Concevoir modele multi-tenant:
  - `tenant_id` sur toutes les entites metier
  - contraintes de separation logique
- Poser backend relais Odoo:
  - endpoints internes
  - mapping des donnees Odoo vers format SaaS

### Livrables

- Contrat d API v1
- Modele de donnees v1
- Environnements dev + staging operationnels

---

## Phase 2 (S3-S4) - Securite, Auth, RBAC

### Objectifs

- Securiser totalement les acces et les actions.
- Industrialiser les droits par role.

### Travaux

- Auth:
  - JWT access + refresh tokens
  - expiration/rotation
  - gestion de session
- RBAC:
  - roles standard: super_admin, admin_tenant, gestionnaire, proprietaire, locataire, lecteur
  - permissions granulaire: `resource:action`
- Enforcement:
  - verification cote backend sur chaque route
  - UI masque/desactive selon droits
- Audit:
  - journal d actions sensibles (create/update/delete/validate/payment)
  - conservation horodatee
- Securite applicative:
  - validation stricte des payloads
  - limitation rate
  - sanitization

### Livrables

- Auth/RBAC actifs sur API
- Journal d audit consultable
- Matrice de permissions versionnee

---

## Phase 3 (S5-S7) - Modules metier v1 connectes

### Objectifs

- Brancher les ecrans existants aux donnees reelles.
- Supprimer les dependances aux mocks sur flux critiques.

### Travaux par espace

#### Locataire

- Mon bien / mon contrat
- Paiement (Orange Money) + confirmation + historique
- Documents (contrat, recus)
- Demandes (incident, renovation, information)
- Notifications (rappel paiement, confirmation paiement, suivi demande)

#### Proprietaire

- Liste proprietes + statut
- Revenus mensuels
- Historique paiements
- Revenus par bien
- Documents et rapports PDF
- Notifications
- Demandes

#### Gestionnaire

- CRUD proprietaires
- CRUD locataires
- CRUD biens
- Attribution roles/permissions
- Vue operationnelle avec recherche, filtres, pagination

### Livrables

- Parcours end-to-end sans mock sur use cases critiques
- API de production integree au frontend

---

## Phase 4 (S8-S9) - Paiements et finance robustes

### Objectifs

- Fiabiliser monétique et coherence comptable.

### Travaux

- Integration Orange Money production:
  - init paiement
  - callback/webhook
  - idempotence par transaction
- Rapprochement:
  - paiement <-> periode <-> recu <-> statut bail
- Gestion impayes:
  - detection retard
  - relances automatiques
  - escalade gestionnaire
- Exports:
  - PDF et CSV par bien/proprietaire/periode

### Livrables

- Chaine paiement complete et traçable
- Historique financier coherent et exportable

---

## Phase 5 (S10-S11) - Workflows, notifications, documents

### Objectifs

- Industrialiser l operationnel quotidien.

### Travaux

- Workflows demandes:
  - nouvelle -> en cours -> resolue -> cloturee
  - SLA et priorites
- Notifications:
  - in-app
  - email
  - SMS optionnel
  - preferences utilisateur
- Documents:
  - templates versionnes
  - generation automatique (contrat, recu, rapports)
  - stockage et acces securise

### Livrables

- Workflows metier standardises
- Notifications multi-canal pilotables

---

## Phase 6 (S12) - Go-live et exploitation

### Objectifs

- Lancer en production avec maitrise du risque.

### Travaux

- CI/CD:
  - lint
  - tests unitaires/integration/E2E
  - quality gates
- Observabilite:
  - logs centralises
  - dashboards de sante
  - alerting incident
- Resilience:
  - sauvegardes
  - tests restauration
  - plan rollback
- Runbooks:
  - procedure incident paiement
  - procedure indisponibilite Odoo

### Livrables

- Go-live checklist validee
- Runbooks exploitation disponibles

---

## Plan 30 / 60 / 90 jours

## J+30

- API v1 definie et exposee
- Auth + RBAC minimum en place
- 2 parcours reels en bout en bout:
  - locataire paie loyer et recoit recu
  - gestionnaire cree bien visible proprietaire

## J+60

- Modules locataire/proprietaire/gestionnaire connectes
- Paiements + rapprochement operationnels
- Audit logs et exports financiers actifs

## J+90

- Plateforme multi-tenant stabilisee
- Workflows demandes + notifications complets
- Mise en production supervisee et KPI pilotes

---

## Backlog prioritaire post v1

- Signature electronique contrats
- Facturation SaaS (plans, quotas, abonnement)
- Portail mobile/PWA
- BI avancee et previsions de revenus
- Connecteurs additionnels (compta/ERP externes)

---

## KPIs de pilotage

## Produit

- taux activation comptes
- MAU par role
- retention a 30/90 jours

## Operationnel

- delai moyen de traitement des demandes
- taux resolution au premier passage
- taux vacance locative

## Finance

- taux paiement a echeance
- volume impayes
- temps moyen de rapprochement

## Technique

- disponibilite plateforme
- latence p95 API
- taux erreurs 5xx

---

## Risques et mitigations

- Dependance Odoo -> ajouter cache, retries, circuit breaker
- Mauvaise qualite data legacy -> scripts de validation + migration progressive
- Regressions UX -> tests E2E des parcours critiques
- Risque securite -> revue OWASP + pentest avant go-live

---

## Definition of Done (global)

Une fonctionnalite est consideree terminee si:

- comportement metier valide par cas de test,
- controle d acces applique cote backend,
- logs/audit disponibles pour action sensible,
- UX avec etats loading/error/success,
- documentation technique et fonctionnelle a jour.

---

## Prochaine execution recommandee (immediate)

1. Geler la matrice RBAC definitive.
2. Prioriser 5 endpoints API critiques:
   - `POST /payments/orange-money/init`
   - `POST /payments/orange-money/webhook`
   - `GET /tenants/:id/properties`
   - `POST /requests`
   - `GET /documents`
3. Connecter en premier:
   - paiement locataire
   - suivi revenus proprietaire
   - CRUD biens gestionnaire
4. Ajouter tests E2E sur ces 3 parcours.

