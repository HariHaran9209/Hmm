import { useEffect, useState } from 'react'
import axios from '../api/axiosConfig'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000')

export default function Orders() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || { role: '', name: '', id: '' })
  
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ title: '', description: '', budget: '' })
  const [activeOrder, setActiveOrder] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')

  // Runs once — persistent listeners
  // 1. Move real-time chat listeners here so they stay synced with the active room
  useEffect(() => {
    if (!activeOrder) return

    // Listen for new messages
    socket.on('receive_message', (message) => {
      // Crucial check: Only append the message if it belongs to the currently active chat tab!
      // (Ensure your backend includes 'orderId' when emitting 'send_message')
      if (message.orderId === activeOrder) {
        setMessages(prev => [...prev, message])
      }
    })

    socket.on('chat_history', (history) => {
      setMessages(history)
    })

    // Clean up listeners immediately whenever the user switches orders/rooms
    return () => {
      socket.off('receive_message')
      socket.off('chat_history')
    }
  }, [activeOrder]) // <-- Re-binds cleanly when activeOrder changes


  // 2. Keep global sync operations (like progress bar updating across lists) independent
  useEffect(() => {
    socket.on('progress_changed', ({ progress, orderId }) => {
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, progress } : o
      ))
    })

    return () => {
      socket.off('progress_changed')
    }
  }, [])

  // 3. Keep your data fetching logic
  useEffect(() => {
    fetchOrders()
  }, [activeOrder])


  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders')
      setOrders(data)
    } catch (err) {
      toast.error('Failed to fetch orders')
    }
  }

  const createOrder = async () => {
    try {
      await axios.post('/api/orders', form)
      toast.success('Order created!')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const acceptOrder = async (id) => {
    try {
      await axios.put(`/api/orders/${id}/accept`)
      toast.success('Order accepted!')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const updateProgress = async (id, progress) => {
    try {
      await axios.put(`/api/orders/${id}/progress`, { progress })
    } catch (err) {
      toast.error('Error updating progress')
    }
  }

  const joinOrder = (orderId) => {
    setActiveOrder(orderId)
    socket.emit('join_order', orderId)
    setMessages([])
  }

  const sendMessage = () => {
    if (!msgInput.trim()) return
    socket.emit('send_message', { orderId: activeOrder, sender: user.name, text: msgInput })
    setMsgInput('')
  }

  return (
    <div>
      {/* Create order — students only */}
      {user.role === 'student' && (
        <div>
          <h3>Post a Task</h3>
          <input placeholder="Title" onChange={e => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Budget" type="number" onChange={e => setForm({ ...form, budget: e.target.value })} />
          <button onClick={createOrder}>Post</button>
        </div>
      )}

      {/* Orders list */}
      <h3>Open Orders</h3>
      {orders.map(order => (
        <div key={order._id}>
          <h4>{order.title}</h4>
          <p>{order.description}</p>
          <p>Budget: ₹{order.budget}</p>
          <p>Progress: {order.progress}%</p>
          <p>Status: {order.status}</p>

          {user.role === 'provider' && order.status === 'open' && (
            <button onClick={() => acceptOrder(order._id)}>Accept</button>
          )}

          {user.role === 'provider' && order.status === 'active' && order.provider === user.id && (
            <div>
              <input type="range" min="0" max="100" defaultValue={order.progress}
                onChange={e => updateProgress(order._id, Number(e.target.value))} />
            </div>
          )}

          <button onClick={() => joinOrder(order._id)}>Open Chat</button>
        </div>
      ))}

      {/* Chat */}
      {activeOrder && (
        <div>
          <h3>Chat</h3>
          <div>
            {messages.map((m, i) => (
              <p key={i}><strong>{m.sender}:</strong> {m.text}</p>
            ))}
          </div>
          <input
            placeholder="Type a message"
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  )
}