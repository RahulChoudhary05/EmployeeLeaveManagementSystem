import { defineStore } from 'pinia'
import api from '../api/axios'

const getStoredUser = () => {
  const rawUser = localStorage.getItem('user')
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser)
  } catch (error) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}

const storedUser = getStoredUser()
const storedToken = localStorage.getItem('token') || null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: storedUser,
    token: storedUser ? storedToken : null,
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isEmployer: (state) => state.user?.role === 'employer',
    isEmployee: (state) => state.user?.role === 'employee',
  },

  actions: {
    async initializeAuth() {
      if (!this.token || !this.user) {
        this.logout()
        return
      }

      try {
        const response = await api.get('/auth/me')
        const user = response.data?.data?.user

        if (!user) {
          this.logout()
          return
        }

        this.user = {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department || ''
        }
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (err) {
        this.logout()
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/login', credentials)
        const { token, user } = response.data.data
        
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return user
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/register', Object.assign({}, userData, { role: userData.role || 'employee' }))
        const { token, user } = response.data.data
        
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return user
      } catch (err) {
        this.error = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },

    clearError() {
      this.error = null
    }
  }
})
