<script setup lang="ts">
defineProps<{
  label: string
  accent?: boolean
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-3 py-1 rounded-full font-mono text-mono text-xs uppercase tracking-wider transition-all duration-300"
    :class="
      accent
        ? 'bg-morandi-lavender/15 text-morandi-lavender border border-morandi-lavender/30'
        : 'bg-morandi-green/10 text-morandi-green border border-morandi-green/20'
    "
  >
    #{{ label }}
  </span>
</template>
