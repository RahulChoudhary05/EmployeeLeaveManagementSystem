import { defineStore } from 'pinia'
import api from '../api/axios'

export const useLeaveStore = defineStore('leave', {
  state: () => ({
    leaves: [],
    stats: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMyLeaves() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/leaves/my')
        this.leaves = res.data.data.leaves
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch leaves'
      } finally {
        this.loading = false
      }
    },

    async fetchAllLeaves() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/leaves')
        this.leaves = res.data.data.leaves
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch leaves'
      } finally {
        this.loading = false
      }
    },

    async applyLeave(data) {
      this.loading = true
      try {
        await api.post('/leaves', data)
        await this.fetchMyLeaves()
        await this.fetchStats()
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to apply leave'
        throw new Error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    async reviewLeave(id, status, reviewNote = '') {
      this.loading = true
      try {
        await api.patch(`/leaves/${id}/review`, { status, reviewNote })
        await this.fetchAllLeaves()
        await this.fetchStats()
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to review leave')
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const res = await api.get('/leaves/stats')
        this.stats = res.data.data.stats
      } catch (err) {
        console.error('Failed to fetch stats')
      }
    }
  }
})
