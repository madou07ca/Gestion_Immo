import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  listGestionnaireQuittancesController,
  listGestionnaireTicketsController,
  createGestionnaireTicketController,
  updateGestionnaireTicketController,
  runSlaNotificationsController,
  listSlaNotificationLogsController,
  getSlaNotificationSettingsController,
  updateSlaNotificationSettingsController,
  previewSlaNotificationTemplateController,
  exportGestionnaireReportingCsvController,
} from '../controllers/gestionnaireController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/quittances', listGestionnaireQuittancesController)
router.get('/tickets', listGestionnaireTicketsController)
router.post('/tickets', createGestionnaireTicketController)
router.put('/tickets/:id', updateGestionnaireTicketController)
router.post('/tickets/sla-notifications/run', runSlaNotificationsController)
router.get('/tickets/sla-notifications/logs', listSlaNotificationLogsController)
router.get('/tickets/sla-notifications/settings', getSlaNotificationSettingsController)
router.put('/tickets/sla-notifications/settings', updateSlaNotificationSettingsController)
router.post('/tickets/sla-notifications/preview', previewSlaNotificationTemplateController)
router.get('/reporting/export.csv', exportGestionnaireReportingCsvController)

export default router

