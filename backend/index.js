import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import http from 'http'
import Message from './models/Message.js'
import Post from './models/Post.js'

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

    socket.on('disconnect', () => {})

    socket.on('new_post', async ({ content, sender }) => {
      try {
        // 1. Save the post to the database
        const post = await Post.create({ author: sender, content })
        
        // 2. Fetch it and properly await the population of user details
        const populated = await Post.findById(post._id).populate('author', 'name role')
        
        // 3. Now it is a 100% complete object with name and role populated!
        io.emit('post_created', populated) 
      } catch (err) {
        console.error("Error creating post via socket:", err.message)
        socket.emit('post_error', { message: 'Failed to create post' })
      }
    })
})

io.on('connection', (socket) => {
  socket.on('join_order', async (orderId) => {
    socket.join(orderId)

    // Load chat history from DB
    const messages = await Message.find({ orderId }).sort({ createdAt: 1 })
    socket.emit('chat_history', messages)
  })

  socket.on('progress_update', ({ orderId, progress }) => {
    io.to(orderId).emit('progress_changed', { progress })
  })

  socket.on('send_message', async ({ orderId, sender, text }) => {
    // Save to DB
    const message = await Message.create({ orderId, sender, text })
    io.to(orderId).emit('receive_message', message)
  })

  socket.on('disconnect', () => {})

  socket.on('new_post', async ({ content, sender }) => {
    const post = await Post.create({ author: sender, content })
    const populated = post.populate('author', 'name role')
    io.emit('post_created', populated) // broadcast to everyone
  })
}) 



app.use('/api/auth', authRouter)
app.use('/api/orders', orderRouter(io))
app.use('/api/posts', postRouter)

mongoose.connect(process.env.DB_URI)
    .then(() => server.listen(5000, () => console.log('Server running on port 5000')))
    .catch(err => console.log(err))