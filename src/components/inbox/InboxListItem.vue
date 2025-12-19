<script setup lang="ts">
import { computed } from 'vue'
import { Heart, FileText, Bell } from 'lucide-vue-next'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { InboxPreview } from '@/types/models'

const props = defineProps<{
  item: InboxPreview
  active?: boolean
}>()

const emit = defineEmits<{
  select: [InboxPreview]
}>()

const frequencyStore = useFrequencyStore()

const avatarKind = computed(() => {
  if (props.item.category === 'chats' && props.item.avatarUrl) {
    return { type: 'avatar', value: props.item.avatarUrl }
  }
  if (props.item.category === 'applications') {
    return { type: 'icon', value: 'file' }
  }
  if (props.item.category === 'activity') {
    return { type: 'icon', value: 'heart' }
  }
  return { type: 'icon', value: 'bell' }
})

const timestamp = computed(() => {
  const diff = Date.now() - new Date(props.item.timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
})

function handleClick() {
  emit('select', props.item)
}
</script>

<template>
  <button
    class="list-item"
    :class="[
      active 
        ? (frequencyStore.isFocus ? 'item-active-focus' : 'item-active-vibe')
        : 'item-inactive'
    ]"
    @click="handleClick"
  >
    <div class="item-content">
      <!-- 头像/图标 -->
      <div class="item-avatar">
        <div v-if="avatarKind.type === 'avatar'" class="avatar-img">
          <img :src="avatarKind.value" :alt="item.title" />
        </div>
        <div 
          v-else 
          class="avatar-icon"
          :class="[
            avatarKind.value === 'heart' && 'icon-heart',
            avatarKind.value === 'file' && 'icon-file',
            avatarKind.value === 'bell' && 'icon-bell'
          ]"
        >
          <Heart v-if="avatarKind.value === 'heart'" :size="20" />
          <FileText v-else-if="avatarKind.value === 'file'" :size="20" />
          <Bell v-else :size="20" />
        </div>
      </div>

      <!-- 内容 -->
      <div class="item-info">
        <div class="info-top">
          <p class="item-title">{{ item.title }}</p>
          <span class="item-time">{{ timestamp }}</span>
        </div>
        <p class="item-preview">{{ item.preview }}</p>
      </div>

      <!-- 未读标记 -->
      <span
        v-if="item.unread"
        class="unread-dot"
        :class="frequencyStore.isFocus ? 'dot-focus' : 'dot-vibe'"
      />
    </div>
  </button>
</template>

<style scoped>
.list-item {
  @apply w-full text-left rounded-xl px-4 py-4 transition-all duration-200;
}

.item-inactive {
  @apply hover:bg-slate/5;
}

.item-active-focus {
  @apply bg-focus-primary/10;
}

.item-active-vibe {
  @apply bg-vibe-primary/10;
}

.item-content {
  @apply flex items-center gap-4;
}

/* 头像 */
.item-avatar {
  @apply flex-shrink-0;
}

.avatar-img {
  @apply w-12 h-12 rounded-full overflow-hidden;
}

.avatar-img img {
  @apply w-full h-full object-cover;
}

.avatar-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
}

.icon-heart {
  @apply bg-pink-50 text-pink-500;
}

.icon-file {
  @apply bg-sky-50 text-sky-600;
}

.icon-bell {
  @apply bg-slate/10 text-slate;
}

/* 内容 */
.item-info {
  @apply flex-1 min-w-0;
}

.info-top {
  @apply flex items-center justify-between gap-2;
}

.item-title {
  @apply font-sans text-base font-medium text-charcoal truncate;
}

.item-time {
  @apply font-mono text-xs text-slate flex-shrink-0;
}

.item-preview {
  @apply font-sans text-sm text-slate/70 truncate mt-1;
}

/* 未读标记 */
.unread-dot {
  @apply w-2.5 h-2.5 rounded-full flex-shrink-0;
}

.dot-focus {
  @apply bg-focus-accent;
}

.dot-vibe {
  @apply bg-vibe-accent;
}
</style>
