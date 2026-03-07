<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { LayoutDashboard, LogOut, Menu, X, Bell, Leaf } from 'lucide-vue-next'

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
</script>

<template>
  <div class="min-h-screen bg-surface-50 flex flex-col md:flex-row font-sans">
    
    <!-- Mobile header with hamburger -->
    <header class="md:hidden bg-white border-b border-surface-200 p-4 flex justify-between items-center z-20">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center transform rotate-3">
          <Leaf class="h-4 w-4 text-white -rotate-3" />
        </div>
        <span class="font-bold text-lg text-surface-900 tracking-tight">HR Dashboard</span>
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

    <!-- Sidebar Navigation -->
    <aside 
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:sticky top-0 h-screen w-64 bg-white border-r border-surface-200 z-20 flex flex-col']"
    >
      <div class="p-6 hidden md:flex items-center gap-3">
        <div class="h-10 w-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 transform hover:rotate-6 transition-transform">
          <LayoutDashboard class="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 class="font-bold text-lg text-surface-900 leading-tight">LeaveFlow</h1>
          <p class="text-xs text-surface-500 font-medium tracking-wide">HR SYNC</p>
        </div>
      </div>

      <nav class="flex-1 px-4 py-6 md:py-2 space-y-1">
        <router-link 
          :to="authStore.isEmployer ? '/employer/dashboard' : '/employee/dashboard'" 
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200"
          :class="[$route.path.includes('dashboard') ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900']"
          @click="isSidebarOpen = false"
        >
          <LayoutDashboard class="h-5 w-5" />
          Dashboard Overview
        </router-link>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-surface-200">
        <div class="flex items-center gap-3 px-3 mb-6 bg-surface-50 p-3 rounded-lg border border-surface-100">
          <div class="h-10 w-10 bg-gradient-to-tr from-rose-200 to-teal-200 rounded-full flex items-center justify-center text-surface-900 font-bold border-2 border-white shadow-sm">
            {{ authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-semibold text-surface-900 truncate">{{ authStore.user?.name || 'User' }}</p>
            <p class="text-xs text-surface-500 truncate capitalize">{{ authStore.user?.role || 'Guest' }}</p>
          </div>
        </div>
        
        <button 
          @click="handleLogout" 
          class="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 font-medium rounded-lg hover:bg-rose-50 transition-colors"
        >
          <LogOut class="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <!-- Top navbar logic for desktop -->
      <div class="hidden md:flex bg-white h-16 border-b border-surface-200 items-center justify-between px-8 sticky top-0 z-10">
        <h2 class="text-lg font-semibold text-surface-800 tracking-tight flex items-center gap-2">
          Hello, <span class="capitalize text-primary-600">{{ authStore.user?.name ? authStore.user.name.split(' ')[0] : 'User' }}</span> 👋
        </h2>
        
        <div class="flex items-center gap-4">
          <button class="relative p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-full transition-colors">
            <Bell class="h-5 w-5" />
            <span class="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>

      <!-- Page Content -->
      <div class="flex-1 p-4 md:p-8 bg-surface-50">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </main>
    
  </div>
</template>
