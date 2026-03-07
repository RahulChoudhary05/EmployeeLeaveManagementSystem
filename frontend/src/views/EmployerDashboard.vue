<script setup>
import { onMounted, ref, computed } from 'vue'
import { useLeaveStore } from '../stores/leave'
import { format } from 'date-fns'
import { 
  Search, Filter, CheckCircle, XCircle, Clock, CalendarDays, 
  ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, CornerUpLeft, 
  Pause, AlarmClock, Bell, User as UserIcon, Loader2, X, FileText, UsersRound
} from 'lucide-vue-next'

const leaveStore = useLeaveStore()

const currentFilter = ref('Month')
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

const leavesList = computed(() => leaveStore.leaves || [])

// Get unique list of employees from the leaves data to populate the "Totals By Person" section
const employeeStats = computed(() => {
  const empMap = new Map();
  leavesList.value.forEach(leave => {
    if (!leave.employee) return;
    const id = leave.employee._id;
    if (!empMap.has(id)) {
      empMap.set(id, {
        id: id,
        name: leave.employee.name,
        department: leave.employee.department,
        totalLeaves: 0,
        approved: 0,
        pending: 0,
        avatarColor: getColorsFromName(leave.employee.name)
      });
    }
    const stat = empMap.get(id);
    stat.totalLeaves++;
    if (leave.status === 'Approved') stat.approved++;
    if (leave.status === 'Pending') stat.pending++;
  })
  return Array.from(empMap.values()).slice(0, 6); // Just show top few
})

// Avatar color generator based on name
const getColorsFromName = (name) => {
  const hash = String(name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'from-rose-400 to-orange-400', 'from-emerald-400 to-teal-400', 
    'from-cyan-400 to-blue-500', 'from-indigo-400 to-purple-500', 
    'from-fuchsia-400 to-pink-500', 'from-yellow-400 to-orange-500'
  ];
  return colors[hash % colors.length];
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return 'N/A'
  return format(new Date(dateStr), 'MMM d')
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

const colors = {
  Approved: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Rejected: 'bg-rose-100 text-rose-700'
}

</script>

<template>
  <div class="animate-fade-in flex flex-col gap-6 md:pb-10">
    
    <!-- Top Nav Header -->
    <div class="card-container flex items-center justify-between p-3 md:p-4 bg-white/70 backdrop-blur-md sticky top-0 z-10 border border-white">
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

    <!-- Review Action Modal (Same functionality, styled differently) -->
    <div v-if="showReviewModal && selectedLeave" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-surface-100 relative">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r" :class="reviewAction === 'Approved' ? 'from-emerald-400 to-emerald-500' : 'from-brand-400 to-brand-500'"></div>
        
        <form @submit.prevent="submitReview" class="p-8 pt-10 space-y-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-bold flex items-center gap-2 text-surface-900 tracking-tight">
              {{ selectedLeave.employee?.name }}
            </h2>
            <div class="w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-lg font-bold shadow-sm" :class="getColorsFromName(selectedLeave.employee?.name)">
              {{ selectedLeave.employee?.name?.charAt(0) }}
            </div>
          </div>
          
          <!-- Details card -->
          <div class="bg-surface-50 rounded-2xl p-5 border border-surface-100 text-sm shadow-sm">
            <p class="flex justify-between items-center"><span class="text-surface-500 font-medium">Leave Type</span> <span class="font-bold text-surface-900 bg-white px-2 py-1 rounded shadow-sm border border-surface-100">{{ selectedLeave.leaveType }}</span></p>
            <div class="w-full h-px bg-surface-200/60 my-3"></div>
            <p class="flex justify-between items-center"><span class="text-surface-500 font-medium">Duration</span> <span class="text-brand-600 font-bold bg-brand-50 px-2 py-1 rounded-md">{{ selectedLeave.totalDays }} days</span></p>
            <p class="mt-4 text-surface-600 italic bg-white p-3 rounded-lg border border-surface-100 relative">
              <span class="absolute -top-2 left-2 text-3xl text-surface-200">"</span>
              <span class="relative z-10 font-medium">{{ selectedLeave.reason }}</span>
            </p>
          </div>

          <div v-if="reviewError" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm font-medium shadow-sm">
            {{ reviewError }}
          </div>

          <div v-if="selectedLeave.status === 'Pending'">
            <label class="block text-sm font-semibold text-surface-700 mb-2">Manager Remarks</label>
            <textarea v-model="reviewNote" rows="2" placeholder="Required for context..." class="input-field resize-none text-sm"></textarea>
          </div>

          <div class="pt-4 flex items-center gap-3">
            <button v-if="selectedLeave.status === 'Pending'" type="button" @click.prevent="reviewAction = 'Rejected'; submitReview()" :disabled="leaveStore.loading" class="flex-1 py-2.5 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition shadow-sm flex justify-center items-center gap-2 border border-rose-200/50">
              <XCircle class="w-4 h-4" /> Reject
            </button>
            <button v-if="selectedLeave.status === 'Pending'" type="button" @click.prevent="reviewAction = 'Approved'; submitReview()" :disabled="leaveStore.loading" class="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-400 hover:to-emerald-500 transition shadow-md shadow-emerald-500/30 flex justify-center items-center gap-2 border border-emerald-500">
              <CheckCircle class="w-4 h-4" /> Approve
            </button>
            
            <button v-if="selectedLeave.status !== 'Pending'" type="button" @click.prevent="showReviewModal = false" class="w-full btn-secondary font-bold text-surface-600">
              Close Overview
            </button>

            <!-- Loading overlay -->
             <div v-if="leaveStore.loading" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <Loader2 class="w-8 h-8 animate-spin text-brand-500" />
             </div>
          </div>
          <button type="button" @click="showReviewModal = false" class="absolute top-4 right-4 p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-full transition">
            <X class="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
    
  </div>
</template>
