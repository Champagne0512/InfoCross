<script setup lang="ts">
import { computed } from 'vue'
import type { ForumThread } from '@/types/models'

const props = defineProps<{
  thread: ForumThread
  active?: boolean
}>()

const emit = defineEmits<{
  select: [ForumThread]
}>()

const categoryLabelMap: Record<string, string> = {
  review: 'Review · 测评',
  guide: 'Guide · 指南',
  discussion: 'Discussion · 讨论',
  debate: 'Debate · 辩论',
  question: 'Question · 提问',
}

const categoryLabel = computed(() => {
  if (!props.thread.category) return 'Depth'
  return categoryLabelMap[props.thread.category] ?? props.thread.category
})

const readTimeLabel = computed(() => {
  return `${props.thread.readTimeMinutes || 5} min read`
})

function handleSelect() {
  emit('select', props.thread)
}
</script>

<template>
  <article
    class="depth-card"
    :class="active ? 'depth-active' : ''"
    @click="handleSelect"
  >
    <div class="content">
      <div class="meta-pill">
        {{ categoryLabel }}
      </div>
      <h3 class="title">
        {{ thread.title || '未命名长文' }}
      </h3>
      <p class="summary">
        {{ thread.summary || thread.contentText }}
      </p>
      <div class="meta">
        <div class="author">
          <span>{{ thread.authorName || '匿名作者' }}</span>
          <span v-if="thread.sourceCollege" class="dot" />
          <span v-if="thread.sourceCollege">{{ thread.sourceCollege }}</span>
        </div>
        <div class="read-info">
          <span>{{ readTimeLabel }}</span>
          <span class="dot" />
          <span>{{ new Date(thread.createdAt).toLocaleDateString() }}</span>
        </div>
      </div>
      <div v-if="thread.aiTags?.length" class="tag-list">
        <span v-for="tag in thread.aiTags.slice(0, 3)" :key="tag" class="tag-pill">
          {{ tag }}
        </span>
      </div>
    </div>
    <div v-if="thread.coverUrl" class="cover">
      <img :src="thread.coverUrl" :alt="thread.title" />
    </div>
  </article>
</template>

<style scoped>
.depth-card {
  @apply flex items-stretch gap-4 cursor-pointer;
  @apply py-6 px-4 transition-all duration-300;
  @apply border-b border-slate/10;
}

.depth-card:last-child {
  @apply border-b-0;
}

.depth-card:hover {
  @apply bg-slate/5;
}

.depth-active {
  @apply bg-white shadow-morandi-lg rounded-morandi;
}

.content {
  @apply flex-1 flex flex-col gap-3;
}

.meta-pill {
  @apply inline-flex items-center px-3 py-1 rounded-full;
  @apply font-mono text-xs uppercase tracking-widest;
  @apply bg-morandi-blue/15 text-morandi-blue;
}

.title {
  @apply font-sans text-2xl font-semibold text-charcoal;
}

.summary {
  @apply font-sans text-body text-slate;
}

.meta {
  @apply flex flex-wrap items-center gap-3 text-sm text-slate;
}

.author,
.read-info {
  @apply flex items-center gap-2 font-mono text-xs;
}

.dot {
  @apply w-1 h-1 rounded-full bg-slate/50 inline-block;
}

.tag-list {
  @apply flex flex-wrap gap-2 mt-2;
}

.tag-pill {
  @apply px-2.5 py-1 rounded-full font-mono text-xs;
  @apply bg-morandi-clay/15 text-morandi-clay;
}

.cover {
  @apply w-32 h-24 rounded-xl overflow-hidden flex-shrink-0;
}

.cover img {
  @apply w-full h-full object-cover;
}
</style>
