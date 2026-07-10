import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Community from './pages/Community'
import PrivateRoute from './components/PrivateRoute'
import './api/axiosConfig'

function App() {
  return (
    <BrowserRouter>
      <Routes>
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