import axios from 'axios'

// Create a custom instance with the correct backend URL
const API = axios.create({
  baseURL: 'https://zenora-backend-8sxs.onrender.com' 
})

// Attach the interceptor to the custom API instance
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default API