import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import { espacePortals } from '../../data/espacePortals'
import { tables } from '../../data/portalMockData'
import { getAuthSession } from '../../lib/authSession'
import InlineFeedback from '../../components/InlineFeedback'

const PAGE_SIZE = 5
const API_BASE = '/api'
const MONTHLY_COST_LOW_THRESHOLD = 1000000
const MONTHLY_COST_MEDIUM_THRESHOLD = 3000000
const DEFAULT_SLA_TEMPLATES = {
  warning: {
    emailSubject: '[SLA imminent] Ticket {{ticketId}} - {{sujet}}',
    emailBody: 'Le ticket {{ticketId}} approche son echeance SLA ({{dueAt}}). Merci de traiter rapidement.',
    smsBody: 'SLA imminent: ticket {{ticketId}} ({{sujet}}), echeance {{dueAt}}.',
  },
  breach: {
    emailSubject: '[HORS SLA] Ticket {{ticketId}} - {{sujet}}',
    emailBody: 'Le ticket {{ticketId}} est hors SLA depuis {{dueAt}}. Escalade immediate requise.',
    smsBody: 'HORS SLA: ticket {{ticketId}} ({{sujet}}). Action immediate.',
  },
}

function mapOwnerToRow(owner) {
  return {
    id: owner.id,
    agenceId: owner.agenceId || '-',
    nom: owner.nom || '-',
    email: owner.email || '-',
    telephone: owner.telephone || '-',
    statut: owner.statut || 'Actif',
  }
}

function mapTenantToRow(tenant) {
  return {
    id: tenant.id,
    agenceId: tenant.agenceId || '-',
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
  const loyerMensuel = Number(property.loyerMensuel)
  const chargesMensuelles = Number(property.chargesMensuelles)
  const fraisGestionMensuels = Number(property.fraisGestionMensuels)
  const coutTotalMensuel = (
    (Number.isFinite(loyerMensuel) ? loyerMensuel : 0)
    + (Number.isFinite(chargesMensuelles) ? chargesMensuelles : 0)
    + (Number.isFinite(fraisGestionMensuels) ? fraisGestionMensuels : 0)
  )
  return {
    ref: property.id,
    agenceId: property.agenceId || '-',
    adresse: property.adresse || '-',
    type: property.type || '-',
    proprietaire: owner?.nom || property.proprietaireId || '-',
    statut: normalizedStatus,
    published: Boolean(property.published),
    loyer: Number.isFinite(loyerMensuel)
      ? `${loyerMensuel.toLocaleString('fr-FR')} GNF`
      : '-',
    chargesMensuelles: Number.isFinite(chargesMensuelles)
      ? `${chargesMensuelles.toLocaleString('fr-FR')} GNF`
      : '0 GNF',
    fraisGestionMensuels: Number.isFinite(fraisGestionMensuels)
      ? `${fraisGestionMensuels.toLocaleString('fr-FR')} GNF`
      : '0 GNF',
    coutTotalMensuelValue: coutTotalMensuel,
    coutTotalMensuel: `${coutTotalMensuel.toLocaleString('fr-FR')} GNF`,
    taxeFonciereAnnuelle: Number.isFinite(Number(property.taxeFonciereAnnuelle))
      ? `${Number(property.taxeFonciereAnnuelle).toLocaleString('fr-FR')} GNF`
      : '0 GNF',
    assuranceAnnuelle: Number.isFinite(Number(property.assuranceAnnuelle))
      ? `${Number(property.assuranceAnnuelle).toLocaleString('fr-FR')} GNF`
      : '0 GNF',
    locataire: tenant?.nom || '-',
  }
}

function mapContratToRow(contrat, biens, locataires) {
  const bien = biens.find((item) => item.id === contrat.bienId)
  const locataire = locataires.find((item) => item.id === contrat.locataireId)
  const loyer = Number(contrat.loyerMensuel || bien?.loyerMensuel || 0)
  return {
    id: contrat.id,
    agenceId: bien?.agenceId || '-',
    bien: bien?.adresse || bien?.titre || contrat.bienId || '-',
    locataire: locataire?.nom || contrat.locataireId || '-',
    dateDebut: contrat.dateDebut || '-',
    dateFin: contrat.dateFin || '-',
    loyerMensuel: `${loyer.toLocaleString('fr-FR')} GNF`,
    statut: contrat.statut || '-',
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
  const isBackoffice = slug === 'admin'
  const navigate = useNavigate()
  const portal = espacePortals[slug]
  const data = isBackoffice ? tables.gestionnaire?.[section] : tables[slug]?.[section]
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
  const [gestionnaireContrats, setGestionnaireContrats] = useState([])
  const [gestionnaireTickets, setGestionnaireTickets] = useState([])
  const [slaNotificationLogs, setSlaNotificationLogs] = useState([])
  const [slaSettings, setSlaSettings] = useState({
    enabled: true,
    warningLeadHours: 2,
    autoRunEveryMinutes: 15,
    lastAutoRunAt: null,
    templates: {
      ...DEFAULT_SLA_TEMPLATES,
    },
  })
  const [slaPreview, setSlaPreview] = useState(null)
  const [ticketAssigneeFilter, setTicketAssigneeFilter] = useState('all')
  const [gestionnaireQuittancesStats, setGestionnaireQuittancesStats] = useState(() => gestionnaireData?.quittances || [])
  const [gestionnaireAccess, setGestionnaireAccess] = useState([])
  const [gestionnaireProspects, setGestionnaireProspects] = useState([])
  const [prospectReply, setProspectReply] = useState({})
  const [locataireContext, setLocataireContext] = useState({ tenant: null, bien: null })
  const [userForm, setUserForm] = useState({
    type: 'proprietaire',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    pieceIdentiteType: '',
    pieceIdentiteNumero: '',
    adresse: '',
    profession: '',
    revenuMensuel: '',
    agenceId: '',
  })
  const [roleForm, setRoleForm] = useState({ acteur: '', typeCompte: 'Locataire', role: '', permissions: '' })
  const [accessForm, setAccessForm] = useState({
    role: 'locataire',
    nom: '',
    email: '',
    telephone: '',
    poste: '',
    code: '1234',
    linkedId: '',
    agenceId: '',
    internalRole: 'gestionnaire_agence',
  })
  const [bienForm, setBienForm] = useState({
    titre: '',
    adresse: '',
    quartier: '',
    ville: '',
    codePostal: '',
    type: 'appartement',
    usage: 'habitation',
    proprietaireId: '',
    locataireId: '',
    statut: 'disponible',
    surface: '',
    nbPieces: '',
    nbChambres: '',
    nbSdb: '',
    depotGarantie: '',
    loyerMensuel: '',
    chargesMensuelles: '',
    fraisGestionMensuels: '',
    taxeFonciereAnnuelle: '',
    assuranceAnnuelle: '',
  })
  const [gestionnaireFeedback, setGestionnaireFeedback] = useState('')
  const [gestionnaireSubmitting, setGestionnaireSubmitting] = useState(false)
  const [contratForm, setContratForm] = useState({
    bienId: '',
    locataireId: '',
    dateDebut: '',
    dateFin: '',
    dateSignature: '',
    dureeMois: '',
    loyerMensuel: '',
    chargesMensuelles: '',
    depotGarantie: '',
    modalitePaiement: 'virement',
    jourEcheance: '5',
    penaliteRetard: '',
    clausesParticulieres: '',
    conditionsResiliation: '',
  })
  const [contratPrefilled, setContratPrefilled] = useState(false)
  const [gestionnaireSearch, setGestionnaireSearch] = useState('')
  const [gestionnairePage, setGestionnairePage] = useState(1)
  const [accessProfile, setAccessProfile] = useState('admin')
  const [agenceWorkspace, setAgenceWorkspace] = useState({
    agence: null,
    proprietaires: [],
    locataires: [],
    gestionnaires: [],
    biens: [],
  })
  const [agenceFeedback, setAgenceFeedback] = useState('')
  const [agenceSubmitting, setAgenceSubmitting] = useState(false)
  const [agenceSearch, setAgenceSearch] = useState('')
  const [agencePage, setAgencePage] = useState(1)
  const [agenceActorForm, setAgenceActorForm] = useState({ nom: '', email: '', telephone: '' })
  const [agenceGestionnaireForm, setAgenceGestionnaireForm] = useState({ nom: '', email: '', code: '1234' })
  const [agenceBienForm, setAgenceBienForm] = useState({
    titre: '',
    adresse: '',
    type: 'appartement',
    proprietaireId: '',
    locataireId: '',
    statut: 'disponible',
    loyerMensuel: '',
    chargesMensuelles: '',
    fraisGestionMensuels: '',
  })
  const [adminAgences, setAdminAgences] = useState([])
  const [adminOverview, setAdminOverview] = useState({
    kpis: [],
    feed: [],
    byAgence: [],
    signals: [],
    expiringLeases: [],
    alerts: [],
    actionsToday: [],
    recoveryPlan: [],
    agencyComparison: { top: [], bottom: [] },
    forecast: [],
    complianceByAgence: [],
    auditEvents: [],
  })
  const [adminOverviewFeedback, setAdminOverviewFeedback] = useState('')
  const [adminSearchTerm, setAdminSearchTerm] = useState('')
  const [adminSearchResults, setAdminSearchResults] = useState([])
  const [adminBiFilters, setAdminBiFilters] = useState({
    agenceId: 'all',
    severity: 'all',
    horizon: '90',
    minOccupation: 'all',
    retardOnly: false,
  })
  const [adminAgenceForm, setAdminAgenceForm] = useState({
    nom: '',
    codeAgence: '',
    adresse: '',
    ville: '',
    pays: 'Guinee',
    email: '',
    telephone: '',
    numeroFiscal: '',
    registreCommerce: '',
    deviseParDefaut: 'GNF',
    logoUrl: '',
  })

  if (!portal) return null

  const title = section
    ? section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ')
    : ''

  let content = null
  const permissionMap = {
    admin: { create: true, update: true, delete: true },
    gestionnaire: { create: true, update: true, delete: false },
    consultation: { create: false, update: false, delete: false },
  }
  const can = (action) => permissionMap[accessProfile]?.[action]
  const isAdminPortal = slug === 'admin'

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

  const authSession = getAuthSession()
  const agenceAuthHeaders = authSession?.token
    ? { Authorization: `Bearer ${authSession.token}` }
    : {}

  useEffect(() => {
    if (!isBackoffice) return

    let isMounted = true

    const loadCollections = async () => {
      try {
        const [ownersRes, tenantsRes, propertiesRes, prospectsRes, quittancesRes, accessRes, contratsRes, ticketsRes, slaLogsRes, slaSettingsRes] = await Promise.all([
          fetch(`${API_BASE}/proprietaires`),
          fetch(`${API_BASE}/locataires`),
          fetch(`${API_BASE}/biens`),
          fetch(`${API_BASE}/prospects/interets`),
          fetch(`${API_BASE}/gestionnaire/quittances`),
          fetch(`${API_BASE}/admin/acces`),
          fetch(`${API_BASE}/contrats`),
          fetch(`${API_BASE}/gestionnaire/tickets`),
          fetch(`${API_BASE}/gestionnaire/tickets/sla-notifications/logs`),
          fetch(`${API_BASE}/gestionnaire/tickets/sla-notifications/settings`),
        ])

        if (!ownersRes.ok || !tenantsRes.ok || !propertiesRes.ok || !prospectsRes.ok || !quittancesRes.ok || !accessRes.ok || !contratsRes.ok || !ticketsRes.ok || !slaLogsRes.ok || !slaSettingsRes.ok) {
          throw new Error('Erreur de chargement des donnees.')
        }

        const [ownersData, tenantsData, propertiesData, prospectsData, quittancesData, accessData, contratsData, ticketsData, slaLogsData, slaSettingsData] = await Promise.all([
          ownersRes.json(),
          tenantsRes.json(),
          propertiesRes.json(),
          prospectsRes.json(),
          quittancesRes.json(),
          accessRes.json(),
          contratsRes.json(),
          ticketsRes.json(),
          slaLogsRes.json(),
          slaSettingsRes.json().then((p) => p?.data || {}),
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
        setGestionnaireContrats(Array.isArray(contratsData) ? contratsData.map((item) => mapContratToRow(item, propertiesData, tenantsData)) : [])
        setGestionnaireTickets(Array.isArray(ticketsData) ? ticketsData : [])
        setSlaNotificationLogs(Array.isArray(slaLogsData) ? slaLogsData : [])
        setSlaSettings((prev) => ({ ...prev, ...(slaSettingsData || {}) }))
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
  }, [slug, isBackoffice])

  useEffect(() => {
    if (!isAdminPortal) return
    let isMounted = true
    const loadAdminOverview = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/overview`)
        const payload = await res.json().catch(() => ({}))
        if (!isMounted) return
        if (!res.ok || !payload?.ok) {
          setAdminOverviewFeedback(
            res.status === 404
              ? 'Vue admin API absente sur ce serveur (Cannot GET /api/admin/overview). Redemarrez le backend: npm run server.'
              : `Vue admin API indisponible (${res.status}). KPI agence / reporting admin ne s afficheront pas.`,
          )
          return
        }
        setAdminOverviewFeedback('')
        setAdminOverview({
          kpis: Array.isArray(payload.data?.kpis) ? payload.data.kpis : [],
          feed: Array.isArray(payload.data?.feed) ? payload.data.feed : [],
          byAgence: Array.isArray(payload.data?.byAgence) ? payload.data.byAgence : [],
          signals: Array.isArray(payload.data?.signals) ? payload.data.signals : [],
          expiringLeases: Array.isArray(payload.data?.expiringLeases) ? payload.data.expiringLeases : [],
          alerts: Array.isArray(payload.data?.alerts) ? payload.data.alerts : [],
          actionsToday: Array.isArray(payload.data?.actionsToday) ? payload.data.actionsToday : [],
          recoveryPlan: Array.isArray(payload.data?.recoveryPlan) ? payload.data.recoveryPlan : [],
          agencyComparison: payload.data?.agencyComparison || { top: [], bottom: [] },
          forecast: Array.isArray(payload.data?.forecast) ? payload.data.forecast : [],
          complianceByAgence: Array.isArray(payload.data?.complianceByAgence) ? payload.data.complianceByAgence : [],
          auditEvents: Array.isArray(payload.data?.auditEvents) ? payload.data.auditEvents : [],
        })
      } catch {
        if (isMounted) {
          setAdminOverviewFeedback('Connexion impossible au serveur API pour la vue admin.')
        }
      }
    }
    loadAdminOverview()
    return () => {
      isMounted = false
    }
  }, [isAdminPortal])

  useEffect(() => {
    if (!isAdminPortal) return
    if (!adminSearchTerm.trim()) {
      setAdminSearchResults([])
      return
    }
    let active = true
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/search?q=${encodeURIComponent(adminSearchTerm.trim())}`)
        const payload = await res.json().catch(() => ({}))
        if (!active) return
        if (!res.ok || !payload?.ok) return
        setAdminSearchResults(Array.isArray(payload.data) ? payload.data : [])
      } catch {
        if (active) setAdminSearchResults([])
      }
    }
    run()
    return () => { active = false }
  }, [isAdminPortal, adminSearchTerm])

  useEffect(() => {
    if (slug !== 'agence' && slug !== 'gestionnaire') return
    let isMounted = true
    const loadAgenceWorkspace = async () => {
      try {
        const res = await fetch(`${API_BASE}/agence/workspace`, { headers: agenceAuthHeaders })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok || !payload?.ok || !isMounted) return
        const next = payload.data || {}
        setAgenceWorkspace({
          agence: next.agence || null,
          proprietaires: Array.isArray(next.proprietaires) ? next.proprietaires : [],
          locataires: Array.isArray(next.locataires) ? next.locataires : [],
          gestionnaires: Array.isArray(next.gestionnaires) ? next.gestionnaires : [],
          biens: Array.isArray(next.biens) ? next.biens : [],
        })
      } catch {
        if (isMounted) setAgenceFeedback('Chargement agence indisponible.')
      }
    }
    loadAgenceWorkspace()
    return () => {
      isMounted = false
    }
  }, [slug, authSession?.token])

  useEffect(() => {
    if (!isBackoffice) return
    if (!['agences', 'proprietaires', 'locataires', 'acces'].includes(section)) return
    loadAdminAgences()
  }, [slug, section, isBackoffice])

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
    if (isAdminPortal && !userForm.agenceId) {
      setGestionnaireFeedback('Selectionnez une agence de rattachement.')
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
          prenom: userForm.prenom.trim(),
          email: userForm.email.trim(),
          telephone: userForm.telephone.trim(),
          dateNaissance: userForm.dateNaissance || undefined,
          pieceIdentiteType: userForm.pieceIdentiteType.trim() || undefined,
          pieceIdentiteNumero: userForm.pieceIdentiteNumero.trim() || undefined,
          adresse: userForm.adresse.trim() || undefined,
          profession: userForm.profession.trim() || undefined,
          revenuMensuel: userForm.revenuMensuel ? Number(userForm.revenuMensuel) : undefined,
          agenceId: isAdminPortal ? userForm.agenceId : undefined,
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
      setUserForm({
        type: userForm.type,
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        dateNaissance: '',
        pieceIdentiteType: '',
        pieceIdentiteNumero: '',
        adresse: '',
        profession: '',
        revenuMensuel: '',
        agenceId: '',
      })
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
    if (isAdminPortal && accessForm.role === 'gestionnaire' && !accessForm.agenceId) {
      setGestionnaireFeedback('Selectionnez une agence pour ce gestionnaire.')
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
          telephone: accessForm.telephone.trim(),
          poste: accessForm.poste.trim(),
          code: accessForm.code.trim(),
          linkedId: accessForm.linkedId.trim(),
          agenceId: accessForm.role === 'gestionnaire' ? accessForm.agenceId : undefined,
          internalRole: accessForm.role === 'gestionnaire' ? accessForm.internalRole : undefined,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGestionnaireFeedback(payload?.error || 'Creation acces impossible.')
        return
      }
      setGestionnaireAccess((prev) => [payload.data, ...prev])
      setAccessForm({
        role: 'locataire',
        nom: '',
        email: '',
        telephone: '',
        poste: '',
        code: '1234',
        linkedId: '',
        agenceId: '',
        internalRole: 'gestionnaire_agence',
      })
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
          usage: bienForm.usage,
          adresse: bienForm.adresse.trim(),
          quartier: bienForm.quartier.trim() || undefined,
          ville: bienForm.ville.trim() || undefined,
          codePostal: bienForm.codePostal.trim() || undefined,
          proprietaireId: bienForm.proprietaireId,
          locataireId: bienForm.locataireId || undefined,
          statut: bienForm.statut,
          surface: bienForm.surface ? Number(bienForm.surface) : undefined,
          nbPieces: bienForm.nbPieces ? Number(bienForm.nbPieces) : undefined,
          nbChambres: bienForm.nbChambres ? Number(bienForm.nbChambres) : undefined,
          nbSdb: bienForm.nbSdb ? Number(bienForm.nbSdb) : undefined,
          loyerMensuel: Number(bienForm.loyerMensuel),
          chargesMensuelles: bienForm.chargesMensuelles ? Number(bienForm.chargesMensuelles) : 0,
          depotGarantie: bienForm.depotGarantie ? Number(bienForm.depotGarantie) : 0,
          fraisGestionMensuels: bienForm.fraisGestionMensuels ? Number(bienForm.fraisGestionMensuels) : 0,
          taxeFonciereAnnuelle: bienForm.taxeFonciereAnnuelle ? Number(bienForm.taxeFonciereAnnuelle) : 0,
          assuranceAnnuelle: bienForm.assuranceAnnuelle ? Number(bienForm.assuranceAnnuelle) : 0,
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
        quartier: '',
        ville: '',
        codePostal: '',
        type: 'appartement',
        usage: 'habitation',
        proprietaireId: '',
        locataireId: '',
        statut: 'disponible',
        surface: '',
        nbPieces: '',
        nbChambres: '',
        nbSdb: '',
        depotGarantie: '',
        loyerMensuel: '',
        chargesMensuelles: '',
        fraisGestionMensuels: '',
        taxeFonciereAnnuelle: '',
        assuranceAnnuelle: '',
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
          dateSignature: contratForm.dateSignature || undefined,
          dureeMois: contratForm.dureeMois ? Number(contratForm.dureeMois) : undefined,
          loyerMensuel: contratForm.loyerMensuel ? Number(contratForm.loyerMensuel) : undefined,
          chargesMensuelles: contratForm.chargesMensuelles ? Number(contratForm.chargesMensuelles) : undefined,
          depotGarantie: contratForm.depotGarantie ? Number(contratForm.depotGarantie) : undefined,
          modalitePaiement: contratForm.modalitePaiement,
          jourEcheance: contratForm.jourEcheance ? Number(contratForm.jourEcheance) : undefined,
          penaliteRetard: contratForm.penaliteRetard || undefined,
          clausesParticulieres: contratForm.clausesParticulieres || undefined,
          conditionsResiliation: contratForm.conditionsResiliation || undefined,
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
      setGestionnaireContrats((prev) => [
        mapContratToRow(payload.data, [{ ...updatedBien, adresse: updatedBien.adresse || '' }], gestionnaireLocataires),
        ...prev,
      ])
      setContratForm({
        bienId: '',
        locataireId: '',
        dateDebut: '',
        dateFin: '',
        dateSignature: '',
        dureeMois: '',
        loyerMensuel: '',
        chargesMensuelles: '',
        depotGarantie: '',
        modalitePaiement: 'virement',
        jourEcheance: '5',
        penaliteRetard: '',
        clausesParticulieres: '',
        conditionsResiliation: '',
      })
      setContratPrefilled(false)
      setGestionnaireFeedback('Contrat signe et bien attribue au locataire.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const updateContratStatus = async (contratId, currentStatus) => {
    if (!can('update')) {
      setGestionnaireFeedback('Modification de contrat non autorisee pour ce profil.')
      return
    }
    const order = ['Signe', 'En cours', 'Renouvele', 'Termine', 'Resilie']
    const idx = order.findIndex((item) => item.toLowerCase() === String(currentStatus || '').toLowerCase())
    const nextStatus = order[(idx + 1 + order.length) % order.length]
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/contrats/${contratId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nextStatus }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Mise a jour du contrat impossible.')
        return
      }
      setGestionnaireContrats((prev) =>
        prev.map((row) => (row.id === contratId ? { ...row, statut: payload.data.statut || nextStatus } : row)),
      )
      setGestionnaireFeedback('Statut du contrat mis a jour.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const deleteContrat = async (contratId) => {
    if (!can('delete')) {
      setGestionnaireFeedback('Suppression de contrat non autorisee pour ce profil.')
      return
    }
    if (!window.confirm('Confirmer la suppression de ce contrat ?')) return
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/contrats/${contratId}`, { method: 'DELETE' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Suppression du contrat impossible.')
        return
      }
      setGestionnaireContrats((prev) => prev.filter((row) => row.id !== contratId))
      setGestionnaireFeedback('Contrat supprime.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const cycleTicketStatus = async (ticket) => {
    if (!can('update')) {
      setGestionnaireFeedback('Modification ticket non autorisee.')
      return
    }
    const order = ['Ouvert', 'En cours', 'En attente', 'Resolu']
    const idx = order.findIndex((s) => s.toLowerCase() === String(ticket.statut || '').toLowerCase())
    const nextStatus = order[(idx + 1 + order.length) % order.length]
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/gestionnaire/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nextStatus }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Mise a jour ticket impossible.')
        return
      }
      setGestionnaireTickets((prev) => prev.map((row) => (row.id === ticket.id ? payload.data : row)))
      setGestionnaireFeedback('Statut ticket mis a jour.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const assignTicketToGestionnaire = async (ticketId, gestionnaireId) => {
    if (!can('update')) {
      setGestionnaireFeedback('Assignation ticket non autorisee.')
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/gestionnaire/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gestionnaireId: gestionnaireId || null }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Assignation impossible.')
        return
      }
      setGestionnaireTickets((prev) => prev.map((row) => (row.id === ticketId ? payload.data : row)))
      setGestionnaireFeedback(gestionnaireId ? 'Ticket assigne au gestionnaire.' : 'Ticket desassigne.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const runSlaNotifications = async () => {
    if (!can('update')) {
      setGestionnaireFeedback('Execution notifications SLA non autorisee.')
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/gestionnaire/tickets/sla-notifications/run`, { method: 'POST' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Execution SLA impossible.')
        return
      }
      const logsRes = await fetch(`${API_BASE}/gestionnaire/tickets/sla-notifications/logs`)
      const logsData = await logsRes.json().catch(() => [])
      if (logsRes.ok && Array.isArray(logsData)) setSlaNotificationLogs(logsData)
      setGestionnaireFeedback(`SLA execute: ${payload.data.notificationsSent} notification(s) envoyee(s).`)
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const saveSlaSettings = async () => {
    if (!can('update')) {
      setGestionnaireFeedback('Parametrage SLA non autorise.')
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/gestionnaire/tickets/sla-notifications/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: Boolean(slaSettings.enabled),
          warningLeadHours: Number(slaSettings.warningLeadHours || 2),
          autoRunEveryMinutes: Number(slaSettings.autoRunEveryMinutes || 15),
          templates: slaSettings.templates,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Sauvegarde SLA impossible.')
        return
      }
      setSlaSettings((prev) => ({ ...prev, ...payload.data }))
      setGestionnaireFeedback('Parametres SLA enregistres.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const resetSlaTemplates = async () => {
    if (!can('update')) {
      setGestionnaireFeedback('Parametrage SLA non autorise.')
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/gestionnaire/tickets/sla-notifications/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetTemplates: true }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Reinitialisation templates impossible.')
        return
      }
      setSlaSettings((prev) => ({ ...prev, ...payload.data }))
      setSlaPreview(null)
      setGestionnaireFeedback('Templates SLA reinitialises.')
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const previewSlaTemplate = async (stage) => {
    if (!can('update')) {
      setGestionnaireFeedback('Previsualisation SLA non autorisee.')
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/gestionnaire/tickets/sla-notifications/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Previsualisation SLA impossible.')
        return
      }
      setSlaPreview(payload.data)
      setGestionnaireFeedback(`Apercu template ${payload.data.stage} charge (ticket ${payload.data.ticketId}).`)
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
        navigate(`/espace/${slug}/app/biens`)
      }
    } catch {
      setGestionnaireFeedback('Connexion impossible au serveur API.')
    } finally {
      setGestionnaireSubmitting(false)
    }
  }

  const submitAgenceActor = async (actorType) => {
    if (!agenceActorForm.nom.trim()) {
      setAgenceFeedback('Le nom est obligatoire.')
      return
    }
    setAgenceSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/agence/${actorType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...agenceAuthHeaders },
        body: JSON.stringify({ ...agenceActorForm }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setAgenceFeedback(payload?.error || 'Creation impossible.')
        return
      }
      setAgenceWorkspace((prev) => ({ ...prev, [actorType]: [payload.data, ...prev[actorType]] }))
      setAgenceActorForm({ nom: '', email: '', telephone: '' })
      setAgenceFeedback('Creation effectuee.')
    } catch {
      setAgenceFeedback('Connexion API agence impossible.')
    } finally {
      setAgenceSubmitting(false)
    }
  }

  const deleteAgenceActor = async (actorType, id) => {
    if (!window.confirm('Confirmer la suppression ?')) return
    setAgenceSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/agence/${actorType}/${id}`, { method: 'DELETE', headers: agenceAuthHeaders })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setAgenceFeedback(payload?.error || 'Suppression impossible.')
        return
      }
      setAgenceWorkspace((prev) => ({ ...prev, [actorType]: prev[actorType].filter((item) => item.id !== id) }))
      setAgenceFeedback('Suppression effectuee.')
    } catch {
      setAgenceFeedback('Connexion API agence impossible.')
    } finally {
      setAgenceSubmitting(false)
    }
  }

  const toggleAgenceActorStatus = async (actorType, item) => {
    setAgenceSubmitting(true)
    try {
      const nextStatus = item.statut === 'Actif' ? 'Inactif' : 'Actif'
      const res = await fetch(`${API_BASE}/agence/${actorType}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...agenceAuthHeaders },
        body: JSON.stringify({ statut: nextStatus }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setAgenceFeedback(payload?.error || 'Mise a jour impossible.')
        return
      }
      setAgenceWorkspace((prev) => ({
        ...prev,
        [actorType]: prev[actorType].map((row) => (row.id === item.id ? payload.data : row)),
      }))
      setAgenceFeedback('Statut mis a jour.')
    } catch {
      setAgenceFeedback('Connexion API agence impossible.')
    } finally {
      setAgenceSubmitting(false)
    }
  }

  const submitAgenceGestionnaire = async () => {
    if (!agenceGestionnaireForm.email.trim()) {
      setAgenceFeedback("L'email gestionnaire est obligatoire.")
      return
    }
    setAgenceSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/agence/gestionnaires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...agenceAuthHeaders },
        body: JSON.stringify({ ...agenceGestionnaireForm }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setAgenceFeedback(payload?.error || 'Creation gestionnaire impossible.')
        return
      }
      setAgenceWorkspace((prev) => ({ ...prev, gestionnaires: [payload.data, ...prev.gestionnaires] }))
      setAgenceGestionnaireForm({ nom: '', email: '', code: '1234' })
      setAgenceFeedback('Gestionnaire cree.')
    } catch {
      setAgenceFeedback('Connexion API agence impossible.')
    } finally {
      setAgenceSubmitting(false)
    }
  }

  const submitAgenceBien = async () => {
    if (!agenceBienForm.titre.trim() || !agenceBienForm.adresse.trim() || !agenceBienForm.proprietaireId) {
      setAgenceFeedback('Renseignez titre, adresse et proprietaire.')
      return
    }
    setAgenceSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/agence/biens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...agenceAuthHeaders },
        body: JSON.stringify({
          ...agenceBienForm,
          loyerMensuel: Number(agenceBienForm.loyerMensuel || 0),
          chargesMensuelles: Number(agenceBienForm.chargesMensuelles || 0),
          fraisGestionMensuels: Number(agenceBienForm.fraisGestionMensuels || 0),
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setAgenceFeedback(payload?.error || 'Creation bien impossible.')
        return
      }
      setAgenceWorkspace((prev) => ({ ...prev, biens: [payload.data, ...prev.biens] }))
      setAgenceBienForm({
        titre: '',
        adresse: '',
        type: 'appartement',
        proprietaireId: '',
        locataireId: '',
        statut: 'disponible',
        loyerMensuel: '',
        chargesMensuelles: '',
        fraisGestionMensuels: '',
      })
      setAgenceFeedback('Bien cree.')
    } catch {
      setAgenceFeedback('Connexion API agence impossible.')
    } finally {
      setAgenceSubmitting(false)
    }
  }

  const toggleAgenceBien = async (item, patch) => {
    setAgenceSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/agence/biens/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...agenceAuthHeaders },
        body: JSON.stringify({ ...patch }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setAgenceFeedback(payload?.error || 'Mise a jour du bien impossible.')
        return
      }
      setAgenceWorkspace((prev) => ({
        ...prev,
        biens: prev.biens.map((row) => (row.id === item.id ? payload.data : row)),
      }))
      setAgenceFeedback('Bien mis a jour.')
    } catch {
      setAgenceFeedback('Connexion API agence impossible.')
    } finally {
      setAgenceSubmitting(false)
    }
  }

  const loadAdminAgences = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/agences`)
      const payload = await res.json().catch(() => ([]))
      if (res.ok && Array.isArray(payload)) setAdminAgences(payload)
    } catch {
      // ignore
    }
  }

  const submitAdminAgence = async () => {
    if (!adminAgenceForm.nom.trim()) {
      setGestionnaireFeedback("Le nom de l'agence est obligatoire.")
      return
    }
    setGestionnaireSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/agences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminAgenceForm),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload?.ok) {
        setGestionnaireFeedback(payload?.error || 'Creation agence impossible.')
        return
      }
      setAdminAgences((prev) => [payload.data, ...prev])
      setAdminAgenceForm({
        nom: '',
        codeAgence: '',
        adresse: '',
        ville: '',
        pays: 'Guinee',
        email: '',
        telephone: '',
        numeroFiscal: '',
        registreCommerce: '',
        deviseParDefaut: 'GNF',
        logoUrl: '',
      })
      const onboardingEmail = payload?.onboarding?.email
      const onboardingCode = payload?.onboarding?.temporaryCode
      let copied = false
      if (onboardingCode && navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(onboardingCode)
          copied = true
        } catch {
          copied = false
        }
      }
      if (onboardingEmail && onboardingCode) {
        setGestionnaireFeedback(
          copied
            ? `Agence creee. Compte directeur: ${onboardingEmail} / code temporaire ${onboardingCode} (copie).`
            : `Agence creee. Compte directeur: ${onboardingEmail} / code temporaire ${onboardingCode}.`,
        )
      } else {
        setGestionnaireFeedback('Agence creee.')
      }
    } catch {
      setGestionnaireFeedback('Connexion API indisponible.')
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
            <InlineFeedback message={paymentFeedback} className="mt-3" />
          </div>
        </div>
      )
    } else if (section === 'historique-paiements') {
      content = (
        <div className="space-y-3">
          <InlineFeedback message={paymentEmailFeedback} />
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
              <InlineFeedback message={demandeFeedback} />
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
              <InlineFeedback message={ownerDemandeFeedback} />
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

  if (slug === 'agence' || slug === 'gestionnaire') {
    const normalizedSearchAgence = agenceSearch.trim().toLowerCase()
    const agenceFilter = (rows, fields) =>
      !normalizedSearchAgence
        ? rows
        : rows.filter((row) => fields.some((field) => String(row[field] || '').toLowerCase().includes(normalizedSearchAgence))
        )
    const agencePaginate = (rows) => {
      const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
      const safePage = Math.min(agencePage, totalPages)
      const start = (safePage - 1) * PAGE_SIZE
      return { rows: rows.slice(start, start + PAGE_SIZE), totalPages, safePage }
    }

    if (section === 'proprietaires' || section === 'locataires') {
      const actorType = section
      const rows = agenceFilter(agenceWorkspace[actorType], ['id', 'nom', 'email', 'telephone', 'statut'])
      const paginated = agencePaginate(rows)
      content = (
        <div className="space-y-5">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-gray-400">Recherche</span>
              <input
                value={agenceSearch}
                onChange={(e) => {
                  setAgenceSearch(e.target.value)
                  setAgencePage(1)
                }}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Nom complet</span>
              <input
                value={agenceActorForm.nom}
                onChange={(e) => setAgenceActorForm((prev) => ({ ...prev, nom: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Email</span>
              <input
                type="email"
                value={agenceActorForm.email}
                onChange={(e) => setAgenceActorForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Telephone</span>
              <input
                value={agenceActorForm.telephone}
                onChange={(e) => setAgenceActorForm((prev) => ({ ...prev, telephone: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <button type="button" onClick={() => submitAgenceActor(actorType)} disabled={agenceSubmitting} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 disabled:opacity-50">
              {agenceSubmitting ? 'Enregistrement...' : `Ajouter ${actorType === 'proprietaires' ? 'proprietaire' : 'locataire'}`}
            </button>
          </div>
          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'nom', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'telephone', label: 'Telephone' },
              { key: 'statut', label: 'Statut' },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleAgenceActorStatus(actorType, r)} className="rounded border border-night-500 px-2 py-1 text-xs text-gray-300">
                      {r.statut === 'Actif' ? 'Desactiver' : 'Activer'}
                    </button>
                    <button type="button" onClick={() => deleteAgenceActor(actorType, r.id)} className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-300">
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
            onPrev={() => setAgencePage((p) => Math.max(1, p - 1))}
            onNext={() => setAgencePage((p) => Math.min(paginated.totalPages, p + 1))}
          />
        </div>
      )
    } else if (section === 'gestionnaires' && slug === 'agence') {
      const rows = agenceFilter(agenceWorkspace.gestionnaires, ['id', 'nom', 'email', 'statut'])
      const paginated = agencePaginate(rows)
      content = (
        <div className="space-y-5">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid md:grid-cols-3 gap-4">
            <input value={agenceGestionnaireForm.nom} onChange={(e) => setAgenceGestionnaireForm((prev) => ({ ...prev, nom: e.target.value }))} placeholder="Nom" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            <input value={agenceGestionnaireForm.email} onChange={(e) => setAgenceGestionnaireForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            <input value={agenceGestionnaireForm.code} onChange={(e) => setAgenceGestionnaireForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="Code temporaire" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            <button type="button" onClick={submitAgenceGestionnaire} disabled={agenceSubmitting} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 disabled:opacity-50">Ajouter gestionnaire</button>
          </div>
          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'nom', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'statut', label: 'Statut' },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleAgenceActorStatus('gestionnaires', r)} className="rounded border border-night-500 px-2 py-1 text-xs text-gray-300">
                      {r.statut === 'Actif' ? 'Desactiver' : 'Activer'}
                    </button>
                    <button type="button" onClick={() => deleteAgenceActor('gestionnaires', r.id)} className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-300">Supprimer</button>
                  </div>
                ),
              },
            ]}
            rows={paginated.rows}
          />
        </div>
      )
    } else if (section === 'biens') {
      const rows = agenceFilter(
        agenceWorkspace.biens.map((item) => mapPropertyToRow(item, agenceWorkspace.proprietaires, agenceWorkspace.locataires)),
        ['ref', 'adresse', 'type', 'proprietaire', 'locataire', 'statut'],
      )
      const paginated = agencePaginate(rows)
      content = (
        <div className="space-y-5">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid md:grid-cols-2 gap-4">
            <input value={agenceBienForm.titre} onChange={(e) => setAgenceBienForm((prev) => ({ ...prev, titre: e.target.value }))} placeholder="Titre du bien" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            <input value={agenceBienForm.adresse} onChange={(e) => setAgenceBienForm((prev) => ({ ...prev, adresse: e.target.value }))} placeholder="Adresse" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            <select value={agenceBienForm.proprietaireId} onChange={(e) => setAgenceBienForm((prev) => ({ ...prev, proprietaireId: e.target.value }))} className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200">
              <option value="">Proprietaire</option>
              {agenceWorkspace.proprietaires.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
            </select>
            <select value={agenceBienForm.locataireId} onChange={(e) => setAgenceBienForm((prev) => ({ ...prev, locataireId: e.target.value }))} className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200">
              <option value="">Locataire (optionnel)</option>
              {agenceWorkspace.locataires.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
            </select>
            <input type="number" min="0" value={agenceBienForm.loyerMensuel} onChange={(e) => setAgenceBienForm((prev) => ({ ...prev, loyerMensuel: e.target.value }))} placeholder="Loyer mensuel" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            <input type="number" min="0" value={agenceBienForm.chargesMensuelles} onChange={(e) => setAgenceBienForm((prev) => ({ ...prev, chargesMensuelles: e.target.value }))} placeholder="Charges mensuelles" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            <button type="button" onClick={submitAgenceBien} disabled={agenceSubmitting} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 disabled:opacity-50">
              Ajouter bien
            </button>
          </div>
          <SimpleTable
            rowKey={(r) => r.ref}
            columns={[
              { key: 'ref', label: 'Reference' },
              { key: 'adresse', label: 'Adresse' },
              { key: 'proprietaire', label: 'Proprietaire' },
              { key: 'locataire', label: 'Locataire' },
              { key: 'coutTotalMensuel', label: 'Cout total/mois' },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleAgenceBien(agenceWorkspace.biens.find((item) => item.id === r.ref), { published: !r.published })} className="rounded border border-gold-500/40 px-2 py-1 text-xs text-gold-300">
                      {r.published ? 'Depublier' : 'Publier'}
                    </button>
                    <button type="button" onClick={() => toggleAgenceBien(agenceWorkspace.biens.find((item) => item.id === r.ref), { statut: r.statut === 'Disponible' ? 'loue' : 'disponible' })} className="rounded border border-night-500 px-2 py-1 text-xs text-gray-300">
                      Changer statut
                    </button>
                    <button type="button" onClick={() => deleteAgenceActor('biens', r.ref)} className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-300">Supprimer</button>
                  </div>
                ),
              },
            ]}
            rows={paginated.rows}
          />
        </div>
      )
    }
  }

  if (isBackoffice) {
    if (section === 'dashboard-search') {
      content = (
        <div className="space-y-5">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4">
            <label className="text-sm w-full">
              <span className="text-gray-400">Recherche globale (agences, biens, contrats, acteurs, acces)</span>
              <input
                type="text"
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
                placeholder="Ex: Ratoma, lease_, owner_, gestionnaire..."
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              />
            </label>
          </div>
          <SimpleTable
            rowKey={(r) => `${r.type}-${r.id}`}
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'id', label: 'ID' },
              { key: 'label', label: 'Libelle' },
              { key: 'detail', label: 'Detail' },
            ]}
            rows={adminSearchResults}
          />
        </div>
      )
    } else if (section === 'pilotage') {
      const borderBySeverity = {
        high: 'border-l-rose-500',
        medium: 'border-l-amber-500',
        low: 'border-l-sky-500',
      }
      const signals = Array.isArray(adminOverview.signals) ? adminOverview.signals : []
      const expiring = Array.isArray(adminOverview.expiringLeases) ? adminOverview.expiringLeases : []
      const agencyOptions = Array.isArray(adminOverview.byAgence) ? adminOverview.byAgence : []
      const horizonDays = Number(adminBiFilters.horizon || 90)
      const filteredSignals = signals.filter((row) => (
        adminBiFilters.severity === 'all' || row.severity === adminBiFilters.severity
      ))
      const filteredExpiring = expiring.filter((row) => {
        const matchesAgency = adminBiFilters.agenceId === 'all' || row.agenceId === adminBiFilters.agenceId
        const matchesHorizon = Number(row.joursRestants || 9999) <= horizonDays
        return matchesAgency && matchesHorizon
      })
      content = (
        <div className="space-y-8">
          <p className="text-sm text-gray-400 max-w-3xl">
            Vue transverse immobilier : impayes, echeances de baux, vacance et hygiene des acces. Les indicateurs
            proviennent des donnees reelles chargees par l API admin.
          </p>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="text-gray-400">Agence</span>
              <select
                value={adminBiFilters.agenceId}
                onChange={(e) => setAdminBiFilters((prev) => ({ ...prev, agenceId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              >
                <option value="all">Toutes les agences</option>
                {agencyOptions.map((row) => (
                  <option key={row.agenceId} value={row.agenceId}>{row.agence}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Severite</span>
              <select
                value={adminBiFilters.severity}
                onChange={(e) => setAdminBiFilters((prev) => ({ ...prev, severity: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              >
                <option value="all">Toutes</option>
                <option value="high">Critique</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Horizon baux</span>
              <select
                value={adminBiFilters.horizon}
                onChange={(e) => setAdminBiFilters((prev) => ({ ...prev, horizon: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              >
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
                <option value="365">12 mois</option>
              </select>
            </label>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={() => setAdminBiFilters((prev) => ({ ...prev, agenceId: 'all', severity: 'all', horizon: '90' }))}
                className="rounded-lg border border-night-500 px-3 py-2 text-xs text-gray-300 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
              >
                Reinitialiser les filtres
              </button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Signaux operationnels ({filteredSignals.length})</h3>
            {filteredSignals.length === 0 ? (
              <p className="text-sm text-gray-500 rounded-xl border border-dashed border-night-600 px-4 py-8 text-center">
                Aucun signal critique pour le moment — situation stable sur les metriques suivies.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredSignals.map((s, idx) => (
                  <div
                    key={`${s.label}-${idx}`}
                    className={`rounded-xl border border-night-600 bg-night-800/40 pl-4 border-l-4 ${borderBySeverity[s.severity] || borderBySeverity.low}`}
                  >
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{s.label}</p>
                      <p className="mt-2 font-display text-2xl font-bold text-gold-400">{s.value}</p>
                      <p className="mt-2 text-xs text-gray-400">{s.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Centre d alertes actionnables ({adminOverview.alerts.length})</h3>
            {adminOverview.alerts.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune alerte active.</p>
            ) : (
              <ul className="space-y-3">
                {adminOverview.alerts.map((item) => (
                  <li key={item.id} className="rounded-lg border border-night-600 bg-night-900/40 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white">{item.title}</p>
                      <span className="text-[10px] uppercase text-gold-300">{item.severity}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{item.detail}</p>
                    <Link to={`/espace/${slug}/app/${item.ctaSection}`} className="mt-2 inline-flex text-xs text-sky-300 hover:text-sky-200">
                      {item.ctaLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Actions du jour ({adminOverview.actionsToday.length})</h3>
            <SimpleTable
              rowKey={(r) => r.id}
              columns={[
                { key: 'priority', label: 'Priorite' },
                { key: 'title', label: 'Action' },
                { key: 'detail', label: 'Detail' },
                {
                  key: 'section',
                  label: 'Acces',
                  render: (r) => <Link to={`/espace/${slug}/app/${r.section}`} className="text-sky-300 hover:underline">Ouvrir</Link>,
                },
              ]}
              rows={adminOverview.actionsToday}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              <h3 className="font-semibold text-white">Echeances de baux (actifs, 12 mois) ({filteredExpiring.length})</h3>
              <Link to={`/espace/${slug}/app/reporting`} className="text-xs text-gold-400 hover:text-gold-300">
                Voir reporting multi
              </Link>
            </div>
            <SimpleTable
              rowKey={(r) => r.id}
              columns={[
                { key: 'bien', label: 'Bien' },
                { key: 'agenceId', label: 'Agence' },
                { key: 'dateFin', label: 'Fin de bail' },
                {
                  key: 'loyerMensuel',
                  label: 'Loyer',
                  render: (r) => (
                    <span>{Number(r.loyerMensuel) > 0 ? `${Number(r.loyerMensuel).toLocaleString('fr-FR')} GNF` : '-'}</span>
                  ),
                },
                {
                  key: 'joursRestants',
                  label: 'Jours',
                  render: (r) => (
                    <span className={r.joursRestants <= 30 ? 'text-amber-400 font-medium' : 'text-gray-300'}>{r.joursRestants}</span>
                  ),
                },
              ]}
              rows={filteredExpiring}
            />
          </div>
        </div>
      )
    } else if (section === 'prospects') {
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
      const filteredRows = filterBySearch(rows, ['id', 'agenceId', 'nom', 'email', 'telephone', 'statut'])
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
                <span className="text-gray-400">Prenom</span>
                <input
                  type="text"
                  value={userForm.prenom}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', prenom: e.target.value }))}
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
              <label className="text-sm">
                <span className="text-gray-400">Date de naissance</span>
                <input
                  type="date"
                  value={userForm.dateNaissance}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', dateNaissance: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Type piece identite</span>
                <input
                  type="text"
                  value={userForm.pieceIdentiteType}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', pieceIdentiteType: e.target.value }))}
                  placeholder="CNI, Passeport..."
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Numero piece identite</span>
                <input
                  type="text"
                  value={userForm.pieceIdentiteNumero}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', pieceIdentiteNumero: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Profession / Situation</span>
                <input
                  type="text"
                  value={userForm.profession}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', profession: e.target.value }))}
                  placeholder={isProprietaireSection ? 'Ex: Investisseur' : 'Ex: Salarie CDI'}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Revenu mensuel (optionnel)</span>
                <input
                  type="number"
                  min="0"
                  value={userForm.revenuMensuel}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', revenuMensuel: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Adresse</span>
                <input
                  type="text"
                  value={userForm.adresse}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, type: isProprietaireSection ? 'proprietaire' : 'locataire', adresse: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              {isAdminPortal && (
                <label className="text-sm md:col-span-2">
                  <span className="text-gray-400">Agence de rattachement</span>
                  <select
                    required
                    value={userForm.agenceId}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, agenceId: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                  >
                    <option value="">Selectionnez une agence</option>
                    {adminAgences.map((agence) => (
                      <option key={agence.id} value={agence.id}>{agence.nom}</option>
                    ))}
                  </select>
                </label>
              )}
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
              <InlineFeedback message={gestionnaireFeedback} />
            </div>
          </div>

          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'ID' },
              ...(isAdminPortal ? [{ key: 'agenceId', label: 'Agence' }] : []),
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
      const filteredRows = filterBySearch(gestionnaireAccess, ['role', 'agenceId', 'nom', 'email', 'statut', 'linkedId'])
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
                <span className="text-gray-400">Telephone pro</span>
                <input
                  type="text"
                  value={accessForm.telephone}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, telephone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Poste</span>
                <input
                  type="text"
                  value={accessForm.poste}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, poste: e.target.value }))}
                  placeholder="Ex: Gestionnaire recouvrement"
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
              {isAdminPortal && accessForm.role === 'gestionnaire' && (
                <>
                  <label className="text-sm">
                    <span className="text-gray-400">Agence de rattachement</span>
                    <select
                      value={accessForm.agenceId}
                      onChange={(e) => setAccessForm((prev) => ({ ...prev, agenceId: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                    >
                      <option value="">Selectionnez une agence</option>
                      {adminAgences.map((agence) => (
                        <option key={agence.id} value={agence.id}>{agence.nom}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="text-gray-400">Role interne</span>
                    <select
                      value={accessForm.internalRole}
                      onChange={(e) => setAccessForm((prev) => ({ ...prev, internalRole: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                    >
                      <option value="gestionnaire_agence">Gestionnaire agence</option>
                      <option value="gestionnaire_finance">Gestionnaire finance</option>
                      <option value="gestionnaire_support">Gestionnaire support</option>
                    </select>
                  </label>
                </>
              )}
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
              ...(isAdminPortal ? [{ key: 'agenceId', label: 'Agence' }] : []),
              { key: 'nom', label: 'Nom' },
              { key: 'email', label: 'Email' },
              ...(isAdminPortal ? [{ key: 'internalRole', label: 'Role interne' }] : []),
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
    } else if (section === 'agences') {
      const filteredRows = filterBySearch(adminAgences, ['id', 'nom', 'email', 'telephone', 'statut'])
      const paginated = paginate(filteredRows)
      content = (
        <div className="space-y-6">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Creer une agence (admin plateforme)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={adminAgenceForm.nom} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, nom: e.target.value }))} placeholder="Nom agence" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.codeAgence} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, codeAgence: e.target.value }))} placeholder="Code agence" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.adresse} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, adresse: e.target.value }))} placeholder="Adresse" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.ville} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, ville: e.target.value }))} placeholder="Ville" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.pays} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, pays: e.target.value }))} placeholder="Pays" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.email} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.telephone} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, telephone: e.target.value }))} placeholder="Telephone" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.numeroFiscal} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, numeroFiscal: e.target.value }))} placeholder="Numero fiscal" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.registreCommerce} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, registreCommerce: e.target.value }))} placeholder="Registre commerce" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.deviseParDefaut} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, deviseParDefaut: e.target.value }))} placeholder="Devise (GNF)" className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              <input value={adminAgenceForm.logoUrl} onChange={(e) => setAdminAgenceForm((prev) => ({ ...prev, logoUrl: e.target.value }))} placeholder="URL logo (optionnel)" className="md:col-span-2 rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
            </div>
            <button type="button" onClick={submitAdminAgence} disabled={!can('create') || gestionnaireSubmitting} className="mt-4 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-night-900 disabled:opacity-50">
              Creer agence
            </button>
          </div>
          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'nom', label: 'Nom' },
              { key: 'adresse', label: 'Adresse' },
              { key: 'email', label: 'Email' },
              { key: 'telephone', label: 'Telephone' },
              { key: 'statut', label: 'Statut' },
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
      const filteredRows = filterBySearch(gestionnaireBiens, ['ref', 'agenceId', 'adresse', 'type', 'proprietaire', 'statut', 'loyer'])
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
                <span className="text-gray-400">Quartier</span>
                <input
                  type="text"
                  value={bienForm.quartier}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, quartier: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Ville</span>
                <input
                  type="text"
                  value={bienForm.ville}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, ville: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Code postal</span>
                <input
                  type="text"
                  value={bienForm.codePostal}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, codePostal: e.target.value }))}
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
                <span className="text-gray-400">Usage</span>
                <select
                  value={bienForm.usage}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, usage: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                >
                  <option value="habitation">Habitation</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixte">Mixte</option>
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
              <label className="text-sm">
                <span className="text-gray-400">Depot de garantie (GNF)</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.depotGarantie}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, depotGarantie: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Surface (m2)</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.surface}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, surface: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Nb pieces</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.nbPieces}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, nbPieces: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Nb chambres</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.nbChambres}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, nbChambres: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Nb salles de bain</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.nbSdb}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, nbSdb: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Charges mensuelles (GNF)</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.chargesMensuelles}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, chargesMensuelles: e.target.value }))}
                  placeholder="Ex: 90000"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Frais gestion mensuels (GNF)</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.fraisGestionMensuels}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, fraisGestionMensuels: e.target.value }))}
                  placeholder="Ex: 50000"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Taxe fonciere annuelle (GNF)</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.taxeFonciereAnnuelle}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, taxeFonciereAnnuelle: e.target.value }))}
                  placeholder="Ex: 350000"
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Assurance annuelle (GNF)</span>
                <input
                  type="number"
                  min="0"
                  value={bienForm.assuranceAnnuelle}
                  onChange={(e) => setBienForm((prev) => ({ ...prev, assuranceAnnuelle: e.target.value }))}
                  placeholder="Ex: 120000"
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
              <label className="text-sm">
                <span className="text-gray-400">Date signature</span>
                <input type="date" value={contratForm.dateSignature} onChange={(e) => setContratForm((prev) => ({ ...prev, dateSignature: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Duree (mois)</span>
                <input type="number" min="1" value={contratForm.dureeMois} onChange={(e) => setContratForm((prev) => ({ ...prev, dureeMois: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Charges mensuelles (GNF)</span>
                <input type="number" min="0" value={contratForm.chargesMensuelles} onChange={(e) => setContratForm((prev) => ({ ...prev, chargesMensuelles: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Depot de garantie (GNF)</span>
                <input type="number" min="0" value={contratForm.depotGarantie} onChange={(e) => setContratForm((prev) => ({ ...prev, depotGarantie: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Modalite paiement</span>
                <select value={contratForm.modalitePaiement} onChange={(e) => setContratForm((prev) => ({ ...prev, modalitePaiement: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200">
                  <option value="virement">Virement</option>
                  <option value="cash">Especes</option>
                  <option value="mobile-money">Mobile money</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Jour echeance mensuelle</span>
                <input type="number" min="1" max="28" value={contratForm.jourEcheance} onChange={(e) => setContratForm((prev) => ({ ...prev, jourEcheance: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Penalite retard</span>
                <input type="text" value={contratForm.penaliteRetard} onChange={(e) => setContratForm((prev) => ({ ...prev, penaliteRetard: e.target.value }))} placeholder="Ex: 5% apres 7 jours" className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Conditions de resiliation</span>
                <textarea rows={2} value={contratForm.conditionsResiliation} onChange={(e) => setContratForm((prev) => ({ ...prev, conditionsResiliation: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="text-gray-400">Clauses particulieres</span>
                <textarea rows={2} value={contratForm.clausesParticulieres} onChange={(e) => setContratForm((prev) => ({ ...prev, clausesParticulieres: e.target.value }))} className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200" />
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
              ...(isAdminPortal ? [{ key: 'agenceId', label: 'Agence' }] : []),
              { key: 'adresse', label: 'Adresse' },
              { key: 'type', label: 'Type' },
              { key: 'proprietaire', label: 'Proprietaire' },
              { key: 'locataire', label: 'Locataire' },
              { key: 'loyer', label: 'Loyer' },
              { key: 'chargesMensuelles', label: 'Charges/mois' },
              { key: 'fraisGestionMensuels', label: 'Gestion/mois' },
              {
                key: 'coutTotalMensuel',
                label: 'Cout total/mois',
                render: (r) => {
                  const total = Number(r.coutTotalMensuelValue || 0)
                  const colorClass = total <= MONTHLY_COST_LOW_THRESHOLD
                    ? 'text-emerald-400'
                    : total <= MONTHLY_COST_MEDIUM_THRESHOLD
                      ? 'text-amber-300'
                      : 'text-rose-400'
                  return <span className={`font-medium ${colorClass}`}>{r.coutTotalMensuel}</span>
                },
              },
              { key: 'taxeFonciereAnnuelle', label: 'Taxe/an' },
              { key: 'assuranceAnnuelle', label: 'Assurance/an' },
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
    } else if (section === 'contrats') {
      const filteredRows = filterBySearch(gestionnaireContrats, ['id', 'agenceId', 'bien', 'locataire', 'dateDebut', 'dateFin', 'statut'])
      const paginated = paginate(filteredRows)
      content = (
        <div className="space-y-5">
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
                placeholder="Rechercher contrat, bien, locataire, statut..."
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              />
            </label>
          </div>
          <InlineFeedback message={gestionnaireFeedback} />
          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'Contrat' },
              { key: 'agenceId', label: 'Agence' },
              { key: 'bien', label: 'Bien' },
              { key: 'locataire', label: 'Locataire' },
              { key: 'dateDebut', label: 'Debut' },
              { key: 'dateFin', label: 'Fin' },
              { key: 'loyerMensuel', label: 'Loyer' },
              {
                key: 'statut',
                label: 'Statut',
                render: (r) => (
                  <span className={String(r.statut).toLowerCase().includes('resil') ? 'text-rose-400' : 'text-emerald-400'}>
                    {r.statut}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex items-center gap-3 text-xs">
                    <a
                      href={`${API_BASE}/contrats/${r.id}/download`}
                      className="text-gold-300 hover:underline"
                    >
                      Telecharger
                    </a>
                    <button
                      type="button"
                      disabled={!can('update') || gestionnaireSubmitting}
                      onClick={() => updateContratStatus(r.id, r.statut)}
                      className="text-sky-400 hover:underline disabled:opacity-40"
                    >
                      Changer statut
                    </button>
                    <button
                      type="button"
                      disabled={!can('delete') || gestionnaireSubmitting}
                      onClick={() => deleteContrat(r.id)}
                      className="text-red-400 hover:underline disabled:opacity-40"
                    >
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
    } else if (section === 'tickets') {
      const ticketRows = Array.isArray(gestionnaireTickets) && gestionnaireTickets.length > 0 ? gestionnaireTickets : data
      const gestionnaireOptions = gestionnaireAccess.filter((item) => item.role === 'gestionnaire')
      const assigneeFilteredRows = ticketRows.filter((ticket) => {
        if (ticketAssigneeFilter === 'all') return true
        if (ticketAssigneeFilter === 'mine') return String(ticket.gestionnaireId || '') === String(authSession?.userId || '')
        if (ticketAssigneeFilter === 'unassigned') return !ticket.gestionnaireId
        return String(ticket.gestionnaireId || '') === ticketAssigneeFilter
      })
      const filteredRows = filterBySearch(assigneeFilteredRows, ['id', 'agenceId', 'gestionnaireId', 'sujet', 'statut', 'priorite'])
      const paginated = paginate(filteredRows)
      content = (
        <div className="space-y-5">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-300">Notifications automatiques SLA (email + SMS simule)</p>
            <button
              type="button"
              disabled={!can('update') || gestionnaireSubmitting}
              onClick={runSlaNotifications}
              className="rounded-lg border border-gold-500/40 px-3 py-2 text-xs text-gold-300 hover:bg-gold-500/10 disabled:opacity-40"
            >
              Lancer notifications SLA
            </button>
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid gap-3 md:grid-cols-4">
            <label className="text-sm flex items-end">
              <span className="inline-flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={Boolean(slaSettings.enabled)}
                  onChange={(e) => setSlaSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                Activer l auto-notification
              </span>
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Alerte avant echeance (heures)</span>
              <input
                type="number"
                min="1"
                max="24"
                value={slaSettings.warningLeadHours}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, warningLeadHours: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Frequence auto-run (minutes)</span>
              <input
                type="number"
                min="5"
                max="120"
                value={slaSettings.autoRunEveryMinutes}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, autoRunEveryMinutes: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                disabled={!can('update') || gestionnaireSubmitting}
                onClick={saveSlaSettings}
                className="rounded-lg border border-sky-500/40 px-3 py-2 text-xs text-sky-300 hover:bg-sky-500/10 disabled:opacity-40"
              >
                Enregistrer reglages SLA
              </button>
            </div>
            {slaSettings.lastAutoRunAt && (
              <p className="text-xs text-gray-500 md:col-span-4">
                Dernier auto-run: {new Date(slaSettings.lastAutoRunAt).toLocaleString('fr-FR')}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid gap-3 md:grid-cols-2">
            <p className="text-xs text-gray-400 md:col-span-2">Variables dispo: {'{{ticketId}}'}, {'{{sujet}}'}, {'{{dueAt}}'}, {'{{severity}}'}</p>
            <label className="text-sm">
              <span className="text-gray-400">Template warning - Sujet email</span>
              <input
                type="text"
                value={slaSettings.templates?.warning?.emailSubject || ''}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, templates: { ...prev.templates, warning: { ...prev.templates.warning, emailSubject: e.target.value } } }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Template breach - Sujet email</span>
              <input
                type="text"
                value={slaSettings.templates?.breach?.emailSubject || ''}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, templates: { ...prev.templates, breach: { ...prev.templates.breach, emailSubject: e.target.value } } }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Template warning - Corps email</span>
              <textarea
                rows={3}
                value={slaSettings.templates?.warning?.emailBody || ''}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, templates: { ...prev.templates, warning: { ...prev.templates.warning, emailBody: e.target.value } } }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Template breach - Corps email</span>
              <textarea
                rows={3}
                value={slaSettings.templates?.breach?.emailBody || ''}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, templates: { ...prev.templates, breach: { ...prev.templates.breach, emailBody: e.target.value } } }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Template warning - SMS</span>
              <input
                type="text"
                value={slaSettings.templates?.warning?.smsBody || ''}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, templates: { ...prev.templates, warning: { ...prev.templates.warning, smsBody: e.target.value } } }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <label className="text-sm">
              <span className="text-gray-400">Template breach - SMS</span>
              <input
                type="text"
                value={slaSettings.templates?.breach?.smsBody || ''}
                onChange={(e) => setSlaSettings((prev) => ({ ...prev, templates: { ...prev.templates, breach: { ...prev.templates.breach, smsBody: e.target.value } } }))}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              />
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!can('update') || gestionnaireSubmitting}
                onClick={resetSlaTemplates}
                className="rounded-lg border border-gray-500/40 px-3 py-2 text-xs text-gray-300 hover:bg-gray-500/10 disabled:opacity-40"
              >
                Reinitialiser templates par defaut
              </button>
              <button
                type="button"
                disabled={!can('update') || gestionnaireSubmitting}
                onClick={() => previewSlaTemplate('warning')}
                className="rounded-lg border border-cyan-500/40 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-40"
              >
                Tester template warning
              </button>
              <button
                type="button"
                disabled={!can('update') || gestionnaireSubmitting}
                onClick={() => previewSlaTemplate('breach')}
                className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"
              >
                Tester template breach
              </button>
            </div>
            {slaPreview && (
              <div className="md:col-span-2 rounded-lg border border-night-600 bg-night-900/70 p-3 text-xs text-gray-200 space-y-1">
                <p className="text-gray-400">Apercu ({slaPreview.stage}) - ticket {slaPreview.ticketId}</p>
                <p><span className="text-gray-400">Sujet email:</span> {slaPreview.emailSubject}</p>
                <p><span className="text-gray-400">Corps email:</span> {slaPreview.emailBody}</p>
                <p><span className="text-gray-400">SMS:</span> {slaPreview.smsBody}</p>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="text-gray-400">Filtre assignation</span>
              <select
                value={ticketAssigneeFilter}
                onChange={(e) => {
                  setTicketAssigneeFilter(e.target.value)
                  setGestionnairePage(1)
                }}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
              >
                <option value="all">Tous les tickets</option>
                <option value="mine">Mes tickets</option>
                <option value="unassigned">Non assignes</option>
                {gestionnaireOptions.map((g) => (
                  <option key={g.id} value={g.id}>{g.nom || g.email}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-night-600 bg-night-800/40 p-4">
              <p className="text-xs text-gray-400 uppercase">Tickets ouverts</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {filteredRows.filter((t) => !['resolu', 'clos', 'termine'].includes(String(t.statut || '').toLowerCase())).length}
              </p>
            </div>
            <div className="rounded-xl border border-night-600 bg-night-800/40 p-4">
              <p className="text-xs text-gray-400 uppercase">Hors SLA</p>
              <p className="mt-2 text-2xl font-semibold text-rose-400">
                {filteredRows.filter((t) => t.dueAt && new Date(t.dueAt) < new Date() && !['resolu', 'clos', 'termine'].includes(String(t.statut || '').toLowerCase())).length}
              </p>
            </div>
            <div className="rounded-xl border border-night-600 bg-night-800/40 p-4">
              <p className="text-xs text-gray-400 uppercase">Urgents</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">
                {filteredRows.filter((t) => String(t.priorite || '').toLowerCase().includes('haut') || String(t.priorite || '').toLowerCase().includes('urgent')).length}
              </p>
            </div>
          </div>
          <SimpleTable
            rowKey={(r) => r.id}
            columns={[
              { key: 'id', label: 'Ticket' },
              ...(isAdminPortal ? [{ key: 'agenceId', label: 'Agence' }] : []),
              {
                key: 'gestionnaireId',
                label: 'Gestionnaire',
                render: (r) => {
                  const g = gestionnaireOptions.find((item) => item.id === r.gestionnaireId)
                  return g ? (g.nom || g.email) : '-'
                },
              },
              { key: 'sujet', label: 'Sujet' },
              { key: 'priorite', label: 'Priorite' },
              {
                key: 'dueAt',
                label: 'Echeance SLA',
                render: (r) => (
                  <span className={r.dueAt && new Date(r.dueAt) < new Date() ? 'text-rose-400' : 'text-gray-300'}>
                    {r.dueAt ? new Date(r.dueAt).toLocaleString('fr-FR') : '-'}
                  </span>
                ),
              },
              {
                key: 'statut',
                label: 'Statut',
                render: (r) => (
                  <span className={String(r.statut || '').toLowerCase().includes('resolu') ? 'text-emerald-400' : 'text-amber-400'}>{r.statut}</span>
                ),
              },
              {
                key: 'assignation',
                label: 'Assigner',
                render: (r) => (
                  <select
                    value={r.gestionnaireId || ''}
                    disabled={!can('update') || gestionnaireSubmitting}
                    onChange={(e) => assignTicketToGestionnaire(r.id, e.target.value)}
                    className="rounded border border-night-600 bg-night-900 px-2 py-1 text-xs text-gray-200"
                  >
                    <option value="">Non assigne</option>
                    {gestionnaireOptions.map((g) => (
                      <option key={g.id} value={g.id}>{g.nom || g.email}</option>
                    ))}
                  </select>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <button
                    type="button"
                    disabled={!can('update') || gestionnaireSubmitting}
                    onClick={() => cycleTicketStatus(r)}
                    className="text-sky-400 hover:underline disabled:opacity-40 text-xs"
                  >
                    Changer statut
                  </button>
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
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <h3 className="font-semibold text-white mb-4">Historique notifications SLA</h3>
            <SimpleTable
              rowKey={(r) => r.id}
              columns={[
                { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleString('fr-FR') },
                { key: 'channel', label: 'Canal' },
                { key: 'ticketId', label: 'Ticket' },
                { key: 'to', label: 'Destinataire' },
                { key: 'status', label: 'Statut' },
              ]}
              rows={slaNotificationLogs.slice(0, 30)}
            />
          </div>
        </div>
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
    } else if (section === 'reporting') {
      const monthlyRows = Array.isArray(gestionnaireQuittancesStats) ? gestionnaireQuittancesStats : []
      const totalGenerees = monthlyRows.reduce((sum, row) => sum + Number(row.generees || 0), 0)
      const totalRelances = monthlyRows.reduce((sum, row) => sum + Number(row.relances || 0), 0)
      const totalErreurs = monthlyRows.reduce((sum, row) => sum + Number(row.erreurs || 0), 0)
      const maxGenerees = Math.max(...monthlyRows.map((row) => Number(row.generees || 0)), 1)
      const byAgenceRows = Array.isArray(adminOverview.byAgence) ? adminOverview.byAgence : []
      const filteredByAgenceRows = byAgenceRows.filter((row) => {
        const matchesAgency = adminBiFilters.agenceId === 'all' || row.agenceId === adminBiFilters.agenceId
        const minOcc = adminBiFilters.minOccupation === 'all' ? 0 : Number(adminBiFilters.minOccupation)
        const occValue = Number(String(row.tauxOccupation || '0').replace('%', '')) || 0
        const matchesOccupation = occValue >= minOcc
        const matchesRetard = !adminBiFilters.retardOnly || Number(row.paiementsRetard || 0) > 0
        return matchesAgency && matchesOccupation && matchesRetard
      })
      const forecastRows = Array.isArray(adminOverview.forecast) ? adminOverview.forecast : []
      const topRows = Array.isArray(adminOverview.agencyComparison?.top) ? adminOverview.agencyComparison.top : []
      const bottomRows = Array.isArray(adminOverview.agencyComparison?.bottom) ? adminOverview.agencyComparison.bottom : []

      content = (
        <div className="space-y-5">
          {isAdminPortal && (
            <div className="rounded-xl border border-night-600 bg-night-800/30 p-4 grid gap-3 md:grid-cols-4">
              <label className="text-sm">
                <span className="text-gray-400">Agence</span>
                <select
                  value={adminBiFilters.agenceId}
                  onChange={(e) => setAdminBiFilters((prev) => ({ ...prev, agenceId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                >
                  <option value="all">Toutes</option>
                  {byAgenceRows.map((row) => (
                    <option key={row.agenceId} value={row.agenceId}>{row.agence}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-gray-400">Occupation mini</span>
                <select
                  value={adminBiFilters.minOccupation}
                  onChange={(e) => setAdminBiFilters((prev) => ({ ...prev, minOccupation: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200"
                >
                  <option value="all">Sans filtre</option>
                  <option value="50">50%+</option>
                  <option value="70">70%+</option>
                  <option value="85">85%+</option>
                </select>
              </label>
              <label className="text-sm flex items-end">
                <span className="inline-flex items-center gap-2 mt-6 text-gray-300">
                  <input
                    type="checkbox"
                    checked={adminBiFilters.retardOnly}
                    onChange={(e) => setAdminBiFilters((prev) => ({ ...prev, retardOnly: e.target.checked }))}
                  />
                  Agences avec retard uniquement
                </span>
              </label>
              <div className="md:col-span-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAdminBiFilters((prev) => ({
                    ...prev,
                    agenceId: 'all',
                    minOccupation: 'all',
                    retardOnly: false,
                  }))}
                  className="rounded-lg border border-night-500 px-3 py-2 text-xs text-gray-300 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
                >
                  Reinitialiser les filtres
                </button>
              </div>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-night-600 bg-night-800/40 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Quittances generees</p>
              <p className="mt-2 text-2xl font-semibold text-white">{totalGenerees}</p>
            </div>
            <div className="rounded-xl border border-night-600 bg-night-800/40 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Relances envoyees</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">{totalRelances}</p>
            </div>
            <div className="rounded-xl border border-night-600 bg-night-800/40 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Erreurs detectees</p>
              <p className="mt-2 text-2xl font-semibold text-rose-400">{totalErreurs}</p>
            </div>
          </div>

          <div className="rounded-xl border border-night-600 bg-gradient-to-br from-night-800 to-night-900 p-6">
            <h3 className="font-semibold text-white mb-4">Evolution des quittances generees</h3>
            <div className="h-48 rounded-lg bg-night-700/50 border border-night-600 flex items-end justify-between gap-2 px-4 pb-3">
              {monthlyRows.length > 0
                ? monthlyRows.map((row) => {
                  const generated = Number(row.generees || 0)
                  const height = Math.max(8, Math.round((generated / maxGenerees) * 120))
                  return (
                    <div key={row.periode} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                      <div className="h-32 w-full flex items-end justify-center">
                        <div className="w-full max-w-[44px] rounded-t bg-gradient-to-t from-gold-600/40 to-gold-400/80" style={{ height: `${height}px` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 truncate">{row.periode}</span>
                    </div>
                  )
                })
                : [40, 65, 45, 80, 55, 70].map((h, i) => (
                  <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                    <div className="h-32 w-full flex items-end justify-center">
                      <div className="w-full max-w-[44px] rounded-t bg-gradient-to-t from-gold-600/40 to-gold-400/80" style={{ height: `${h}px` }} />
                    </div>
                    <span className="text-[10px] text-gray-500">M{i + 1}</span>
                  </div>
                ))}
            </div>
            <a
              href={`${API_BASE}/gestionnaire/reporting/export.csv`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-500/20 border border-gold-500/40 px-4 py-2 text-sm text-gold-300"
            >
              <Download size={16} />
              Export CSV reel
            </a>
          </div>
          {isAdminPortal && Array.isArray(adminOverview.byAgence) && adminOverview.byAgence.length > 0 && (
            <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
              <h3 className="font-semibold text-white mb-4">Performance par agence ({filteredByAgenceRows.length})</h3>
              <SimpleTable
                rowKey={(r) => r.agenceId}
                columns={[
                  { key: 'agence', label: 'Agence' },
                  { key: 'biens', label: 'Biens' },
                  { key: 'loues', label: 'Loues' },
                  { key: 'tauxOccupation', label: 'Taux' },
                  { key: 'proprietaires', label: 'Proprio.' },
                  { key: 'locataires', label: 'Locataires' },
                  { key: 'gestionnaires', label: 'Gestionnaires' },
                  { key: 'ticketsOuverts', label: 'Tickets ouverts' },
                  { key: 'ticketsHorsSla', label: 'Hors SLA' },
                  {
                    key: 'paiementsRetard',
                    label: 'Retard',
                    render: (r) => (
                      <span className={Number(r.paiementsRetard) > 0 ? 'text-rose-400' : 'text-gray-400'}>{r.paiementsRetard}</span>
                    ),
                  },
                ]}
                rows={filteredByAgenceRows}
              />
            </div>
          )}
          {isAdminPortal && (
            <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
              <h3 className="font-semibold text-white mb-4">Comparaison agences (Top/Bottom)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-2">Top performers</p>
                  <SimpleTable
                    rowKey={(r) => `top-${r.agenceId}`}
                    columns={[
                      { key: 'agence', label: 'Agence' },
                      { key: 'tauxOccupation', label: 'Occupation' },
                      { key: 'paiementsRetard', label: 'Retards' },
                    ]}
                    rows={topRows}
                  />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-2">Bottom performers</p>
                  <SimpleTable
                    rowKey={(r) => `bottom-${r.agenceId}`}
                    columns={[
                      { key: 'agence', label: 'Agence' },
                      { key: 'tauxOccupation', label: 'Occupation' },
                      { key: 'paiementsRetard', label: 'Retards' },
                    ]}
                    rows={bottomRows}
                  />
                </div>
              </div>
            </div>
          )}
          {isAdminPortal && (
            <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
              <h3 className="font-semibold text-white mb-4">Prevision 30/60/90 jours</h3>
              <SimpleTable
                rowKey={(r) => r.horizon}
                columns={[
                  { key: 'horizon', label: 'Horizon' },
                  { key: 'expected', label: 'Encaissement attendu (GNF)' },
                  { key: 'risk', label: 'Risque (GNF)' },
                  { key: 'focus', label: 'Focus' },
                ]}
                rows={forecastRows}
              />
            </div>
          )}
        </div>
      )
    } else if (section === 'audit') {
      const events = isAdminPortal && Array.isArray(adminOverview.auditEvents) && adminOverview.auditEvents.length > 0
        ? adminOverview.auditEvents
        : data
      const filteredAudit = filterBySearch(events, ['horodatage', 'user', 'action', 'detail', 'objectType', 'severity'])
      const complianceRows = Array.isArray(adminOverview.complianceByAgence) ? adminOverview.complianceByAgence : []
      content = (
        <div className="space-y-5">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-4">
            <label className="text-sm w-full md:max-w-sm">
              <span className="text-gray-400">Recherche audit</span>
              <input
                type="text"
                value={gestionnaireSearch}
                onChange={(e) => {
                  setGestionnaireSearch(e.target.value)
                  setGestionnairePage(1)
                }}
                placeholder="user, action, detail..."
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-gray-200 outline-none focus:border-gold-500/50"
              />
            </label>
          </div>
          <SimpleTable
            rowKey={(r, i) => `${r.horodatage || i}-${i}`}
            columns={[
              { key: 'horodatage', label: 'Horodatage' },
              { key: 'user', label: 'Utilisateur' },
              { key: 'action', label: 'Action' },
              { key: 'objectType', label: 'Objet' },
              { key: 'severity', label: 'Severite' },
              { key: 'detail', label: 'Detail' },
            ]}
            rows={filteredAudit}
          />
          {isAdminPortal && (
            <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
              <h3 className="font-semibold text-white mb-4">Conformite dossiers par agence</h3>
              <SimpleTable
                rowKey={(r) => r.agenceId}
                columns={[
                  { key: 'agence', label: 'Agence' },
                  { key: 'score', label: 'Score' },
                  { key: 'incidents', label: 'Incidents' },
                  { key: 'accesInactifs', label: 'Acces inactifs' },
                ]}
                rows={complianceRows}
              />
            </div>
          )}
        </div>
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
      {isAdminPortal && adminOverviewFeedback ? (
        <InlineFeedback message={adminOverviewFeedback} className="mb-4" />
      ) : null}
      {isAdminPortal && adminOverview.kpis.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {adminOverview.kpis.slice(0, 9).map((item) => (
            <div key={item.label} className="rounded-xl border border-night-600 bg-night-800/40 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
              <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      )}
      {slug === 'agence' && <InlineFeedback message={agenceFeedback} className="mb-4" />}
      {content || (
        <p className="text-gray-500">
          Section « {section} » — contenu démo à étendre.
        </p>
      )}
    </div>
  )
}
