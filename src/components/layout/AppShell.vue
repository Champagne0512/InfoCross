<script setup lang="ts">
import AppNavBar from './AppNavBar.vue'
import ThreeBodyAnimation from '../ThreeBodyAnimation.vue'
import { useFrequencyStore } from '@/stores/frequencyStore'

const frequencyStore = useFrequencyStore()
</script>

<template>
  <div 
    class="min-h-screen text-charcoal transition-colors duration-500"
    :class="frequencyStore.isFocus ? 'bg-focus-bg' : 'bg-vibe-bg'"
  >
    <ThreeBodyAnimation />
    <AppNavBar />
    <main 
      class="main-content transition-colors duration-500"
      :class="frequencyStore.isFocus ? 'bg-focus-bg' : 'bg-vibe-bg'"
    >
      <slot />
    </main>
  </div>
</template>
