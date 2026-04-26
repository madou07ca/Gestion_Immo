import { Router } from 'express'
import {
  listAgencesAdminController,
  createAgenceAdminController,
  updateAgenceAdminController,
  deleteAgenceAdminController,
} from '../controllers/agenceAdminController.js'

const router = Router()

router.get('/', listAgencesAdminController)
router.post('/', createAgenceAdminController)
router.put('/:id', updateAgenceAdminController)
router.delete('/:id', deleteAgenceAdminController)

export default router
