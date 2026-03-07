<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  Menu, X, Clock, CalendarRange, FileText, LayoutDashboard, 
  Building2, Users, UsersRound, Settings, HelpCircle, UserCog, Briefcase
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const unreadCount = 3
</script>

<template>
  <div class="min-h-screen bg-surface-100 flex flex-col md:flex-row font-sans selection:bg-brand-200">
    
    <!-- Mobile header with hamburger -->
    <header class="md:hidden bg-white border-b border-surface-200 p-4 flex justify-between items-center z-20">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 bg-brand-500 rounded-full flex items-center justify-center">
          <Clock class="h-4 w-4 text-white" />
        </div>
        <span class="font-bold text-lg text-brand-700 tracking-tight">Audime</span>
      </div>
      <button @click="toggleSidebar" class="p-2 text-surface-600 hover:bg-surface-100 rounded-lg transition-colors">
        <Menu v-if="!isSidebarOpen" />
        <X v-else />
      </button>
    </header>

    <!-- Sidebar Overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-10 md:hidden animate-fade-in" 
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar Navigation - Mimicking Dribbble left pane -->
    <aside 
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:sticky shadow-2xl md:shadow-none top-0 h-screen w-64 bg-white z-20 flex flex-col flex-shrink-0']"
    >
      <!-- Logo Area -->
      <div class="p-6 flex items-center gap-3">
        <div class="h-9 w-9 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Clock class="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 class="font-bold text-xl text-brand-700 tracking-tight">Audime</h1>
        </div>
      </div>

      <!-- User/Company Menu dummy -->
      <div class="px-5 mb-8">
        <div class="flex items-center justify-between border border-surface-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-surface-50 transition-colors bg-white shadow-sm">
          <div class="flex items-center gap-2 text-brand-600 font-medium text-sm">
            <Building2 class="w-4 h-4" />
            Panze Studio
          </div>
          <svg class="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 overflow-y-auto space-y-1.5 custom-scrollbar pb-6 relative">
        <router-link 
          :to="authStore.isEmployer ? '/employer/dashboard' : '/employee/dashboard'" 
          class="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 text-sm"
          :class="[$route.path.includes('dashboard') ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-md shadow-brand-500/30 font-bold hover:from-brand-600 hover:to-brand-500 scale-[1.02]' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900']"
          @click="isSidebarOpen = false"
        >
          <LayoutDashboard class="h-5 w-5" />
          Dashboard
        </router-link>

        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
          <Clock class="h-5 w-5 opacity-70" />
          Timesheet
        </a>

        <router-link 
          :to="authStore.isEmployee ? '/employee/dashboard' : '/employer/dashboard'"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all font-semibold"
        >
          <CalendarRange class="h-5 w-5 opacity-70" />
          Leave Schedule
        </router-link>

        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
          <FileText class="h-5 w-5 opacity-70" />
          Saved Reports
        </a>

        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all mt-4">
          <Briefcase class="h-5 w-5 opacity-70" />
          Projects
        </a>
        
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
          <Users class="h-5 w-5 opacity-70" />
          Clients
        </a>

        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
          <UserCog class="h-5 w-5 opacity-70" />
          Staff
        </a>

        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
          <UsersRound class="h-5 w-5 opacity-70" />
          Teams
        </a>
      </nav>

      <!-- Bottom Settings Links -->
      <div class="p-4 space-y-1 border-t border-surface-100">
        <a href="#" class="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 transition-all">
            <Settings class="h-4 w-4 opacity-70" />
            System Settings
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-medium text-sm text-surface-600 hover:bg-surface-50 transition-all">
            <HelpCircle class="h-4 w-4 opacity-70" />
            Help Service
          </a>
          
          <button @click="handleLogout" class="w-full mt-2 bg-rose-50 text-rose-600 px-4 py-2.5 rounded-2xl font-medium text-sm text-center hover:bg-rose-100 transition-colors border border-rose-100 border-dashed">
            Log out
          </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-screen overflow-y-auto bg-surface-50 md:rounded-tl-3xl border-l border-t border-surface-200/60 shadow-inner overflow-x-hidden relative">
      
      <!-- Content padding inside the rounded corner -->
      <div class="flex-1 p-4 md:p-8 space-y-6 md:max-w-[1600px] w-full mx-auto">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>

    </main>
    
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #e2e8f0;
}
</style>
