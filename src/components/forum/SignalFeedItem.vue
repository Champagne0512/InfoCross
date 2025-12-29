<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Heart,
  MessageCircle,
  Share2,
  Globe,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  Pencil,
} from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import type { ForumThread, ForumComment } from '@/types/models'

const { t } = useI18n()

const props = defineProps<{
  thread: ForumThread
  userCollege?: string
  isLast?: boolean
  liked?: boolean
  bookmarked?: boolean
  comments?: ForumComment[]
  commentsLoading?: boolean
  likedComments?: Set<number>
}>()

const emit = defineEmits<{
  like: [ForumThread]
  comment: [ForumThread]
  share: [ForumThread]
  bookmark: [ForumThread]
  toggleComments: [ForumThread]
  submitComment: [{ thread: ForumThread; content: string; anonymous: boolean }]
  likeComment: [ForumComment]
}>()

// 评论区展开状态
const isCommentsExpanded = ref(false)
const newComment = ref('')
const commentAnonymous = ref(false)
const submitting = ref(false)

// 切换评论区展开
function toggleComments() {
  isCommentsExpanded.value = !isCommentsExpanded.value
  if (isCommentsExpanded.value) {
    emit('toggleComments', props.thread)
  }
}

// 提交评论
async function handleSubmitComment() {
  if (!newComment.value.trim()) return
  submitting.value = true
  emit('submitComment', {
    thread: props.thread,
    content: newComment.value,
    anonymous: commentAnonymous.value,
  })
  newComment.value = ''
  commentAnonymous.value = false
  submitting.value = false
}

// 检查评论是否被点赞
function isCommentLiked(commentId: number): boolean {
  return props.likedComments?.has(commentId) ?? false
}

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

// 检查帖子是否被编辑过
const isEdited = computed(() => {
  if (!props.thread.updatedAt || !props.thread.createdAt) return false
  const created = new Date(props.thread.createdAt).getTime()
  const updated = new Date(props.thread.updatedAt).getTime()
  return updated - created > 60000
})

// 编辑时间
const editedTime = computed(() => {
  if (!props.thread.updatedAt) return ''
  const now = Date.now()
  const updated = new Date(props.thread.updatedAt).getTime()
  const diff = now - updated
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

// 是否是热门帖子
const isHot = computed(() => {
  return props.thread.likeCount >= 10 || props.thread.commentCount >= 5
})

// 是否是新帖子（24小时内）
const isNew = computed(() => {
  const created = new Date(props.thread.createdAt).getTime()
  const now = Date.now()
  return now - created < 24 * 60 * 60 * 1000
})

// 是否是高热度帖子
const isTrending = computed(() => {
  return props.thread.sentimentScore >= 0.8
})
</script>

<template>
  <div class="signal-item">
    <!-- 内容区 -->
    <div class="content-area">
      <!-- 气泡卡片 -->
      <div 
        class="bubble-card" 
        :class="[
          `sentiment-${sentimentColor}`,
          { 'bubble-card--expanded': isCommentsExpanded }
        ]"
      >
        <!-- 装饰性背景图案 -->
        <div class="card-decoration">
          <div class="decoration-circle decoration-circle--1" />
          <div class="decoration-circle decoration-circle--2" />
        </div>

        <!-- 卡片头部：头像 + 用户信息 + 标签 -->
        <div class="card-header">
          <div class="header-left">
            <!-- 头像放在卡片内部 -->
            <div class="avatar" :class="{ 'avatar--hot': isHot, 'avatar--new': isNew }">
              <span class="avatar-text">{{ displayName.charAt(0) }}</span>
            </div>
            <div class="user-info">
              <span class="author font-sans">{{ displayName }}</span>
              <div class="time-info">
                <span class="time font-mono">{{ relativeTime }}</span>
                <span v-if="isEdited" class="edited-indicator font-mono">
                  <Pencil :size="9" />
                  已编辑
                </span>
              </div>
            </div>
          </div>
          
          <!-- 标签栏 -->
          <div class="card-badges">
            <!-- 跨界情报标识 -->
            <div v-if="isCrossCollege" class="cross-badge">
              <Globe :size="12" />
              <span>{{ thread.sourceCollege }}</span>
            </div>
            <!-- 热门标识 -->
            <div v-if="isHot" class="hot-badge">
              <Zap :size="12" />
              <span>热门</span>
            </div>
            <!-- 新帖标识 -->
            <div v-if="isNew && !isHot" class="new-badge">
              <Sparkles :size="12" />
              <span>新鲜</span>
            </div>
            <!-- 趋势标识 -->
            <div v-if="isTrending" class="trending-badge">
              <TrendingUp :size="12" />
            </div>
          </div>
        </div>

        <!-- 正文 -->
        <p class="content-text font-sans">{{ thread.contentText }}</p>

        <!-- 标签 -->
        <div v-if="thread.aiTags.length" class="tags">
          <span 
            v-for="(tag, index) in thread.aiTags.slice(0, 3)" 
            :key="tag" 
            class="tag font-mono"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <span class="tag-hash">#</span>{{ tag }}
          </span>
        </div>

        <!-- 底部信息栏 -->
        <div class="meta-bar">
          <!-- 操作按钮 -->
          <div class="action-bar">
            <button
              class="action-btn like-btn"
              :class="{ 'liked-active': props.liked }"
              @click="emit('like', thread)"
            >
              <Heart :size="15" :fill="props.liked ? 'currentColor' : 'none'" />
              <span v-if="thread.likeCount" class="action-count">{{ thread.likeCount }}</span>
            </button>
            <button 
              class="action-btn comment-btn" 
              :class="{ 'comment-active': isCommentsExpanded }"
              @click="toggleComments"
            >
              <MessageCircle :size="15" />
              <span v-if="thread.commentCount" class="action-count">{{ thread.commentCount }}</span>
              <component :is="isCommentsExpanded ? ChevronUp : ChevronDown" :size="12" class="chevron-icon" />
            </button>
            <button 
              class="action-btn bookmark-btn"
              :class="{ 'bookmarked-active': props.bookmarked }"
              @click="emit('bookmark', thread)"
            >
              <Bookmark :size="15" :fill="props.bookmarked ? 'currentColor' : 'none'" />
            </button>
            <button class="action-btn share-btn" @click="emit('share', thread)">
              <Share2 :size="15" />
            </button>
          </div>

          <!-- 热度指示器 -->
          <div class="heat-indicator" :title="`热度: ${Math.round(thread.sentimentScore * 100)}%`">
            <div class="heat-dots">
              <div
                v-for="i in 5"
                :key="i"
                class="heat-dot"
                :class="i <= heatLevel ? 'heat-active' : 'heat-inactive'"
              />
            </div>
          </div>
        </div>

        <!-- 卡片底部装饰线 -->
        <div class="card-bottom-line" :class="`line-${sentimentColor}`" />
      </div>

      <!-- 展开的评论区 -->
      <Transition name="expand">
        <div v-if="isCommentsExpanded" class="comments-section">
          <!-- 评论输入框 -->
          <div class="comment-input-wrapper">
            <div class="comment-input-row">
              <input
                v-model="newComment"
                type="text"
                class="comment-input font-sans"
                :placeholder="t('forum.writeComment')"
                @keyup.enter="handleSubmitComment"
              />
              <button
                class="send-btn"
                :disabled="!newComment.trim() || submitting"
                @click="handleSubmitComment"
              >
                <Send :size="16" />
              </button>
            </div>
            <label class="anonymous-toggle">
              <input v-model="commentAnonymous" type="checkbox" class="toggle-checkbox" />
              <span class="toggle-text font-mono">{{ t('common.anonymous') }}</span>
            </label>
          </div>

          <!-- 评论列表 -->
          <div v-if="commentsLoading" class="comments-loading">
            <div class="loading-spinner" />
            <span class="font-mono text-xs text-slate">{{ t('forum.loadingComments') }}</span>
          </div>
          <div v-else-if="!comments?.length" class="comments-empty">
            <span class="font-sans text-sm text-slate">{{ t('forum.noComments') }}</span>
          </div>
          <div v-else class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-avatar">
                {{ (comment.authorName || '匿')[0] }}
              </div>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author font-sans">{{ comment.authorName || t('forum.anonymousUser') }}</span>
                  <span class="comment-time font-mono">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
                </div>
                <p class="comment-text font-sans">{{ comment.content }}</p>
                <button
                  class="comment-like-btn font-mono"
                  :class="{ 'comment-liked': isCommentLiked(comment.id) }"
                  @click="emit('likeComment', comment)"
                >
                  <Heart :size="12" :fill="isCommentLiked(comment.id) ? 'currentColor' : 'none'" />
                  {{ comment.likeCount || 0 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.signal-item {
  @apply mb-4;
}

.content-area {
  @apply flex-1;
}

.bubble-card {
  @apply p-5 rounded-2xl;
  @apply border;
  @apply relative overflow-hidden;
  @apply transition-all duration-300;
}

.bubble-card:hover {
  transform: translateY(-1px);
}

.bubble-card--expanded {
  @apply rounded-b-none;
}

/* 装饰性背景 - 已隐藏 */
.card-decoration {
  @apply hidden;
}

.decoration-circle {
  @apply hidden;
}

.decoration-circle--1 {
  @apply hidden;
}

.decoration-circle--2 {
  @apply hidden;
}

/* 纯色背景 */
.bubble-card.sentiment-positive {
  @apply bg-white;
  @apply border-vibe-primary/20;
}

.bubble-card.sentiment-neutral {
  @apply bg-white;
  @apply border-slate/15;
}

.bubble-card.sentiment-negative {
  @apply bg-white;
  @apply border-morandi-clay/20;
}

/* 卡片头部 */
.card-header {
  @apply flex items-start justify-between gap-3 mb-4;
  @apply relative z-10;
}

.header-left {
  @apply flex items-center gap-3;
}

/* 头像样式 - 在卡片内部 */
.avatar {
  @apply w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0;
  @apply bg-mist;
  @apply font-sans font-semibold text-sm text-slate;
  @apply border border-slate/20;
}

.avatar-text {
  @apply relative z-10;
}

.avatar--hot {
  @apply bg-mist;
  @apply text-slate;
}

.avatar--new {
  @apply bg-mist;
  @apply text-slate;
}

.user-info {
  @apply flex flex-col;
}

.time-info {
  @apply flex items-center gap-1.5;
}

.author {
  @apply text-sm text-charcoal font-medium leading-tight;
}

.time {
  @apply text-xs text-slate/70;
}

.edited-indicator {
  @apply inline-flex items-center gap-0.5 text-amber-600 text-xs;
}

/* 标签栏 */
.card-badges {
  @apply flex items-center gap-1.5 flex-wrap;
}

.cross-badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full;
  @apply bg-vibe-accent text-white;
  @apply font-mono text-xs;
}

.hot-badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full;
  @apply bg-gradient-to-r from-amber-500 to-orange-500;
  @apply text-white;
  @apply font-mono text-xs font-medium;
}

.new-badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full;
  @apply bg-gradient-to-r from-emerald-500 to-teal-500;
  @apply text-white;
  @apply font-mono text-xs;
}

.trending-badge {
  @apply inline-flex items-center justify-center w-5 h-5 rounded-full;
  @apply bg-gradient-to-br from-rose-500 to-pink-500;
  @apply text-white;
}

.content-text {
  @apply text-base text-charcoal leading-relaxed;
  @apply relative z-10;
}

.tags {
  @apply flex flex-wrap gap-2 mt-4;
  @apply relative z-10;
}

.tag {
  @apply px-2.5 py-1 rounded-full;
  @apply bg-vibe-primary/10 text-vibe-accent;
  @apply text-xs;
  @apply transition-all duration-200;
  @apply cursor-pointer;
  @apply border border-vibe-primary/10;
}

.tag:hover {
  @apply bg-vibe-primary/20;
  @apply border-vibe-accent/20;
}

.tag-hash {
  @apply opacity-50 mr-0.5;
}

.meta-bar {
  @apply flex items-center justify-between mt-4 pt-3;
  @apply border-t border-slate/10;
  @apply relative z-10;
}

/* 操作栏 - 放在卡片内部 */
.action-bar {
  @apply flex items-center gap-1;
}

.action-btn {
  @apply flex items-center gap-1 px-2.5 py-1.5 rounded-full;
  @apply text-slate/70;
  @apply font-mono text-xs;
  @apply transition-all duration-200;
}

.action-btn:hover {
  @apply bg-slate/5;
}

.action-count {
  @apply font-medium;
}

.chevron-icon {
  @apply ml-0.5 transition-transform duration-200;
}

.like-btn:hover {
  @apply text-rose-500 bg-rose-50;
}

.like-btn.liked-active {
  @apply text-rose-500;
}

.comment-btn:hover {
  @apply text-blue-500 bg-blue-50;
}

.comment-btn.comment-active {
  @apply text-blue-500 bg-blue-50;
}

.comment-btn.comment-active .chevron-icon {
  transform: rotate(180deg);
}

.share-btn:hover {
  @apply text-emerald-500 bg-emerald-50;
}

.bookmark-btn:hover {
  @apply text-amber-500 bg-amber-50;
}

.bookmark-btn.bookmarked-active {
  @apply text-amber-500;
}

/* 热度指示器 */
.heat-indicator {
  @apply cursor-help;
}

.heat-dots {
  @apply flex gap-1;
}

.heat-dot {
  @apply w-1.5 h-1.5 rounded-full transition-all duration-300;
}

.heat-active {
  @apply bg-vibe-accent;
}

.heat-inactive {
  @apply bg-slate/15;
}

/* 卡片底部装饰线 - 已隐藏 */
.card-bottom-line {
  @apply hidden;
}

.line-positive {
  @apply hidden;
}

.line-neutral {
  @apply hidden;
}

.line-negative {
  @apply hidden;
}

/* 评论区展开样式 */
.comments-section {
  @apply mt-0 pt-4 px-5 pb-5;
  @apply bg-white;
  @apply border border-t-0 border-slate/15;
  @apply rounded-b-2xl;
}

.comment-input-wrapper {
  @apply mb-4;
}

.comment-input-row {
  @apply flex gap-2;
}

.comment-input {
  @apply flex-1 px-4 py-2.5 rounded-full;
  @apply bg-white border border-slate/20;
  @apply text-sm text-charcoal;
  @apply focus:outline-none focus:border-vibe-accent/50 focus:ring-2 focus:ring-vibe-accent/10;
  @apply transition-all duration-200;
}

.send-btn {
  @apply w-10 h-10 rounded-full;
  @apply bg-gradient-to-br from-vibe-accent to-vibe-accent/80;
  @apply text-white;
  @apply flex items-center justify-center;
  @apply transition-all duration-200;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.anonymous-toggle {
  @apply flex items-center gap-2 mt-2 ml-2 cursor-pointer;
}

.toggle-checkbox {
  @apply w-3.5 h-3.5 rounded accent-vibe-accent;
}

.toggle-text {
  @apply text-xs text-slate;
}

.comments-loading {
  @apply flex items-center justify-center gap-2 py-6;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-vibe-primary/30 border-t-vibe-accent rounded-full animate-spin;
}

.comments-empty {
  @apply text-center py-6;
  @apply text-slate/60;
}

.comments-list {
  @apply space-y-3;
}

.comment-item {
  @apply flex gap-3 p-3 rounded-xl;
  @apply bg-white/80;
  @apply border border-slate/10;
  @apply transition-all duration-200;
}

.comment-item:hover {
  @apply bg-white;
  @apply border-slate/20;
}

.comment-avatar {
  @apply w-8 h-8 rounded-full flex-shrink-0;
  @apply bg-vibe-primary/20;
  @apply text-vibe-accent;
  @apply flex items-center justify-center;
  @apply font-sans font-semibold text-xs;
  @apply border border-white/50;
}

.comment-body {
  @apply flex-1 min-w-0;
}

.comment-header {
  @apply flex items-center gap-2 mb-1;
}

.comment-author {
  @apply text-xs font-medium text-charcoal;
}

.comment-time {
  @apply text-xs text-slate/60;
}

.comment-text {
  @apply text-sm text-charcoal leading-relaxed;
}

.comment-like-btn {
  @apply inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full;
  @apply text-xs text-slate;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:text-rose-500 hover:bg-rose-50;
}

.comment-like-btn.comment-liked {
  @apply text-rose-500 bg-rose-50;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>
