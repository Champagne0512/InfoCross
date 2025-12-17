import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type FrequencyMode = 'focus' | 'vibe'

export const useFrequencyStore = defineStore('frequency', () => {
  const mode = ref<FrequencyMode>('focus')

  const isFocus = computed(() => mode.value === 'focus')
  const isVibe = computed(() => mode.value === 'vibe')

  // 模式配置
  const config = computed(() => {
    if (mode.value === 'focus') {
      return {
        name: 'Focus',
        label: '深度聚焦',
        desc: '跨学科科研、长期项目、深度交流',
        bgClass: 'bg-focus-bg',
        primaryColor: 'focus-primary',
        accentColor: 'focus-accent',
        cardBg: 'bg-card-focus',
      }
    }
    return {
      name: 'Vibe',
      label: '生活脉动',
      desc: '即时约伴、限时动态、轻松社交',
      bgClass: 'bg-vibe-bg',
      primaryColor: 'vibe-primary',
      accentColor: 'vibe-accent',
      cardBg: 'bg-card-vibe',
    }
  })

  function toggle() {
    mode.value = mode.value === 'focus' ? 'vibe' : 'focus'
  }

  function setMode(newMode: FrequencyMode) {
    mode.value = newMode
  }

  return {
    mode,
    isFocus,
    isVibe,
    config,
    toggle,
    setMode,
  }
})
