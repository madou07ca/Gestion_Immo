import PDFDocument from 'pdfkit'
import { findContratById } from '../repositories/contratRepository.js'
import { findBienById, listBiens } from '../repositories/bienRepository.js'
import { findLocataireById } from '../repositories/locataireRepository.js'
import { findProprietaireById } from '../repositories/proprietaireRepository.js'
import {
  signContrat,
  getContrats,
  updateContratStatus,
  deleteContratService,
} from '../services/operationsService.js'
import { assertSameAgence } from '../utils/backofficeScope.js'

function assertContratScope(req, contrat) {
  if (!contrat) return { status: 404, message: 'Contrat introuvable.' }
  const bien = findBienById(contrat.bienId)
  const denied = assertSameAgence(req.scopeAgenceId, bien?.agenceId, 'Contrat')
  if (denied) return { status: denied.status, message: denied.message }
  return null
}

export function listContratsController(req, res) {
  let rows = getContrats()
  if (req.scopeAgenceId) {
    const biens = listBiens()
    const bienById = Object.fromEntries(biens.map((b) => [b.id, b]))
    const aid = req.scopeAgenceId
    rows = rows.filter((c) => String(bienById[c.bienId]?.agenceId || '') === aid)
  }
  res.json(rows)
}

export function downloadContratController(req, res) {
  const contrat = findContratById(req.params.id)
  if (!contrat) return res.status(404).json({ ok: false, error: 'Contrat introuvable.' })

  const blocked = assertContratScope({ scopeAgenceId: req.scopeAgenceId }, contrat)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })

  const bien = findBienById(contrat.bienId)
  const locataire = findLocataireById(contrat.locataireId)
  const proprietaire = findProprietaireById(bien?.proprietaireId)

  const fileName = `contrat-${contrat.id}.pdf`
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)
  res.setHeader('Content-Type', 'application/pdf')

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)

  const left = doc.page.margins.left
  const right = doc.page.width - doc.page.margins.right
  const width = right - left

  doc.save().rect(left, 40, width, 72).strokeColor('#111111').lineWidth(1).stroke().restore()
  doc.fillColor('#000000').fontSize(10).text('IMMO CONNECT GN', left + 16, 52)
  doc.fillColor('#000000').fontSize(18).text('Contrat de bail', left + 16, 68)
  doc.fillColor('#000000').fontSize(10).text(`N° ${contrat.id}`, right - 180, 56, { width: 170, align: 'right' })
  doc.fillColor('#000000').fontSize(10).text(new Date().toLocaleDateString('fr-FR'), right - 180, 72, { width: 170, align: 'right' })
  doc.y = 130

  const drawSection = (title, lines) => {
    const startY = doc.y
    const sectionHeight = 22 + lines.length * 16 + 12
    doc.save().roundedRect(left, startY, width, sectionHeight, 8).strokeColor('#111111').lineWidth(1).stroke().restore()
    doc.fillColor('#000000').fontSize(11).text(title, left + 12, startY + 8)
    let lineY = startY + 28
    doc.fillColor('#000000').fontSize(11)
    lines.forEach((line) => {
      doc.text(line, left + 12, lineY, { width: width - 24 })
      lineY += 16
    })
    doc.y = startY + sectionHeight + 12
  }

  drawSection('Parties', [
    `Proprietaire: ${proprietaire?.nom || bien?.proprietaireId || '-'}`,
    `Locataire: ${locataire?.nom || contrat.locataireId || '-'}`,
    `Telephone locataire: ${locataire?.telephone || '-'}`,
  ])
  drawSection('Bien loue', [
    `Adresse: ${bien?.adresse || '-'}`,
    `Type: ${bien?.type || '-'}`,
    `Reference bien: ${bien?.id || contrat.bienId || '-'}`,
  ])
  drawSection('Conditions financieres et duree', [
    `Date debut: ${contrat.dateDebut || '-'}`,
    `Date fin: ${contrat.dateFin || '-'}`,
    `Loyer mensuel: ${Number(contrat.loyerMensuel || 0).toLocaleString('fr-FR')} GNF`,
    `Statut: ${contrat.statut || '-'}`,
  ])

  doc.fillColor('#000000').fontSize(9)
  doc.text('Document genere automatiquement par la plateforme Gestion Locative.', left, doc.y + 10, { width, align: 'center' })
  doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, left, doc.y + 24, { width, align: 'center' })
  doc.end()
}

export function signContratController(req, res) {
  const body = req.body || {}
  if (req.scopeAgenceId) {
    const bien = findBienById(body.bienId)
    const denied = assertSameAgence(req.scopeAgenceId, bien?.agenceId, 'Bien')
    if (denied) return res.status(denied.status).json({ ok: false, error: denied.message })
  }
  const result = signContrat(body)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.status(201).json({ ok: true, data: result.data.contrat, bien: result.data.bien })
}

export function updateContratStatusController(req, res) {
  const contrat = findContratById(req.params.id)
  const blocked = assertContratScope(req, contrat)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const result = updateContratStatus(req.params.id, req.body?.statut)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

export function deleteContratController(req, res) {
  const contrat = findContratById(req.params.id)
  const blocked = assertContratScope(req, contrat)
  if (blocked) return res.status(blocked.status).json({ ok: false, error: blocked.message })
  const result = deleteContratService(req.params.id)
  if (result.error) return res.status(result.error.status).json({ ok: false, error: result.error.message })
  res.json({ ok: true, data: result.data })
}

