<script setup lang="ts">
import { computed } from 'vue'
import { Heart, MessageCircle, Share2, Globe } from 'lucide-vue-next'
import type { ForumThread } from '@/types/models'

const props = defineProps<{
  thread: ForumThread
  userCollege?: string
  isLast?: boolean
}>()

const emit = defineEmits<{
  like: [ForumThread]
  comment: [ForumThread]
  share: [ForumThread]
}>()

// 是否是跨界情报
const isCrossCollege = computed(() => {
  return props.userCollege && props.thread.sourceCollege !== props.userCollege
})

// 热度等级 (1-5)
const heatLevel = computed(() => {
  const score = props.thread.sentimentScore
  if (score >= 0.9) return 5
  if (score >= 0.7) return 4
  if (score >= 0.5) return 3
  if (score >= 0.3) return 2
  return 1
})

// 相对时间
const relativeTime = computed(() => {
  const now = Date.now()
  const created = new Date(props.thread.createdAt).getTime()
  const diff = now - created
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
})

// 显示名称
const displayName = computed(() => {
  if (props.thread.isAnonymous) {
    return `某${props.thread.sourceCollege || '学院'}同学`
  }
  return props.thread.authorName || '匿名用户'
})
</script>

<template>
  <div class="signal-item">
    <!-- 时间轴线 -->
    <div class="timeline">
      <!-- 头像 -->
      <div class="avatar">
        {{ displayName.charAt(0) }}
      </div>
      <!-- 连接线 -->
      <div v-if="!isLast" class="timeline-line" />
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <!-- 气泡卡片 -->
      <div class="bubble-card">
        <!-- 跨界情报标识 -->
        <div v-if="isCrossCollege" class="cross-badge">
          <Globe :size="14" />
          <span>{{ thread.sourceCollege }}</span>
        </div>

        <!-- 正文 -->
        <p class="content-text">{{ thread.contentText }}</p>

        <!-- 标签 -->
        <div v-if="thread.aiTags.length" class="tags">
          <span v-for="tag in thread.aiTags.slice(0, 3)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <!-- 底部信息栏 -->
        <div class="meta-bar">
          <div class="meta-left">
            <span class="author">{{ displayName }}</span>
            <span class="time">{{ relativeTime }}</span>
          </div>

          <!-- 热度指示器 -->
          <div class="heat-indicator">
            <div
              v-for="i in 5"
              :key="i"
              class="heat-dot"
              :class="i <= heatLevel ? 'heat-active' : 'heat-inactive'"
            />
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <button class="action-btn" @click="emit('like', thread)">
          <Heart :size="16" />
          <span v-if="thread.likeCount">{{ thread.likeCount }}</span>
        </button>
        <button class="action-btn" @click="emit('comment', thread)">
          <MessageCircle :size="16" />
          <span v-if="thread.commentCount">{{ thread.commentCount }}</span>
        </button>
        <button class="action-btn" @click="emit('share', thread)">
          <Share2 :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signal-item {
  @apply flex gap-4;
}

.timeline {
  @apply flex flex-col items-center;
}

.avatar {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
  @apply bg-vibe-primary/20 text-vibe-accent;
  @apply font-sans font-semibold text-sm;
}

.timeline-line {
  @apply flex-1 w-px bg-slate/15 mt-2;
}

.content-area {
  @apply flex-1 pb-6;
}

.bubble-card {
  @apply p-5 rounded-morandi bg-cream;
  @apply border border-slate/10 shadow-morandi-sm;
  @apply relative;
}

.cross-badge {
  @apply absolute -top-2 right-4;
  @apply inline-flex items-center gap-1 px-2 py-1 rounded-full;
  @apply bg-vibe-primary/20 text-vibe-accent;
  @apply font-mono text-xs;
}

.content-text {
  @apply font-sans text-body text-charcoal leading-relaxed;
}

.tags {
  @apply flex flex-wrap gap-2 mt-4;
}

.tag {
  @apply px-2 py-1 rounded-full;
  @apply bg-slate/10 text-slate;
  @apply font-mono text-xs;
}

.meta-bar {
  @apply flex items-center justify-between mt-4 pt-4 border-t border-slate/10;
}

.meta-left {
  @apply flex items-center gap-3;
}

.author {
  @apply font-sans text-sm text-charcoal;
}

.time {
  @apply font-mono text-xs text-slate;
}

.heat-indicator {
  @apply flex gap-1;
}

.heat-dot {
  @apply w-1.5 h-1.5 rounded-full transition-all;
}

.heat-active {
  @apply bg-vibe-accent;
}

.heat-inactive {
  @apply bg-slate/20;
}

.action-bar {
  @apply flex gap-4 mt-3;
}

.action-btn {
  @apply flex items-center gap-1.5 px-3 py-1.5 rounded-soft;
  @apply text-slate hover:text-vibe-accent hover:bg-vibe-primary/10;
  @apply font-mono text-xs transition-all;
}
</style>
