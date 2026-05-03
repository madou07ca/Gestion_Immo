import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  listProprietairesController,
  createProprietaireController,
  updateProprietaireController,
  deleteProprietaireController,
} from '../controllers/proprietaireController.js'

const router = Router()

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/', listProprietairesController)
router.post('/', createProprietaireController)
router.put('/:id', updateProprietaireController)
router.delete('/:id', deleteProprietaireController)

export default router

