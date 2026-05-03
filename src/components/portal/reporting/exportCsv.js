function escapeCsvCell(value) {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/**
 * @param {string} filename
 * @param {{ key: string, header: string }[]} columns
 * @param {Record<string, unknown>[]} rows
 */
export function downloadCsv(filename, columns, rows) {
  if (!columns?.length) return
  const header = columns.map((c) => escapeCsvCell(c.header)).join(',')
  const lines = (rows || []).map((row) =>
    columns.map((c) => escapeCsvCell(row[c.key])).join(','),
  )
  const blob = new Blob([`\ufeff${header}\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
