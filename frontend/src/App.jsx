import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' // ✓ Added Navigate
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Community from './pages/Community'
import PrivateRoute from './components/PrivateRoute'
import './api/axiosConfig'

function App() {
  // Check if a user token or object exists in localStorage
  const isAuthenticated = !!localStorage.getItem('user')

  return (
    <BrowserRouter>
      <Routes>
        {/* ✓ FIX: Handle the root URL. If logged in -> Dashboard, if not -> Login */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App