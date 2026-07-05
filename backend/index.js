import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import http from 'http'

import authRouter from './routes/auth.js'
import orderRouter from './routes/orders.js'
import postRouter from './routes/posts.js'
import { timeStamp } from 'console'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id)

    socket.on('join_order', (orderId) => {
        socket.join(orderId)
        console.log(`Socket ${socket.id} joined order ${orderId}`)
    })

    socket.on('progress_update', ({ orderId, progress }) => {
        io.to(orderId).emit('progress_changed', { progress })
    })

    socket.on('send_message', ({ orderId, sender, text }) => {
        const message = { sender, text, timeStamp: new Date() }
        io.to(orderId).emit('receive_message', message)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id)
    })
})

app.use('/api/auth', authRouter)
app.use('/api/orders', orderRouter(io))
app.use('/api/posts', postrouter)

mongoose.connect(process.env.DB_URI)
    .then(() => server.listen(5000, () => console.log('Server running on port 5000')))
    .catch(err => console.log(err))