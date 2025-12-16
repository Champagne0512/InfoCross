<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'ghost' | 'ai'

const props = defineProps<{
  variant?: Variant
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const emit = defineEmits<{
  click: [MouseEvent]
}>()

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-soft font-sans font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  const variants: Record<Variant, string> = {
    primary: 'px-6 py-3 bg-charcoal text-white hover:bg-charcoal/90 hover:shadow-morandi-lg hover:scale-105 active:scale-95',
    secondary: 'px-6 py-3 bg-morandi-green text-white hover:bg-morandi-green/90 hover:shadow-morandi-lg hover:scale-105 active:scale-95',
    ghost: 'px-5 py-3 bg-transparent border border-slate/20 text-slate hover:bg-slate/5 hover:text-charcoal hover:border-slate/40',
    ai: 'px-6 py-3 bg-morandi-lavender text-white hover:bg-morandi-lavender/90 hover:shadow-morandi-lg hover:scale-105 active:scale-95',
  }
  return `${base} ${variants[props.variant ?? 'primary']}`
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
