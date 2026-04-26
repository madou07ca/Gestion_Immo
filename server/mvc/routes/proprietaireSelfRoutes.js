import { Router } from 'express'
import { getProprietaireMeController } from '../controllers/proprietaireSelfController.js'

const router = Router()

router.get('/me', getProprietaireMeController)

export default router

