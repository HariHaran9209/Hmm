import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['open', 'active', 'completed'], default: 'open' },
    progress: { type: Number, default: 0 }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

export default Order