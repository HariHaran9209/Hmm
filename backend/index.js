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

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

// ✓ FIX: Merged into a single 'connection' block to keep event handling predictable
io.on('connection', (socket) => {
    
    // --- ORDER & CHAT EVENTS ---
    socket.on('join_order', async (orderId) => {
        socket.join(orderId)
        console.log(`Socket ${socket.id} joined order ${orderId}`)

        // Load chat history from DB
        try {
            const messages = await Message.find({ orderId }).sort({ createdAt: 1 })
            socket.emit('chat_history', messages)
        } catch (err) {
            console.error('Error fetching chat history:', err)
        }
    })

    socket.on('progress_update', ({ orderId, progress }) => {
        io.to(orderId).emit('progress_changed', { progress })
    })

    socket.on('send_message', async ({ orderId, sender, text }) => {
        try {
            const message = await Message.create({ orderId, sender, text })
            io.to(orderId).emit('receive_message', message)
        } catch (err) {
            console.error('Error saving message:', err)
        }
    })

    // --- COMMUNITY POST & COMMENT EVENTS ---
    socket.on('new_post', async ({ content, sender }) => {
        try {
            const post = await Post.create({ author: sender, content })
            const populated = await post.populate('author', 'name role')
            io.emit('post_created', populated)
        } catch (err) {
            console.error('Error creating post:', err)
        }
    })

    // ✓ FIX: Added the missing comment listener
    socket.on('new_comment', async ({ postId, authorId, text }) => {
        try {
            // Find the post and push the comment into the subdocument array
            const post = await Post.findById(postId)
            if (!post) return;

            post.comments.push({
                author: authorId,
                text: text
            })

            await post.save()

            // Crucial: Populate BOTH the post author AND the comment author
            // so the frontend receives the full name and profile details
            const populatedPost = await Post.findById(postId)
                .populate('author', 'name role')
                .populate('comments.author', 'name role')

            // Emit the fully updated post out to everyone
            io.emit('comment_added', populatedPost)
        } catch (err) {
            console.error('Error adding comment:', err)
        }
    })

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`)
    })
}) 

// Routes
app.use('/api/auth', authRouter)
app.use('/api/orders', orderRouter(io))
app.use('/api/posts', postRouter)

// Database Connection
mongoose.connect(process.env.DB_URI)
    .then(() => server.listen(5000, () => console.log('Server running on port 5000')))
    .catch(err => console.log(err))