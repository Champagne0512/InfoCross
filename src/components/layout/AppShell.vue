<script setup lang="ts">
import AppNavBar from './AppNavBar.vue'
import ThreeBodyAnimation from '../ThreeBodyAnimation.vue'
import { useFrequencyStore } from '@/stores/frequencyStore'

const frequencyStore = useFrequencyStore()
</script>

<template>
  <div 
    class="flex h-screen w-screen overflow-hidden text-charcoal transition-colors duration-500"
    :class="frequencyStore.isFocus ? 'bg-focus-bg' : 'bg-vibe-bg'"
  >
    <ThreeBodyAnimation />
    <!-- 左侧导航：固定宽度，不用 fixed -->
    <AppNavBar />
    <!-- 右侧主内容：flex-1 自动填满 -->
    <main 
      class="flex-1 w-full h-full overflow-y-auto transition-colors duration-500"
      :class="frequencyStore.isFocus ? 'bg-focus-bg' : 'bg-vibe-bg'"
    >
      <div class="w-full min-h-full px-8 py-8">
        <slot />
      </div>
    </main>
  </div>
</template>
