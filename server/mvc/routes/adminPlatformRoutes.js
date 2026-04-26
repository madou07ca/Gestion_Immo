import { Router } from 'express'
import { adminOverviewController, adminSearchController } from '../controllers/adminPlatformController.js'

const router = Router()

router.get('/overview', adminOverviewController)
router.get('/search', adminSearchController)

export default router
