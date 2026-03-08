<script setup>
import { onMounted, ref, computed } from 'vue'
import { useLeaveStore } from '../stores/leave'
import { format } from 'date-fns'
import { 
  Search, CheckCircle, XCircle, Clock, CalendarDays, 
  ThumbsUp, ThumbsDown, User as UserIcon, Loader2, X, 
  FileText, Calendar, Building2, TrendingUp
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
  await Promise.all([
    leaveStore.fetchAllLeaves(),
    leaveStore.fetchStats()
  ])
})

const filteredLeaves = computed(() => {
  let list = leaveStore.leaves || []
  
  if (currentFilter.value !== 'All') {
    list = list.filter(l => l.status === currentFilter.value)
  }

  if (searchQuery.value) {
    const s = searchQuery.value.toLowerCase()
    list = list.filter(l => 
      l.employee?.name?.toLowerCase().includes(s) || 
      l.employee?.department?.toLowerCase().includes(s) ||
      l.leaveType?.toLowerCase().includes(s)
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
    
    <!-- Header Section -->
    <div class="card-container bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 md:p-8 relative overflow-hidden">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full"></div>
      <div class="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-400 opacity-10 blur-3xl rounded-full"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Building2 class="w-7 h-7" />
          </div>
              <!-- Visual Charts Section -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
                <!-- Leave Status Breakdown Chart -->
                <div class="card-container p-6">
                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <h3 class="text-lg font-bold text-surface-900">Leave Status Overview</h3>
                      <p class="text-sm text-surface-500 mt-1">Distribution of leave requests by status</p>
                    </div>
                    <TrendingUp class="w-5 h-5 text-indigo-500" />
                  </div>
        
                  <div class="space-y-4">
                    <!-- Pending Bar -->
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-semibold text-surface-700">Pending</span>
                        <span class="text-sm font-bold text-amber-600">{{ leaveStore.stats?.Pending?.count || 0 }}</span>
                      </div>
                      <div class="h-3 bg-surface-100 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                          :style="{ width: `${((leaveStore.stats?.Pending?.count || 0) / (leaveStore.stats?.Total?.count || 1)) * 100}%` }"
                        ></div>
                      </div>
                    </div>
          
                    <!-- Approved Bar -->
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-semibold text-surface-700">Approved</span>
                        <span class="text-sm font-bold text-emerald-600">{{ leaveStore.stats?.Approved?.count || 0 }}</span>
                      </div>
                      <div class="h-3 bg-surface-100 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                          :style="{ width: `${((leaveStore.stats?.Approved?.count || 0) / (leaveStore.stats?.Total?.count || 1)) * 100}%` }"
                        ></div>
                      </div>
                    </div>
          
                    <!-- Rejected Bar -->
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-semibold text-surface-700">Rejected</span>
                        <span class="text-sm font-bold text-rose-600">{{ leaveStore.stats?.Rejected?.count || 0 }}</span>
                      </div>
                      <div class="h-3 bg-surface-100 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-1000 ease-out"
                          :style="{ width: `${((leaveStore.stats?.Rejected?.count || 0) / (leaveStore.stats?.Total?.count || 1)) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
      
                <!-- Donut Chart: Leave Distribution -->
                <div class="card-container p-6">
                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <h3 class="text-lg font-bold text-surface-900">Leave Distribution</h3>
                      <p class="text-sm text-surface-500 mt-1">Overview of leave applications</p>
                    </div>
                    <FileText class="w-5 h-5 text-indigo-500" />
                  </div>
        
                  <div class="flex items-center justify-center gap-8">
                    <!-- SVG Donut Chart -->
                    <div class="relative">
                      <svg width="180" height="180" viewBox="0 0 180 180" class="transform -rotate-90">
                        <circle cx="90" cy="90" r="70" fill="none" stroke="#f1f5f9" stroke-width="24"></circle>
              
                        <!-- Approved segment -->
                        <circle 
                          cx="90" cy="90" r="70" fill="none" 
                          stroke="#10b981" stroke-width="24"
                          :stroke-dasharray="`${((leaveStore.stats?.Approved?.count || 0) / (leaveStore.stats?.Total?.count || 1)) * 440} 440`"
                          stroke-dashoffset="0"
                          class="transition-all duration-1000"
                        ></circle>
              
                        <!-- Pending segment -->
                        <circle 
                          cx="90" cy="90" r="70" fill="none" 
                          stroke="#f59e0b" stroke-width="24"
                          :stroke-dasharray="`${((leaveStore.stats?.Pending?.count || 0) / (leaveStore.stats?.Total?.count || 1)) * 440} 440`"
                          :stroke-dashoffset="`${-((leaveStore.stats?.Approved?.count || 0) / (leaveStore.stats?.Total?.count || 1)) * 440}`"
                          class="transition-all duration-1000"
                        ></circle>
              
                        <!-- Rejected segment -->
                        <circle 
                          cx="90" cy="90" r="70" fill="none" 
                          stroke="#ef4444" stroke-width="24"
                          :stroke-dasharray="`${((leaveStore.stats?.Rejected?.count || 0) / (leaveStore.stats?.Total?.count || 1)) * 440} 440`"
                          :stroke-dashoffset="`${-(((leaveStore.stats?.Approved?.count || 0) + (leaveStore.stats?.Pending?.count || 0)) / (leaveStore.stats?.Total?.count || 1)) * 440}`"
                          class="transition-all duration-1000"
                        ></circle>
                      </svg>
            
                      <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <p class="text-3xl font-bold text-surface-900">{{ leaveStore.stats?.Total?.count || 0 }}</p>
                        <p class="text-xs text-surface-500 font-semibold uppercase">Total</p>
                      </div>
                    </div>
          
                    <!-- Legend -->
                    <div class="space-y-3">
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full bg-emerald-500"></div>
                        <span class="text-sm text-surface-700 font-medium">Approved</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full bg-amber-500"></div>
                        <span class="text-sm text-surface-700 font-medium">Pending</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full bg-rose-500"></div>
                        <span class="text-sm text-surface-700 font-medium">Rejected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

          <div>
            <h1 class="text-2xl md:text-3xl font-bold">Employer Dashboard</h1>
            <p class="text-purple-100 text-sm md:text-base opacity-90 mt-1">Review and manage employee leave requests</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card-container bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 relative overflow-hidden hover:shadow-xl transition-shadow">
        <div class="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-blue-100 font-semibold text-sm uppercase tracking-wider">Total Requests</h3>
            <FileText class="w-6 h-6 text-blue-200" />
          </div>
          <p class="text-5xl font-bold mb-1">{{ leaveStore.stats?.Total?.count || 0 }}</p>
          <p class="text-blue-100 text-sm">All time applications</p>
        </div>
      </div>

      <div class="card-container bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 relative overflow-hidden hover:shadow-xl transition-shadow">
        <div class="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-amber-100 font-semibold text-sm uppercase tracking-wider">Pending Review</h3>
            <Clock class="w-6 h-6 text-amber-200" />
          </div>
          <p class="text-5xl font-bold mb-1">{{ leaveStore.stats?.Pending?.count || 0 }}</p>
          <p class="text-amber-100 text-sm flex items-center gap-1">
            <span v-if="(leaveStore.stats?.Pending?.count || 0) > 0" class="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold animate-pulse">Action required</span>
            <span v-else>No pending requests</span>
          </p>
        </div>
      </div>

      <div class="card-container bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 relative overflow-hidden hover:shadow-xl transition-shadow">
        <div class="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-emerald-100 font-semibold text-sm uppercase tracking-wider">Approved</h3>
            <CheckCircle class="w-6 h-6 text-emerald-200" />
          </div>
          <p class="text-5xl font-bold mb-1">{{ leaveStore.stats?.Approved?.count || 0 }}</p>
          <p class="text-emerald-100 text-sm">Granted leaves</p>
        </div>
      </div>
    </div>

    <!-- Leave Requests Table -->
    <div class="card-container flex flex-col shadow-xl min-h-[600px]">
      
      <!-- Toolbar -->
      <div class="p-6 border-b border-surface-100 bg-gradient-to-r from-surface-50 to-white">
        <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 class="text-xl font-bold text-surface-900 flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-indigo-600" />
              Employee Leave Requests
            </h2>
            <p class="text-sm text-surface-500 mt-1">Review, approve or reject leave applications</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <!-- Search -->
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search by name or department..." 
                class="input-field pl-10 py-2.5 text-sm md:w-72 border-surface-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <!-- Status Filter -->
            <select 
              v-model="currentFilter" 
              class="input-field py-2.5 text-sm border-surface-300 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Approved">✅ Approved</option>
              <option value="Rejected">❌ Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Table Content -->
      <div class="overflow-x-auto relative flex-1">
        
        <!-- Loading State -->
        <div v-if="leaveStore.loading && filteredLeaves.length === 0" class="flex flex-col items-center justify-center p-20 text-surface-400">
          <Loader2 class="h-10 w-10 animate-spin mb-4 text-indigo-500" />
          <p class="font-medium">Loading leave requests...</p>
        </div>

        <!-- Table -->
        <table v-else-if="filteredLeaves.length > 0" class="w-full text-left border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="bg-surface-50 text-surface-600 text-xs uppercase tracking-wider border-b-2 border-surface-200">
              <th class="py-4 px-6 font-bold">Employee</th>
              <th class="py-4 px-6 font-bold">Leave Details</th>
              <th class="py-4 px-6 font-bold">Duration</th>
              <th class="py-4 px-6 font-bold">Dates</th>
              <th class="py-4 px-6 font-bold">Reason</th>
              <th class="py-4 px-6 font-bold text-center">Status</th>
              <th class="py-4 px-6 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr 
              v-for="leave in filteredLeaves" 
              :key="leave._id" 
              class="hover:bg-surface-50 transition-colors group cursor-pointer"
              @click="openReview(leave, leave.status === 'Pending' ? 'Approved' : '')"
            >
              <!-- Employee Info -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                    {{ leave.employee?.name?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <div>
                    <p class="font-bold text-surface-900 text-sm">{{ leave.employee?.name || 'Unknown' }}</p>
                    <p class="text-xs text-surface-500 mt-0.5">{{ leave.employee?.department || 'No Department' }}</p>
                  </div>
                </div>
              </td>

              <!-- Leave Type -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                  <CalendarDays class="w-4 h-4 text-indigo-500" />
                  <span class="text-sm font-semibold text-surface-800">{{ leave.leaveType }}</span>
                </div>
              </td>

              <!-- Duration -->
              <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                  {{ leave.totalDays }} day{{ leave.totalDays !== 1 ? 's' : '' }}
                </span>
              </td>

              <!-- Dates -->
              <td class="py-4 px-6 whitespace-nowrap">
                <p class="text-sm font-medium text-surface-800">{{ formatDate(leave.startDate) }}</p>
                <p class="text-xs text-surface-500 mt-0.5">to {{ formatDate(leave.endDate) }}</p>
              </td>

              <!-- Reason -->
              <td class="py-4 px-6 max-w-[250px]">
                <p class="text-sm text-surface-600 line-clamp-2" :title="leave.reason">{{ leave.reason }}</p>
              </td>

              <!-- Status -->
              <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center gap-1.5 badge whitespace-nowrap" :class="'badge-' + leave.status.toLowerCase()">
                  <CheckCircle v-if="leave.status === 'Approved'" class="w-3.5 h-3.5" />
                  <Clock v-else-if="leave.status === 'Pending'" class="w-3.5 h-3.5" />
                  <XCircle v-else class="w-3.5 h-3.5" />
                  {{ leave.status }}
                </span>
                <p v-if="leave.reviewedBy" class="text-xs text-surface-400 mt-1">By: {{ leave.reviewedBy.name }}</p>
              </td>

              <!-- Actions -->
              <td class="py-4 px-6">
                <div v-if="leave.status === 'Pending'" class="flex items-center justify-center gap-2">
                  <button 
                    @click.stop="openReview(leave, 'Approved')" 
                    class="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm border border-emerald-200 hover:scale-110" 
                    title="Approve"
                  >
                    <ThumbsUp class="w-4 h-4" />
                  </button>
                  <button 
                    @click.stop="openReview(leave, 'Rejected')" 
                    class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all shadow-sm border border-rose-200 hover:scale-110" 
                    title="Reject"
                  >
                    <ThumbsDown class="w-4 h-4" />
                  </button>
                </div>
                <button v-else @click.stop="openReview(leave, '')" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1 rounded-lg hover:bg-indigo-50 transition">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div class="bg-surface-100 p-6 rounded-full mb-4 ring-8 ring-surface-50">
            <Calendar class="h-12 w-12 text-surface-400" />
          </div>
          <h3 class="text-xl font-bold text-surface-900 mb-2">No leave requests found</h3>
          <p class="text-surface-500 max-w-sm">
            {{ currentFilter === 'All' ? 'There are no leave requests at the moment.' : `No ${currentFilter.toLowerCase()} requests found.` }}
          </p>
        </div>
      </div>
    </div>
    <div class="card-container flex items-center justify-between p-3 md:p-4 bg-white/70 backdrop-blur-md sticky top-0 z-50 border border-white">
      <div class="flex items-center gap-2">
        <h2 class="text-surface-500 text-sm md:text-base font-medium pl-2">
          Company Dashboard / <span class="text-surface-900 font-semibold tracking-tight">Panze Studio</span>
        </h2>
      </div>
      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-100 rounded-full shadow-inner border border-surface-200">
          <Pause class="w-4 h-4 text-surface-600" />
          <span class="font-bold font-mono text-sm tracking-widest text-surface-700 pr-1">2:43:17</span>
          <div class="bg-brand-500 p-1.5 rounded-full shadow-md shadow-brand-500/20">
            <AlarmClock class="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <button class="relative p-2 text-surface-400 hover:text-brand-600 hover:bg-surface-50 rounded-full transition-colors">
          <Bell class="w-5 h-5" />
          <span class="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
        <div class="w-9 h-9 bg-gradient-to-tr from-brand-300 to-brand-500 rounded-full p-0.5 shadow-sm">
          <div class="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-brand-700 text-sm overflow-hidden">
            <img v-if="false" src="https://i.pravatar.cc/100" />
            <span>AD</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 mb-2 px-2">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <!-- Day Week Month Tabs -->
        <div class="flex items-center p-1 bg-surface-200/50 rounded-full gap-1">
          <button @click="currentFilter = 'Day'" :class="currentFilter === 'Day' ? 'pill-tab-active shadow-md' : 'pill-tab-inactive'" class="pill-tab text-xs px-5">Day</button>
          <button @click="currentFilter = 'Week'" :class="currentFilter === 'Week' ? 'pill-tab-active shadow-md' : 'pill-tab-inactive'" class="pill-tab text-xs px-5">Week</button>
          <button @click="currentFilter = 'Month'" :class="currentFilter === 'Month' ? 'pill-tab-active shadow-md' : 'pill-tab-inactive'" class="pill-tab text-xs px-5">Month</button>
        </div>
        
        <!-- Date Scroller -->
        <div class="hidden md:flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-surface-200 gap-3">
          <button class="text-surface-400 hover:text-brand-600 transition"><ChevronLeft class="w-4 h-4" /></button>
          <span class="text-sm font-semibold text-surface-800 tracking-wide">January 2024</span>
          <button class="text-surface-400 hover:text-brand-600 transition"><ChevronRight class="w-4 h-4" /></button>
        </div>

        <button class="hidden lg:flex items-center gap-2 text-xs font-medium text-brand-600 hover:text-brand-800 px-2 transition group">
          Back to current month <CornerUpLeft class="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div class="hidden md:flex items-center gap-5 text-sm font-semibold text-surface-600">
        <label class="flex items-center gap-2 cursor-pointer group">
          <div class="w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-brand-500"></div>
          </div>
          <span class="group-hover:text-surface-900 transition">Leave Summary</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer group">
          <div class="w-4 h-4 rounded-full border-2 border-surface-300"></div>
          <span class="group-hover:text-surface-900 transition font-medium">Pending Approvals</span>
        </label>
      </div>
    </div>

    <!-- Main Widget Rows -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
      
      <!-- Logged Time Summary (Donut Chart representation) -->
      <div class="card-container p-6 lg:p-8 flex flex-col shadow-float relative overflow-hidden bg-white hover:border-brand-100 transition duration-300">
        <h3 class="text-lg font-bold text-surface-800 mb-6">Leave Summary</h3>
        <div class="relative flex items-center justify-center flex-1 my-4">
          <!-- CSS Donut Chart logic mimicking the image -->
          <div class="w-48 h-48 rounded-full border-[24px] border-surface-100 relative shadow-inner">
            <div class="absolute inset-[-24px] rounded-full border-[24px] border-brand-400 border-r-emerald-400 border-b-cyan-400 border-l-amber-400 rotate-45 transform bg-transparent z-10 opacity-90 drop-shadow-md"></div>
            <!-- Labels in middle -->
            <div class="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white shadow-soft rounded-full m-[-18px]">
              <span class="text-2xl font-black tracking-tight text-brand-900">{{ leaveStore.stats?.Total?.count || 0 }}</span>
              <span class="text-xs font-medium text-surface-500 mt-0.5">Total Leaves</span>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-between px-4 text-xs font-semibold text-surface-500">
           <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-emerald-400"></div>Approved</div>
           <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-amber-400"></div>Pending</div>
           <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-rose-400"></div>Rejected</div>
        </div>
      </div>

      <!-- Time Summary Stats (Bar Chart Graphic dummy) -->
      <div class="card-container lg:col-span-2 p-6 lg:p-8 shadow-card flex flex-col w-full relative group hover:border-brand-100 ">
         <div class="flex justify-between items-center mb-6">
           <h3 class="text-lg font-bold text-surface-800">Department Status Stats</h3>
           <div class="flex gap-2 bg-surface-100/50 p-1 rounded-full">
             <button class="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white px-3 py-1.5 rounded-full shadow-sm"><FileText class="w-3.5 h-3.5" /> By Dept</button>
             <button class="flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-full transition"><UsersRound class="w-3.5 h-3.5" /> By Member</button>
           </div>
         </div>
         <div class="flex-1 w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+ICAgIDxwb2x5Z29uIHBvaW50cz0iMCwwIDQwLDAgNDAsNDAgMCw0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIi8+ICAgIDxwb2x5Z29uIHBvaW50cz0iMCwzOSA0MCwzOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTRlOGYwIi8+PC9zdmc+')] bg-repeat">
            <div class="h-64 w-full flex items-end justify-around pb-2 pt-6 gap-2 sm:gap-4 px-2">
               <!-- Generating dummy visual bars matching dribbble asthetics -->
               <div v-for="i in 10" :key="i" class="w-full flex justify-center group/bar cursor-pointer">
                  <div class="w-8 sm:w-10 flex flex-col-reverse rounded-t-lg overflow-hidden h-full group-hover/bar:bg-surface-50/50 transition">
                     <!-- Bar segments -->
                     <div class="w-full rounded-sm bg-gradient-to-t from-cyan-400 to-cyan-300 shadow-sm" :style="`height: ${20 + Math.random() * 30}%`"></div>
                     <div class="w-full rounded-sm bg-gradient-to-t from-emerald-400 to-emerald-300 mt-1 shadow-sm" :style="`height: ${Math.random() * 20}%`"></div>
                     <div class="w-full rounded-sm bg-gradient-to-t from-brand-400 to-brand-300 mt-1 shadow-sm" :style="`height: ${10 + Math.random() * 40}%`"></div>
                  </div>
               </div>
            </div>
            <div class="flex justify-around items-center w-full px-2 text-xs font-semibold text-surface-400 mt-3 pt-3 border-t-2 border-surface-200 border-dashed">
               <span>P1</span><span>P2</span><span>P3</span><span>P4</span><span>P5</span><span>P6</span><span>P7</span><span>P8</span><span>P9</span><span>P10</span>
            </div>
         </div>
      </div>
      
    </div>

    <!-- Bottom Grids -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
      
      <!-- Totals By Person -->
      <div class="card-container lg:col-span-2 p-6 shadow-soft flex flex-col bg-white">
         <h3 class="text-lg font-bold text-surface-800 mb-5">Totals By Person</h3>
         <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <!-- Emulating the employee cards from image -->
            <div v-for="emp in employeeStats" :key="emp.id" class="border border-surface-100 rounded-2xl p-4 flex flex-col bg-surface-50/30 hover:shadow-card hover:-translate-y-1 transition-all group">
               <div class="flex items-start justify-between">
                  <div class="relative">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-sm" :class="emp.avatarColor">
                      {{ emp.name.charAt(0) }}
                    </div>
                    <!-- Tooltip pill indicator -->
                    <div v-if="emp.pending > 0" class="absolute -top-1 -right-4 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow border border-brand-400 z-10 animate-bounce">
                      Review
                    </div>
                  </div>
               </div>
               <div class="mt-4">
                 <h4 class="font-bold text-surface-900 text-base tracking-tight">{{ emp.name }}</h4>
                 <p class="text-xs font-medium text-surface-500 mt-0.5">{{ emp.department }}</p>
               </div>
               <div class="mt-4 flex items-center gap-1.5 text-sm font-semibold text-surface-700 font-mono tracking-tight bg-white rounded-lg p-2 border border-surface-100 w-max">
                 <CalendarDays class="w-4 h-4 text-brand-500" />
                 {{ emp.totalLeaves }} total requests
               </div>
               <!-- Small progress bar indicators -->
               <div class="mt-5 flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
                 <div class="bg-gradient-to-r from-emerald-400 to-emerald-300" :style="`width: ${Math.max((emp.approved / emp.totalLeaves) * 100, 10)}%`"></div>
                 <div class="bg-gradient-to-r from-amber-400 to-orange-300" :style="`width: ${Math.max((emp.pending / emp.totalLeaves) * 100, 5)}%`"></div>
               </div>
            </div>
            
            <div v-if="employeeStats.length === 0" class="col-span-full py-10 flex flex-col items-center justify-center text-surface-400">
              <Loader2 v-if="leaveStore.loading" class="w-6 h-6 animate-spin mb-2 text-brand-500" />
              <p>No member data to show</p>
            </div>
         </div>
      </div>

      <!-- Members Leaves column -->
      <div class="card-container p-6 shadow-soft flex flex-col bg-white overflow-hidden relative group">
        <div class="flex items-center justify-between mb-6">
           <h3 class="text-lg font-bold text-surface-800">Members Leaves</h3>
           <a href="#" class="text-sm font-semibold text-brand-600 hover:text-brand-800 transition">See All</a>
        </div>
        
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[500px]">
          <div v-for="leave in leavesList" :key="leave._id" class="flex gap-4 p-3 rounded-2xl hover:bg-surface-50 transition border border-transparent hover:border-surface-100 cursor-pointer" @click="openReview(leave, 'Approved')">
             <div class="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm flex-shrink-0" :class="getColorsFromName(leave.employee?.name || '?')">
               {{ leave.employee?.name?.charAt(0) || 'U' }}
             </div>
             <div class="flex-1 min-w-0">
               <h4 class="font-bold text-surface-900 text-sm truncate">{{ leave.employee?.name }}</h4>
               <span class="inline-flex mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md" :class="colors[leave.status]">
                 {{ leave.status }}
               </span>
             </div>
             <div class="text-right flex-shrink-0">
               <div class="text-xs font-bold text-surface-800">{{ leave.totalDays }} Days</div>
               <div class="text-[11px] font-medium text-surface-500 mt-1 whitespace-nowrap">{{ formatDateShort(leave.startDate) }} - {{ formatDateShort(leave.endDate) }}</div>
             </div>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal && selectedLeave" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-md animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up border-2 border-surface-200">
        
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-surface-100 flex justify-between items-center" :class="reviewAction === 'Approved' ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : reviewAction === 'Rejected' ? 'bg-gradient-to-r from-rose-50 to-orange-50' : 'bg-gradient-to-r from-surface-50 to-indigo-50'">
          <h2 class="text-xl font-bold flex items-center gap-2" :class="reviewAction === 'Approved' ? 'text-emerald-800' : reviewAction === 'Rejected' ? 'text-rose-800' : 'text-surface-900'">
            <component :is="reviewAction === 'Approved' ? ThumbsUp : reviewAction === 'Rejected' ? ThumbsDown : FileText" class="w-6 h-6" /> 
            {{ reviewAction || 'Leave Request Details' }}
          </h2>
          <button @click="showReviewModal = false" class="p-2 text-surface-400 hover:text-surface-700 hover:bg-white rounded-lg transition">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Modal Body -->
        <form @submit.prevent="submitReview" class="p-6 space-y-5">
          
          <!-- Employee Info Card -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                {{ selectedLeave.employee?.name?.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="font-bold text-lg text-surface-900">{{ selectedLeave.employee?.name }}</h3>
                <p class="text-sm text-surface-600 flex items-center gap-2 mt-1">
                  <Building2 class="w-4 h-4" />
                  {{ selectedLeave.employee?.department || 'No Department' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Leave Details -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white rounded-lg p-4 border border-surface-200 shadow-sm">
              <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Leave Type</p>
              <p class="font-bold text-surface-900 flex items-center gap-2">
                <CalendarDays class="w-4 h-4 text-indigo-500" />
                {{ selectedLeave.leaveType }}
              </p>
            </div>
            <div class="bg-white rounded-lg p-4 border border-surface-200 shadow-sm">
              <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Duration</p>
              <p class="font-bold text-indigo-600 text-lg">{{ selectedLeave.totalDays }} day{{ selectedLeave.totalDays !== 1 ? 's' : '' }}</p>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 border border-surface-200 shadow-sm">
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Period</p>
            <p class="text-sm font-medium text-surface-800">
              {{ formatDate(selectedLeave.startDate) }} → {{ formatDate(selectedLeave.endDate) }}
            </p>
          </div>

          <!-- Reason -->
          <div class="bg-surface-50 rounded-lg p-4 border border-surface-200">
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Reason for Leave</p>
            <p class="text-surface-700 leading-relaxed italic">"{{ selectedLeave.reason }}"</p>
          </div>

          <!-- Error Display -->
          <div v-if="reviewError" class="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-lg text-sm flex items-start gap-3">
            <XCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{{ reviewError }}</span>
          </div>

          <!-- Manager Note Input (only for pending reviews) -->
          <div v-if="selectedLeave.status === 'Pending' && reviewAction">
            <label class="block text-sm font-semibold text-surface-700 mb-2">
              Manager's Note <span class="text-surface-400 font-normal">(Optional)</span>
            </label>
            <textarea 
              v-model="reviewNote" 
              rows="3" 
              placeholder="Add any remarks or feedback for the employee..." 
              class="input-field resize-none text-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          <!-- Existing Review Note (if already reviewed) -->
          <div v-if="selectedLeave.reviewNote" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Manager's Feedback</p>
            <p class="text-blue-900 text-sm italic">{{ selectedLeave.reviewNote }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="pt-4 flex gap-3">
            <button 
              v-if="selectedLeave.status === 'Pending' && !reviewAction"
              type="button"
              @click="reviewAction = 'Rejected'"
              class="flex-1 btn-secondary py-3 font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center justify-center gap-2"
            >
              <ThumbsDown class="w-4 h-4" />
              Reject
            </button>
            
            <button 
              v-if="selectedLeave.status === 'Pending' && !reviewAction"
              type="button"
              @click="reviewAction = 'Approved'"
              class="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <ThumbsUp class="w-4 h-4" />
              Approve
            </button>

            <button 
              v-if="reviewAction"
              type="submit"
              :disabled="leaveStore.loading"
              class="flex-1 py-3 rounded-lg font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2"
              :class="reviewAction === 'Approved' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30' : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30'"
            >
              <Loader2 v-if="leaveStore.loading" class="w-5 h-5 animate-spin" />
              <template v-else>
                <CheckCircle class="w-5 h-5" />
                Confirm {{ reviewAction }}
              </template>
            </button>

            <button 
              v-if="reviewAction"
              type="button"
              @click="reviewAction = ''"
              :disabled="leaveStore.loading"
              class="px-4 py-3 rounded-lg font-semibold text-surface-600 hover:bg-surface-100 transition"
            >
              Back
            </button>

            <button 
              v-if="selectedLeave.status !== 'Pending'"
              type="button"
              @click="showReviewModal = false"
              class="flex-1 btn-primary py-3 font-semibold"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.pill-tab {
  @apply py-1.5 rounded-full transition-all font-medium;
}
.pill-tab-active {
  @apply bg-white text-brand-700;
}
.pill-tab-inactive {
  @apply text-surface-600 hover:text-surface-900;
}
.shadow-float {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
}
</style>
