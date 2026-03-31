# Intégration du site avec Odoo

Ce document décrit comment connecter le site Gestion Locative à Odoo.

## Deux façons d’intégrer

### 1. Odoo comme backend (recommandé)

Le site React reste hébergé (Netlify, etc.) et utilise Odoo pour :

- **Biens immobiliers** : afficher les biens depuis un modèle Odoo (ex. `real.estate.property` ou modèle personnalisé).
- **Leads / demandes** : envoyer les formulaires (estimation, gestion locative, contact) vers Odoo (ex. `crm.lead` ou modèle personnalisé).

Avantages : un seul outil (Odoo) pour la gestion, le CRM et les contacts ; le site reste rapide et moderne.

### 2. Afficher le site dans Odoo (iframe)

Vous pouvez afficher le site dans une page Odoo (menu personnalisé, onglet « Site vitrine », etc.) via un **iframe** pointant vers l’URL du site (ex. `https://votre-site.netlify.app`).

- Dans Odoo : créer une page / action qui charge cette URL en iframe.
- Le site tourne tel quel ; il n’est pas « dans » Odoo au sens technique, mais il est visible depuis l’interface Odoo.

---

## Mise en œuvre : envoyer les leads vers Odoo

Pour que les formulaires du site (estimation rapide, estimation, gestion locative, contact bien) créent des enregistrements dans Odoo, il faut un **relais** entre le navigateur et Odoo (à cause des contrôles CORS et de la sécurité).

Schéma recommandé :

```
Navigateur (formulaire) → Votre API (Netlify Function / Express) → API Odoo
```

### Prérequis Odoo

1. **Module CRM** activé (pour `crm.lead`) ou modèle personnalisé pour les demandes.
2. **Accès API** : utilisateur technique avec droits sur les modèles utilisés.
3. **URL Odoo** : ex. `https://votre-odoo.com`

### Option A : Netlify Function (site hébergé sur Netlify)

Une fonction serverless reçoit les données du formulaire et appelle l’API Odoo (JSON-RPC). Pas de serveur à gérer.

- Fichier : `netlify/functions/odoo-lead.js` (voir exemple ci-dessous).
- Variables d’environnement Netlify : `ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_API_KEY` (ou mot de passe).

### Option B : Serveur Express existant

Votre serveur `server/index.js` peut, au lieu d’écrire dans `leads.json`, appeler Odoo pour créer un `crm.lead` (ou un enregistrement personnalisé). Idéal si vous hébergez déjà l’API (Render, Railway, etc.).

### Option C : Appel direct depuis le navigateur (si Odoo autorise CORS)

Si votre instance Odoo accepte les requêtes depuis le domaine du site (CORS configuré) et que vous exposez un contrôleur JSON-RPC ou une route API dédiée, le site peut appeler Odoo directement. Moins courant pour des raisons de sécurité.

---

## Exemple : Netlify Function qui envoie un lead à Odoo

Créer le fichier suivant. Les variables `ODOO_*` sont à définir dans Netlify (Site settings → Environment variables).

```javascript
// netlify/functions/odoo-lead.js
const ODOO_URL = process.env.ODOO_URL || ''  // ex. https://votre-odoo.com
const ODOO_DB = process.env.ODOO_DB || ''
const ODOO_USERNAME = process.env.ODOO_USERNAME || ''
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || ''  // ou API key selon votre Odoo

async function odooJsonRpc(url, method, params) {
  const res = await fetch(`${url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params,
      id: Math.floor(Math.random() * 1e9),
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message || data.error.message)
  return data.result
}

async function odooLogin() {
  const uid = await odooJsonRpc(ODOO_URL, 'call', {
    service: 'common',
    method: 'login',
    args: [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD],
  })
  return uid
}

async function odooCreateLead(uid, leadData) {
  return odooJsonRpc(ODOO_URL, 'call', {
    service: 'object',
    method: 'execute_kw',
    args: [ODOO_DB, uid, ODOO_PASSWORD, 'crm.lead', 'create', [leadData]],
  })
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: '' }
  }
  try {
    const body = JSON.parse(event.body || '{}')
    const { type, ...fields } = body
    const uid = await odooLogin()
    const leadData = {
      name: fields.name || fields.lastName
        ? `[Site] ${type || 'Lead'} - ${fields.name || fields.lastName || 'Sans nom'}`
        : `[Site] ${type || 'Lead'}`,
      email_from: fields.email || '',
      phone: fields.phone || '',
      description: [
        type,
        fields.message,
        fields.propertyType,
        fields.address,
        fields.surface,
        fields.priceLabel,
      ]
        .filter(Boolean)
        .join(' | '),
    }
    const id = await odooCreateLead(uid, leadData)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message }),
    }
  }
}
```

**Activation dans ce projet** : la fonction est déjà dans `netlify/functions/odoo-lead.js`. Pour l’utiliser :

1. Dans Netlify : **Site settings** → **Environment variables** → ajoutez `ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_PASSWORD`.
2. Pour que le frontend envoie vers cette fonction au lieu de `/api/leads/...`, définissez une variable au **build** :  
   **Build & deploy** → **Environment** → **Variable** :  
   `VITE_LEADS_API_BASE` = `/.netlify/functions/odoo-lead`  
   Puis redéployez. Les formulaires enverront alors vers Odoo (crm.lead).

---

## Récupérer les biens depuis Odoo

Si vos biens sont dans Odoo (modèle personnalisé ou module immobilier) :

1. Exposer une API côté Odoo (contrôleur HTTP ou module `website_form` / API custom) qui renvoie la liste des biens en JSON.
2. Dans le site React, remplacer l’import des données statiques (`src/data/properties.js`) par un `fetch` vers cette URL au chargement (ou via une Netlify Function qui appelle Odoo et renvoie le JSON).

Exemple d’appel Odoo pour lire des enregistrements (depuis un serveur) :

```javascript
// search_read sur un modèle ex. real.estate.property
const properties = await odooJsonRpc(ODOO_URL, 'call', {
  service: 'object',
  method: 'execute_kw',
  args: [ODOO_DB, uid, ODOO_PASSWORD, 'real.estate.property', 'search_read', [[]], { fields: ['name', 'price', 'surface', 'city', 'district', ...] }],
})
```

Vous devrez ensuite mapper les champs Odoo vers le format attendu par le site (slug, priceLabel, images, etc.).

---

## Résumé

| Besoin                         | Solution recommandée                                      |
|--------------------------------|-----------------------------------------------------------|
| Recevoir les leads dans Odoo   | Netlify Function ou Express qui appelle l’API Odoo        |
| Afficher le site dans Odoo     | Page Odoo avec iframe vers l’URL du site                  |
| Gérer les biens dans Odoo      | Modèle Odoo + API ou fonction qui renvoie les biens en JSON |

Si vous précisez votre version d’Odoo et où le site est hébergé (Netlify uniquement ou aussi un serveur), on peut adapter le code exact (modèles, champs, URL des formulaires).
