import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getCollection, addToCollection, removeFromCollection } from '../controllers/collection.controller'

const router = Router()

router.get('/', authenticate, getCollection)
router.post('/', authenticate, addToCollection)
router.delete('/:id', authenticate, removeFromCollection)

export default router