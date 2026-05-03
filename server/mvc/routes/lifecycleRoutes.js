import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  postGenerateEcheancesController,
  postMarkOverdueController,
  getComplianceAlertsController,
  postReversementController,
  getReversementsController,
  postValidateReversementController,
  postEtatLieuController,
  getEtatsLieuxController,
  putEtatLieuController,
  deleteEtatLieuController,
  postCautionController,
  getCautionsController,
  putCautionController,
  postEnqueueNotificationController,
  postProcessNotificationsController,
  postRgpdTenantExportController,
  postRgpdOwnerExportController,
  postRentRevisionController,
  postSignatureRequestController,
  postRelanceController,
  getRelancesController,
} from '../controllers/lifecycleController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.post('/echeances/generate', postGenerateEcheancesController)
router.post('/echeances/mark-overdue', postMarkOverdueController)
router.get('/compliance/alerts', getComplianceAlertsController)
router.post('/reversements', postReversementController)
router.get('/reversements', getReversementsController)
router.post('/reversements/:id/validate', postValidateReversementController)
router.post('/etats-lieux', postEtatLieuController)
router.get('/etats-lieux', getEtatsLieuxController)
router.put('/etats-lieux/:id', putEtatLieuController)
router.delete('/etats-lieux/:id', deleteEtatLieuController)
router.post('/cautions', postCautionController)
router.get('/cautions', getCautionsController)
router.put('/cautions/:id', putCautionController)
router.post('/notifications/enqueue', postEnqueueNotificationController)
router.post('/notifications/process', postProcessNotificationsController)
router.post('/relances', postRelanceController)
router.get('/relances', getRelancesController)
router.post('/contrats/:id/revision', postRentRevisionController)
router.post('/contrats/:id/signature-request', postSignatureRequestController)
router.post('/gdpr/export-tenant', postRgpdTenantExportController)
router.post('/gdpr/export-owner', postRgpdOwnerExportController)

export default router
