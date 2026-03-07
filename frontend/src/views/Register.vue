<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { Leaf, User, Mail, Lock, Flag, ArrowRight, Loader2, Briefcase } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: ''
})

const handleRegister = async () => {
  try {
    await authStore.register(form.value)
    router.push('/')
  } catch (error) {
    // Error logic is in store
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-100 to-surface-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    
    <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-200 opacity-50 blur-3xl mix-blend-multiply"></div>
    <div class="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-teal-200 opacity-50 blur-3xl mix-blend-multiply"></div>

    <div class="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-soft border border-white relative z-10 animate-slide-up">
      <div class="text-center mt-2">
        <h2 class="text-3xl font-extrabold text-surface-900 tracking-tight">Create an account</h2>
        <p class="mt-2 text-sm text-surface-500">
          Join the HR Leave Dashboard
        </p>
      </div>
      
      <form class="mt-6 space-y-4" @submit.prevent="handleRegister">
        <!-- Role toggler -->
        <div class="flex p-1 bg-surface-100 rounded-lg">
          <button 
            type="button" 
            @click="form.role = 'employee'"
            :class="[form.role === 'employee' ? 'bg-white shadow text-primary-700' : 'text-surface-600 hover:text-surface-900', 'flex-1 py-1.5 text-sm font-medium rounded-md transition-all']"
          >
            Employee
          </button>
          <button 
            type="button" 
            @click="form.role = 'employer'"
            :class="[form.role === 'employer' ? 'bg-white shadow text-primary-700' : 'text-surface-600 hover:text-surface-900', 'flex-1 py-1.5 text-sm font-medium rounded-md transition-all']"
          >
            Employer
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Full Name</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User class="h-5 w-5 text-surface-400" />
            </div>
            <input v-model="form.name" type="text" required class="input-field pl-10" placeholder="John Doe" />
          </div>
        </div>
        
        <div v-if="form.role === 'employee'">
          <label class="block text-sm font-medium text-surface-700 mb-1">Department</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase class="h-5 w-5 text-surface-400" />
            </div>
            <input v-model="form.department" type="text" class="input-field pl-10" placeholder="Engineering, HR, Sales..." />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Email address</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-5 w-5 text-surface-400" />
            </div>
            <input v-model="form.email" type="email" required class="input-field pl-10" placeholder="you@company.com" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Password</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-5 w-5 text-surface-400" />
            </div>
            <input v-model="form.password" type="password" required minlength="6" class="input-field pl-10" placeholder="••••••••" />
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="authStore.error" class="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-md animate-fade-in">
          <p class="text-sm text-rose-700">{{ authStore.error }}</p>
        </div>

        <div class="pt-2">
          <button type="submit" :disabled="authStore.loading" class="w-full btn-primary py-3 overflow-hidden relative group">
            <span v-if="authStore.loading" class="flex items-center gap-2">
              <Loader2 class="w-5 h-5 animate-spin" /> Processing...
            </span>
            <span v-else class="flex items-center gap-2 justify-center w-full">
              Create Account <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </form>

      <div class="text-center mt-6">
        <p class="text-sm text-surface-600">
          Already have an account? 
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 hover:underline transition-colors">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
