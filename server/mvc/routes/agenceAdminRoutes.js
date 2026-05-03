import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js'
import {
  listAgencesAdminController,
  createAgenceAdminController,
  updateAgenceAdminController,
  deleteAgenceAdminController,
} from '../controllers/agenceAdminController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('admin'))

router.get('/', listAgencesAdminController)
router.post('/', createAgenceAdminController)
router.put('/:id', updateAgenceAdminController)
router.delete('/:id', deleteAgenceAdminController)

export default router
