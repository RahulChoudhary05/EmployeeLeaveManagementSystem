import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import EmployeeDashboard from '../views/EmployeeDashboard.vue'
import EmployerDashboard from '../views/EmployerDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: () => {
            const authStore = useAuthStore()
            return authStore.isEmployer ? '/employer/dashboard' : '/employee/dashboard'
          }
        },
        {
          path: 'employer/dashboard',
          name: 'employer-dashboard',
          component: EmployerDashboard,
          meta: { requiresEmployer: true }
        },
        {
          path: 'employee/dashboard',
          name: 'employee-dashboard',
          component: EmployeeDashboard,
          meta: { requiresEmployee: true }
        }
      ]
    },
    {
      // Catch all 404
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
  } else if (to.meta.requiresEmployer && !authStore.isEmployer) {
    next('/')
  } else if (to.meta.requiresEmployee && !authStore.isEmployee) {
    next('/')
  } else {
    next()
  }
})

export default router
