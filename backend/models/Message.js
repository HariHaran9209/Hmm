import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)