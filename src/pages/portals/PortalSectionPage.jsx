import { useParams, Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { espacePortals } from '../../data/espacePortals'
import { tables } from '../../data/portalMockData'

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

export default function PortalSectionPage() {
  const { slug, section } = useParams()
  const portal = espacePortals[slug]
  const data = tables[slug]?.[section]

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

  if (slug === 'locataire') {
    if (section === 'loyers') {
      content = (
        <SimpleTable
          rowKey={(r) => r.id}
          columns={[
            { key: 'periode', label: 'Période' },
            { key: 'montant', label: 'Montant' },
            { key: 'statut', label: 'Statut', render: (r) => <span className="text-emerald-400">{r.statut}</span> },
            {
              key: 'quittance',
              label: 'Quittance',
              render: () => (
                <button type="button" className="text-gold-400 hover:underline inline-flex items-center gap-1">
                  <Download size={14} /> PDF
                </button>
              ),
            },
          ]}
          rows={data}
        />
      )
    } else if (section === 'demandes') {
      content = (
        <SimpleTable
          rowKey={(r) => r.id}
          columns={[
            { key: 'id', label: 'N°' },
            { key: 'sujet', label: 'Sujet' },
            { key: 'date', label: 'Date' },
            { key: 'statut', label: 'Statut' },
            { key: 'priorite', label: 'Priorité' },
          ]}
          rows={data}
        />
      )
    } else if (section === 'documents') {
      content = (
        <SimpleTable
          rowKey={(r, i) => i}
          columns={[
            { key: 'nom', label: 'Document' },
            { key: 'type', label: 'Type' },
            {
              key: 'date',
              label: 'Date',
              render: (r) => (
                <span className="flex items-center justify-between gap-4">
                  {r.date}
                  <button type="button" className="text-gold-400 text-xs shrink-0">
                    Telecharger
                  </button>
                </span>
              ),
            },
          ]}
          rows={data}
        />
      )
    } else if (section === 'messages') {
      content = (
        <ul className="space-y-3">
          {data?.map((m, i) => (
            <li
              key={i}
              className={`rounded-xl border px-4 py-3 ${
                m.lu ? 'border-night-600 bg-night-800/30' : 'border-gold-500/30 bg-gold-500/5'
              }`}
            >
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="text-gray-300 font-medium">{m.de}</span>
                <span>{m.date}</span>
              </div>
              <p className="text-sm text-gray-400">{m.apercu}</p>
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
            { key: 'loyer', label: 'Loyer' },
            { key: 'locataire', label: 'Locataire' },
            { key: 'finBail', label: 'Fin de bail' },
          ]}
          rows={data}
        />
      )
    } else if (section === 'encaissements') {
      content = (
        <SimpleTable
          rowKey={(r, i) => i}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'bien', label: 'Bien' },
            { key: 'montant', label: 'Montant (GNF)' },
            { key: 'statut', label: 'Statut', render: (r) => <span className="text-emerald-400">{r.statut}</span> },
          ]}
          rows={data}
        />
      )
    } else if (section === 'candidatures') {
      content = (
        <SimpleTable
          rowKey={(r, i) => i}
          columns={[
            { key: 'candidat', label: 'Candidat' },
            { key: 'bien', label: 'Bien' },
            { key: 'date', label: 'Date' },
            { key: 'score', label: 'Score' },
            {
              key: 'act',
              label: '',
              render: () => (
                <button type="button" className="text-gold-400 text-xs">
                  Voir dossier
                </button>
              ),
            },
          ]}
          rows={data?.map((d) => ({ ...d, act: true }))}
        />
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
    if (section === 'tickets') {
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
          rows={data}
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
