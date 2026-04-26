import { Router } from 'express'
import { downloadQuittanceController, sendQuittanceEmailController } from '../controllers/quittanceController.js'

const router = Router()

router.get('/:id/download', downloadQuittanceController)
router.post('/:id/send-email', sendQuittanceEmailController)

export default router

