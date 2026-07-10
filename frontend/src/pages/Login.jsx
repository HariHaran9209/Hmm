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
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleSubmit}>Login</button>
      <Link to="/register">Don't have an account?</Link>
    </div>
  )
}