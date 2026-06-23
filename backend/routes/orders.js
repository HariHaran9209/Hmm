import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { createOrder, getOrders, acceptOrder, updateProgress } from '../controllers/orderController.js'

const router = express.Router()

router.post('/', authMiddleware, createOrder)
router.get('/', authMiddleware, getOrders)
router.put('/:id/accept', authMiddleware, acceptOrder)
router.put('/:id/progress', authMiddleware, updateProgress)

export default router