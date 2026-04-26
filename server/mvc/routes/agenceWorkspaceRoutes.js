import { Router } from 'express'
import {
  getAgenceWorkspaceController,
  createAgenceProprietaireController,
  updateAgenceProprietaireController,
  deleteAgenceProprietaireController,
  createAgenceLocataireController,
  updateAgenceLocataireController,
  deleteAgenceLocataireController,
  createAgenceGestionnaireController,
  updateAgenceGestionnaireController,
  deleteAgenceGestionnaireController,
  createAgenceBienController,
  updateAgenceBienController,
  deleteAgenceBienController,
} from '../controllers/agenceWorkspaceController.js'
import { requireAuth, requireRoles } from '../middlewares/authMiddleware.js'
import { requireAgencePermission } from '../middlewares/agenceAccessMiddleware.js'

const router = Router()
router.use(requireAuth)
router.use(requireRoles(['agence', 'gestionnaire']))

router.get('/workspace', requireAgencePermission('workspace', 'read'), getAgenceWorkspaceController)

router.post('/proprietaires', requireAgencePermission('proprietaires', 'create'), createAgenceProprietaireController)
router.put('/proprietaires/:id', requireAgencePermission('proprietaires', 'update'), updateAgenceProprietaireController)
router.delete('/proprietaires/:id', requireAgencePermission('proprietaires', 'delete'), deleteAgenceProprietaireController)

router.post('/locataires', requireAgencePermission('locataires', 'create'), createAgenceLocataireController)
router.put('/locataires/:id', requireAgencePermission('locataires', 'update'), updateAgenceLocataireController)
router.delete('/locataires/:id', requireAgencePermission('locataires', 'delete'), deleteAgenceLocataireController)

router.post('/gestionnaires', requireAgencePermission('gestionnaires', 'create'), createAgenceGestionnaireController)
router.put('/gestionnaires/:id', requireAgencePermission('gestionnaires', 'update'), updateAgenceGestionnaireController)
router.delete('/gestionnaires/:id', requireAgencePermission('gestionnaires', 'delete'), deleteAgenceGestionnaireController)

router.post('/biens', requireAgencePermission('biens', 'create'), createAgenceBienController)
router.put('/biens/:id', requireAgencePermission('biens', 'update'), updateAgenceBienController)
router.delete('/biens/:id', requireAgencePermission('biens', 'delete'), deleteAgenceBienController)

export default router
