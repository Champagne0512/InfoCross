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
  <label class="flex flex-col gap-2 text-sm font-medium text-ink">
    <span class="font-data text-xs text-ink-soft">{{ props.label }}</span>
    <input
      :value="modelValue"
      :type="props.type ?? 'text'"
      :placeholder="props.placeholder"
      class="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink-soft focus:border-ink"
      :class="{ 'font-data': props.mono }"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
