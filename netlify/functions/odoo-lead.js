/**
 * Netlify Function : envoi des leads du site vers Odoo (crm.lead).
 *
 * Variables d'environnement à définir dans Netlify (Site → Build & deploy → Environment) :
 *   ODOO_URL      ex. https://votre-instance.odoo.com
 *   ODOO_DB       nom de la base
 *   ODOO_USERNAME utilisateur API
 *   ODOO_PASSWORD mot de passe ou clé API
 *
 * Le frontend doit envoyer les requêtes ici (voir INTEGRATION_ODOO.md).
 */

async function odooJsonRpc(url, params) {
  const res = await fetch(`${url.replace(/\/$/, '')}/jsonrpc`, {
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
  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message || 'Odoo API error')
  }
  return data.result
}

async function odooLogin(url, db, username, password) {
  return odooJsonRpc(url, {
    service: 'common',
    method: 'login',
    args: [db, username, password],
  })
}

async function odooCreate(url, db, uid, password, model, record) {
  return odooJsonRpc(url, {
    service: 'object',
    method: 'execute_kw',
    args: [db, uid, password, model, 'create', [record]],
  })
}

function buildLeadName(type, body) {
  const label = {
    'estimation-rapide': 'Estimation rapide',
    estimation: 'Estimation',
    'gestion-locative': 'Gestion locative',
    'contact-bien': 'Contact bien',
  }[type] || type
  const name = body.name || body.lastName || body.firstName
  return name ? `[Site] ${label} - ${name}` : `[Site] ${label}`
}

function buildDescription(type, body) {
  const parts = [
    `Type: ${type}`,
    body.message,
    body.propertyType && `Type bien: ${body.propertyType}`,
    body.address && `Adresse: ${body.address}`,
    body.surface != null && `Surface: ${body.surface}`,
    body.rent != null && `Loyer souhaité: ${body.rent}`,
    body.priceLabel && `Bien: ${body.priceLabel}`,
    body.propertyTitle && `Bien: ${body.propertyTitle}`,
  ].filter(Boolean)
  return parts.join('\n')
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: '' }
  }

  const url = process.env.ODOO_URL
  const db = process.env.ODOO_DB
  const username = process.env.ODOO_USERNAME
  const password = process.env.ODOO_PASSWORD

  if (!url || !db || !username || !password) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: 'Configuration Odoo manquante (ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD)',
      }),
    }
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body
    const type = body.type || event.headers['x-lead-type'] || 'lead'
    const uid = await odooLogin(url, db, username, password)

    const leadData = {
      name: buildLeadName(type, body),
      email_from: body.email || '',
      phone: body.phone || '',
      description: buildDescription(type, body),
    }

    const id = await odooCreate(url, db, uid, password, 'crm.lead', leadData)

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
