<script setup lang="ts">
import { computed } from 'vue'
import { Eye, Heart, MessageCircle } from 'lucide-vue-next'
import type { ForumThread } from '@/types/models'

const props = defineProps<{
  thread: ForumThread
  active?: boolean
}>()

const emit = defineEmits<{
  select: [ForumThread]
}>()

const categoryConfig: Record<string, { label: string; color: string }> = {
  review: { label: '测评', color: 'bg-morandi-clay/15 text-morandi-clay' },
  guide: { label: '指南', color: 'bg-morandi-green/15 text-morandi-green' },
  discussion: { label: '讨论', color: 'bg-morandi-blue/15 text-morandi-blue' },
  debate: { label: '辩论', color: 'bg-morandi-lavender/15 text-morandi-lavender' },
  question: { label: '提问', color: 'bg-focus-primary/15 text-focus-accent' },
}

const categoryInfo = computed(() => {
  if (!props.thread.category) return { label: 'Depth', color: 'bg-slate/10 text-slate' }
  return categoryConfig[props.thread.category] ?? { label: props.thread.category, color: 'bg-slate/10 text-slate' }
})

const formattedDate = computed(() => {
  const date = new Date(props.thread.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})

function handleSelect() {
  emit('select', props.thread)
}
</script>

<template>
  <article class="depth-card" :class="{ 'depth-active': active }" @click="handleSelect">
    <div class="content">
      <div class="meta-row">
        <span class="category-pill font-mono" :class="categoryInfo.color">{{ categoryInfo.label }}</span>
        <div class="date-info">
          <span class="date font-mono">{{ formattedDate }}</span>
        </div>
      </div>
      <h3 class="title font-sans">{{ thread.title || '未命名长文' }}</h3>
      <p class="summary font-sans">{{ thread.summary || thread.contentText.substring(0, 100) + '...' }}</p>
      
      <div class="author-row">
        <div class="author-info">
          <div class="author-avatar">
            {{ (thread.authorName || '匿').charAt(0).toUpperCase() }}
          </div>
          <span class="author-name font-mono">{{ thread.authorName || '匿名用户' }}</span>
        </div>
        <div class="stats-row">
          <span class="stat font-mono"><Eye :size="14" />{{ thread.viewCount }}</span>
          <span class="stat font-mono"><Heart :size="14" />{{ thread.likeCount }}</span>
          <span class="stat font-mono"><MessageCircle :size="14" />{{ thread.commentCount }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.depth-card {
  @apply flex flex-col cursor-pointer py-4 px-5 transition-all duration-300 border-b border-gray-100 relative overflow-hidden;
  @apply hover:bg-white/50;
}
.depth-card::before {
  content: '';
  @apply absolute left-0 top-0 bottom-0 w-1 bg-transparent transition-all duration-300;
}
.depth-card:last-child {
  @apply border-b-0;
}
.depth-card:hover {
  @apply bg-white/50;
}
.depth-card:hover::before {
  @apply bg-focus-primary/50;
}
.depth-active {
  @apply bg-white shadow-sm;
}
.depth-active::before {
  @apply bg-[#93A8AC] border-l-4;
}
.content {
  @apply flex flex-col gap-3;
}
.meta-row {
  @apply flex items-center justify-between;
}
.category-pill {
  @apply inline-flex items-center px-2.5 py-1 rounded-full text-xs uppercase tracking-wider;
}
.date {
  @apply text-xs text-slate;
}
.title {
  @apply text-h3 font-semibold text-charcoal line-clamp-1 transition-colors duration-200;
}
.depth-card:hover .title,
.depth-active .title {
  @apply text-focus-accent;
}
.summary {
  @apply text-sm text-slate line-clamp-1 leading-relaxed;
}
.author-row {
  @apply flex items-center justify-between mt-2;
}
.author-info {
  @apply flex items-center gap-2;
}
.author-avatar {
  @apply w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600;
}
.author-name {
  @apply text-xs text-slate;
}
.stats-row {
  @apply flex items-center gap-4;
}
.stat {
  @apply flex items-center gap-1 text-xs text-slate;
}
</style>
