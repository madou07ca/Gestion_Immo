import { Router } from 'express'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { attachScopeAgenceId } from '../middlewares/backofficeScopeMiddleware.js'
import {
  createProspectInteretController,
  listProspectsInteretsController,
  updateProspectInteretController,
  convertProspectToLocataireController,
} from '../controllers/prospectController.js'

const router = Router()

router.post('/interets', createProspectInteretController)

router.use(requireAuth)
router.use(requireRoles(['admin', 'agence', 'gestionnaire']))
router.use(attachScopeAgenceId)

router.get('/interets', listProspectsInteretsController)
router.put('/interets/:id', updateProspectInteretController)
router.post('/interets/:id/convertir-locataire', convertProspectToLocataireController)

export default router

