import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://employeeleavemanagementsystem-fp9j.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default apiClient
