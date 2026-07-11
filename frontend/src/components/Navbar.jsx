import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

// Ahmm wtf

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ name: 'User', role: 'Guest' })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Error parsing user from localStorage", e)
      }
    }
  }, []) // Runs once when Navbar mounts

  const logout = () => {
    localStorage.clear()
    setUser({ name: 'User', role: 'Guest' }) // Reset state immediately
    navigate('/login')
  }

  return (
    <nav className="border-b border-[#1f1f1f] bg-[#111111] px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="text-[#e63946] font-bold text-lg tracking-tight">Zenora</Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/orders" className="text-sm text-[#888888] hover:text-[#f1f1f1] transition-colors">Orders</Link>
          <Link to="/community" className="text-sm text-[#888888] hover:text-[#f1f1f1] transition-colors">Community</Link>
          <span className="text-sm text-[#f1f1f1]">{user?.name}</span>
          <span className="text-xs bg-[#1f1f1f] text-[#888888] px-2 py-1 rounded-full">{user?.role}</span>
          <button onClick={logout} className="text-sm text-[#888888] hover:text-[#e63946] transition-colors">Logout</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-[#888888] text-xl">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 pt-4 border-t border-[#1f1f1f] mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#f1f1f1]">{user?.name}</span>
            <span className="text-xs bg-[#1f1f1f] text-[#888888] px-2 py-1 rounded-full">{user?.role}</span>
          </div>
          <Link to="/orders" onClick={() => setOpen(false)} className="text-sm text-[#888888] hover:text-[#f1f1f1] transition-colors">Orders</Link>
          <Link to="/community" onClick={() => setOpen(false)} className="text-sm text-[#888888] hover:text-[#f1f1f1] transition-colors">Community</Link>
          <button onClick={logout} className="text-sm text-[#e63946] text-left">Logout</button> 
        </div>
      )}
    </nav>
  )
}