import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createOrder, getOrders, acceptOrder, updateProgress } from '../controllers/orderController.js'

const router = Router()

export default (io) => {
  router.post('/', auth, createOrder)
  router.get('/', getOrders)
  router.put('/:id/accept', auth, acceptOrder)
  router.put('/:id/progress', auth, (req, res) => updateProgress(req, res, io))

  return router
}