<template>
  <div class="min-h-screen bg-surface-50 text-surface-800 font-sans selection:bg-primary-200 selection:text-primary-900">
    <!-- Router View manages Layouts dynamically based on route meta -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
