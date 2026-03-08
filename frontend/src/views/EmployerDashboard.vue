<script setup>
import { onMounted, ref, computed } from 'vue'
import { useLeaveStore } from '../stores/leave'
import { format } from 'date-fns'
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  X,
  FileText,
  Calendar,
  Building2,
  TrendingUp
} from 'lucide-vue-next'

const leaveStore = useLeaveStore()

const currentFilter = ref('All')
const searchQuery = ref('')
const showReviewModal = ref(false)
const selectedLeave = ref(null)
const reviewAction = ref('')
const reviewNote = ref('')
const reviewError = ref('')

onMounted(async () => {
  await Promise.all([leaveStore.fetchAllLeaves(), leaveStore.fetchStats()])
})

const totalCount = computed(() => leaveStore.stats?.Total?.count || 0)
const pendingCount = computed(() => leaveStore.stats?.Pending?.count || 0)
const approvedCount = computed(() => leaveStore.stats?.Approved?.count || 0)
const rejectedCount = computed(() => leaveStore.stats?.Rejected?.count || 0)

const pct = (count) => {
  if (!totalCount.value) return 0
  return Math.round((count / totalCount.value) * 100)
}

const filteredLeaves = computed(() => {
  let list = leaveStore.leaves || []

  if (currentFilter.value !== 'All') {
    list = list.filter((leave) => leave.status === currentFilter.value)
  }

  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    list = list.filter(
      (leave) =>
        leave.employee?.name?.toLowerCase().includes(search) ||
        leave.employee?.department?.toLowerCase().includes(search) ||
        leave.leaveType?.toLowerCase().includes(search)
    )
  }

  return list
})

const circumference = 440
const approvedDash = computed(() => `${(approvedCount.value / (totalCount.value || 1)) * circumference} ${circumference}`)
const pendingDash = computed(() => `${(pendingCount.value / (totalCount.value || 1)) * circumference} ${circumference}`)
const rejectedDash = computed(() => `${(rejectedCount.value / (totalCount.value || 1)) * circumference} ${circumference}`)
const pendingOffset = computed(() => `${-(approvedCount.value / (totalCount.value || 1)) * circumference}`)
const rejectedOffset = computed(
  () => `${-((approvedCount.value + pendingCount.value) / (totalCount.value || 1)) * circumference}`
)

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

const closeReview = () => {
  showReviewModal.value = false
  selectedLeave.value = null
  reviewAction.value = ''
  reviewNote.value = ''
  reviewError.value = ''
}

const submitReview = async () => {
  if (!selectedLeave.value || !reviewAction.value) return

  try {
    reviewError.value = ''
    await leaveStore.reviewLeave(selectedLeave.value._id, reviewAction.value, reviewNote.value)
    closeReview()
  } catch (err) {
    reviewError.value = err.message
  }
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="card-container bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white p-6 md:p-8 relative overflow-hidden">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full"></div>
      <div class="absolute -left-10 -bottom-10 w-48 h-48 bg-cyan-300 opacity-10 blur-3xl rounded-full"></div>
      <div class="relative z-10 flex items-center gap-3">
        <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
          <Building2 class="w-7 h-7" />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold">Employer Dashboard</h1>
          <p class="text-blue-100 text-sm md:text-base opacity-90 mt-1">Review and manage employee leave requests</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card-container bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-blue-100 font-semibold text-sm uppercase tracking-wider">Total Requests</h3>
            <FileText class="w-6 h-6 text-blue-200" />
          </div>
          <p class="text-5xl font-bold mb-1">{{ totalCount }}</p>
          <p class="text-blue-100 text-sm">All applications</p>
        </div>
      </div>

      <div class="card-container bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-amber-100 font-semibold text-sm uppercase tracking-wider">Pending Review</h3>
            <Clock class="w-6 h-6 text-amber-200" />
          </div>
          <p class="text-5xl font-bold mb-1">{{ pendingCount }}</p>
          <p class="text-amber-100 text-sm">Needs action</p>
        </div>
      </div>

      <div class="card-container bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-emerald-100 font-semibold text-sm uppercase tracking-wider">Approved</h3>
            <CheckCircle class="w-6 h-6 text-emerald-200" />
          </div>
          <p class="text-5xl font-bold mb-1">{{ approvedCount }}</p>
          <p class="text-emerald-100 text-sm">Granted leaves</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-container p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-surface-900">Leave Status Overview</h3>
            <p class="text-sm text-surface-500 mt-1">Status split by percentage</p>
          </div>
          <TrendingUp class="w-5 h-5 text-indigo-500" />
        </div>

        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-semibold text-surface-700">Pending</span>
              <span class="text-sm font-bold text-amber-600">{{ pendingCount }} ({{ pct(pendingCount) }}%)</span>
            </div>
            <div class="h-3 bg-surface-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" :style="{ width: `${pct(pendingCount)}%` }"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-semibold text-surface-700">Approved</span>
              <span class="text-sm font-bold text-emerald-600">{{ approvedCount }} ({{ pct(approvedCount) }}%)</span>
            </div>
            <div class="h-3 bg-surface-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700" :style="{ width: `${pct(approvedCount)}%` }"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-semibold text-surface-700">Rejected</span>
              <span class="text-sm font-bold text-rose-600">{{ rejectedCount }} ({{ pct(rejectedCount) }}%)</span>
            </div>
            <div class="h-3 bg-surface-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-700" :style="{ width: `${pct(rejectedCount)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-container p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-surface-900">Leave Distribution</h3>
            <p class="text-sm text-surface-500 mt-1">Visual status distribution</p>
          </div>
          <FileText class="w-5 h-5 text-indigo-500" />
        </div>

        <div class="flex items-center justify-center gap-8">
          <div class="relative">
            <svg width="180" height="180" viewBox="0 0 180 180" class="transform -rotate-90">
              <circle cx="90" cy="90" r="70" fill="none" stroke="#f1f5f9" stroke-width="24"></circle>
              <circle cx="90" cy="90" r="70" fill="none" stroke="#10b981" stroke-width="24" :stroke-dasharray="approvedDash" stroke-dashoffset="0" class="transition-all duration-700"></circle>
              <circle cx="90" cy="90" r="70" fill="none" stroke="#f59e0b" stroke-width="24" :stroke-dasharray="pendingDash" :stroke-dashoffset="pendingOffset" class="transition-all duration-700"></circle>
              <circle cx="90" cy="90" r="70" fill="none" stroke="#ef4444" stroke-width="24" :stroke-dasharray="rejectedDash" :stroke-dashoffset="rejectedOffset" class="transition-all duration-700"></circle>
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-3xl font-bold text-surface-900">{{ totalCount }}</p>
              <p class="text-xs text-surface-500 font-semibold uppercase">Total</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-emerald-500"></div><span class="text-sm text-surface-700 font-medium">Approved</span></div>
            <div class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-amber-500"></div><span class="text-sm text-surface-700 font-medium">Pending</span></div>
            <div class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-rose-500"></div><span class="text-sm text-surface-700 font-medium">Rejected</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-container flex flex-col shadow-xl min-h-[550px]">
      <div class="p-6 border-b border-surface-100 bg-gradient-to-r from-surface-50 to-white">
        <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 class="text-xl font-bold text-surface-900">Employee Leave Requests</h2>
            <p class="text-sm text-surface-500 mt-1">Search, filter and review leave applications</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input v-model="searchQuery" type="text" placeholder="Search by name or department" class="input-field pl-10 py-2.5 text-sm md:w-72 border-surface-300" />
            </div>

            <select v-model="currentFilter" class="input-field py-2.5 text-sm border-surface-300 cursor-pointer">
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto relative flex-1">
        <div v-if="leaveStore.loading && filteredLeaves.length === 0" class="flex flex-col items-center justify-center p-20 text-surface-400">
          <Loader2 class="h-10 w-10 animate-spin mb-4 text-indigo-500" />
          <p class="font-medium">Loading leave requests...</p>
        </div>

        <table v-else-if="filteredLeaves.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-50 text-surface-600 text-xs uppercase tracking-wider border-b-2 border-surface-200">
              <th class="py-4 px-6 font-bold">Employee</th>
              <th class="py-4 px-6 font-bold">Type</th>
              <th class="py-4 px-6 font-bold">Duration</th>
              <th class="py-4 px-6 font-bold">Dates</th>
              <th class="py-4 px-6 font-bold">Status</th>
              <th class="py-4 px-6 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="leave in filteredLeaves" :key="leave._id" class="hover:bg-surface-50 transition-colors">
              <td class="py-4 px-6">
                <p class="font-semibold text-surface-900">{{ leave.employee?.name || 'Unknown' }}</p>
                <p class="text-xs text-surface-500">{{ leave.employee?.department || 'No Department' }}</p>
              </td>
              <td class="py-4 px-6 text-sm font-medium text-surface-800">{{ leave.leaveType }}</td>
              <td class="py-4 px-6 text-sm text-surface-700">{{ leave.totalDays }} day{{ leave.totalDays !== 1 ? 's' : '' }}</td>
              <td class="py-4 px-6 text-sm text-surface-700">{{ formatDate(leave.startDate) }} - {{ formatDate(leave.endDate) }}</td>
              <td class="py-4 px-6">
                <span class="badge whitespace-nowrap" :class="`badge-${leave.status.toLowerCase()}`">{{ leave.status }}</span>
              </td>
              <td class="py-4 px-6">
                <div v-if="leave.status === 'Pending'" class="flex items-center justify-center gap-2">
                  <button @click="openReview(leave, 'Approved')" class="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" title="Approve">
                    <ThumbsUp class="w-4 h-4" />
                  </button>
                  <button @click="openReview(leave, 'Rejected')" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200" title="Reject">
                    <ThumbsDown class="w-4 h-4" />
                  </button>
                </div>
                <button v-else @click="openReview(leave, '')" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div class="bg-surface-100 p-6 rounded-full mb-4 ring-8 ring-surface-50">
            <Calendar class="h-12 w-12 text-surface-400" />
          </div>
          <h3 class="text-xl font-bold text-surface-900 mb-2">No leave requests found</h3>
          <p class="text-surface-500 max-w-sm">Try changing the filter or search keyword.</p>
        </div>
      </div>
    </div>

    <div v-if="showReviewModal && selectedLeave" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-md">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border-2 border-surface-200">
        <div class="px-6 py-5 border-b border-surface-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-surface-900">{{ reviewAction || 'Leave Request Details' }}</h2>
          <button @click="closeReview" class="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="submitReview" class="p-6 space-y-5">
          <div class="bg-surface-50 rounded-xl p-4 border border-surface-200">
            <p class="font-semibold text-surface-900">{{ selectedLeave.employee?.name }}</p>
            <p class="text-sm text-surface-600">{{ selectedLeave.employee?.department || 'No Department' }}</p>
            <p class="text-sm text-surface-700 mt-2">{{ selectedLeave.leaveType }} • {{ selectedLeave.totalDays }} day{{ selectedLeave.totalDays !== 1 ? 's' : '' }}</p>
            <p class="text-sm text-surface-600">{{ formatDate(selectedLeave.startDate) }} - {{ formatDate(selectedLeave.endDate) }}</p>
          </div>

          <div class="bg-surface-50 rounded-lg p-4 border border-surface-200">
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Reason</p>
            <p class="text-surface-700">{{ selectedLeave.reason }}</p>
          </div>

          <div v-if="reviewError" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm flex items-center gap-2">
            <XCircle class="w-4 h-4" />
            <span>{{ reviewError }}</span>
          </div>

          <div v-if="selectedLeave.status === 'Pending' && reviewAction">
            <label class="block text-sm font-semibold text-surface-700 mb-2">Manager Note (Optional)</label>
            <textarea v-model="reviewNote" rows="3" class="input-field resize-none text-sm" placeholder="Add feedback"></textarea>
          </div>

          <div class="pt-2 flex gap-3">
            <button v-if="selectedLeave.status === 'Pending' && !reviewAction" type="button" @click="reviewAction = 'Rejected'" class="flex-1 btn-secondary py-3 text-rose-600 border-rose-200">
              <ThumbsDown class="w-4 h-4" />
              Reject
            </button>

            <button v-if="selectedLeave.status === 'Pending' && !reviewAction" type="button" @click="reviewAction = 'Approved'" class="flex-1 btn-primary py-3">
              <ThumbsUp class="w-4 h-4" />
              Approve
            </button>

            <button v-if="reviewAction" type="submit" :disabled="leaveStore.loading" class="flex-1 btn-primary py-3">
              <Loader2 v-if="leaveStore.loading" class="w-4 h-4 animate-spin" />
              <template v-else>Confirm {{ reviewAction }}</template>
            </button>

            <button type="button" @click="closeReview" :disabled="leaveStore.loading" class="px-4 py-3 rounded-lg font-semibold text-surface-600 hover:bg-surface-100 transition">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
