<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { Leaf, Mail, Lock, ArrowRight, Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/')
  } catch (error) {
    // Error handled in store, display template logic will show authStore.error
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-100 to-surface-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-200 opacity-50 blur-3xl mix-blend-multiply"></div>
    <div class="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-teal-200 opacity-50 blur-3xl mix-blend-multiply"></div>

    <div class="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-soft border border-white relative z-10 animate-fade-in">
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 transform rotate-3">
          <Leaf class="h-8 w-8 text-white -rotate-3" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-surface-900 tracking-tight">Welcome back</h2>
        <p class="mt-2 text-sm text-surface-500">
          Sign in to your HR Leave Dashboard
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-surface-700 mb-1">Email address</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-surface-400" />
              </div>
              <input 
                id="email" 
                v-model="email" 
                name="email" 
                type="email" 
                required 
                class="input-field pl-10" 
                placeholder="you@company.com" 
              />
            </div>
          </div>
          
          <!-- Password Input -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-sm font-medium text-surface-700">Password</label>
            </div>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-surface-400" />
              </div>
              <input 
                id="password" 
                v-model="password" 
                name="password" 
                type="password" 
                required 
                class="input-field pl-10" 
                placeholder="••••••••" 
              />
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="authStore.error" class="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 text-sm text-rose-700">
              <p>{{ authStore.error }}</p>
            </div>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="authStore.loading"
            class="w-full btn-primary py-3 overflow-hidden relative group"
          >
            <span v-if="authStore.loading" class="flex items-center gap-2">
              <Loader2 class="w-5 h-5 animate-spin" /> Signing in...
            </span>
            <span v-else class="flex items-center gap-2 justify-center w-full">
              Sign in <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div class="absolute inset-0 h-full w-full pointer-events-none opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
      </form>

      <div class="text-center mt-6">
        <p class="text-sm text-surface-600">
          Don't have an account? 
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500 hover:underline inline-flex items-center transition-colors">
            Create an account
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
