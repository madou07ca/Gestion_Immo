import { Router } from 'express'
import {
  getLocataireMeController,
  createLocataireDemandeController,
  reglerPaiementsLocataireController,
} from '../controllers/tenantSelfController.js'

const router = Router()

router.get('/', getLocataireMeController)
router.post('/demandes', createLocataireDemandeController)
router.post('/paiements/regler', reglerPaiementsLocataireController)

export default router

