import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  listLocatairesController,
  createLocataireController,
  updateLocataireController,
  deleteLocataireController,
} from '../controllers/locataireController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/', listLocatairesController)
router.post('/', createLocataireController)
router.put('/:id', updateLocataireController)
router.delete('/:id', deleteLocataireController)

export default router

