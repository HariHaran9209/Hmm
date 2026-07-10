import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post('/api/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Welcome back!')
      setTimeout(() => navigate('/dashboard'), 100)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-sm bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#f1f1f1]">Welcome back</h1>
          <p className="text-sm text-[#888888] mt-1">Sign in to Zenora</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-[#e63946] hover:bg-[#c1121f] text-white font-medium py-3 rounded-lg text-sm transition-colors"
        >
          Sign in
        </button>

        <p className="text-center text-sm text-[#888888]">
          No account?{' '}
          <Link to="/register" className="text-[#e63946] hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}