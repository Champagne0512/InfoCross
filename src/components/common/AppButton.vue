<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'ghost' | 'pill'

const props = defineProps<{
  variant?: Variant
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const emit = defineEmits<{
  click: [MouseEvent]
}>()

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'
  const variants: Record<Variant, string> = {
    primary: 'bg-ink text-white border-ink px-6 py-2 hover:translate-y-0.5 active:scale-[0.97]',
    secondary:
      'bg-intelligence text-white border-intelligence px-6 py-2 shadow-subtle hover:bg-intelligence/90',
    ghost:
      'bg-transparent border-border text-ink px-5 py-2 hover:border-ink hover:text-ink active:translate-y-0.5',
    pill: 'bg-neutral border-border text-ink px-4 py-1 text-xs font-mono uppercase tracking-[0.3em]',
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
