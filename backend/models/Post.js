import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    comments: [
        {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true })

export default mongoose.model('Post', postSchema)