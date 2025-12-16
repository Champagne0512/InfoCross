<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'neon' | 'glass' | 'primary'

const props = defineProps<{
  variant?: Variant
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const emit = defineEmits<{
  click: [MouseEvent]
}>()

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-medium transition-all duration-300 focus-visible:outline-none'
  
  const variants: Record<Variant, string> = {
    neon: 'neon-button',
    glass: 'glass-button',
    primary: 'px-6 py-3 rounded-button bg-neon-purple/80 border border-neon-purple/50 text-white hover:bg-neon-purple hover:shadow-glow-purple'
  }

  return `${base} ${variants[props.variant ?? 'neon']}`
})

function onClick(event: MouseEvent) {
  if (props.loading) return
  emit('click', event)
}
</script>

<template>
  <button :type="props.type ?? 'button'" :class="classes" :disabled="loading" @click="onClick">
    <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" />
    <slot />
  </button>
</template>
