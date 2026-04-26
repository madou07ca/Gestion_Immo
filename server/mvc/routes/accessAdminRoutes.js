import { Router } from 'express'
import {
  listAccessController,
  createAccessController,
  updateAccessController,
  deleteAccessController,
  resetAccessCodeController,
} from '../controllers/accessAdminController.js'

const router = Router()

router.get('/', listAccessController)
router.post('/', createAccessController)
router.put('/:id', updateAccessController)
router.delete('/:id', deleteAccessController)
router.post('/:id/reset-code', resetAccessCodeController)

export default router

