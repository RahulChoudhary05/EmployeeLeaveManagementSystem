<script setup>
import { onMounted, ref, computed } from 'vue'
import { useLeaveStore } from '../stores/leave'
import { format } from 'date-fns'
import { Calendar, Clock, CheckCircle, XCircle, Plus, CalendarDays, Loader2, Play, X } from 'lucide-vue-next'

const leaveStore = useLeaveStore()

const showApplyModal = ref(false)
const form = ref({
  leaveType: 'Sick Leave',
  startDate: '',
  endDate: '',
  reason: ''
})

const applyError = ref('')

onMounted(async () => {
  await Promise.all([
    leaveStore.fetchMyLeaves(),
    leaveStore.fetchStats()
  ])
})

const leavesList = computed(() => leaveStore.leaves || [])

const handleApplyError = (err) => {
  applyError.value = err.message
}

const submitLeave = async () => {
  try {
    applyError.value = ''
    await leaveStore.applyLeave(form.value)
    showApplyModal.value = false
    form.value = { leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '' }
  } catch (err) {
    handleApplyError(err)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending': return Clock
    case 'Approved': return CheckCircle
    case 'Rejected': return XCircle
    default: return Calendar
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'text-amber-500 bg-amber-50'
    case 'Approved': return 'text-emerald-500 bg-emerald-50'
    case 'Rejected': return 'text-rose-500 bg-rose-50'
    default: return 'text-surface-500 bg-surface-50'
  }
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    
    <!-- Header banner -->
    <div class="card-container bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full"></div>
      <div class="relative z-10 text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-bold mb-1">My Leave Dashboard</h1>
        <p class="text-primary-100 text-sm md:text-base opacity-90">Manage your time off requests and view statuses</p>
      </div>
      <button @click="showApplyModal = true" class="relative z-10 bg-white text-primary-700 hover:bg-primary-50 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-black/10 flex items-center gap-2 group">
        <Plus class="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
        Apply Leave
      </button>
    </div>

    <!-- Stats Grid -->
    <div v-if="leaveStore.stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card-container p-5 flex flex-col justify-center gap-1 group relative overflow-hidden">
        <div class="absolute right-0 top-0 h-full w-2 bg-surface-200 group-hover:bg-primary-500 transition-colors"></div>
        <p class="text-surface-500 text-sm font-medium">Total Applied</p>
        <p class="text-3xl font-bold text-surface-900">{{ leaveStore.stats.Total?.count || 0 }}</p>
      </div>
      
      <div class="card-container p-5 flex flex-col justify-center gap-1 group relative overflow-hidden">
        <div class="absolute right-0 top-0 h-full w-2 bg-emerald-200 group-hover:bg-emerald-500 transition-colors"></div>
        <div class="flex items-center gap-2 mb-1">
          <CheckCircle class="w-5 h-5 text-emerald-500" />
          <p class="text-surface-500 text-sm font-medium">Approved</p>
        </div>
        <p class="text-3xl font-bold text-surface-900">{{ leaveStore.stats.Approved?.count || 0 }}</p>
      </div>

      <div class="card-container p-5 flex flex-col justify-center gap-1 group relative overflow-hidden">
        <div class="absolute right-0 top-0 h-full w-2 bg-amber-200 group-hover:bg-amber-500 transition-colors"></div>
        <div class="flex items-center gap-2 mb-1">
          <Clock class="w-5 h-5 text-amber-500" />
          <p class="text-surface-500 text-sm font-medium">Pending</p>
        </div>
        <p class="text-3xl font-bold text-surface-900">{{ leaveStore.stats.Pending?.count || 0 }}</p>
      </div>

      <div class="card-container p-5 flex flex-col justify-center gap-1 group relative overflow-hidden">
        <div class="absolute right-0 top-0 h-full w-2 bg-rose-200 group-hover:bg-rose-500 transition-colors"></div>
        <div class="flex items-center gap-2 mb-1">
          <XCircle class="w-5 h-5 text-rose-500" />
          <p class="text-surface-500 text-sm font-medium">Rejected</p>
        </div>
        <p class="text-3xl font-bold text-surface-900">{{ leaveStore.stats.Rejected?.count || 0 }}</p>
      </div>
    </div>

    <!-- Leave History Table Card -->
    <div class="card-container flex flex-col">
      <div class="p-6 border-b border-surface-100 flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-surface-900">Recent Applications</h2>
          <p class="text-sm text-surface-500">Your latest leave requests and their statuses.</p>
        </div>
      </div>
      
      <div class="overflow-x-auto relative">
        <!-- Loader -->
        <div v-if="leaveStore.loading && leavesList.length === 0" class="flex flex-col items-center justify-center p-12 text-surface-400">
             <Loader2 class="h-8 w-8 animate-spin mb-4 text-primary-500" />
             <p>Loading your leaves...</p>
        </div>

        <table v-else-if="leavesList.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-50 text-surface-500 text-sm border-b border-surface-200">
              <th class="py-4 px-6 font-medium">Type & Duration</th>
              <th class="py-4 px-6 font-medium">Dates</th>
              <th class="py-4 px-6 font-medium">Reason</th>
              <th class="py-4 px-6 font-medium">Applied On</th>
              <th class="py-4 px-6 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="leave in leavesList" :key="leave._id" class="hover:bg-surface-50/50 transition-colors group">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                    <CalendarDays class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-semibold text-surface-900 text-sm">{{ leave.leaveType }}</p>
                    <p class="text-xs text-surface-500">{{ leave.totalDays }} day(s)</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 whitespace-nowrap">
                <p class="text-sm font-medium text-surface-800">{{ formatDate(leave.startDate) }}</p>
                <p class="text-xs text-surface-500 flex items-center gap-1 mt-0.5"><Play class="w-3 h-3 text-surface-300" /> {{ formatDate(leave.endDate) }}</p>
              </td>
              <td class="py-4 px-6 max-w-[200px]">
                <p class="text-sm text-surface-600 truncate">{{ leave.reason }}</p>
              </td>
              <td class="py-4 px-6 whitespace-nowrap text-sm text-surface-500">
                {{ formatDate(leave.createdAt) }}
              </td>
              <td class="py-4 px-6 text-right">
                <span class="inline-flex items-center gap-1.5 badge" :class="'badge-' + leave.status.toLowerCase()">
                  <component :is="getStatusIcon(leave.status)" class="w-3.5 h-3.5" />
                  {{ leave.status }}
                </span>
                <p v-if="leave.reviewNote" class="text-xs text-surface-400 mt-1 truncate max-w-[120px] ml-auto" title="Note">Ref: {{ leave.reviewNote }}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
          <div class="bg-surface-100 p-4 rounded-full mb-4">
            <Calendar class="h-8 w-8 text-surface-400" />
          </div>
          <h3 class="text-lg font-bold text-surface-900 mb-1">No leave requests yet</h3>
          <p class="text-surface-500 text-sm max-w-sm mb-6">Looks like you haven't applied for any leaves. Click the button above when you need some time off.</p>
        </div>
      </div>
    </div>

    <!-- Apply Leave Modal -->
    <div v-if="showApplyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up" @click.stop>
        <div class="px-6 py-4 border-b border-surface-100 flex justify-between items-center bg-surface-50">
          <h2 class="text-lg font-bold text-surface-900 flex items-center gap-2"><Plus class="w-5 h-5 text-primary-500" /> Apply for Leave</h2>
          <button @click="showApplyModal = false" class="text-surface-400 hover:text-surface-700 transition">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="submitLeave" class="p-6 space-y-4">
          <div v-if="applyError" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-md text-sm">
            {{ applyError }}
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Leave Type</label>
            <select v-model="form.leaveType" required class="input-field appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1em_1em] bg-[right_1rem_center]">
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Earned Leave</option>
              <option>Emergency Leave</option>
              <option>Unpaid Leave</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Start Date</label>
              <input v-model="form.startDate" type="date" required class="input-field" :min="new Date().toISOString().split('T')[0]" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">End Date</label>
              <input v-model="form.endDate" type="date" required class="input-field" :min="form.startDate || new Date().toISOString().split('T')[0]" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Reason</label>
            <textarea v-model="form.reason" required rows="3" minlength="10" placeholder="Please provide details for your leave request..." class="input-field resize-none"></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button type="button" @click="showApplyModal = false" class="btn-secondary transition-colors">Cancel</button>
            <button type="submit" :disabled="leaveStore.loading" class="btn-primary flex items-center justify-center min-w-[120px]">
              <Loader2 v-if="leaveStore.loading" class="h-4 w-4 animate-spin" />
              <span v-else>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
  </div>
</template>
