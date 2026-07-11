import axios from 'axios'

// Create a custom instance with the correct backend URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
})

// Attach the interceptor to the custom API instance
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default API
