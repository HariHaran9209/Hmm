import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Dashboard() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')))
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <p>Role: {user?.role}</p>
      <button onClick={() => navigate('/orders')}>Orders</button>
      <button onClick={() => navigate('/community')}>Community</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}