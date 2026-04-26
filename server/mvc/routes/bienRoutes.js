import { Router } from 'express'
import {
  listBiensController,
  createBienController,
  updateBienController,
  deleteBienController,
} from '../controllers/bienController.js'

const router = Router()

router.get('/', listBiensController)
router.post('/', createBienController)
router.put('/:id', updateBienController)
router.delete('/:id', deleteBienController)

export default router

