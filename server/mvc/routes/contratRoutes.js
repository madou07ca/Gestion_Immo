import { Router } from 'express'
import {
  listContratsController,
  downloadContratController,
  signContratController,
  updateContratStatusController,
  deleteContratController,
} from '../controllers/contratController.js'

const router = Router()

router.get('/', listContratsController)
router.get('/:id/download', downloadContratController)
router.post('/signature', signContratController)
router.patch('/:id/status', updateContratStatusController)
router.delete('/:id', deleteContratController)

export default router

