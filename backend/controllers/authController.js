import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        const exists = await User.findOne({ email })
        if (exists) return res.status(400).json({ message: "Email already registered"} )
        
        const hashed = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashed, role })

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' } )

        res.status(201).json({ token, user: { id: user._id, name: user.name, roles: user.role } })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' })
        
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(400).json({ message: 'Invalid Credentials' })

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d'})

        res.json({ token, user: { id: user._id, name: user.name, role: user.role } })
    } catch (err) {
        res.status(500).json({ messages: err.message })
    }
}