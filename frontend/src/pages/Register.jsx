import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post('/api/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Account created!')
      setTimeout(() => navigate('/dashboard'), 100)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-sm bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#f1f1f1]">Create account</h1>
          <p className="text-sm text-[#888888] mt-1">Join Zenora</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            placeholder="Full name"
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
          />
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
          <select
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
          >
            <option value="student">Student</option>
            <option value="provider">Provider</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-[#e63946] hover:bg-[#c1121f] text-white font-medium py-3 rounded-lg text-sm transition-colors"
        >
          Create account
        </button>

        <p className="text-center text-sm text-[#888888]">
          Have an account?{' '}
          <Link to="/login" className="text-[#e63946] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}