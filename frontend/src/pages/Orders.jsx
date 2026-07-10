import { useEffect, useState } from 'react'
import axios from '../api/axiosConfig' //  RIGHT: Uses your token header configuration
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'

const socket = io('http://localhost:5000')

export default function Orders() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || { role: '', name: '', id: '' })
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ title: '', description: '', budget: '' })
  const [activeOrder, setActiveOrder] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')

  // 1. Fetch initial orders list on mount
  useEffect(() => {
    fetchOrders()
  }, [])

  // 2. Room-specific Chat Listeners (Cleans up and re-binds safely whenever activeOrder changes)
  useEffect(() => {
    if (!activeOrder) return

    socket.on('chat_history', (history) => {
      setMessages(history)
    })

    socket.on('receive_message', (message) => {
      // Prevent cross-chat leak: Only append if message belongs to current tab
      if (message.orderId === activeOrder._id) {
        setMessages(prev => [...prev, message])
      }
    })

    return () => {
      socket.off('chat_history')
      socket.off('receive_message')
    }
  }, [activeOrder]) 

  // 3. Global Real-time Progress Sync
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
      toast.success('Task posted!')
      setForm({ title: '', description: '', budget: '' })
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

  const joinOrder = (order) => {
    setActiveOrder(order)
    socket.emit('join_order', order._id)
    setMessages([])
  }

  const sendMessage = () => {
    if (!msgInput.trim() || !activeOrder) return
    socket.emit('send_message', { orderId: activeOrder._id, sender: user.name, text: msgInput })
    setMsgInput('')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* Left — orders list */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Create order */}
          {user.role === 'student' && (
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 flex flex-col gap-3">
              <h2 className="text-[#f1f1f1] font-semibold">Post a Task</h2>
              <input
                placeholder="Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
              />
              <textarea
                placeholder="Describe your task..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors resize-none"
              />
              <input
                placeholder="Budget (₹)"
                type="number"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
                className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
              />
              <button
                onClick={createOrder}
                className="bg-[#e63946] hover:bg-[#c1121f] text-white font-medium py-3 rounded-lg text-sm transition-colors"
              >
                Post Task
              </button>
            </div>
          )}

          {/* Orders */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[#f1f1f1] font-semibold">Open Orders</h2>
            {orders.length === 0 && (
              <p className="text-[#888888] text-sm">No orders yet.</p>
            )}
            {orders.map(order => (
              <div
                key={order._id}
                className={`bg-[#111111] border rounded-2xl p-5 flex flex-col gap-3 transition-colors ${activeOrder?._id === order._id ? 'border-[#e63946]' : 'border-[#1f1f1f]'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[#f1f1f1] font-medium">{order.title}</h3>
                    <p className="text-[#888888] text-sm mt-1">{order.description}</p>
                  </div>
                  <span className="text-sm text-[#e63946] font-semibold whitespace-nowrap ml-4">₹{order.budget}</span>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-[#888888]">
                    <span>Progress</span>
                    <span>{order.progress}%</span>
                  </div>
                  <div className="w-full bg-[#1f1f1f] rounded-full h-1.5">
                    <div
                      className="bg-[#e63946] h-1.5 rounded-full transition-all"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>

                {/* Progress slider for provider */}
                {user.role === 'provider' && order.status === 'active' && order.provider === user.id && (
                  <input
                    type="range" min="0" max="100"
                    defaultValue={order.progress}
                    onChange={e => updateProgress(order._id, Number(e.target.value))}
                    className="accent-[#e63946] w-full"
                  />
                )}

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'open' ? 'bg-[#1f1f1f] text-[#888888]' :
                    order.status === 'active' ? 'bg-[#e63946]/10 text-[#e63946]' :
                    'bg-green-900/20 text-green-400'
                  }`}>
                    {order.status}
                  </span>

                  {user.role === 'provider' && order.status === 'open' && (
                    <button
                      onClick={() => acceptOrder(order._id)}
                      className="text-xs bg-[#e63946] hover:bg-[#c1121f] text-white px-3 py-1 rounded-full transition-colors"
                    >
                      Accept
                    </button>
                  )}

                  <button
                    onClick={() => joinOrder(order)}
                    className="text-xs border border-[#1f1f1f] hover:border-[#e63946] text-[#888888] hover:text-[#f1f1f1] px-3 py-1 rounded-full transition-colors ml-auto"
                  >
                    {activeOrder?._id === order._id ? 'Chatting' : 'Open Chat'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — chat panel */}
        {activeOrder && (
          <div className="w-full lg:w-80 bg-[#111111] border border-[#1f1f1f] rounded-2xl flex flex-col lg:h-[calc(100vh-120px)] h-[500px] lg:sticky lg:top-6">
            <div className="p-4 border-b border-[#1f1f1f]">
              <p className="text-[#f1f1f1] font-medium text-sm">{activeOrder.title}</p>
              <p className="text-[#888888] text-xs mt-0.5">Order chat</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-[#3a3a3a] text-xs text-center mt-4">No messages yet</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.sender === user.name ? 'items-end' : 'items-start'}`}>
                  <span className="text-[#888888] text-xs mb-1">{m.sender}</span>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[90%] ${
                    m.sender === user.name
                      ? 'bg-[#e63946] text-white'
                      : 'bg-[#1f1f1f] text-[#f1f1f1]'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#1f1f1f] flex gap-2">
              <input
                placeholder="Message..."
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e63946] transition-colors"
              />
              <button
                onClick={sendMessage}
                className="bg-[#e63946] hover:bg-[#c1121f] text-white px-4 rounded-lg text-sm transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}