import { Router } from 'express'
import {
  listProprietairesController,
  createProprietaireController,
  updateProprietaireController,
  deleteProprietaireController,
} from '../controllers/proprietaireController.js'

const router = Router()

router.get('/', listProprietairesController)
router.post('/', createProprietaireController)
router.put('/:id', updateProprietaireController)
router.delete('/:id', deleteProprietaireController)

export default router

