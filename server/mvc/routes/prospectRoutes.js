import { Router } from 'express'
import {
  createProspectInteretController,
  listProspectsInteretsController,
  updateProspectInteretController,
  convertProspectToLocataireController,
} from '../controllers/prospectController.js'

const router = Router()

router.post('/interets', createProspectInteretController)
router.get('/interets', listProspectsInteretsController)
router.put('/interets/:id', updateProspectInteretController)
router.post('/interets/:id/convertir-locataire', convertProspectToLocataireController)

export default router

