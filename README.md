# Prestige & Gestion Immobilière – Conakry

Site vitrine et PWA de location et gestion locative haut de gamme à Conakry (appartements, maisons, magasins, immeubles, terrains).

## Fonctionnalités

- **Accueil** : Hero, services premium, biens en vedette, pourquoi nous choisir, formulaire d'estimation rapide, témoignages
- **Nos Biens** : Filtres (type, quartier, budget, surface, pièces), tri, vue grille/liste, fiches détaillées avec galerie, CTA (info, visite, partage), biens similaires
- **Gestion locative** : Présentation de l'offre, étapes du processus, avantages, FAQ, formulaire propriétaires
- **Estimation** : Formulaire détaillé (confidentiel et gratuit)
- **À propos** : Histoire, chiffres clés, engagements
- **PWA** : Installable, mise en cache pour consultation hors ligne, mise à jour auto
- **SEO** : Titres et meta description par page, `robots.txt`, `sitemap.xml`
- **RGPD** : Bandeau cookies, mentions légales, politique de confidentialité
- **Back-end** : API Express pour enregistrement des leads (estimation rapide, estimation, gestion locative, contact bien) et export CSV

## Technologies

- **Frontend** : React 19, Vite 5, React Router, Tailwind CSS, Framer Motion, React Hook Form, Lucide React
- **PWA** : vite-plugin-pwa (Workbox)
- **Backend** : Node.js, Express, stockage JSON (fichier `server/data/leads.json`)

## Mise en ligne (Git + Netlify)

### 1. Pousser le projet sur Git (GitHub / GitLab)

À la racine du projet :

```bash
git init
git add .
git commit -m "Initial commit - Site Gestion Locative"
```

Créez un dépôt **vide** sur [GitHub](https://github.com/new) (sans README ni .gitignore), puis :

```bash
git remote add origin https://github.com/VOTRE_UTILISATEUR/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

Remplacez `VOTRE_UTILISATEUR` et `VOTRE_REPO` par votre compte et le nom du dépôt.

### 2. Déployer sur Netlify

1. Allez sur [app.netlify.com](https://app.netlify.com) et connectez-vous (ou créez un compte).
2. **Add new site** → **Import an existing project**.
3. Choisissez **GitHub** (ou GitLab) et autorisez Netlify.
4. Sélectionnez le dépôt du projet.
5. Netlify détecte automatiquement la config grâce à `netlify.toml` :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
6. Cliquez sur **Deploy site**.

Le site sera en ligne à une URL du type `https://nom-aleatoire.netlify.app`. Vous pourrez définir un nom personnalisé ou un domaine personnalisé dans **Domain settings**.

> **Note** : Netlify héberge le **frontend**. Pour que les formulaires enregistrent les demandes en production, vous pouvez soit déployer l’API Express ailleurs (Render, Railway), soit **envoyer les leads vers Odoo** via la fonction fournie (voir [INTEGRATION_ODOO.md](INTEGRATION_ODOO.md)).

## Installation

```bash
npm install
```

## Développement

Démarrer le frontend (avec proxy API vers le serveur) :

```bash
npm run dev
```

Démarrer le serveur API (dans un second terminal) :

```bash
npm run server
```

Le site est sur `http://localhost:5173`, l’API sur `http://localhost:3001`. Les formulaires envoient les données à `/api/leads/*` (proxy Vite vers le serveur).

## Production

```bash
npm run build
npm run server
```

En production, `NODE_ENV=production` et le serveur servira les fichiers statiques depuis `dist/` et gérera les routes SPA.

## Export des leads

GET `http://localhost:3001/api/leads/export` retourne un fichier CSV de toutes les demandes (estimation rapide, estimation, gestion locative, contact bien). À protéger par authentification en production.

## PWA

- Icônes : ajouter dans `public/` les fichiers `pwa-192x192.png` et `pwa-512x512.png` pour l’icône d’installation. Sinon, le navigateur peut utiliser une icône par défaut.
- Après déploiement en HTTPS, l’utilisateur peut « Ajouter à l’écran d’accueil » (mobile/desktop).

## Configuration

- **Sitemap** : modifier l’URL de base dans `public/sitemap.xml` (remplacer `https://votredomaine.gn/` par votre domaine).
- **Coordonnées** : footer et liens (téléphone, email, WhatsApp) à adapter dans `src/components/Footer.jsx` et dans les CTA (fiche bien).
- **reCAPTCHA** : pour renforcer la protection des formulaires, ajouter une clé reCAPTCHA et l’intégrer dans les formulaires (cahier des charges phase 2).

## Structure

```
├── public/           # Assets statiques, favicon, robots.txt, sitemap.xml
├── server/           # API Express (leads, export CSV)
│   ├── index.js
│   └── data/         # leads.json (créé à la première soumission)
├── src/
│   ├── components/   # Layout, Header, Footer, CookieBanner, cartes, formulaires, SEO
│   ├── data/         # properties.js (données biens – à remplacer par API/CMS)
│   ├── pages/        # Accueil, Nos Biens, Fiche bien, Gestion locative, Estimation, À propos, Mentions, Confidentialité
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Évolutions possibles (cahier des charges)

- Back-office d’administration (gestion des biens, catégories, témoignages, médias)
- Carte interactive (Google Maps ou autre) avec marqueurs des biens
- Notifications push (nouveaux biens, rappels)
- Connexion CRM / emailing (Brevo, Mailchimp)
- Micro-données schema.org pour les annonces immobilières
