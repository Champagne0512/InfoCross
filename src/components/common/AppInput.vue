<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: string
  type?: string
  placeholder?: string
  mono?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()
</script>

<template>
  <label class="flex flex-col gap-2 text-body font-body font-medium">
    <span class="font-mono text-mono text-text-secondary uppercase tracking-wider">{{ props.label }}</span>
    <input
      :value="modelValue"
      :type="props.type ?? 'text'"
      :placeholder="props.placeholder"
      class="w-full px-4 py-3 rounded-button glass-card border-glass-border focus:border-neon-cyan/50 focus:shadow-glow-cyan focus:outline-none transition-all duration-300"
      :class="{ 'font-mono text-mono': props.mono }"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
