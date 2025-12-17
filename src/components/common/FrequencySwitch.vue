<script setup lang="ts">
import { useFrequencyStore } from '@/stores/frequencyStore'

const frequencyStore = useFrequencyStore()
</script>

<template>
  <div class="frequency-switch">
    <button
      class="switch-track"
      :class="frequencyStore.isFocus ? 'track-focus' : 'track-vibe'"
      @click="frequencyStore.toggle()"
      :aria-label="frequencyStore.isFocus ? '切换到 Vibe 模式' : '切换到 Focus 模式'"
    >
      <!-- 滑块 -->
      <div 
        class="switch-thumb"
        :class="frequencyStore.isFocus ? 'thumb-focus' : 'thumb-vibe'"
      />
      
      <!-- 左侧标签 - Focus -->
      <span 
        class="switch-label label-left"
        :class="{ active: frequencyStore.isFocus }"
      >
        Focus
      </span>
      
      <!-- 右侧标签 - Vibe -->
      <span 
        class="switch-label label-right"
        :class="{ active: frequencyStore.isVibe }"
      >
        Vibe
      </span>
    </button>
  </div>
</template>

<style scoped>
.frequency-switch {
  @apply flex flex-col items-center;
}

.switch-track {
  @apply relative w-32 h-9 rounded-full cursor-pointer transition-all duration-500;
  @apply flex items-center justify-between px-1;
  @apply shadow-morandi-sm hover:shadow-morandi;
}

.track-focus {
  background: linear-gradient(135deg, #E8F0F0, #F0F4F4);
  @apply border;
  border-color: rgba(147, 168, 172, 0.2);
}

.track-vibe {
  background: linear-gradient(135deg, #FDF6F0, #FBF2EA);
  @apply border;
  border-color: rgba(217, 166, 159, 0.2);
}

.switch-thumb {
  @apply absolute w-7 h-7 rounded-full;
  @apply shadow-morandi transition-all duration-500 ease-out;
}

.thumb-focus {
  @apply left-1;
  background: linear-gradient(135deg, #93A8AC, #A6B9A8);
}

.thumb-vibe {
  @apply left-[calc(100%-1.875rem)];
  background: linear-gradient(135deg, #D9A69F, #E8D5B7);
}

.switch-label {
  @apply font-mono text-xs uppercase tracking-wider;
  @apply transition-all duration-300 z-10;
}

.label-left {
  @apply ml-8 text-focus-accent;
}

.label-right {
  @apply mr-2 text-vibe-accent;
}

.switch-label:not(.active) {
  @apply opacity-40;
}

.switch-label.active {
  @apply opacity-100 font-medium;
}
</style>
