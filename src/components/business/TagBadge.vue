<script setup lang="ts">
defineProps<{
  label: string
  accent?: boolean
}>()
</script>

<template>
  <span
    class="tag-pill"
    :class="{ 'is-accent': accent }"
  >
    #{{ label }}
  </span>
</template>
