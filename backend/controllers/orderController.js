import Order from '../models/Order.js'

export const createOrder = async (req, res) => {
    try {
        const { title, description, budget } = req.body
        const order = await Order.create({ title, description, budget, student: req.user.id })
        res.status(201).json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getOrders = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ message: 'Order not found' })
        if (order.status !== 'open') return res.status(400).json({ message: 'Order already taken' })

        order.provider = req.user.id
        order.status = 'active'
        await order.save()

        res.json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ message: 'Order not found' })
        if (order.status !== 'open') return res.status(400).json({ message: 'Order already taken' })

        order.provider = req.user.id
        order.status = 'active'
        await order.save()

        res.json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const updateProgress = async (req, res) => {
    try {
        const { progress } = req.body
        const order = await Order.findById(req.params.id)

        if (!order) return res.status(404).json({ message: 'Order not found' })
        if (order.provider.toString() !== req.user.id) return res.status(403).json({ message: 'Not your order' })

        order.progress = progress
        if (progress === 100) order.status = 'completed'
        await order.save()

        res.json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}