import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import { downloadQuittanceController, sendQuittanceEmailController } from '../controllers/quittanceController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/:id/download', downloadQuittanceController)
router.post('/:id/send-email', sendQuittanceEmailController)

export default router

