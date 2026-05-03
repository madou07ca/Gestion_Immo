import { Download } from 'lucide-react'
import { downloadCsv } from './exportCsv'

export default function ExportCsvButton({ filename, columns, rows, label = 'Exporter CSV' }) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, columns, rows || [])}
      className="inline-flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-xs font-medium text-gold-300 hover:bg-gold-500/20 transition-colors"
    >
      <Download size={14} />
      {label}
    </button>
  )
}
