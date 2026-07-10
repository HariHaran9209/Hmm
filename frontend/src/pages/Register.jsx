import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
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
      <h2>Register</h2>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <select onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="student">Student</option>
        <option value="provider">Provider</option>
      </select>
      <button onClick={handleSubmit}>Register</button>
      <Link to="/login">Already have an account?</Link>
    </div>
  )
}