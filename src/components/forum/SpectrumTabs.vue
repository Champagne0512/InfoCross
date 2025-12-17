<script setup lang="ts">
import { Radio, BookOpen } from 'lucide-vue-next'

type SpectrumMode = 'signal' | 'depth'

const props = defineProps<{
  modelValue: SpectrumMode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SpectrumMode]
}>()

function selectMode(mode: SpectrumMode) {
  emit('update:modelValue', mode)
}
</script>

<template>
  <div class="spectrum-tabs">
    <div class="tabs-container">
      <!-- Depth 按钮 -->
      <button
        class="tab-button"
        :class="modelValue === 'depth' ? 'tab-depth-active' : 'tab-inactive'"
        @click="selectMode('depth')"
      >
        <BookOpen class="tab-icon" :size="18" />
        <span class="tab-label">Depth</span>
        <span class="tab-desc">深潜</span>
      </button>

      <!-- Signal 按钮 -->
      <button
        class="tab-button"
        :class="modelValue === 'signal' ? 'tab-signal-active' : 'tab-inactive'"
        @click="selectMode('signal')"
      >
        <Radio class="tab-icon" :size="18" />
        <span class="tab-label">Signal</span>
        <span class="tab-desc">情报</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.spectrum-tabs {
  @apply flex justify-center;
}

.tabs-container {
  @apply inline-flex rounded-full p-1.5;
  @apply bg-white/80 backdrop-blur-sm shadow-morandi;
  @apply border border-slate/10;
}

.tab-button {
  @apply flex items-center gap-2 px-6 py-3 rounded-full;
  @apply font-sans text-sm font-medium;
  @apply transition-all duration-300;
}

.tab-inactive {
  @apply text-slate hover:text-charcoal hover:bg-slate/5;
}

.tab-signal-active {
  @apply text-white;
  background: linear-gradient(135deg, #D9A69F, #C4887E);
  box-shadow: 0 6px 20px rgba(196, 136, 126, 0.35);
}

.tab-depth-active {
  @apply text-white;
  background: linear-gradient(135deg, #93A8AC, #7A9A9E);
  box-shadow: 0 6px 20px rgba(122, 154, 158, 0.35);
}

.tab-icon {
  @apply flex-shrink-0;
}

.tab-label {
  @apply font-mono text-xs uppercase tracking-wider;
}

.tab-desc {
  @apply hidden sm:inline text-xs opacity-80;
}
</style>
