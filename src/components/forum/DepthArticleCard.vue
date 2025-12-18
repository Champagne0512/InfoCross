<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Eye, Heart, MessageCircle } from 'lucide-vue-next'
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

const readTimeLabel = computed(() => {
  return `${props.thread.readTimeMinutes || 5} min`
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
    <div v-if="thread.coverUrl" class="cover">
      <img :src="thread.coverUrl" :alt="thread.title" />
    </div>
    <div class="content">
      <div class="meta-row">
        <span class="category-pill font-mono" :class="categoryInfo.color">{{ categoryInfo.label }}</span>
        <span class="date font-mono">{{ formattedDate }}</span>
      </div>
      <h3 class="title font-sans">{{ thread.title || '未命名长文' }}</h3>
      <p class="summary font-sans">{{ thread.summary || thread.contentText }}</p>
      <div class="author-row">
        <div class="author-info">
          <div class="author-avatar">{{ (thread.authorName || '匿')[0] }}</div>
          <div class="author-text">
            <span class="author-name font-sans">{{ thread.authorName || '匿名作者' }}</span>
            <span v-if="thread.sourceCollege" class="author-college font-mono">{{ thread.sourceCollege }}</span>
          </div>
        </div>
      </div>
      <div class="stats-row">
        <span class="stat font-mono"><Clock :size="14" />{{ readTimeLabel }}</span>
        <span class="stat font-mono"><Eye :size="14" />{{ thread.viewCount }}</span>
        <span class="stat font-mono"><Heart :size="14" />{{ thread.likeCount }}</span>
        <span class="stat font-mono"><MessageCircle :size="14" />{{ thread.commentCount }}</span>
      </div>
      <div v-if="thread.aiTags?.length" class="tag-list">
        <span v-for="tag in thread.aiTags.slice(0, 3)" :key="tag" class="tag-pill font-mono">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.depth-card {
  @apply flex flex-col cursor-pointer py-5 px-5 transition-all duration-300 border-b border-slate/10 relative overflow-hidden;
}
.depth-card::before {
  content: '';
  @apply absolute left-0 top-0 bottom-0 w-1 bg-transparent transition-all duration-300;
}
.depth-card:last-child {
  @apply border-b-0;
}
.depth-card:hover {
  @apply bg-focus-primary/5;
}
.depth-card:hover::before {
  @apply bg-focus-primary;
}
.depth-active {
  @apply bg-focus-primary/10;
}
.depth-active::before {
  @apply bg-focus-accent;
}
.cover {
  @apply w-full h-32 rounded-soft overflow-hidden mb-4 relative;
}
.cover img {
  @apply w-full h-full object-cover transition-transform duration-500;
}
.depth-card:hover .cover img {
  @apply scale-105;
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
  @apply text-sm text-slate line-clamp-1;
}
.author-row {
  @apply flex items-center justify-between;
}
.author-info {
  @apply flex items-center gap-2;
}
.author-avatar {
  @apply w-7 h-7 rounded-full bg-focus-primary/20 text-focus-accent flex items-center justify-center text-xs font-semibold;
}
.author-text {
  @apply flex flex-col;
}
.author-name {
  @apply text-sm text-charcoal;
}
.author-college {
  @apply text-xs text-slate;
}
.stats-row {
  @apply flex items-center gap-4;
}
.stat {
  @apply flex items-center gap-1 text-xs text-slate;
}
.tag-list {
  @apply flex flex-wrap gap-1.5 mt-1;
}
.tag-pill {
  @apply px-2 py-0.5 rounded-full text-xs bg-focus-primary/10 text-focus-accent transition-colors duration-200;
}
.depth-card:hover .tag-pill {
  @apply bg-focus-primary/20;
}
</style>
