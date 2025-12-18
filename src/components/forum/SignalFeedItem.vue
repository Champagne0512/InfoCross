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

// 情感颜色
const sentimentColor = computed(() => {
  const score = props.thread.sentimentScore
  if (score >= 0.7) return 'positive'
  if (score <= 0.3) return 'negative'
  return 'neutral'
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
      <div class="bubble-card" :class="`sentiment-${sentimentColor}`">
        <!-- 跨界情报标识 -->
        <div v-if="isCrossCollege" class="cross-badge">
          <Globe :size="14" />
          <span>{{ thread.sourceCollege }}</span>
        </div>

        <!-- 正文 -->
        <p class="content-text font-sans">{{ thread.contentText }}</p>

        <!-- 标签 -->
        <div v-if="thread.aiTags.length" class="tags">
          <span v-for="tag in thread.aiTags.slice(0, 3)" :key="tag" class="tag font-mono">
            #{{ tag }}
          </span>
        </div>

        <!-- 底部信息栏 -->
        <div class="meta-bar">
          <div class="meta-left">
            <span class="author font-sans">{{ displayName }}</span>
            <span class="time font-mono">{{ relativeTime }}</span>
          </div>

          <!-- 热度指示器 -->
          <div class="heat-indicator" :title="`热度: ${Math.round(thread.sentimentScore * 100)}%`">
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
        <button class="action-btn like-btn" @click="emit('like', thread)">
          <Heart :size="16" />
          <span v-if="thread.likeCount">{{ thread.likeCount }}</span>
        </button>
        <button class="action-btn comment-btn" @click="emit('comment', thread)">
          <MessageCircle :size="16" />
          <span v-if="thread.commentCount">{{ thread.commentCount }}</span>
        </button>
        <button class="action-btn share-btn" @click="emit('share', thread)">
          <Share2 :size="16" />
          <span v-if="thread.shareCount">{{ thread.shareCount }}</span>
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
  @apply bg-vibe-primary/30 text-vibe-accent;
  @apply font-sans font-semibold text-sm;
  @apply transition-all duration-300;
  @apply shadow-sm;
}

.signal-item:hover .avatar {
  @apply scale-110 shadow-md;
}

.timeline-line {
  @apply flex-1 w-px bg-vibe-primary/20 mt-2;
  @apply transition-colors duration-300;
}

.content-area {
  @apply flex-1 pb-6;
}

.bubble-card {
  @apply p-5 rounded-morandi;
  @apply border shadow-morandi-sm;
  @apply relative;
  @apply transition-all duration-300;
  @apply hover:shadow-morandi hover:-translate-y-0.5;
}

.bubble-card.sentiment-positive {
  @apply bg-vibe-bg border-vibe-primary/20;
}

.bubble-card.sentiment-neutral {
  @apply bg-cream border-slate/15;
}

.bubble-card.sentiment-negative {
  @apply bg-morandi-clay/5 border-morandi-clay/20;
}

.cross-badge {
  @apply absolute -top-2 right-4;
  @apply inline-flex items-center gap-1 px-2.5 py-1 rounded-full;
  @apply bg-vibe-accent text-white;
  @apply font-mono text-xs;
  @apply shadow-sm;
}

.content-text {
  @apply text-body text-charcoal leading-relaxed;
}

.tags {
  @apply flex flex-wrap gap-2 mt-4;
}

.tag {
  @apply px-2.5 py-1 rounded-full;
  @apply bg-vibe-primary/15 text-vibe-accent;
  @apply text-xs;
  @apply transition-colors duration-200;
  @apply cursor-pointer hover:bg-vibe-primary/25;
}

.meta-bar {
  @apply flex items-center justify-between mt-4 pt-4 border-t border-slate/10;
}

.meta-left {
  @apply flex items-center gap-3;
}

.author {
  @apply text-sm text-charcoal font-medium;
}

.time {
  @apply text-xs text-slate;
}

.heat-indicator {
  @apply flex gap-1 cursor-help;
}

.heat-dot {
  @apply w-2 h-2 rounded-full transition-all duration-300;
}

.heat-active {
  @apply bg-vibe-accent;
  animation: pulse 2s infinite;
}

.heat-inactive {
  @apply bg-slate/20;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.action-bar {
  @apply flex gap-2 mt-3;
}

.action-btn {
  @apply flex items-center gap-1.5 px-3 py-2 rounded-soft;
  @apply text-slate;
  @apply font-mono text-xs;
  @apply transition-all duration-200;
  @apply hover:scale-105;
}

.like-btn:hover {
  @apply text-vibe-accent bg-vibe-primary/10;
}

.comment-btn:hover {
  @apply text-morandi-blue bg-morandi-blue/10;
}

.share-btn:hover {
  @apply text-morandi-green bg-morandi-green/10;
}
</style>
