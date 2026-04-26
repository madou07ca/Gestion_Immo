import PDFDocument from 'pdfkit'
import { findQuittanceById } from '../repositories/quittanceRepository.js'
import { listLocataires } from '../repositories/locataireRepository.js'
import { listBiens } from '../repositories/bienRepository.js'
import { sendQuittanceByEmail } from '../services/operationsService.js'

export function downloadQuittanceController(req, res) {
  const quittance = findQuittanceById(req.params.id)
  if (!quittance) return res.status(404).json({ ok: false, error: 'Quittance introuvable.' })
  const tenant = listLocataires().find((item) => item.id === quittance.locataireId)
  const bien = listBiens().find((item) => item.id === quittance.bienId)

  const fileName = `quittance-${quittance.id}.pdf`
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)
  res.setHeader('Content-Type', 'application/pdf')

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)

  const left = doc.page.margins.left
  const right = doc.page.width - doc.page.margins.right
  const width = right - left

  doc.save().rect(left, 40, width, 72).fill('#0f172a').restore()
  doc.fillColor('#fbbf24').fontSize(10).text('IMMO CONNECT GN', left + 16, 52)
  doc.fillColor('#ffffff').fontSize(18).text('Quittance de loyer', left + 16, 68)
  doc.fillColor('#cbd5e1').fontSize(10).text(`N° ${quittance.id}`, right - 130, 56, { width: 120, align: 'right' })
  doc.fillColor('#cbd5e1').fontSize(10).text(new Date(quittance.createdAt).toLocaleDateString('fr-FR'), right - 130, 72, { width: 120, align: 'right' })
  doc.y = 130

  const drawSection = (title, lines) => {
    const startY = doc.y
    const sectionHeight = 22 + lines.length * 16 + 12
    doc.save().roundedRect(left, startY, width, sectionHeight, 8).strokeColor('#334155').lineWidth(1).stroke().restore()
    doc.fillColor('#fbbf24').fontSize(11).text(title, left + 12, startY + 8)
    let lineY = startY + 28
    doc.fillColor('#e5e7eb').fontSize(11)
    lines.forEach((line) => {
      doc.text(line, left + 12, lineY, { width: width - 24 })
      lineY += 16
    })
    doc.y = startY + sectionHeight + 12
  }

  drawSection('Periode et reference', [
    `Periode: ${quittance.periode}`,
    `Type: ${quittance.type}`,
    `Reference de paiement: ${quittance.reference}`,
  ])
  drawSection('Informations locataire', [
    `Nom: ${tenant?.nom || quittance.locataireId}`,
    `Email: ${tenant?.email || '-'}`,
    `Telephone: ${tenant?.telephone || '-'}`,
  ])
  drawSection('Informations bien', [
    `Titre: ${bien?.titre || '-'}`,
    `Adresse: ${`${bien?.adresse || '-'} ${bien?.ville || ''}`.trim()}`,
    `Reference bien: ${quittance.bienId}`,
  ])
  drawSection('Detail du reglement', [
    `Montant regle: ${Number(quittance.montant || 0).toLocaleString('fr-FR')} GNF`,
    `Moyen de paiement: ${quittance.moyen}`,
    `Statut: ${quittance.statut}`,
  ])

  const signTop = doc.y + 16
  const signWidth = (width - 16) / 2
  doc.save()
    .roundedRect(left, signTop, signWidth, 90, 8).strokeColor('#334155').stroke()
    .roundedRect(left + signWidth + 16, signTop, signWidth, 90, 8).strokeColor('#334155').stroke()
    .restore()
  doc.fillColor('#9ca3af').fontSize(10).text('Signature gestionnaire', left + 12, signTop + 10)
  doc.fillColor('#9ca3af').fontSize(10).text('Signature locataire', left + signWidth + 28, signTop + 10)
  doc.fillColor('#6b7280').fontSize(9).text('Nom / cachet / date', left + 12, signTop + 68)
  doc.fillColor('#6b7280').fontSize(9).text('Nom / date', left + signWidth + 28, signTop + 68)
  doc.y = signTop + 110
  doc.fillColor('#6b7280').fontSize(9)
  doc.text('Document genere automatiquement par la plateforme Gestion Locative.', left, doc.y, { width, align: 'center' })
  doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, left, doc.y + 14, { width, align: 'center' })
  doc.end()
}

export function sendQuittanceEmailController(req, res) {
  const result = sendQuittanceByEmail(req.params.id, req.body?.email)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

