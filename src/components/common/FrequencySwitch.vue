<script setup lang="ts">
import { useI18n } from '@/i18n'
import { useFrequencyStore } from '@/stores/frequencyStore'

const { t } = useI18n()
const frequencyStore = useFrequencyStore()
</script>

<template>
  <div class="frequency-switch">
    <button
      class="switch-track"
      :class="frequencyStore.isFocus ? 'track-focus' : 'track-vibe'"
      @click="frequencyStore.toggle()"
      :aria-label="frequencyStore.isFocus ? t('frequency.vibe') : t('frequency.focus')"
    >
      <!-- 滑块 -->
      <div 
        class="switch-thumb"
        :class="frequencyStore.isFocus ? 'thumb-focus' : 'thumb-vibe'"
      />
      
      <!-- 标签容器 - 随状态切换位置 -->
      <div 
        class="labels-container"
        :class="frequencyStore.isFocus ? 'labels-right' : 'labels-left'"
      >
        <span 
          class="switch-label"
          :class="[
            frequencyStore.isFocus ? 'text-focus-accent active' : 'text-focus-accent'
          ]"
        >
          {{ t('frequency.focus') }}
        </span>
        <span 
          class="switch-label"
          :class="[
            frequencyStore.isVibe ? 'text-vibe-accent active' : 'text-vibe-accent'
          ]"
        >
          {{ t('frequency.vibe') }}
        </span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.frequency-switch {
  @apply flex flex-col items-center mt-2;
}

.switch-track {
  @apply relative w-32 h-9 rounded-full cursor-pointer transition-all duration-500;
  @apply flex items-center px-1;
  @apply shadow-morandi-sm hover:shadow-morandi;
  overflow: hidden;
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
  z-index: 10;
}

.thumb-focus {
  @apply left-1;
  background: linear-gradient(135deg, #93A8AC, #A6B9A8);
}

.thumb-vibe {
  @apply left-[calc(100%-1.875rem)];
  background: linear-gradient(135deg, #D9A69F, #E8D5B7);
}

/* 标签容器 */
.labels-container {
  @apply absolute flex gap-2 transition-all duration-500 ease-out;
}

/* Focus状态：标签在右侧（圆形在左） */
.labels-right {
  @apply left-9 right-2;
}

/* Vibe状态：标签在左侧（圆形在右） */
.labels-left {
  @apply left-2 right-9;
}

.switch-label {
  @apply font-mono text-xs uppercase tracking-wider;
  @apply transition-all duration-300;
}

.switch-label:not(.active) {
  @apply opacity-40;
}

.switch-label.active {
  @apply opacity-100 font-medium;
}
</style>
