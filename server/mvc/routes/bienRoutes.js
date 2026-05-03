import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  listBiensController,
  createBienController,
  updateBienController,
  deleteBienController,
} from '../controllers/bienController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/', listBiensController)
router.post('/', createBienController)
router.put('/:id', updateBienController)
router.delete('/:id', deleteBienController)

export default router

