import { useMemo } from 'react'
import { parseAmountGnf } from '../../../lib/parseGnf'
import { MonthlyBarChart, DonutPieChart } from './ReportingCharts'
import ExportCsvButton from './ExportCsvButton'

function MiniTable({ columns, rows }) {
  if (!rows?.length) {
    return <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-night-600 rounded-xl">Aucune ligne à afficher.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-night-600">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-night-600 bg-night-800/80">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium text-gray-400 whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-night-600">
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-night-800/40">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 text-gray-300">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectionHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div>
        <h2 className="font-display text-xl font-bold text-white">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2 shrink-0">{children}</div> : null}
    </div>
  )
}

export default function PortalReportingContent({
  slug,
  paymentHistory = [],
  pendingPayments = [],
  demandes = [],
  proprietaireBiens = [],
  proprietaireRevenus = [],
  proprietaireHistorique = [],
  agenceWorkspace = { biens: [], proprietaires: [], locataires: [], gestionnaires: [] },
  gestionnaireTickets = [],
}) {
  const locataireBar = useMemo(() => {
    return (paymentHistory || []).map((r) => ({
      name: r.periode || r.date || '-',
      value: parseAmountGnf(r.montant),
    })).filter((d) => d.value > 0)
  }, [paymentHistory])

  const locatairePie = useMemo(() => {
    const by = {}
    for (const d of demandes || []) {
      const k = d.type || 'Autre'
      by[k] = (by[k] || 0) + 1
    }
    return Object.entries(by).map(([name, value]) => ({ name, value }))
  }, [demandes])

  const locataireTableRows = useMemo(() => (paymentHistory || []).map((r) => ({
    date: r.date || '',
    periode: r.periode || '',
    moyen: r.moyen || '',
    montant: r.montant || '',
    reference: r.reference || '',
    statut: r.statut || '',
  })), [paymentHistory])

  const proprioBar = useMemo(() => (proprietaireRevenus || []).map((r) => ({
    name: r.mois || '-',
    value: parseAmountGnf(r.net),
  })).filter((d) => d.value > 0), [proprietaireRevenus])

  const proprioPie = useMemo(() => {
    const by = {}
    for (const b of proprietaireBiens || []) {
      const k = b.statut || '—'
      by[k] = (by[k] || 0) + 1
    }
    return Object.entries(by).map(([name, value]) => ({ name, value }))
  }, [proprietaireBiens])

  const proprioBiensRows = useMemo(() => (proprietaireBiens || []).map((b) => ({
    ref: b.ref,
    adresse: b.adresse,
    type: b.type,
    loyer: b.loyer,
    locataire: b.locataire,
    statut: b.statut,
    finBail: b.finBail,
  })), [proprietaireBiens])

  const proprioHistRows = useMemo(() => (proprietaireHistorique || []).map((r) => ({
    date: r.date,
    bien: r.bien,
    locataire: r.locataire,
    montant: r.montant,
    mode: r.mode,
    statut: r.statut,
  })), [proprietaireHistorique])

  const agenceBar = useMemo(() => {
    const by = {}
    for (const b of agenceWorkspace?.biens || []) {
      const t = b.type || 'Autre'
      by[t] = (by[t] || 0) + 1
    }
    return Object.entries(by).map(([name, value]) => ({ name, value }))
  }, [agenceWorkspace])

  const agencePie = useMemo(() => {
    const rows = (agenceWorkspace?.biens || []).map((b) => {
      const s = String(b.statut || 'disponible')
      const label = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      return label
    })
    const by = {}
    for (const l of rows) {
      by[l] = (by[l] || 0) + 1
    }
    return Object.entries(by).map(([name, value]) => ({ name, value }))
  }, [agenceWorkspace])

  const agenceSummaryRows = useMemo(() => {
    const mapped = (agenceWorkspace?.biens || []).map((b) => ({
      id: b.id,
      titre: b.titre || b.adresse || '-',
      type: b.type || '-',
      statut: b.statut || '-',
      loyer: b.loyerMensuel != null ? String(b.loyerMensuel) : '',
    }))
    return mapped
  }, [agenceWorkspace])

  const ticketPie = useMemo(() => {
    const by = {}
    for (const t of gestionnaireTickets || []) {
      const k = t.statut || t.status || '—'
      by[k] = (by[k] || 0) + 1
    }
    return Object.entries(by).map(([name, value]) => ({ name, value }))
  }, [gestionnaireTickets])

  if (slug === 'locataire') {
    return (
      <div className="space-y-8">
        <SectionHeader
          title="Reporting locataire"
          subtitle="Histogramme des paiements, répartition des demandes et export de l historique."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyBarChart data={locataireBar} title="Montants payés par période (GNF)" />
          <DonutPieChart data={locatairePie} title="Demandes par type" />
        </div>
        <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-white">Historique des paiements</h3>
            <ExportCsvButton
              filename="reporting-locataire-paiements.csv"
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'periode', header: 'Periode' },
                { key: 'moyen', header: 'Moyen' },
                { key: 'montant', header: 'Montant' },
                { key: 'reference', header: 'Reference' },
                { key: 'statut', header: 'Statut' },
              ]}
              rows={locataireTableRows}
            />
          </div>
          <MiniTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'periode', label: 'Période' },
              { key: 'moyen', label: 'Moyen' },
              { key: 'montant', label: 'Montant' },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={locataireTableRows}
          />
        </div>
        <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
          <h3 className="font-semibold text-white mb-3">Lignes à payer (snapshot)</h3>
          <ExportCsvButton
            filename="reporting-locataire-a-payer.csv"
            columns={[
              { key: 'libelle', header: 'Libelle' },
              { key: 'type', header: 'Type' },
              { key: 'echeance', header: 'Echeance' },
              { key: 'montant', header: 'Montant_GNF' },
              { key: 'statut', header: 'Statut' },
            ]}
            rows={(pendingPayments || []).map((p) => ({
              ...p,
              montant: p.montant != null ? String(p.montant) : '',
            }))}
            label="Exporter lignes à payer"
          />
          <div className="mt-3">
            <MiniTable
              columns={[
                { key: 'libelle', label: 'Libellé' },
                { key: 'type', label: 'Type' },
                { key: 'echeance', label: 'Échéance' },
                {
                  key: 'montant',
                  label: 'Montant',
                  render: (r) => (r.montant != null ? `${Number(r.montant).toLocaleString('fr-FR')} GNF` : '-'),
                },
                { key: 'statut', label: 'Statut' },
              ]}
              rows={pendingPayments}
            />
          </div>
        </div>
      </div>
    )
  }

  if (slug === 'proprietaire') {
    return (
      <div className="space-y-8">
        <SectionHeader
          title="Reporting propriétaire"
          subtitle="Revenus nets par mois, occupation du parc et exports comptables."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyBarChart data={proprioBar} title="Revenus nets par mois (GNF)" />
          <DonutPieChart data={proprioPie} title="Biens par statut" />
        </div>
        <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-white">Parc immobilier</h3>
            <ExportCsvButton
              filename="reporting-proprietaire-biens.csv"
              columns={[
                { key: 'ref', header: 'Ref' },
                { key: 'adresse', header: 'Adresse' },
                { key: 'type', header: 'Type' },
                { key: 'loyer', header: 'Loyer' },
                { key: 'locataire', header: 'Locataire' },
                { key: 'statut', header: 'Statut' },
                { key: 'finBail', header: 'Fin_bail' },
              ]}
              rows={proprioBiensRows}
            />
          </div>
          <MiniTable
            columns={[
              { key: 'ref', label: 'Réf.' },
              { key: 'adresse', label: 'Bien' },
              { key: 'loyer', label: 'Loyer' },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={proprioBiensRows}
          />
        </div>
        <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-white">Historique des encaissements</h3>
            <ExportCsvButton
              filename="reporting-proprietaire-encaissements.csv"
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'bien', header: 'Bien' },
                { key: 'locataire', header: 'Locataire' },
                { key: 'montant', header: 'Montant' },
                { key: 'mode', header: 'Mode' },
                { key: 'statut', header: 'Statut' },
              ]}
              rows={proprioHistRows}
            />
          </div>
          <MiniTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'bien', label: 'Bien' },
              { key: 'montant', label: 'Montant' },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={proprioHistRows}
          />
        </div>
      </div>
    )
  }

  if (slug === 'agence' || slug === 'gestionnaire') {
    const subtitle =
      slug === 'agence'
        ? 'Synthèse du portefeuille agence : typologie des biens, statuts et export des données.'
        : 'Pilotage opérationnel : répartition des biens et des tickets (SLA).'

    return (
      <div className="space-y-8">
        <SectionHeader title={slug === 'agence' ? 'Reporting agence' : 'Reporting gestionnaire'} subtitle={subtitle} />
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyBarChart data={agenceBar} title="Nombre de biens par type" />
          <DonutPieChart data={agencePie} title="Biens par statut" />
        </div>
        {slug === 'gestionnaire' && ticketPie.length > 0 ? (
          <div className="max-w-xl">
            <DonutPieChart data={ticketPie} title="Tickets par statut" />
          </div>
        ) : null}
        <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-white">Export synthèse biens</h3>
            <ExportCsvButton
              filename={`reporting-${slug}-biens.csv`}
              columns={[
                { key: 'id', header: 'Id' },
                { key: 'titre', header: 'Titre_ou_adresse' },
                { key: 'type', header: 'Type' },
                { key: 'statut', header: 'Statut' },
                { key: 'loyer', header: 'Loyer_mensuel' },
              ]}
              rows={agenceSummaryRows}
            />
          </div>
          <MiniTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'titre', label: 'Bien' },
              { key: 'type', label: 'Type' },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={agenceSummaryRows}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-white text-sm">Propriétaires</h3>
              <ExportCsvButton
                filename={`reporting-${slug}-proprietaires.csv`}
                columns={[
                  { key: 'id', header: 'Id' },
                  { key: 'nom', header: 'Nom' },
                  { key: 'email', header: 'Email' },
                  { key: 'telephone', header: 'Telephone' },
                  { key: 'statut', header: 'Statut' },
                ]}
                rows={agenceWorkspace?.proprietaires || []}
                label="CSV"
              />
            </div>
            <MiniTable
              columns={[
                { key: 'nom', label: 'Nom' },
                { key: 'email', label: 'Email' },
                { key: 'statut', label: 'Statut' },
              ]}
              rows={agenceWorkspace?.proprietaires || []}
            />
          </div>
          <div className="rounded-xl border border-night-600 bg-night-800/30 p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-white text-sm">Locataires</h3>
              <ExportCsvButton
                filename={`reporting-${slug}-locataires.csv`}
                columns={[
                  { key: 'id', header: 'Id' },
                  { key: 'nom', header: 'Nom' },
                  { key: 'email', header: 'Email' },
                  { key: 'telephone', header: 'Telephone' },
                  { key: 'statut', header: 'Statut' },
                ]}
                rows={agenceWorkspace?.locataires || []}
                label="CSV"
              />
            </div>
            <MiniTable
              columns={[
                { key: 'nom', label: 'Nom' },
                { key: 'email', label: 'Email' },
                { key: 'statut', label: 'Statut' },
              ]}
              rows={agenceWorkspace?.locataires || []}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <p className="text-gray-500 text-sm">Section reporting non disponible pour ce profil.</p>
  )
}
