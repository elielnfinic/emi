import axios from 'axios'

// When VITE_API_URL is set (e.g. production) use it directly.
// Otherwise use a relative path — Vite's proxy forwards /api → localhost:3333,
// which means any device on the LAN only needs to reach port 5173.
const API_URL = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
