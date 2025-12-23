<script setup lang="ts">
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { InboxPreview } from '@/types/models'
import EnvelopeCard from './EnvelopeCard.vue'

const props = defineProps<{
  items: InboxPreview[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [InboxPreview]
}>()

const frequencyStore = useFrequencyStore()

function handleSelect(item: InboxPreview) {
  emit('select', item)
}
</script>

<template>
  <div 
    class="list-container"
    :class="frequencyStore.isFocus ? 'list-focus' : 'list-vibe'"
  >
    <!-- 消息列表 -->
    <div class="cards-wrapper">
      <transition-group name="card-transition">
        <EnvelopeCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :active="item.id === selectedId"
          @select="handleSelect"
        />
      </transition-group>
    </div>
    
    <!-- 空状态 -->
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-envelope">
        <div class="empty-flap" />
        <div class="empty-body" />
      </div>
      <p>暂无消息</p>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  @apply relative w-full h-full overflow-y-auto overflow-x-hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.list-container::-webkit-scrollbar {
  width: 6px;
}

.list-container::-webkit-scrollbar-track {
  background: transparent;
}

.list-container::-webkit-scrollbar-thumb {
  @apply rounded-full;
  background: rgba(0, 0, 0, 0.15);
}

.list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

/* Focus 模式滚动条 */
.list-focus::-webkit-scrollbar-thumb {
  background: rgba(122, 154, 158, 0.3);
}

.list-focus::-webkit-scrollbar-thumb:hover {
  background: rgba(122, 154, 158, 0.5);
}

/* Vibe 模式滚动条 */
.list-vibe::-webkit-scrollbar-thumb {
  background: rgba(196, 136, 126, 0.3);
}

.list-vibe::-webkit-scrollbar-thumb:hover {
  background: rgba(196, 136, 126, 0.5);
}

/* 卡片容器 */
.cards-wrapper {
  @apply flex flex-col gap-3 p-4;
}

/* 卡片过渡动画 */
.card-transition-enter-active,
.card-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-transition-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.card-transition-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.card-transition-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 空状态 */
.empty-state {
  @apply absolute inset-0 flex flex-col items-center justify-center gap-4;
}

.empty-envelope {
  @apply relative w-20 h-14;
}

.empty-flap {
  @apply absolute top-0 left-0 right-0 h-6;
  background: linear-gradient(180deg, #E8E4DF 0%, #DDD9D4 100%);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
}

.empty-body {
  @apply absolute bottom-0 left-0 right-0 h-10 rounded-b-lg;
  background: linear-gradient(145deg, #F5F3EF 0%, #E8E6E2 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.empty-state p {
  @apply font-sans text-base text-slate/50;
}
</style>
