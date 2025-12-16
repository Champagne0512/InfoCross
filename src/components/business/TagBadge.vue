<script setup lang="ts">
defineProps<{
  label: string
  accent?: boolean
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-3 py-1 font-mono text-mono"
    :class="
      accent
        ? 'ai-tag'
        : 'normal-tag'
    "
  >
    #{{ label }}
  </span>
</template>
