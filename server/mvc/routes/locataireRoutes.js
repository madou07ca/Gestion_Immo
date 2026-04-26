import { Router } from 'express'
import {
  listLocatairesController,
  createLocataireController,
  updateLocataireController,
  deleteLocataireController,
} from '../controllers/locataireController.js'

const router = Router()

router.get('/', listLocatairesController)
router.post('/', createLocataireController)
router.put('/:id', updateLocataireController)
router.delete('/:id', deleteLocataireController)

export default router

