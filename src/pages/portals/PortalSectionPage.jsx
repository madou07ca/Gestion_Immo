import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import { espacePortals } from '../../data/espacePortals'
import { tables } from '../../data/portalMockData'

const PAGE_SIZE = 5
const API_BASE = '/api'

function mapOwnerToRow(owner) {
  return {
    id: owner.id,
    nom: owner.nom || '-',
    email: owner.email || '-',
    telephone: owner.telephone || '-',
    statut: owner.statut || 'Actif',
  }
}

function mapTenantToRow(tenant) {
  return {
    id: tenant.id,
    nom: tenant.nom || '-',
    email: tenant.email || '-',
    telephone: tenant.telephone || '-',
    statut: tenant.statut || 'Actif',
  }
}

function mapPropertyToRow(property, owners, tenants) {
  const owner = owners.find((item) => item.id === property.proprietaireId)
  const tenant = tenants.find((item) => item.id === property.locataireId)
  const status = String(property.statut || '-')
  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  return {
    ref: property.id,
    adresse: property.adresse || '-',
    type: property.type || '-',
    proprietaire: owner?.nom || property.proprietaireId || '-',
    statut: normalizedStatus,
    published: Boolean(property.published),
    loyer: Number.isFinite(Number(property.loyerMensuel))
      ? `${Number(property.loyerMensuel).toLocaleString('fr-FR')} GNF`
      : '-',
    locataire: tenant?.nom || '-',
  }
}

function formatType(type) {
  const source = String(type || '').replace(/-/g, ' ')
  return source.charAt(0).toUpperCase() + source.slice(1)
}

function SimpleTable({ columns, rows, rowKey }) {
  if (!rows?.length) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-night-600 rounded-xl">
        Aucune donnée pour cette section (démo).
      </p>
    )
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-night-600">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-night-600 bg-night-800/80">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium text-gray-400 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-night-600">
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)} className="hover:bg-night-800/40">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-gray-300">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PaginationControls({ page, total, onPrev, onNext }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-end gap-3 text-xs text-gray-400">
      <button type="button" onClick={onPrev} disabled={page <= 1} className="rounded border border-night-600 px-2 py-1 disabled:opacity-40">
        Prec.
      </button>
      <span>Page {page} / {total}</span>
      <button type="button" onClick={onNext} disabled={page >= total} className="rounded border border-night-600 px-2 py-1 disabled:opacity-40">
        Suiv.
      </button>
    </div>
  )
}

export default function PortalSectionPage() {
  const { slug, section } = useParams()
  const navigate = useNavigate()
  const portal = espacePortals[slug]
  const data = tables[slug]?.[section]
  const locataireData = tables.locataire
  const proprietaireData = tables.proprietaire
  const gestionnaireData = tables.gestionnaire
  const [pendingPayments, setPendingPayments] = useState(() => locataireData?.paiements || [])
  const [paymentHistory, setPaymentHistory] = useState(() => locataireData?.['historique-paiements'] || [])
  const [locataireQuittances, setLocataireQuittances] = useState([])
  const [paymentEmailFeedback, setPaymentEmailFeedback] = useState('')
  const [notifications, setNotifications] = useState(() => locataireData?.notifications || [])
  const [demandes, setDemandes] = useState(() => locataireData?.demandes || [])
  const [paymentForm, setPaymentForm] = useState({
    orangeNumber: '',
    transactionRef: '',
    selected: [],
  })
  const [paymentFeedback, setPaymentFeedback] = useState('')
  const [demandeForm, setDemandeForm] = useState({
    type: 'Incident',
    sujet: '',
    priorite: 'Normale',
    details: '',
  })
  const [demandeFeedback, setDemandeFeedback] = useState('')
  const [ownerNotifications, setOwnerNotifications] = useState(() => proprietaireData?.notifications || [])
  const [ownerDemandes, setOwnerDemandes] = useState(() => proprietaireData?.demandes || [])
  const [ownerDemandeForm, setOwnerDemandeForm] = useState({
    type: 'Incident',
    bien: '',
    sujet: '',
    priorite: 'Normale',
    details: '',
  })
  const [ownerDemandeFeedback, setOwnerDemandeFeedback] = useState('')
  const [gestionnaireProprietaires, setGestionnaireProprietaires] = useState(() => gestionnaireData?.proprietaires || [])
  const [gestionnaireLocataires, setGestionnaireLocataires] = useState(() => gestionnaireData?.locataires || [])
  const [gestionnaireRoles, setGestionnaireRoles] = useState(() => gestionnaireData?.['roles-permissions'] || [])
  const [gestionnaireBiens, setGestionnaireBiens] = useState(() => gestionnaireData?.biens || [])
  const [gestionnaireQuittancesStats, setGestionnaireQuittancesStats] = useState(() => gestionnaireData?.quittances || [])
  const [gestionnaireAccess, setGestionnaireAccess] = useState([])
  const [gestionnaireProspects, setGestionnaireProspects] = useState([])
  const [prospectReply, setProspectReply] = useState({})
  const [locataireContext, setLocataireContext] = useState({ tenant: null, bien: null })
  const [userForm, setUserForm] = useState({ type: 'proprietaire', nom: '', email: '', telephone: '' })
  const [roleForm, setRoleForm] = useState({ acteur: '', typeCompte: 'Locataire', role: '', permissions: '' })
  const [accessForm, setAccessForm] = useState({ role: 'locataire', nom: '', email: '', code: '1234', linkedId: '' })
  const [bienForm, setBienForm] = useState({
    titre: '',
    adresse: '',
    type: 'appartement',
    proprietaireId: '',
    locataireId: '',
    statut: 'disponible',
    loyerMensuel: '',
  })
  const [gestionnaireFeedback, setGestionnaireFeedback] = useState('')
  const [gestionnaireSubmitting, setGestionnaireSubmitting] = useState(false)
  const [contratForm, setContratForm] = useState({
    bienId: '',
    locataireId: '',
    dateDebut: '',
    dateFin: '',
    loyerMensuel: '',
  })
  const [contratPrefilled, setContratPrefilled] = useState(false)
  const [gestionnaireSearch, setGestionnaireSearch] = useState('')
  const [gestionnairePage, setGestionnairePage] = useState(1)
  const [accessProfile, setAccessProfile] = useState('admin')

  if (!portal) return null

  const title = section
    ? section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ')
    : ''

  if (section === 'reporting' && (!data || data.length === 0)) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Reporting</h1>
        <p className="text-gray-500 text-sm mb-8">Exports et graphiques (démo)</p>
        <div className="rounded-xl border border-night-600 bg-gradient-to-br from-night-800 to-night-900 p-12 text-center">
          <div className="h-48 rounded-lg bg-night-700/50 border border-night-600 flex items-end justify-around gap-2 px-8 pb-0">
            {[40, 65, 45, 80, 55, 70].map((h, i) => (
              <div
                key={i}
                className="w-full max-w-[48px] rounded-t bg-gradient-to-t from-gold-600/40 to-gold-400/60"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-6">
            Graphiques et exports CSV / PDF seront disponibles ici.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-500/20 border border-gold-500/40 px-4 py-2 text-sm text-gold-300"
          >
            <Download size={16} />
            Simuler export PDF
          </button>
        </div>
      </div>
    )
  }

  let content = null
  const permissionMap = {
    admin: { create: true, update: true, delete: true },
    gestionnaire: { create: true, update: true, delete: false },
    consultation: { create: false, update: false, delete: false },
  }
  const can = (action) => permissionMap[accessProfile]?.[action]

  const formatGNF = (amount) => `${amount.toLocaleString('fr-FR')} GNF`
  const selectedPayments = useMemo(
    () => pendingPayments.filter((p) => paymentForm.selected.includes(p.id)),
    [pendingPayments, paymentForm.selected],
  )
  const selectedTotal = selectedPayments.reduce((sum, item) => sum + item.montant, 0)
  const normalizedSearch = gestionnaireSearch.trim().toLowerCase()

  const filterBySearch = (rows, fields) => {
    if (!normalizedSearch) return rows
    return rows.filter((row) =>
      fields.some((field) => String(row[field] || '').toLowerCase().includes(normalizedSearch)),
    )
  }

  const paginate = (rows) => {
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
    const safePage = Math.min(gestionnairePage, totalPages)
    const start = (safePage - 1) * PAGE_SIZE
    return {
      rows: rows.slice(start, start + PAGE_SIZE),
      totalPages,
      safePage,
    }
  }

  useEffect(() => {
    if (slug !== 'gestionnaire') return

    let isMounted = true

    const loadCollections = async () => {
      try {
        const [ownersRes, tenantsRes, propertiesRes, prospectsRes, quittancesRes, accessRes] = await Promise.all([
          fetch(`${API_BASE}/proprietaires`),
          fetch(`${API_BASE}/locataires`),
          fetch(`${API_BASE}/biens`),
          fetch(`${API_BASE}/prospects/interets`),
          fetch(`${API_BASE}/gestionnaire/quittances`),
          fetch(`${API_BASE}/admin/acces`),
        ])

        if (!ownersRes.ok || !tenantsRes.ok || !propertiesRes.ok || !prospectsRes.ok || !quittancesRes.ok || !accessRes.ok) {
          throw new Error('Erreur de chargement des donnees.')
        }

        const [ownersData, tenantsData, propertiesData, prospectsData, quittancesData, accessData] = await Promise.all([
          ownersRes.json(),
          tenantsRes.json(),
          propertiesRes.json(),
          prospectsRes.json(),
          quittancesRes.json(),
          accessRes.json(),
        ])

        if (!isMounted) return

        const ownerRows = ownersData.map(mapOwnerToRow)
        const tenantRows = tenantsData.map(mapTenantToRow)
        const propertyRows = propertiesData.map((property) =>
          mapPropertyToRow(property, ownersData, tenantsData),
        )

        setGestionnaireProprietaires((prev) => (ownerRows.length > 0 ? ownerRows : prev))
        setGestionnaireLocataires((prev) => (tenantRows.length > 0 ? tenantRows : prev))
        setGestionnaireBiens((prev) => (propertyRows.length > 0 ? propertyRows : prev))
        setGestionnaireProspects(Array.isArray(prospectsData) ? prospectsData : [])
        setGestionnaireAccess(Array.isArray(accessData) ? accessData : [])
        if (Array.isArray(quittancesData) && quittancesData.length > 0) {
          const grouped = quittancesData.reduce((acc, item) => {
            const period = item.periode || '-'
            if (!acc[period]) {
              acc[period] = { periode: period, generees: 0, erreurs: 0, relances: 0 }
            }
            acc[period].generees += 1
            return acc
          }, {})
          setGestionnaireQuittancesStats(Object.values(grouped))
        }
      } catch {
        if (isMounted) {
          setGestionnaireFeedback('API locale indisponible: affichage des donnees de demonstration.')
        }
      }
    }

    loadCollections()

    return () => {
      isMounted = false
    }
  }, [slug])

  useEffect(() => {
    if (slug !== 'locataire') return
    let isMounted = true
    const loadLocataireData = async () => {
      try {
        const res = await fetch(`${API_BASE}/locataire/me`)
        if (!res.ok) return
        const payload = await res.json()
        if (!isMounted || !payload?.ok) return
        const next = payload.data
        setLocataireContext({ tenant: next.tenant || null, bien: next.bien || null })
        if (Array.isArray(next.paiements)) {
          setPendingPayments(next.paiements)
        }
        if (Array.isArray(next.historiquePaiements)) {
          setPaymentHistory(next.historiquePaiements)
        }
        if (Array.isArray(next.quittances)) {
          setLocataireQuittances(next.quittances)
        }
        if (Array.isArray(next.demandes)) {
          const mappedDemandes = next.demandes.map((item) => ({
            id: item.id,
            type: item.type,
            sujet: item.sujet,
            date: new Date(item.createdAt).toLocaleDateString('fr-FR'),
            statut: item.statut,
            priorite: item.priorite,
          }))
          setDemandes(mappedDemandes)
        }
      } catch {
        // fallback vers les donnees de demo
      }
    }
    loadLocataireData()
    return () => {
      isMounted = false
    }
  }, [slug])

  const togglePaymentSelection = (paymentId) => {
    setPaymentFeedback('')
    setPaymentForm((prev) => ({
      ...prev,
      selected: prev.selected.includes(paymentId)
        ? prev.selected.filter((id) => id !== paymentId)
        : [...prev.selected, paymentId],
    }))
  }

  const submitOrangePayment = async () => {
    setPaymentEmailFeedback('')
    if (!paymentForm.orangeNumber || !paymentForm.transactionRef || paymentForm.selected.length === 0) {
      setPaymentFeedback('Veuillez renseigner le numero Orange Money, la reference et selectionner au moins une ligne.')
      return
    }

    const paidRows = pendingPayments.filter((p) => paymentForm.selected.includes(p.id))
    if (paidRows.length === 0) {
      setPaymentFeedback('Aucune ligne valide selectionnee pour le paiement.')
      return
    }

    const now = new Date()
    const dateLabel = now.toLocaleDateString('fr-FR')
    const total = paidRows.reduce((sum, item) => sum + item.montant, 0)
    const periodLabel = paidRows.map((row) => row.libelle.replace('Loyer ', '').replace('Charges ', '')).join(' + ')

    if (locataireContext.tenant?.id) {
      try {
        const res = await fetch(`${API_BASE}/locataire/me/paiements/regler`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locataireId: locataireContext.tenant.id,
            paiementIds: paymentForm.selected,
            moyen: 'Orange Money',
            reference: paymentForm.transactionRef.trim(),
          }),
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          setPaymentFeedback(payload?.error || 'Paiement impossible.')
          return
        }
      } catch {
        setPaymentFeedback('Connexion impossible au serveur API.')
        return
      }
    }

    setPendingPayments((prev) => prev.filter((p) => !paymentForm.selected.includes(p.id)))
    setPaymentHistory((prev) => [
      {
        id: Number(now.getTime()),
        date: dateLabel,
        periode: periodLabel,
        moyen: 'Orange Money',
        montant: formatGNF(total),
        reference: paymentForm.transactionRef.trim(),
        statut: 'Confirme',
      },
      ...prev,
    ])
    setNotifications((prev) => [
      {
        id: `N-${now.getTime()}`,
        type: 'Confirmation paiement',
        titre: 'Paiement confirme',
        message: `Paiement Orange Money confirme pour ${formatGNF(total)} (ref: ${paymentForm.transactionRef.trim()}).`,
        date: `${dateLabel} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        statut: 'Non lu',
        canal: 'In-app',
      },
      ...prev,
    ])

    setPaymentForm({
      orangeNumber: '',
      transactionRef: '',
      selected: [],
    })
    setPaymentFeedback('Paiement enregistre avec succes. La confirmation a ete ajoutee aux notifications.')
  }

  const submitDemande = async () => {
    if (!demandeForm.sujet.trim() || !demandeForm.details.trim()) {
      setDemandeFeedback('Merci de renseigner le sujet et la description detaillee de la demande.')
      return
    }

    const now = new Date()
    let newDemande = {
      id: Math.floor(1000 + Math.random() * 9000),
      type: demandeForm.type,
      sujet: demandeForm.sujet.trim(),
      date: now.toLocaleDateString('fr-FR'),
      statut: 'Nouvelle',
      priorite: demandeForm.priorite,
    }

    if (locataireContext.tenant?.id) {
      try {
        const res = await fetch(`${API_BASE}/locataire/me/demandes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locataireId: locataireContext.tenant.id,
            type: demandeForm.type,
            sujet: demandeForm.sujet.trim(),
            details: demandeForm.details.trim(),
            priorite: demandeForm.priorite,
          }),
        })
        const payload = await res.json().catch(() => ({}))
        if (res.ok && payload?.data) {
          newDemande = {
            id: payload.data.id,
            type: payload.data.type,
            sujet: payload.data.sujet,
            date: new Date(payload.data.createdAt).toLocaleDateString('fr-FR'),
            statut: payload.data.statut,
            priorite: payload.data.priorite,
          }
        }
      } catch {
        // fallback local deja gere ci-dessous
      }
    }

    setDemandes((prev) => [newDemande, ...prev])
    setNotifications((prev) => [
      {
        id: `N-${now.getTime()}-D`,
        type: 'Suivi demande',
        titre: `Demande ${newDemande.id} enregistree`,
        message: `Votre demande "${newDemande.sujet}" a ete transmise a la gestion.`,
        date: `${newDemande.date} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        statut: 'Non lu',
        canal: 'In-app',
      },
      ...prev,
    ])

    setDemandeForm({
      type: 'Incident',
      sujet: '',
      priorite: 'Normale',
      details: '',
    })
    setDemandeFeedback(`Demande #${newDemande.id} soumise avec succes.`)
  }

  const sendQuittanceByEmail = async (quittanceId) => {
    try {
      const res = await fetch(`${API_BASE}/quittances/${quittanceId}/send-email`, { method: 'POST' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPaymentEmailFeedback(payload?.error || 'Envoi email impossible.')
        return
      }
      setPaymentEmailFeedback(`Quittance envoyee a ${payload.data.to}.`)
    } catch {
      setPaymentEmailFeedback('Connexion impossible au serveur API.')
    }
  }

  const submitOwnerDemande = () => {
    if (!ownerDemandeForm.sujet.trim() || !ownerDemandeForm.details.trim() || !ownerDemandeForm.bien.trim()) {
      setOwnerDemandeFeedback('Merci de renseigner le bien, le sujet et la description detaillee.')
      return
    }

    const now = new Date()
    const newDemande = {
      id: Math.floor(10000 + Math.random() * 90000),
      type: ownerDemandeForm.type,
      sujet: ownerDemandeForm.sujet.trim(),
      bien: ownerDemandeForm.bien.trim(),
      date: now.toLocaleDateString('fr-FR'),
      statut: 'Nouvelle',
      priorite: ownerDemandeForm.priorite,
    }

    setOwnerDemandes((prev) => [newDemande, ...prev])
    setOwnerNotifications((prev) => [
      {
        id: `P-N-${now.getTime()}`,
        type: 'Suivi demande',
        titre: `Demande ${newDemande.id} enregistree`,
        message: `Votre demande sur le bien ${newDemande.bien} a ete prise en charge par la gestion.`,
        date: `${newDemande.date} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        statut: 'Non lu',
        canal: 'In-app + Email',
      },
      ...prev,
    ])
    setOwnerDemandeForm({
      type: 'Incident',
      bien: '',
      sujet: '',
      priorite: 'Normale',
      details: '',
    })
    setOwnerDemandeFeedback(`Demande #${newDemande.id} soumise avec succes.`)
  }

  const submitGestionnaireUser = async () => {
    if (!can('create')) {
      setGestionnaireFeedback('Creation non autorisee pour ce profil.')
      return
    }
    if (!userForm.nom.trim() || !userForm.email.trim()) {
      setGestionnaireFeedback('Renseignez au minimum le nom et l email.')
      return
    }

    setGestionnaireSubmitting(true)
    try {
      const endpoint = userForm.type === 'proprietaire' ? 'proprietaires' : 'locataires'
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: userForm.nom.trim(),
          email: userForm.email.trim(),
          telephone: userForm.telephone.trim(),
        }),
      })
      const payload = await res.json()
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Creation impossible.')
        return
      }

      const row = userForm.type === 'proprietaire'
        ? mapOwnerToRow(payload.data)
        : mapTenantToRow(payload.data)

      if (userForm.type === 'proprietaire') {
        setGestionnaireProprietaires((prev) => [row, ...prev])
      } else {
        setGestionnaireLocataires((prev) => [row, ...prev])
      }
      setUserForm({ type: userForm.type, nom: '', email: '', telephone: '' })
      setGestionnaireFeedback(`${userForm.type === 'proprietaire' ? 'Proprietaire' : 'Locataire'} cree avec succes.`)
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const deleteGestionnaireUser = async (type, id) => {
    if (!can('delete')) {
      setGestionnaireFeedback('Suppression non autorisee pour ce profil.')
      return
    }
    if (!window.confirm('Confirmer la suppression de ce compte ?')) return

    setGestionnaireSubmitting(true)
    try {
      const endpoint = type === 'proprietaire' ? 'proprietaires' : 'locataires'
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'DELETE' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Suppression impossible.')
        return
      }

      if (type === 'proprietaire') {
        setGestionnaireProprietaires((prev) => prev.filter((item) => item.id !== id))
      } else {
        setGestionnaireLocataires((prev) => prev.filter((item) => item.id !== id))
      }
      setGestionnaireFeedback('Compte supprime.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const toggleUserStatus = async (type, id) => {
    if (!can('update')) {
      setGestionnaireFeedback('Modification non autorisee pour ce profil.')
      return
    }

    const list = type === 'proprietaire' ? gestionnaireProprietaires : gestionnaireLocataires
    const current = list.find((row) => row.id === id)
    if (!current) return
    const nextStatut = current.statut === 'Actif' ? 'Suspendu' : 'Actif'

    setGestionnaireSubmitting(true)
    try {
      const endpoint = type === 'proprietaire' ? 'proprietaires' : 'locataires'
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: current.nom,
          email: current.email === '-' ? '' : current.email,
          telephone: current.telephone === '-' ? '' : current.telephone,
          statut: nextStatut,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Mise a jour impossible.')
        return
      }

      const mapper = (row) => (row.id === id ? { ...row, statut: nextStatut } : row)
      if (type === 'proprietaire') {
        setGestionnaireProprietaires((prev) => prev.map(mapper))
      } else {
        setGestionnaireLocataires((prev) => prev.map(mapper))
      }
      setGestionnaireFeedback('Statut utilisateur mis a jour.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const submitRolePermission = () => {
    if (!can('update')) {
      setGestionnaireFeedback('Attribution non autorisee pour ce profil.')
      return
    }
    if (!roleForm.acteur.trim() || !roleForm.role.trim() || !roleForm.permissions.trim()) {
      setGestionnaireFeedback('Completez acteur, role et permissions.')
      return
    }
    const newRole = {
      id: `RP-${Math.floor(10 + Math.random() * 90)}`,
      acteur: roleForm.acteur.trim(),
      typeCompte: roleForm.typeCompte,
      role: roleForm.role.trim(),
      permissions: roleForm.permissions.trim(),
    }
    setGestionnaireRoles((prev) => [newRole, ...prev])
    setRoleForm({ acteur: '', typeCompte: 'Locataire', role: '', permissions: '' })
    setGestionnaireFeedback('Role et permissions attribues.')
  }

  const submitAccessUser = async () => {
    if (!can('create')) {
      setGestionnaireFeedback('Creation non autorisee pour ce profil.')
      return
    }
    if (!accessForm.email.trim() || !accessForm.code.trim() || !accessForm.role.trim()) {
      setGestionnaireFeedback('Renseignez role, email et code.')
      return
    }

    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/acces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: accessForm.role,
          nom: accessForm.nom.trim(),
          email: accessForm.email.trim(),
          code: accessForm.code.trim(),
          linkedId: accessForm.linkedId.trim(),
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Creation acces impossible.')
        return
      }
      setGestionnaireAccess((prev) => [payload.data, ...prev])
      setAccessForm({ role: 'locataire', nom: '', email: '', code: '1234', linkedId: '' })
      setGestionnaireFeedback('Acces utilisateur cree avec succes.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const toggleAccessStatus = async (accessItem) => {
    if (!can('update')) {
      setGestionnaireFeedback('Modification non autorisee pour ce profil.')
      return
    }
    const nextStatut = accessItem.statut === 'Actif' ? 'Inactif' : 'Actif'
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/acces/${accessItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nextStatut }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Mise a jour acces impossible.')
        return
      }
      setGestionnaireAccess((prev) => prev.map((item) => (item.id === accessItem.id ? payload.data : item)))
      setGestionnaireFeedback('Statut acces mis a jour.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const deleteAccessUser = async (accessItem) => {
    if (!can('delete')) {
      setGestionnaireFeedback('Suppression non autorisee pour ce profil.')
      return
    }
    if (!window.confirm('Confirmer la suppression de cet acces ?')) return
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/acces/${accessItem.id}`, { method: 'DELETE' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Suppression acces impossible.')
        return
      }
      setGestionnaireAccess((prev) => prev.filter((item) => item.id !== accessItem.id))
      setGestionnaireFeedback('Acces supprime.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const resetAccessCode = async (accessItem) => {
    if (!can('update')) {
      setGestionnaireFeedback('Modification non autorisee pour ce profil.')
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/acces/${accessItem.id}/reset-code`, { method: 'POST' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Reinitialisation code impossible.')
        return
      }
      setGestionnaireAccess((prev) => prev.map((item) => (item.id === accessItem.id ? payload.data : item)))
      const temporaryCode = payload.temporaryCode
      let copied = false
      if (temporaryCode && navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(temporaryCode)
          copied = true
        } catch {
          copied = false
        }
      }
      setGestionnaireFeedback(
        copied
          ? `Code temporaire genere et copie: ${temporaryCode}`
          : `Code temporaire genere: ${temporaryCode}`,
      )
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const submitBienGestionnaire = async () => {
    if (!can('create')) {
      setGestionnaireFeedback('Creation non autorisee pour ce profil.')
      return
    }
    if (!bienForm.titre.trim() || !bienForm.adresse.trim() || !bienForm.proprietaireId || !bienForm.loyerMensuel) {
      setGestionnaireFeedback('Renseignez titre, adresse, proprietaire et loyer.')
      return
    }

    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/biens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: bienForm.titre.trim(),
          type: bienForm.type,
          adresse: bienForm.adresse.trim(),
          proprietaireId: bienForm.proprietaireId,
          locataireId: bienForm.locataireId || undefined,
          statut: bienForm.statut,
          loyerMensuel: Number(bienForm.loyerMensuel),
        }),
      })
      const payload = await res.json()
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Creation du bien impossible.')
        return
      }

      const propertyRow = mapPropertyToRow(
        payload.data,
        gestionnaireProprietaires.map((row) => ({ id: row.id, nom: row.nom })),
        gestionnaireLocataires.map((row) => ({ id: row.id, nom: row.nom })),
      )
      setGestionnaireBiens((prev) => [propertyRow, ...prev])
      setBienForm({
        titre: '',
        adresse: '',
        type: 'appartement',
        proprietaireId: '',
        locataireId: '',
        statut: 'disponible',
        loyerMensuel: '',
      })
      setGestionnaireFeedback('Bien enregistre avec succes.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const deleteBienGestionnaire = async (ref) => {
    if (!can('delete')) {
      setGestionnaireFeedback('Suppression non autorisee pour ce profil.')
      return
    }
    if (!window.confirm('Confirmer la suppression de ce bien ?')) return

    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/biens/${ref}`, { method: 'DELETE' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Suppression du bien impossible.')
        return
      }

      setGestionnaireBiens((prev) => prev.filter((item) => item.ref !== ref))
      setGestionnaireFeedback('Bien supprime.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const cycleBienStatus = async (ref) => {
    if (!can('update')) {
      setGestionnaireFeedback('Modification non autorisee pour ce profil.')
      return
    }
    const order = ['Disponible', 'Loue', 'Maintenance']
    const current = gestionnaireBiens.find((item) => item.ref === ref)
    if (!current) return
    const idx = order.indexOf(current.statut)
    const nextStatus = order[(idx + 1) % order.length]

    setGestionnaireSubmitting(true)
    try {
      const normalizedStatus = nextStatus.toLowerCase()
      const res = await fetch(`${API_BASE}/biens/${ref}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: normalizedStatus }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Mise a jour du bien impossible.')
        return
      }

      setGestionnaireBiens((prev) =>
        prev.map((item) => (item.ref === ref ? { ...item, statut: nextStatus } : item)),
      )
      setGestionnaireFeedback('Statut du bien mis a jour.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const toggleBienPublish = async (ref) => {
    if (!can('update')) {
      setGestionnaireFeedback('Publication non autorisee pour ce profil.')
      return
    }
    const current = gestionnaireBiens.find((item) => item.ref === ref)
    if (!current) return
    const next = !Boolean(current.published)
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/biens/${ref}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Publication impossible.')
        return
      }
      setGestionnaireBiens((prev) => prev.map((item) => (item.ref === ref ? { ...item, published: next } : item)))
      setGestionnaireFeedback(next ? 'Bien publie sur le site.' : 'Bien depublie du site.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const submitContratSignature = async () => {
    if (!can('create')) {
      setGestionnaireFeedback('Signature non autorisee pour ce profil.')
      return
    }
    if (!contratForm.bienId || !contratForm.locataireId || !contratForm.dateDebut || !contratForm.dateFin) {
      setGestionnaireFeedback('Renseignez bien, locataire, date debut et date fin.')
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/contrats/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bienId: contratForm.bienId,
          locataireId: contratForm.locataireId,
          dateDebut: contratForm.dateDebut,
          dateFin: contratForm.dateFin,
          loyerMensuel: contratForm.loyerMensuel ? Number(contratForm.loyerMensuel) : undefined,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Signature impossible.')
        return
      }
      const updatedBien = payload.bien
      const tenantName = gestionnaireLocataires.find((item) => item.id === contratForm.locataireId)?.nom || contratForm.locataireId
      setGestionnaireBiens((prev) =>
        prev.map((item) => (item.ref === updatedBien.id ? { ...item, statut: 'Loue', locataire: tenantName } : item)),
      )
      setContratForm({ bienId: '', locataireId: '', dateDebut: '', dateFin: '', loyerMensuel: '' })
      setContratPrefilled(false)
      setGestionnaireFeedback('Contrat signe et bien attribue au locataire.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const updateProspect = async (prospectId, nextStatus) => {
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/prospects/interets/${prospectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut: nextStatus,
          managerReply: prospectReply[prospectId] || '',
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Mise a jour prospect impossible.')
        return
      }
      setGestionnaireProspects((prev) =>
        prev.map((item) => (item.id === prospectId ? { ...item, ...payload.data } : item)),
      )
      setGestionnaireFeedback('Interaction prospect mise a jour.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const convertProspectToTenant = async (prospect, goToBail = false) => {
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/prospects/interets/${prospect.id}/convertir-locataire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: `Conversion depuis le prospect ${prospect.nom}` }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Conversion prospect impossible.')
        return
      }

      const createdTenant = mapTenantToRow(payload.data.locataire)
      setGestionnaireLocataires((prev) => [createdTenant, ...prev])
      setGestionnaireProspects((prev) =>
        prev.map((item) => (item.id === prospect.id ? { ...item, ...payload.data.prospect } : item)),
      )

      const relatedBien = gestionnaireBiens.find((item) => item.ref === prospect.propertyId)
      setContratForm((prev) => ({
        ...prev,
        bienId: relatedBien ? relatedBien.ref : prev.bienId,
        locataireId: createdTenant.id,
        loyerMensuel: relatedBien ? String((relatedBien.loyer || '').replace(/[^\d]/g, '')) : prev.loyerMensuel,
      }))
      setContratPrefilled(true)

      if (relatedBien) {
        setGestionnaireFeedback('Prospect converti: formulaire de bail pre-rempli (bien + locataire).')
      } else {
        setGestionnaireFeedback('Prospect converti en locataire. Selectionnez le bien dans la section bail.')
      }

      if (goToBail) {
        navigate('/espace/gestionnaire/app/biens')
      }
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  if (slug === 'locataire') {
    if (section === 'bien') {
      const bien = locataireContext.bien
        ? {
            reference: locataireContext.bien.id,
            adresse: `${locataireContext.bien.adresse || ''} ${locataireContext.bien.ville || ''}`.trim(),
            type: formatType(locataireContext.bien.type),
            surface: locataireContext.bien.surface ? `${locataireContext.bien.surface} m2` : '-',
            bailDebut: '-',
            bailFin: '-',
            loyerMensuel: Number(locataireContext.bien.loyerMensuel || 0).toLocaleString('fr-FR') + ' GNF',
            chargesMensuelles: Number(locataireContext.bien.chargesMensuelles || 0).toLocaleString('fr-FR') + ' GNF',
            statutOccupation: locataireContext.bien.statut || '-',
          }
        : locataireData?.bien
      content = (
        <div className="rounded-xl border border-night-600 bg-night-800/30 p-6">
          <h3 className="font-semibold text-white mb-4">Informations du bien loue</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-night-600 bg-night-900/60 p-4">
              <p className="text-gray-500">Reference</p>
              <p className="text-gray-200 mt-1">{bien?.reference}</p>
            </div>
            <div className="rounded-lg border border-night-600 bg-night-900/60 p-4">
              <p className="text-gray-500">Type et surface</p>
              <p className="text-gray-200 mt-1">{bien?.type} - {bien?.surface}</p>
            </div>
            <div className="rounded-lg border border-night-600 bg-night-900/60 p-4 sm:col-span-2">
              <p className="text-gray-500">Adresse</p>
              <p className="text-gray-200 mt-1">{bien?.adresse}</p>
            </div>
            <div className="rounded-lg border border-night-600 bg-night-900/60 p-4">
              <p className="text-gray-500">Loyer mensuel</p>
              <p className="text-gold-300 mt-1 font-medium">{bien?.loyerMensuel}</p>
            </div>
            <div className="rounded-lg border border-night-600 bg-night-900/60 p-4">
              <p className="text-gray-500">Charges mensuelles</p>
              <p className="text-gold-300 mt-1 font-medium">{bien?.chargesMensuelles}</p>
            </div>
            <div className="rounded-lg border border-night-600 bg-night-900/60 p-4">
              <p className="text-gray-500">Bail</p>
              <p className="text-gray-200 mt-1">Du {bien?.bailDebut} au {bien?.bailFin}</p>
            </div>
            <div className="rounded-lg border border-night-600 bg-night-900/60 p-4">
              <p className="text-gray-500">Statut d occupation</p>
              <p className="text-emerald-400 mt-1 font-medium">{bien?.statutOccupation}</p>
            </div>
          </div>
        </div>
      )
    } else if (section === 'contrat') {
      const contrat = locataireData?.contrat
      content = (
        <div className="space-y-5">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-6">
            <h3 className="font-semibold text-white mb-4">Contrat de location</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <p className="text-gray-300"><span className="text-gray-500">Reference:</span> {contrat?.reference}</p>
              <p className="text-gray-300"><span className="text-gray-500">Statut:</span> {contrat?.statut}</p>
              <p className="text-gray-300"><span className="text-gray-500">Titulaire:</span> {contrat?.titulaire}</p>
              <p className="text-gray-300"><span className="text-gray-500">Proprietaire:</span> {contrat?.proprietaire}</p>
              <p className="text-gray-300"><span className="text-gray-500">Agence:</span> {contrat?.agence}</p>
              <p className="text-gray-300"><span className="text-gray-500">Date signature:</span> {contrat?.dateSignature}</p>
              <p className="text-gray-300"><span className="text-gray-500">Date effet:</span> {contrat?.dateEffet}</p>
              <p className="text-gray-300"><span className="text-gray-500">Depot garantie:</span> {contrat?.depotGarantie}</p>
              <p className="text-gray-300"><span className="text-gray-500">Periodicite:</span> {contrat?.periodicite}</p>
              <p className="text-gray-300"><span className="text-gray-500">Echeance:</span> {contrat?.echeance}</p>
              <p className="text-gray-300 sm:col-span-2"><span className="text-gray-500">Mode principal:</span> {contrat?.modePaiementPrincipal}</p>
            </div>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm text-gold-300 hover:bg-gold-500/20">
            <Download size={16} />
            Telecharger le contrat
          </button>
        </div>
      )
    } else if (section === 'paiements') {
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-2">Lignes a payer</h3>
            <p className="text-sm text-gray-500 mb-4">Selectionnez les montants a regler puis confirmez votre paiement Orange Money.</p>
            <div className="space-y-3">
              {pendingPayments.map((item) => (
                <label key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-night-600 bg-night-900/60 px-4 py-3 cursor-pointer">
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={paymentForm.selected.includes(item.id)}
                      onChange={() => togglePaymentSelection(item.id)}
                      className="accent-yellow-500"
                    />
                    <span>
                      <p className="text-sm text-gray-200">{item.libelle}</p>
                      <p className="text-xs text-gray-500">Echeance: {item.echeance}</p>
                    </span>
                  </span>
                  <span className="text-sm text-gold-300 font-medium">{formatGNF(item.montant)}</span>
                </label>
              ))}
              {pendingPayments.length === 0 && (
                <p className="text-sm text-emerald-400">Aucune ligne en attente. Tous les paiements ont ete enregistres.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Paiement via Orange Money</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="text-sm">
                <span className="text-gray-400">Numero Orange Money</span>
                <input
                  type="text"
                  value={paymentForm.orangeNumber}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, orangeNumber: e.target.value }))}
                  placeholder="Ex: 62XXXXXXX"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Reference transaction</span>
                <input
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, transactionRef: e.target.value }))}
                  placeholder="Ex: OM-123456"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-night-600 bg-night-900/70 px-4 py-3">
              <p className="text-sm text-gray-300">Total selectionne: <span className="text-gold-300 font-semibold">{formatGNF(selectedTotal)}</span></p>
              <button
                type="button"
                onClick={submitOrangePayment}
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 hover:bg-gold-400 disabled:opacity-50"
                disabled={pendingPayments.length === 0}
              >
                Confirmer paiement
              </button>
            </div>
            {paymentFeedback && (
              <p className={`text-sm mt-3 ${paymentFeedback.includes('succes') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {paymentFeedback}
              </p>
            )}
          </div>
        </div>
      )
    } else if (section === 'historique-paiements') {
      content = (
        <div className="space-y-3">
          {paymentEmailFeedback && <p className="text-xs text-emerald-300">{paymentEmailFeedback}</p>}
          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'periode', label: 'Periode' },
              { key: 'moyen', label: 'Moyen' },
              { key: 'montant', label: 'Montant' },
              { key: 'reference', label: 'Reference' },
              { key: 'statut', label: 'Statut', render: (r) => <span className="text-emerald-400">{r.statut}</span> },
              {
                key: 'quittance',
                label: 'Quittance',
                render: (r) => (
                  r.quittanceId ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={`${API_BASE}/quittances/${r.quittanceId}/download`}
                        className="text-gold-400 text-xs hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Telecharger
                      </a>
                      <button
                        type="button"
                        onClick={() => sendQuittanceByEmail(r.quittanceId)}
                        className="text-emerald-300 text-xs hover:underline"
                      >
                        Envoyer email
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">-</span>
                  )
                ),
              },
            ]}
            rows={paymentHistory}
          />
        </div>
      )
    } else if (section === 'demandes') {
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Soumettre une nouvelle demande</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="text-gray-400">Type de demande</span>
                <select
                  value={demandeForm.type}
                  onChange={(e) => setDemandeForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option>Incident</option>
                  <option>Renovation</option>
                  <option>Informations</option>
                  <option>Administratif</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Priorite</span>
                <select
                  value={demandeForm.priorite}
                  onChange={(e) => setDemandeForm((prev) => ({ ...prev, priorite: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option>Basse</option>
                  <option>Normale</option>
                  <option>Haute</option>
                  <option>Urgente</option>
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Sujet</span>
                <input
                  type="text"
                  value={demandeForm.sujet}
                  onChange={(e) => setDemandeForm((prev) => ({ ...prev, sujet: e.target.value }))}
                  placeholder="Ex: Probleme electrique cuisine"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Description</span>
                <textarea
                  value={demandeForm.details}
                  onChange={(e) => setDemandeForm((prev) => ({ ...prev, details: e.target.value }))}
                  rows={4}
                  placeholder="Decrivez le besoin, le contexte et les disponibilites d intervention."
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={submitDemande}
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 hover:bg-gold-400"
              >
                Envoyer la demande
              </button>
              {demandeFeedback && (
                <p className={`text-sm ${demandeFeedback.includes('succes') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {demandeFeedback}
                </p>
              )}
            </div>
          </div>

          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'N°' },
              { key: 'type', label: 'Type' },
              { key: 'sujet', label: 'Sujet' },
              { key: 'date', label: 'Date' },
              { key: 'statut', label: 'Statut' },
              { key: 'priorite', label: 'Priorite' },
            ]}
            rows={demandes}
          />
        </div>
      )
    } else if (section === 'documents') {
      const quittanceDocs = locataireQuittances.map((q) => ({
        nom: `Quittance ${q.periode}`,
        type: 'Quittance',
        categorie: 'Recus',
        taille: '-',
        date: new Date(q.createdAt).toLocaleDateString('fr-FR'),
        downloadUrl: `${API_BASE}/quittances/${q.id}/download`,
      }))
      const rows = quittanceDocs.length > 0 ? quittanceDocs : (locataireData?.documents || [])
      content = (
        <SimpleTable
          rowKey={(r, i) => i}
          columns={[
            { key: 'nom', label: 'Document' },
            { key: 'type', label: 'Type' },
            { key: 'categorie', label: 'Categorie' },
            { key: 'taille', label: 'Taille' },
            {
              key: 'date',
              label: 'Date',
              render: (r) => (
                <span className="flex items-center justify-between gap-4">
                  {r.date}
                  {r.downloadUrl ? (
                    <a href={r.downloadUrl} className="text-gold-400 text-xs shrink-0 hover:underline" target="_blank" rel="noreferrer">
                      Telecharger
                    </a>
                  ) : (
                    <button type="button" className="text-gold-400 text-xs shrink-0">
                      Telecharger
                    </button>
                  )}
                </span>
              ),
            },
          ]}
          rows={rows}
        />
      )
    } else if (section === 'notifications') {
      content = (
        <ul className="space-y-3">
          {notifications.map((m, i) => (
            <li
              key={m.id || i}
              className={`rounded-xl border px-4 py-3 ${
                m.statut === 'Lu' ? 'border-night-600 bg-night-800/30' : 'border-gold-500/30 bg-gold-500/5'
              }`}
            >
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="text-gray-300 font-medium">{m.type}</span>
                <span>{m.date}</span>
              </div>
              <p className="text-sm text-gray-200 mb-1">{m.titre}</p>
              <p className="text-sm text-gray-400">{m.message}</p>
              <p className="text-xs text-gray-500 mt-2">{m.canal} - {m.statut}</p>
            </li>
          ))}
        </ul>
      )
    }
  }

  if (slug === 'proprietaire') {
    if (section === 'biens') {
      content = (
        <SimpleTable
          rowKey={(r) => r.ref}
          columns={[
            { key: 'ref', label: 'Réf.' },
            { key: 'adresse', label: 'Bien' },
            { key: 'type', label: 'Type' },
            { key: 'loyer', label: 'Loyer' },
            { key: 'locataire', label: 'Locataire' },
            {
              key: 'statut',
              label: 'Statut',
              render: (r) => (
                <span
                  className={
                    r.statut === 'Loue'
                      ? 'text-emerald-400'
                      : r.statut === 'Disponible'
                        ? 'text-sky-400'
                        : r.statut === 'Maintenance'
                          ? 'text-amber-400'
                          : 'text-red-400'
                  }
                >
                  {r.statut}
                </span>
              ),
            },
            { key: 'finBail', label: 'Fin de bail' },
          ]}
          rows={proprietaireData?.biens || []}
        />
      )
    } else if (section === 'revenus') {
      content = (
        <div className="space-y-6">
          <SimpleTable
            rowKey={(r) => r.mois}
            columns={[
              { key: 'mois', label: 'Mois' },
              { key: 'brut', label: 'Revenus bruts' },
              { key: 'charges', label: 'Charges' },
              { key: 'net', label: 'Revenus nets' },
              {
                key: 'statut',
                label: 'Statut',
                render: (r) => <span className={r.statut === 'Cloture' ? 'text-emerald-400' : 'text-amber-400'}>{r.statut}</span>,
              },
            ]}
            rows={proprietaireData?.revenus || []}
          />
          <SimpleTable
            rowKey={(r) => r.bien}
            columns={[
              { key: 'bien', label: 'Bien' },
              { key: 'revenusAnnuels', label: 'Revenus annuels' },
              { key: 'vacance', label: 'Vacance locative' },
              { key: 'rendement', label: 'Rendement estime' },
            ]}
            rows={proprietaireData?.revenusParBien || []}
          />
        </div>
      )
    } else if (section === 'historique-paiements') {
      content = (
        <SimpleTable
          rowKey={(r) => r.id}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'bien', label: 'Bien' },
            { key: 'locataire', label: 'Locataire' },
            { key: 'montant', label: 'Montant' },
            { key: 'mode', label: 'Mode' },
            { key: 'reference', label: 'Reference' },
            { key: 'statut', label: 'Statut', render: (r) => <span className={r.statut === 'Recu' ? 'text-emerald-400' : 'text-amber-400'}>{r.statut}</span> },
          ]}
          rows={proprietaireData?.['historique-paiements'] || []}
        />
      )
    } else if (section === 'documents') {
      content = (
        <div className="space-y-5">
          <SimpleTable
            rowKey={(r, i) => i}
            columns={[
              { key: 'nom', label: 'Document' },
              { key: 'type', label: 'Type' },
              { key: 'bien', label: 'Bien' },
              { key: 'date', label: 'Periode/Date' },
              { key: 'taille', label: 'Taille' },
              {
                key: 'download',
                label: 'Action',
                render: () => (
                  <button type="button" className="text-gold-400 text-xs hover:underline inline-flex items-center gap-1">
                    <Download size={14} />
                    Telecharger PDF
                  </button>
                ),
              },
            ]}
            rows={proprietaireData?.documents || []}
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm text-gold-300 hover:bg-gold-500/20">
              Telecharger rapport portefeuille (PDF)
            </button>
            <button type="button" className="rounded-lg border border-night-600 bg-night-800/70 px-4 py-2 text-sm text-gray-300 hover:border-gold-500/30">
              Export biens (PDF)
            </button>
          </div>
        </div>
      )
    } else if (section === 'notifications') {
      content = (
        <ul className="space-y-3">
          {ownerNotifications.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border px-4 py-3 ${
                item.statut === 'Lu' ? 'border-night-600 bg-night-800/30' : 'border-gold-500/30 bg-gold-500/5'
              }`}
            >
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="text-gray-300 font-medium">{item.type}</span>
                <span>{item.date}</span>
              </div>
              <p className="text-sm text-gray-200 mb-1">{item.titre}</p>
              <p className="text-sm text-gray-400">{item.message}</p>
              <p className="text-xs text-gray-500 mt-2">{item.canal} - {item.statut}</p>
            </li>
          ))}
        </ul>
      )
    } else if (section === 'demandes') {
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Soumettre une demande proprietaire</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="text-gray-400">Type de demande</span>
                <select
                  value={ownerDemandeForm.type}
                  onChange={(e) => setOwnerDemandeForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option>Incident</option>
                  <option>Renovation</option>
                  <option>Informations</option>
                  <option>Administratif</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Priorite</span>
                <select
                  value={ownerDemandeForm.priorite}
                  onChange={(e) => setOwnerDemandeForm((prev) => ({ ...prev, priorite: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option>Basse</option>
                  <option>Normale</option>
                  <option>Haute</option>
                  <option>Urgente</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Bien concerne</span>
                <input
                  type="text"
                  value={ownerDemandeForm.bien}
                  onChange={(e) => setOwnerDemandeForm((prev) => ({ ...prev, bien: e.target.value }))}
                  placeholder="Ex: V-KLM-01"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Sujet</span>
                <input
                  type="text"
                  value={ownerDemandeForm.sujet}
                  onChange={(e) => setOwnerDemandeForm((prev) => ({ ...prev, sujet: e.target.value }))}
                  placeholder="Ex: Verification facture entretien"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Description detaillee</span>
                <textarea
                  rows={4}
                  value={ownerDemandeForm.details}
                  onChange={(e) => setOwnerDemandeForm((prev) => ({ ...prev, details: e.target.value }))}
                  placeholder="Decrivez la demande, l'urgence et les attentes."
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={submitOwnerDemande}
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 hover:bg-gold-400"
              >
                Envoyer la demande
              </button>
              {ownerDemandeFeedback && (
                <p className={`text-sm ${ownerDemandeFeedback.includes('succes') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {ownerDemandeFeedback}
                </p>
              )}
            </div>
          </div>

          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'N°' },
              { key: 'type', label: 'Type' },
              { key: 'bien', label: 'Bien' },
              { key: 'sujet', label: 'Sujet' },
              { key: 'date', label: 'Date' },
              { key: 'statut', label: 'Statut' },
              { key: 'priorite', label: 'Priorite' },
            ]}
            rows={ownerDemandes}
          />
        </div>
      )
    }
  }

  if (slug === 'agence') {
    if (section === 'mandats') {
      content = (
        <SimpleTable
          rowKey={(r) => r.ref}
          columns={[
            { key: 'ref', label: 'Réf.' },
            { key: 'type', label: 'Type' },
            { key: 'adresse', label: 'Adresse' },
            { key: 'statut', label: 'Statut' },
            { key: 'mandant', label: 'Mandant' },
          ]}
          rows={data}
        />
      )
    } else if (section === 'leads') {
      content = (
        <SimpleTable
          rowKey={(r, i) => i}
          columns={[
            { key: 'nom', label: 'Contact' },
            { key: 'source', label: 'Source' },
            { key: 'bien', label: 'Intérêt' },
            { key: 'etape', label: 'Étape' },
            { key: 'date', label: 'Date' },
          ]}
          rows={data}
        />
      )
    } else if (section === 'visites') {
      content = (
        <SimpleTable
          rowKey={(r, i) => i}
          columns={[
            { key: 'date', label: 'Date / heure' },
            { key: 'bien', label: 'Bien' },
            { key: 'client', label: 'Client' },
            { key: 'agent', label: 'Agent' },
          ]}
          rows={data}
        />
      )
    } else if (section === 'equipe') {
      content = (
        <SimpleTable
          rowKey={(r) => r.email}
          columns={[
            { key: 'nom', label: 'Nom' },
            { key: 'role', label: 'Rôle' },
            {
              key: 'email',
              label: 'Email',
              render: (r) => (
                <a href={`mailto:${r.email}`} className="text-gold-400 hover:underline">
                  {r.email}
                </a>
              ),
            },
          ]}
          rows={data}
        />
      )
    }
  }

  if (slug === 'gestionnaire') {
    if (section === 'prospects') {
      content = (
        <div className="space-y-4">
          {gestionnaireProspects.length === 0 && (
            <p className="text-sm text-gray-400">Aucun prospect pour le moment.</p>
          )}
          {gestionnaireProspects.map((item) => (
            <div key={item.id} className="rounded-xl border border-night-600 bg-night-800/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-300 font-medium">{item.nom} - {item.propertyTitle || item.propertyId}</p>
                <span className="text-xs text-gold-300">{item.statut}</span>
              </div>
              <p className="text-sm text-gray-400">{item.message || 'Aucun message.'}</p>
              <p className="text-xs text-gray-500">{item.email} - {item.telephone}</p>
              <textarea
                rows={2}
                value={prospectReply[item.id] || item.managerReply || ''}
                onChange={(e) => setProspectReply((prev) => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Reponse gestionnaire..."
                className="w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-sm text-gray-200"
              />
              <div className="flex gap-2">
                <button type="button" disabled={gestionnaireSubmitting} onClick={() => updateProspect(item.id, 'Contacte')} className="rounded-lg border border-night-500 px-3 py-1.5 text-xs text-gray-300 disabled:opacity-40">
                  Marquer contacte
                </button>
                <button type="button" disabled={gestionnaireSubmitting} onClick={() => updateProspect(item.id, 'Visite planifiee')} className="rounded-lg border border-gold-500/40 px-3 py-1.5 text-xs text-gold-300 disabled:opacity-40">
                  Planifier visite
                </button>
                <button
                  type="button"
                  disabled={gestionnaireSubmitting || item.convertedLocataireId}
                  onClick={() => convertProspectToTenant(item)}
                  className="rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                >
                  {item.convertedLocataireId ? 'Deja converti' : 'Convertir en locataire'}
                </button>
                <button
                  type="button"
                  disabled={gestionnaireSubmitting || item.convertedLocataireId}
                  onClick={() => convertProspectToTenant(item, true)}
                  className="rounded-lg border border-cyan-500/40 px-3 py-1.5 text-xs text-cyan-300 disabled:opacity-40"
                >
                  {item.convertedLocataireId ? 'Deja converti' : 'Convertir + ouvrir bail'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    } else if (section === 'proprietaires' || section === 'locataires') {
      const isProprietaireSection = section === 'proprietaires'
      const rows = isProprietaireSection ? gestionnaireProprietaires : gestionnaireLocataires
      const filteredRows = filterBySearch(rows, ['id', 'nom', 'email', 'telephone', 'statut'])
      const paginated = paginate(filteredRows)
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <label className="text-sm w-full md:max-w-sm">
              <span className="text-gray-400">Recherche</span>
              <input
                type="text"
                value={gestionnaireSearch}
                onChange={(e) => {
                  setGestionnaireSearch(e.target.value)
                  setGestionnairePage(1)
                }}
                placeholder="Rechercher par nom, email, statut..."
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              />
            </label>
            <label className="text-sm w-full md:w-64">
              <span className="text-gray-400">Profil d acces</span>
              <select
                value={accessProfile}
                onChange={(e) => setAccessProfile(e.target.value)}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              >
                <option value="admin">Admin</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="consultation">Consultation</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">
              {isProprietaireSection ? 'Creer un proprietaire' : 'Creer un locataire'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="text-gray-400">Nom complet</span>
                <input
                  type="text"
                  value={userForm.nom}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', nom: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Email</span>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Telephone</span>
                <input
                  type="text"
                  value={userForm.telephone}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', telephone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={submitGestionnaireUser}
                disabled={!can('create') || gestionnaireSubmitting}
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 hover:bg-gold-400 disabled:opacity-50"
              >
                {gestionnaireSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              {gestionnaireFeedback && <p className="text-sm text-emerald-400">{gestionnaireFeedback}</p>}
            </div>
          </div>

          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'nom', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'telephone', label: 'Telephone' },
              { key: 'statut', label: 'Statut', render: (r) => <span className={r.statut === 'Actif' ? 'text-emerald-400' : 'text-amber-400'}>{r.statut}</span> },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex items-center gap-3 text-xs">
                    <button type="button" disabled={gestionnaireSubmitting} onClick={() => toggleUserStatus(isProprietaireSection ? 'proprietaire' : 'locataire', r.id)} className="text-sky-400 hover:underline disabled:opacity-40">
                      Modifier statut
                    </button>
                    <button type="button" disabled={!can('delete') || gestionnaireSubmitting} onClick={() => deleteGestionnaireUser(isProprietaireSection ? 'proprietaire' : 'locataire', r.id)} className="text-red-400 hover:underline disabled:opacity-40">
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            rows={paginated.rows}
          />
          <PaginationControls
            page={paginated.safePage}
            total={paginated.totalPages}
            onPrev={() => setGestionnairePage((p) => Math.max(1, p - 1))}
            onNext={() => setGestionnairePage((p) => Math.min(paginated.totalPages, p + 1))}
          />
        </div>
      )
    } else if (section === 'acces') {
      const filteredRows = filterBySearch(gestionnaireAccess, ['role', 'nom', 'email', 'statut', 'linkedId'])
      const paginated = paginate(filteredRows)
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <label className="text-sm w-full md:max-w-sm">
              <span className="text-gray-400">Recherche</span>
              <input
                type="text"
                value={gestionnaireSearch}
                onChange={(e) => {
                  setGestionnaireSearch(e.target.value)
                  setGestionnairePage(1)
                }}
                placeholder="Rechercher role, email, statut..."
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              />
            </label>
            <label className="text-sm w-full md:w-64">
              <span className="text-gray-400">Profil d acces</span>
              <select
                value={accessProfile}
                onChange={(e) => setAccessProfile(e.target.value)}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              >
                <option value="admin">Admin</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="consultation">Consultation</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Creer un acces utilisateur</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="text-gray-400">Role</span>
                <select
                  value={accessForm.role}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                >
                  <option value="locataire">Locataire</option>
                  <option value="proprietaire">Proprietaire</option>
                  <option value="agence">Agence</option>
                  <option value="gestionnaire">Gestionnaire</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Nom</span>
                <input
                  type="text"
                  value={accessForm.nom}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Email</span>
                <input
                  type="email"
                  value={accessForm.email}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Code d acces</span>
                <input
                  type="text"
                  value={accessForm.code}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">ID lie (optionnel)</span>
                <input
                  type="text"
                  value={accessForm.linkedId}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, linkedId: e.target.value }))}
                  placeholder="Ex: owner_... / tenant_..."
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={submitAccessUser}
              disabled={!can('create') || gestionnaireSubmitting}
              className="mt-4 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 hover:bg-gold-400 disabled:opacity-50"
            >
              {gestionnaireSubmitting ? 'Enregistrement...' : 'Creer acces'}
            </button>
          </div>

          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'role', label: 'Role' },
              { key: 'nom', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'linkedId', label: 'ID lie' },
              {
                key: 'statut',
                label: 'Statut',
                render: (r) => <span className={r.statut === 'Actif' ? 'text-emerald-400' : 'text-amber-400'}>{r.statut}</span>,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex items-center gap-3 text-xs">
                    <button type="button" disabled={!can('update') || gestionnaireSubmitting} onClick={() => toggleAccessStatus(r)} className="text-sky-400 hover:underline disabled:opacity-40">
                      Activer/Desactiver
                    </button>
                    <button type="button" disabled={!can('update') || gestionnaireSubmitting} onClick={() => resetAccessCode(r)} className="text-amber-300 hover:underline disabled:opacity-40">
                      Reinitialiser code
                    </button>
                    <button type="button" disabled={!can('delete') || gestionnaireSubmitting} onClick={() => deleteAccessUser(r)} className="text-red-400 hover:underline disabled:opacity-40">
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            rows={paginated.rows}
          />
          <PaginationControls
            page={paginated.safePage}
            total={paginated.totalPages}
            onPrev={() => setGestionnairePage((p) => Math.max(1, p - 1))}
            onNext={() => setGestionnairePage((p) => Math.min(paginated.totalPages, p + 1))}
          />
        </div>
      )
    } else if (section === 'roles-permissions') {
      const filteredRows = filterBySearch(gestionnaireRoles, ['acteur', 'typeCompte', 'role', 'permissions'])
      const paginated = paginate(filteredRows)
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <label className="text-sm w-full md:max-w-sm">
              <span className="text-gray-400">Recherche</span>
              <input
                type="text"
                value={gestionnaireSearch}
                onChange={(e) => {
                  setGestionnaireSearch(e.target.value)
                  setGestionnairePage(1)
                }}
                placeholder="Rechercher acteur, role, permissions..."
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              />
            </label>
            <label className="text-sm w-full md:w-64">
              <span className="text-gray-400">Profil d acces</span>
              <select
                value={accessProfile}
                onChange={(e) => setAccessProfile(e.target.value)}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              >
                <option value="admin">Admin</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="consultation">Consultation</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Attribution des roles et permissions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="text-gray-400">Acteur</span>
                <input
                  type="text"
                  value={roleForm.acteur}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, acteur: e.target.value }))}
                  placeholder="Ex: M. Camara"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Type de compte</span>
                <select
                  value={roleForm.typeCompte}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, typeCompte: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option>Locataire</option>
                  <option>Proprietaire</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Role</span>
                <input
                  type="text"
                  value={roleForm.role}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="Ex: Lecture finance"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Permissions</span>
                <input
                  type="text"
                  value={roleForm.permissions}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, permissions: e.target.value }))}
                  placeholder="Ex: Voir revenus, telecharger recu"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={submitRolePermission}
              disabled={!can('update')}
              className="mt-4 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 hover:bg-gold-400 disabled:opacity-50"
            >
              Attribuer
            </button>
          </div>
          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'acteur', label: 'Acteur' },
              { key: 'typeCompte', label: 'Type compte' },
              { key: 'role', label: 'Role' },
              { key: 'permissions', label: 'Permissions' },
            ]}
            rows={paginated.rows}
          />
          <PaginationControls
            page={paginated.safePage}
            total={paginated.totalPages}
            onPrev={() => setGestionnairePage((p) => Math.max(1, p - 1))}
            onNext={() => setGestionnairePage((p) => Math.min(paginated.totalPages, p + 1))}
          />
        </div>
      )
    } else if (section === 'biens') {
      const filteredRows = filterBySearch(gestionnaireBiens, ['ref', 'adresse', 'type', 'proprietaire', 'statut', 'loyer'])
      const paginated = paginate(filteredRows)
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <label className="text-sm w-full md:max-w-sm">
              <span className="text-gray-400">Recherche</span>
              <input
                type="text"
                value={gestionnaireSearch}
                onChange={(e) => {
                  setGestionnaireSearch(e.target.value)
                  setGestionnairePage(1)
                }}
                placeholder="Rechercher bien, proprietaire, statut..."
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              />
            </label>
            <label className="text-sm w-full md:w-64">
              <span className="text-gray-400">Profil d acces</span>
              <select
                value={accessProfile}
                onChange={(e) => setAccessProfile(e.target.value)}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              >
                <option value="admin">Admin</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="consultation">Consultation</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Creer un bien</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="text-gray-400">Titre</span>
                <input
                  type="text"
                  value={bienForm.titre}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, titre: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Adresse</span>
                <input
                  type="text"
                  value={bienForm.adresse}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, adresse: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Type</span>
                <select
                  value={bienForm.type}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option value="appartement">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="local-commercial">Local commercial</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Proprietaire</span>
                <select
                  value={bienForm.proprietaireId}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, proprietaireId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option value="">Selectionnez un proprietaire</option>
                  {gestionnaireProprietaires.map((item) => (
                    <option key={item.id} value={item.id}>{item.nom} ({item.id})</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Locataire (optionnel)</span>
                <select
                  value={bienForm.locataireId}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, locataireId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option value="">Aucun locataire</option>
                  {gestionnaireLocataires.map((item) => (
                    <option key={item.id} value={item.id}>{item.nom} ({item.id})</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Statut</span>
                <select
                  value={bienForm.statut}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, statut: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option value="disponible">Disponible</option>
                  <option value="loue">Loue</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Loyer mensuel (GNF)</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.loyerMensuel}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, loyerMensuel: e.target.value }))}
                  placeholder="Ex: 1200000"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={submitBienGestionnaire}
              disabled={!can('create') || gestionnaireSubmitting}
              className="mt-4 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 hover:bg-gold-400 disabled:opacity-50"
            >
              {gestionnaireSubmitting ? 'Enregistrement...' : 'Enregistrer le bien'}
            </button>
          </div>

          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-white">Signature de contrat de bail</h3>
              {contratPrefilled && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Pret a signer
                </span>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="text-gray-400">Bien</span>
                <select value={contratForm.bienId} onChange={(e) => setContratForm((prev) => ({ ...prev, bienId: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200">
                  <option value="">Selectionnez un bien</option>
                  {gestionnaireBiens.map((item) => (
                    <option key={item.ref} value={item.ref}>{item.adresse} ({item.ref})</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Locataire</span>
                <select value={contratForm.locataireId} onChange={(e) => setContratForm((prev) => ({ ...prev, locataireId: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200">
                  <option value="">Selectionnez un locataire</option>
                  {gestionnaireLocataires.map((item) => (
                    <option key={item.id} value={item.id}>{item.nom} ({item.id})</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Date debut</span>
                <input type="date" value={contratForm.dateDebut} onChange={(e) => setContratForm((prev) => ({ ...prev, dateDebut: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Date fin</span>
                <input type="date" value={contratForm.dateFin} onChange={(e) => setContratForm((prev) => ({ ...prev, dateFin: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
            </div>
            <button type="button" onClick={submitContratSignature} disabled={gestionnaireSubmitting || !can('create')} className="mt-4 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 disabled:opacity-50">
              Signer et attribuer
            </button>
          </div>

          <SimpleTable
            rowKey={(r) => r.ref}
            columns={[
              { key: 'ref', label: 'Reference' },
              { key: 'adresse', label: 'Adresse' },
              { key: 'type', label: 'Type' },
              { key: 'proprietaire', label: 'Proprietaire' },
              { key: 'locataire', label: 'Locataire' },
              {
                key: 'statut',
                label: 'Statut',
                render: (r) => <span className={r.statut === 'Loue' ? 'text-emerald-400' : r.statut === 'Disponible' ? 'text-sky-400' : 'text-amber-400'}>{r.statut}</span>,
              },
              {
                key: 'published',
                label: 'Publication',
                render: (r) => <span className={r.published ? 'text-emerald-400' : 'text-gray-500'}>{r.published ? 'Publie' : 'Non publie'}</span>,
              },
              { key: 'loyer', label: 'Loyer' },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex items-center gap-3 text-xs">
                    <button type="button" disabled={!can('update') || gestionnaireSubmitting} onClick={() => cycleBienStatus(r.ref)} className="text-sky-400 hover:underline disabled:opacity-40">
                      Modifier statut
                    </button>
                    <button type="button" disabled={!can('delete') || gestionnaireSubmitting} onClick={() => deleteBienGestionnaire(r.ref)} className="text-red-400 hover:underline disabled:opacity-40">
                      Supprimer
                    </button>
                    <button type="button" disabled={!can('update') || gestionnaireSubmitting} onClick={() => toggleBienPublish(r.ref)} className="text-gold-300 hover:underline disabled:opacity-40">
                      {r.published ? 'Depublier' : 'Publier'}
                    </button>
                  </div>
                ),
              },
            ]}
            rows={paginated.rows}
          />
          <PaginationControls
            page={paginated.safePage}
            total={paginated.totalPages}
            onPrev={() => setGestionnairePage((p) => Math.max(1, p - 1))}
            onNext={() => setGestionnairePage((p) => Math.min(paginated.totalPages, p + 1))}
          />
        </div>
      )
    } else if (section === 'tickets') {
      content = (
        <SimpleTable
          rowKey={(r) => r.id}
          columns={[
            { key: 'id', label: 'Ticket' },
            { key: 'bien', label: 'Bien' },
            { key: 'sujet', label: 'Sujet' },
            { key: 'sla', label: 'SLA' },
            {
              key: 'statut',
              label: 'Statut',
              render: (r) => (
                <span className={r.statut === 'Urgent' ? 'text-red-400' : 'text-amber-400'}>{r.statut}</span>
              ),
            },
          ]}
          rows={data}
        />
      )
    } else if (section === 'quittances') {
      content = (
        <SimpleTable
          rowKey={(r) => r.periode}
          columns={[
            { key: 'periode', label: 'Période' },
            { key: 'generees', label: 'Générées' },
            { key: 'erreurs', label: 'Erreurs' },
            { key: 'relances', label: 'Relances' },
          ]}
          rows={gestionnaireQuittancesStats}
        />
      )
    } else if (section === 'audit') {
      content = (
        <SimpleTable
          rowKey={(r, i) => i}
          columns={[
            { key: 'horodatage', label: 'Horodatage' },
            { key: 'user', label: 'Utilisateur' },
            { key: 'action', label: 'Action' },
            { key: 'detail', label: 'Détail' },
          ]}
          rows={data}
        />
      )
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-500 text-sm mb-8">
        <Link to={`/espace/${slug}/app`} className="text-gold-500/80 hover:text-gold-400">
          Tableau de bord
        </Link>
        <span className="mx-2 text-night-500">/</span>
        <span className="text-gray-400">{title}</span>
      </p>
      {content || (
        <p className="text-gray-500">
          Section « {section} » — contenu démo à étendre.
        </p>
      )}
    </div>
  )
}
