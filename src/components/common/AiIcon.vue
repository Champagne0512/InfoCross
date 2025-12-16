<template>
  <svg 
    :class="iconClass" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 24L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2Z" 
      :stroke="color" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <path 
      d="M8 14L10.5 11.5L13 14" 
      :stroke="color" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <path 
      d="M10.5 11.5V17.5" 
      :stroke="color" 
      stroke-width="1.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <circle 
      cx="15.5" 
      cy="14.5" 
      r="1" 
      :fill="color"
    />
    <circle 
      cx="15.5" 
      cy="16.5" 
      r="1" 
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  color?: string
}>(), {
  size: 'md',
  color: 'currentColor'
})

const iconClass = computed(() => {
  const baseClass = 'transition-all duration-200'
  switch (props.size) {
    case 'sm':
      return `${baseClass} w-4 h-4`
    case 'lg':
      return `${baseClass} w-8 h-8`
    case 'md':
    default:
      return `${baseClass} w-5 h-5`
  }
})
</script>
