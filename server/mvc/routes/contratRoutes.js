import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  listContratsController,
  downloadContratController,
  signContratController,
  updateContratStatusController,
  deleteContratController,
} from '../controllers/contratController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/', listContratsController)
router.get('/:id/download', downloadContratController)
router.post('/signature', signContratController)
router.patch('/:id/status', updateContratStatusController)
router.delete('/:id', deleteContratController)

export default router

