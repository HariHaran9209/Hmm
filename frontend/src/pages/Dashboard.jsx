import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    // If it's missing, null, or accidentally stored as the literal string "undefined"
    if (!savedUser || savedUser === "undefined") {
      return { id: '', name: '', role: '' };
    }
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      return { id: '', name: '', role: '' };
    }
  });
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-10">
        <div>
          <h1 className="text-3xl font-semibold text-[#f1f1f1]">Hey, {user?.name} 👋</h1>
          <p className="text-[#888888] mt-2 text-sm">What do you want to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-[#111111] border border-[#1f1f1f] hover:border-[#e63946] rounded-2xl p-6 text-left transition-colors group"
          >
            <p className="text-2xl mb-3">📋</p>
            <p className="text-[#f1f1f1] font-medium">Orders</p>
            <p className="text-[#888888] text-sm mt-1">
              {user?.role === 'student' ? 'Post tasks, track progress' : 'Browse and accept tasks'}
            </p>
          </button>

          <button
            onClick={() => navigate('/community')}
            className="bg-[#111111] border border-[#1f1f1f] hover:border-[#e63946] rounded-2xl p-6 text-left transition-colors group"
          >
            <p className="text-2xl mb-3">💬</p>
            <p className="text-[#f1f1f1] font-medium">Community</p>
            <p className="text-[#888888] text-sm mt-1">Share, discuss, connect</p>
          </button>
        </div>
      </div>
    </div>
  )
}