import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { CHART_PALETTE } from './ReportingCharts'
import ExportCsvButton from './ExportCsvButton'

const AXIS = { stroke: '#4b5563', tick: { fill: '#9ca3af', fontSize: 10 } }
const GRID = { stroke: '#2d3548', strokeDasharray: '3 3' }
const TOOLTIP = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 8 },
  labelStyle: { color: '#e5e7eb' },
  itemStyle: { color: '#e5e7eb' },
}

function shortLabel(s, max = 12) {
  if (!s) return '-'
  const t = String(s)
  return t.length > max ? `${t.slice(0, max)}…` : t
}

export default function AdminReportingVisuals({
  monthlyRows,
  totalGenerees,
  totalRelances,
  totalErreurs,
  filteredByAgenceRows,
  forecastRows,
  topRows,
  bottomRows,
  apiBase,
}) {
  const quittanceBar = useMemo(
    () => (monthlyRows || []).map((r) => ({
      name: shortLabel(r.periode, 10),
      generees: Number(r.generees || 0),
      relances: Number(r.relances || 0),
    })),
    [monthlyRows],
  )

  const pieTotals = useMemo(
    () => [
      { name: 'Générées', value: Math.max(0, Number(totalGenerees || 0)) },
      { name: 'Relances', value: Math.max(0, Number(totalRelances || 0)) },
      { name: 'Erreurs', value: Math.max(0, Number(totalErreurs || 0)) },
    ].filter((d) => d.value > 0),
    [totalGenerees, totalRelances, totalErreurs],
  )

  const agenceBar = useMemo(
    () => (filteredByAgenceRows || []).map((r) => ({
      name: shortLabel(r.agence, 10),
      biens: Number(r.biens || 0),
      retards: Number(r.paiementsRetard || 0),
    })),
    [filteredByAgenceRows],
  )

  const agenceExportRows = useMemo(
    () => (filteredByAgenceRows || []).map((r) => ({
      agence: r.agence,
      agenceId: r.agenceId,
      biens: r.biens,
      loues: r.loues,
      tauxOccupation: r.tauxOccupation,
      proprietaires: r.proprietaires,
      locataires: r.locataires,
      gestionnaires: r.gestionnaires,
      ticketsOuverts: r.ticketsOuverts,
      ticketsHorsSla: r.ticketsHorsSla,
      paiementsRetard: r.paiementsRetard,
    })),
    [filteredByAgenceRows],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-night-600 bg-night-900/40 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Quittances générées / relances par période</h3>
          <div className="h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quittanceBar.length ? quittanceBar : [{ name: '-', generees: 0, relances: 0 }]} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="name" tick={AXIS.tick} stroke={AXIS.stroke} interval={0} angle={-20} textAnchor="end" height={48} />
                <YAxis tick={AXIS.tick} stroke={AXIS.stroke} width={36} />
                <Tooltip {...TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="generees" name="Générées" fill="#e5b02d" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="relances" name="Relances" fill="#38bdf8" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-night-600 bg-night-900/40 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Synthèse volumes (diagramme)</h3>
          <div className="h-[260px] w-full min-w-0">
            {pieTotals.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">Aucune donnée agrégée.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieTotals}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {pieTotals.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {agenceBar.length > 0 ? (
        <div className="rounded-xl border border-night-600 bg-night-900/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-white">Biens et retards par agence (filtre actif)</h3>
            <ExportCsvButton
              filename="reporting-admin-performance-agences.csv"
              columns={[
                { key: 'agence', header: 'Agence' },
                { key: 'agenceId', header: 'Agence_id' },
                { key: 'biens', header: 'Biens' },
                { key: 'loues', header: 'Loues' },
                { key: 'tauxOccupation', header: 'Taux_occupation' },
                { key: 'paiementsRetard', header: 'Paiements_retard' },
                { key: 'ticketsOuverts', header: 'Tickets_ouverts' },
                { key: 'ticketsHorsSla', header: 'Tickets_hors_sla' },
              ]}
              rows={agenceExportRows}
              label="Exporter le tableau"
            />
          </div>
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agenceBar} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="name" tick={AXIS.tick} stroke={AXIS.stroke} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={AXIS.tick} stroke={AXIS.stroke} width={36} />
                <Tooltip {...TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="biens" name="Biens" fill="#a78bfa" radius={[3, 3, 0, 0]} maxBarSize={36} />
                <Bar dataKey="retards" name="Retards" fill="#fb7185" radius={[3, 3, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ExportCsvButton
          filename="reporting-admin-previsions.csv"
          columns={[
            { key: 'horizon', header: 'Horizon' },
            { key: 'expected', header: 'Encaissement_attendu' },
            { key: 'risk', header: 'Risque' },
            { key: 'focus', header: 'Focus' },
          ]}
          rows={forecastRows || []}
          label="Export prévisions CSV"
        />
        <ExportCsvButton
          filename="reporting-admin-top-agences.csv"
          columns={[
            { key: 'agence', header: 'Agence' },
            { key: 'tauxOccupation', header: 'Taux' },
            { key: 'paiementsRetard', header: 'Retards' },
          ]}
          rows={topRows || []}
          label="Export top agences"
        />
        <ExportCsvButton
          filename="reporting-admin-bottom-agences.csv"
          columns={[
            { key: 'agence', header: 'Agence' },
            { key: 'tauxOccupation', header: 'Taux' },
            { key: 'paiementsRetard', header: 'Retards' },
          ]}
          rows={bottomRows || []}
          label="Export bottom agences"
        />
        {apiBase ? (
          <a
            href={`${apiBase}/gestionnaire/reporting/export.csv`}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500/20 border border-gold-500/40 px-3 py-2 text-xs font-medium text-gold-300"
          >
            Export serveur (CSV métier)
          </a>
        ) : null}
      </div>
    </div>
  )
}
