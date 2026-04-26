import { Router } from 'express'
import { listPublicBiensController } from '../controllers/publicController.js'

const router = Router()

router.get('/biens', listPublicBiensController)

export default router

