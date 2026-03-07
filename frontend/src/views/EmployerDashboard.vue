<script setup>
import { onMounted, ref, computed } from 'vue'
import { useLeaveStore } from '../stores/leave'
import { format } from 'date-fns'
import { Search, Filter, CheckCircle, XCircle, Clock, CalendarDays, ThumbsUp, ThumbsDown, User as UserIcon, Loader2 } from 'lucide-vue-next'

const leaveStore = useLeaveStore()

const currentFilter = ref('All')
const searchQuery = ref('')
const selectedLeave = ref(null)
const showReviewModal = ref(false)
const reviewNote = ref('')
const reviewAction = ref('') // 'Approved' | 'Rejected'
const reviewError = ref('')

onMounted(async () => {
  await Promise.all([
    leaveStore.fetchAllLeaves(),
    leaveStore.fetchStats()
  ])
})

const leavesList = computed(() => {
  let list = leaveStore.leaves || []
  
  // Apply Status Filter
  if (currentFilter.value !== 'All') {
    list = list.filter(l => l.status === currentFilter.value)
  }

  // Apply Search
  if (searchQuery.value) {
    const s = searchQuery.value.toLowerCase()
    list = list.filter(l => 
      l.employee?.name?.toLowerCase().includes(s) || 
      l.employee?.department?.toLowerCase().includes(s)
    )
  }
  return list
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

const openReview = (leave, action) => {
  selectedLeave.value = leave
  reviewAction.value = action
  reviewNote.value = ''
  reviewError.value = ''
  showReviewModal.value = true
}

const submitReview = async () => {
  try {
    reviewError.value = ''
    await leaveStore.reviewLeave(selectedLeave.value._id, reviewAction.value, reviewNote.value)
    showReviewModal.value = false
    selectedLeave.value = null
  } catch (err) {
    reviewError.value = err.message
  }
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    
    <!-- Top Stats Region for Employers -->
    <div v-if="leaveStore.stats" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card-container bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 relative overflow-hidden">
        <div class="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full"></div>
        <h3 class="text-indigo-100 font-medium text-sm mb-1 uppercase tracking-wider">Total Requests</h3>
        <p class="text-4xl font-bold">{{ leaveStore.stats.Total?.count || 0 }}</p>
      </div>

      <div class="card-container bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 relative overflow-hidden">
        <div class="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full"></div>
        <h3 class="text-amber-100 font-medium text-sm mb-1 uppercase tracking-wider">Needs Attention</h3>
        <p class="text-4xl font-bold flex items-center gap-3">
          {{ leaveStore.stats.Pending?.count || 0 }}
          <span v-if="(leaveStore.stats.Pending?.count || 0) > 0" class="text-xs bg-white text-orange-600 px-2 py-1 rounded-full animate-pulse">Action required</span>
        </p>
      </div>

      <div class="card-container bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 relative overflow-hidden">
         <div class="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full"></div>
         <h3 class="text-emerald-100 font-medium text-sm mb-1 uppercase tracking-wider">Approved Leaves</h3>
         <p class="text-4xl font-bold">{{ leaveStore.stats.Approved?.count || 0 }}</p>
      </div>
    </div>

    <!-- Management Table Area -->
    <div class="card-container flex flex-col min-h-[500px]">
      
      <!-- Toolbar -->
      <div class="p-5 md:p-6 border-b border-surface-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white rounded-t-xl z-10 sticky top-0">
        <div>
          <h2 class="text-xl font-bold text-surface-900 tracking-tight">Team Leave Requests</h2>
          <p class="text-sm text-surface-500 mt-1">Review and manage employee time-off applications.</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <!-- Search -->
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search employee..." 
              class="input-field pl-9 h-10 py-1 text-sm md:w-64"
            />
          </div>
          
          <!-- Filter -->
          <div class="relative inline-block w-full sm:w-auto">
            <select v-model="currentFilter" class="input-field h-10 py-1 text-sm appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1em_1em] bg-[right_0.75rem_center] pr-10">
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Table content -->
      <div class="overflow-x-auto relative flex-1">
        
        <!-- Loading State -->
        <div v-if="leaveStore.loading && leavesList.length === 0" class="flex flex-col items-center justify-center p-16 text-surface-400">
             <Loader2 class="h-8 w-8 animate-spin mb-4 text-primary-500" />
             <p>Loading records...</p>
        </div>

        <table v-else-if="leavesList.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-50 text-surface-500 text-xs uppercase tracking-wider border-b border-surface-200">
              <th class="py-4 px-6 font-semibold">Employee</th>
              <th class="py-4 px-6 font-semibold">Leave Type</th>
              <th class="py-4 px-6 font-semibold">Duration (Days)</th>
              <th class="py-4 px-6 font-semibold">Dates</th>
              <th class="py-4 px-6 font-semibold">Reason</th>
              <th class="py-4 px-6 font-semibold">Status</th>
              <th class="py-4 px-6 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="leave in leavesList" :key="leave._id" class="hover:bg-surface-50/70 transition-colors group" :class="{'bg-rose-50/20': leave.status === 'Rejected', 'bg-emerald-50/20': leave.status === 'Approved'}">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 rounded-full bg-gradient-to-tr from-surface-200 to-surface-300 flex items-center justify-center text-surface-700 font-bold flex-shrink-0 text-sm border border-white shadow-sm">
                    {{ leave.employee?.name?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <div>
                    <p class="font-semibold text-surface-900 text-sm whitespace-nowrap">{{ leave.employee?.name || 'Unknown' }}</p>
                    <p class="text-xs text-surface-500 mt-0.5">{{ leave.employee?.department || 'Employee' }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="text-sm font-medium text-surface-800 bg-surface-100 px-2 py-1 rounded-md">{{ leave.leaveType }}</span>
              </td>
              <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-50 text-primary-700 font-bold text-sm border border-primary-100 shadow-sm">{{ leave.totalDays }}</span>
              </td>
              <td class="py-4 px-6 whitespace-nowrap">
                <p class="text-sm text-surface-800">{{ formatDate(leave.startDate) }}</p>
                <p class="text-xs text-surface-500 flex items-center gap-1 mt-0.5">to {{ formatDate(leave.endDate) }}</p>
              </td>
              <td class="py-4 px-6">
                <p class="text-sm text-surface-600 line-clamp-2 max-w-[200px]" :title="leave.reason">{{ leave.reason }}</p>
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center gap-1.5 badge whitespace-nowrap" :class="'badge-' + leave.status.toLowerCase()">
                  <!-- icon dynamically -->
                  <CheckCircle v-if="leave.status === 'Approved'" class="w-3.5 h-3.5" />
                  <Clock v-else-if="leave.status === 'Pending'" class="w-3.5 h-3.5" />
                  <XCircle v-else class="w-3.5 h-3.5" />
                  {{ leave.status }}
                </span>
                <p v-if="leave.reviewedBy" class="text-xs text-surface-400 mt-1 whitespace-nowrap">By: {{ leave.reviewedBy.name }}</p>
              </td>
              <td class="py-4 px-6 text-center">
                <div v-if="leave.status === 'Pending'" class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openReview(leave, 'Approved')" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-200" title="Approve">
                    <ThumbsUp class="w-4 h-4" />
                  </button>
                  <button @click="openReview(leave, 'Rejected')" class="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shadow-sm border border-rose-200" title="Reject">
                    <ThumbsDown class="w-4 h-4" />
                  </button>
                </div>
                <span v-else class="text-xs text-surface-400 font-medium tracking-wide">REVIEWED</span>
              </td>
            </tr>
          </tbody>
        </table>

         <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div class="bg-surface-100 p-5 rounded-full mb-4 ring-8 ring-surface-50">
            <CheckCircle class="h-10 w-10 text-surface-400" />
          </div>
          <h3 class="text-xl font-bold text-surface-900 mb-1">Queue is clear</h3>
          <p class="text-surface-500 mb-6">No matching leave requests found.</p>
        </div>
      </div>
    </div>

    <!-- Review Action Modal -->
    <div v-if="showReviewModal && selectedLeave" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-surface-200">
        
        <div class="px-6 py-5 border-b border-surface-100 flex justify-between items-center" :class="reviewAction === 'Approved' ? 'bg-emerald-50' : 'bg-rose-50'">
          <h2 class="text-lg font-bold flex items-center gap-2" :class="reviewAction === 'Approved' ? 'text-emerald-800' : 'text-rose-800'">
            <component :is="reviewAction === 'Approved' ? ThumbsUp : ThumbsDown" class="w-5 h-5" /> 
            {{ reviewAction === 'Approved' ? 'Approve Request' : 'Reject Request' }}
          </h2>
        </div>
        
        <form @submit.prevent="submitReview" class="p-6 space-y-5">
          <!-- Summary card -->
          <div class="bg-surface-50 rounded-lg p-4 border border-surface-200 text-sm">
            <p><span class="text-surface-500">Employee:</span> <span class="font-semibold text-surface-900 ml-1">{{ selectedLeave.employee?.name }}</span></p>
            <p class="mt-1"><span class="text-surface-500">Leave Type:</span> <span class="font-medium text-surface-900 ml-1">{{ selectedLeave.leaveType }}</span></p>
            <p class="mt-1"><span class="text-surface-500">Duration:</span> <span class="text-surface-900 ml-1">{{ selectedLeave.totalDays }} days ({{ formatDate(selectedLeave.startDate) }} - {{ formatDate(selectedLeave.endDate) }})</span></p>
            <p class="mt-2 text-surface-600 italic bg-white p-2 rounded border border-surface-100 block">"{{ selectedLeave.reason }}"</p>
          </div>

          <div v-if="reviewError" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-md text-sm">
            {{ reviewError }}
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Manager Note (Optional)</label>
            <textarea v-model="reviewNote" rows="2" placeholder="Leave a remark for the employee..." class="input-field resize-none text-sm"></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button type="button" @click="showReviewModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" :disabled="leaveStore.loading" class="flex items-center justify-center min-w-[120px] px-4 py-2 font-medium rounded-lg text-white shadow-sm transition duration-200 focus:ring-2 focus:ring-offset-2" :class="reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'">
              <Loader2 v-if="leaveStore.loading" class="h-4 w-4 animate-spin" />
              <span v-else>Confirm {{ reviewAction }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
  </div>
</template>
