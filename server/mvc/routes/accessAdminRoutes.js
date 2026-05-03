import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  listAccessController,
  createAccessController,
  updateAccessController,
  deleteAccessController,
  resetAccessCodeController,
} from '../controllers/accessAdminController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/', listAccessController)
router.post('/', createAccessController)
router.put('/:id', updateAccessController)
router.delete('/:id', deleteAccessController)
router.post('/:id/reset-code', resetAccessCodeController)

export default router

