<script setup lang="ts">
import { Radio, BookOpen } from 'lucide-vue-next'
import { useFrequencyStore } from '@/stores/frequencyStore'

type SpectrumMode = 'signal' | 'depth'

const props = withDefaults(
  defineProps<{
    modelValue: SpectrumMode
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SpectrumMode]
}>()

const frequencyStore = useFrequencyStore()

function selectMode(mode: SpectrumMode) {
  emit('update:modelValue', mode)
}
</script>

<template>
  <div class="spectrum-tabs" :class="{ 'spectrum-tabs-compact': compact }">
    <div class="tabs-container" :class="frequencyStore.isFocus ? 'tabs-focus' : 'tabs-vibe'">
      <!-- Depth 按钮 (Focus 模式) -->
      <button
        class="tab-button"
        :class="modelValue === 'depth' ? 'tab-depth-active' : 'tab-inactive'"
        @click="selectMode('depth')"
      >
        <BookOpen class="tab-icon" :size="18" />
        <span class="tab-label font-mono">Depth</span>
        <span class="tab-desc font-sans">深潜</span>
      </button>

      <!-- Signal 按钮 (Vibe 模式) -->
      <button
        class="tab-button"
        :class="modelValue === 'signal' ? 'tab-signal-active' : 'tab-inactive'"
        @click="selectMode('signal')"
      >
        <Radio class="tab-icon" :size="18" />
        <span class="tab-label font-mono">Signal</span>
        <span class="tab-desc font-sans">情报</span>
      </button>
    </div>

    <!-- 模式说明 - 非紧凑模式下显示在下方 -->
    <Transition v-if="!compact" name="fade" mode="out-in">
      <p v-if="modelValue === 'depth'" key="depth" class="mode-hint font-mono text-focus-accent">
        Focus Mode · 深度聚焦
      </p>
      <p v-else key="signal" class="mode-hint font-mono text-vibe-accent">
        Vibe Mode · 生活脉动
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.spectrum-tabs {
  @apply flex flex-col items-center gap-3;
}

.tabs-container {
  @apply inline-flex rounded-full p-1.5;
  @apply backdrop-blur-sm shadow-morandi;
  @apply border transition-all duration-500;
}

.tabs-focus {
  @apply bg-white/90 border-focus-primary/20;
}

.tabs-vibe {
  @apply bg-white/90 border-vibe-primary/20;
}

.tab-button {
  @apply flex items-center gap-2 px-6 py-3 rounded-full;
  @apply font-sans text-sm font-medium;
  @apply transition-all duration-300;
  @apply relative overflow-hidden;
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
  @apply flex-shrink-0 transition-transform duration-300;
}

.tab-button:hover .tab-icon {
  @apply scale-110;
}

.tab-label {
  @apply text-xs uppercase tracking-wider;
}

.tab-desc {
  @apply hidden sm:inline text-xs opacity-80;
}

.mode-hint {
  @apply text-xs tracking-wider uppercase;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
