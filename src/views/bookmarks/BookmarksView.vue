<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bookmark, ArrowLeft, Heart, MessageCircle, Clock, Eye } from 'lucide-vue-next'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { ForumThread } from '@/types/models'

const router = useRouter()
const frequencyStore = useFrequencyStore()

const loading = ref(true)
const bookmarkedThreads = ref<ForumThread[]>([])

// 模拟数据 - 包含 Focus 和 Vibe 两种模式的内容
onMounted(async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  bookmarkedThreads.value = [
    // Focus 模式内容 (depth 类型)
    {
      id: 1,
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
      authorId: 'user1',
      authorName: '张三',
      isAnonymous: false,
      type: 'depth',
      category: 'guide',
      title: '如何高效准备期末考试：我的复习方法论',
      contentText: '期末季来临，分享一下我这几年总结的复习方法...',
      summary: '一份详细的期末复习指南，包含时间管理、记忆技巧和心态调整。',
      aiTags: ['学习方法', '期末', '经验分享'],
      sentimentScore: 0.9,
      readTimeMinutes: 8,
      viewCount: 1520,
      likeCount: 328,
      commentCount: 67,
      shareCount: 89,
      bookmarkCount: 156,
      sourceCollege: '教育学院',
    },
    {
      id: 2,
      createdAt: '2024-12-19T15:30:00Z',
      updatedAt: '2024-12-19T15:30:00Z',
      authorId: 'user2',
      authorName: '李四',
      isAnonymous: false,
      type: 'depth',
      category: 'review',
      title: '深度解析：2024年人工智能发展趋势',
      contentText: '从 GPT-4 到多模态大模型，AI 领域正在经历前所未有的变革...',
      summary: '全面分析 2024 年 AI 领域的重大突破和未来发展方向。',
      aiTags: ['AI', '技术趋势', '深度分析'],
      sentimentScore: 0.85,
      readTimeMinutes: 12,
      viewCount: 2340,
      likeCount: 456,
      commentCount: 89,
      shareCount: 123,
      bookmarkCount: 234,
      sourceCollege: '计算机学院',
    },
    // Vibe 模式内容 (signal 类型)
    {
      id: 3,
      createdAt: '2024-12-18T09:00:00Z',
      updatedAt: '2024-12-18T09:00:00Z',
      authorId: 'user3',
      authorName: '王五',
      isAnonymous: false,
      type: 'signal',
      contentText: '今天在图书馆发现了一个超棒的自习角落，安静又有阳光，分享给大家！',
      aiTags: ['学习', '图书馆'],
      sentimentScore: 0.8,
      readTimeMinutes: 1,
      viewCount: 234,
      likeCount: 56,
      commentCount: 12,
      shareCount: 5,
      bookmarkCount: 23,
      sourceCollege: '计算机学院',
    },
    {
      id: 4,
      createdAt: '2024-12-17T14:00:00Z',
      updatedAt: '2024-12-17T14:00:00Z',
      authorId: 'user4',
      authorName: '赵六',
      isAnonymous: true,
      type: 'signal',
      contentText: '食堂新出的麻辣香锅真的绝了，强烈推荐！二楼窗口，排队的人不多。',
      aiTags: ['美食', '食堂', '推荐'],
      sentimentScore: 0.85,
      readTimeMinutes: 1,
      viewCount: 456,
      likeCount: 89,
      commentCount: 34,
      shareCount: 12,
      bookmarkCount: 45,
      sourceCollege: '商学院',
    },
    {
      id: 5,
      createdAt: '2024-12-16T20:00:00Z',
      updatedAt: '2024-12-16T20:00:00Z',
      authorId: 'user5',
      authorName: '小明',
      isAnonymous: false,
      type: 'signal',
      contentText: '周末有人一起去爬山吗？计划去紫金山，轻松休闲路线，欢迎约伴！',
      aiTags: ['约伴', '户外', '周末'],
      sentimentScore: 0.9,
      readTimeMinutes: 1,
      viewCount: 178,
      likeCount: 34,
      commentCount: 28,
      shareCount: 8,
      bookmarkCount: 15,
      sourceCollege: '体育学院',
    },
  ]
  loading.value = false
})

// 根据模式筛选收藏
const filteredBookmarks = computed(() => {
  if (frequencyStore.isFocus) {
    return bookmarkedThreads.value.filter(t => t.type === 'depth')
  }
  return bookmarkedThreads.value.filter(t => t.type === 'signal')
})

const relativeTime = (dateStr: string) => {
  const now = Date.now()
  const created = new Date(dateStr).getTime()
  const diff = now - created
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

function removeBookmark(thread: ForumThread) {
  bookmarkedThreads.value = bookmarkedThreads.value.filter(t => t.id !== thread.id)
}

function goToThread(thread: ForumThread) {
  router.push(`/forum?thread=${thread.id}`)
}
</script>

<template>
  <div class="bookmarks-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="router.back()">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-info">
          <h1 class="page-title">我的收藏</h1>
          <p class="page-desc">
            {{ filteredBookmarks.length }} 篇{{ frequencyStore.isFocus ? '深度文章' : '动态信号' }}
          </p>
        </div>
      </div>
    </header>

    <!-- 收藏列表 -->
    <section class="bookmarks-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-line w-3/4 h-5"></div>
          <div class="skeleton-line w-full h-4 mt-3"></div>
          <div class="skeleton-line w-1/2 h-3 mt-4"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!filteredBookmarks.length" class="empty-state">
        <div class="empty-icon" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
          <Bookmark :size="32" />
        </div>
        <p class="empty-text">
          暂无{{ frequencyStore.isFocus ? '深度文章' : '动态信号' }}收藏
        </p>
        <button 
          class="empty-action"
          :class="frequencyStore.isFocus ? 'action-focus' : 'action-vibe'"
          @click="router.push('/forum')"
        >
          去论坛看看
        </button>
      </div>

      <!-- Focus 模式：深度文章列表 -->
      <div v-else-if="frequencyStore.isFocus" class="depth-list">
        <article
          v-for="thread in filteredBookmarks"
          :key="thread.id"
          class="depth-card"
          @click="goToThread(thread)"
        >
          <div class="depth-content">
            <div class="depth-header">
              <span class="category-badge">
                {{ thread.category === 'guide' ? 'Guide' : thread.category === 'review' ? 'Review' : 'Post' }}
              </span>
              <span class="depth-time">{{ relativeTime(thread.createdAt) }}</span>
            </div>
            <h3 class="depth-title">{{ thread.title }}</h3>
            <p class="depth-summary">{{ thread.summary || thread.contentText }}</p>
            <div class="depth-meta">
              <div class="meta-author">
                <div class="author-avatar">{{ thread.authorName?.charAt(0) || 'U' }}</div>
                <span class="author-name">{{ thread.authorName }}</span>
              </div>
              <div class="meta-stats">
                <span class="stat-item">
                  <Clock :size="14" />
                  {{ thread.readTimeMinutes }} min
                </span>
                <span class="stat-item">
                  <Eye :size="14" />
                  {{ thread.viewCount }}
                </span>
                <span class="stat-item">
                  <Heart :size="14" />
                  {{ thread.likeCount }}
                </span>
                <span class="stat-item">
                  <Bookmark :size="14" />
                  {{ thread.bookmarkCount }}
                </span>
              </div>
            </div>
          </div>
          <button class="remove-btn-depth" @click.stop="removeBookmark(thread)">
            取消收藏
          </button>
        </article>
      </div>

      <!-- Vibe 模式：信号卡片列表 -->
      <div v-else class="signal-list">
        <div
          v-for="thread in filteredBookmarks"
          :key="thread.id"
          class="signal-card"
          @click="goToThread(thread)"
        >
          <div class="signal-header">
            <div class="signal-author">
              <div class="author-avatar-vibe">{{ thread.authorName?.charAt(0) || '?' }}</div>
              <div class="author-info">
                <span class="author-name-vibe">
                  {{ thread.isAnonymous ? `某${thread.sourceCollege}同学` : thread.authorName }}
                </span>
                <span class="signal-time">{{ relativeTime(thread.createdAt) }}</span>
              </div>
            </div>
          </div>
          <p class="signal-content">{{ thread.contentText }}</p>
          <div v-if="thread.aiTags.length" class="signal-tags">
            <span v-for="tag in thread.aiTags.slice(0, 3)" :key="tag" class="signal-tag">
              #{{ tag }}
            </span>
          </div>
          <div class="signal-footer">
            <div class="signal-stats">
              <span class="stat">
                <Heart :size="14" />
                {{ thread.likeCount }}
              </span>
              <span class="stat">
                <MessageCircle :size="14" />
                {{ thread.commentCount }}
              </span>
              <span class="stat">
                <Bookmark :size="14" />
                {{ thread.bookmarkCount }}
              </span>
            </div>
            <button class="remove-btn-signal" @click.stop="removeBookmark(thread)">
              取消收藏
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bookmarks-page {
  @apply space-y-6;
}

/* 头部 */
.page-header {
  @apply flex items-center gap-4 pb-6 border-b border-slate/10;
}

.header-left {
  @apply flex items-center gap-4;
}

.back-btn {
  @apply p-2 rounded-full text-slate hover:bg-slate/5 transition-colors;
}

.header-info {
  @apply space-y-1;
}

.page-title {
  @apply text-2xl font-sans font-bold text-charcoal;
}

.page-desc {
  @apply text-sm font-sans text-slate;
}


/* 列表 */
.bookmarks-list {
  @apply space-y-4;
}

/* 加载状态 */
.loading-state {
  @apply space-y-4;
}

.skeleton-card {
  @apply p-5 rounded-2xl bg-white/60 animate-pulse;
}

.skeleton-line {
  @apply bg-slate/10 rounded;
}

/* 空状态 */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply w-20 h-20 rounded-full flex items-center justify-center mb-4;
}

.icon-focus {
  @apply bg-focus-primary/10 text-focus-accent;
}

.icon-vibe {
  @apply bg-vibe-primary/10 text-vibe-accent;
}

.empty-text {
  @apply font-sans text-base text-slate mb-4;
}

.empty-action {
  @apply px-5 py-2 rounded-full font-sans text-sm font-medium text-white transition-all;
}

.action-focus {
  @apply bg-focus-accent hover:bg-focus-accent/90;
}

.action-vibe {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}

/* Focus 模式：深度文章 */
.depth-list {
  @apply space-y-4;
}

.depth-card {
  @apply flex items-start justify-between gap-4 p-6 rounded-2xl bg-white border border-slate/10;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:shadow-morandi hover:border-focus-primary/20;
}

.depth-content {
  @apply flex-1 min-w-0;
}

.depth-header {
  @apply flex items-center gap-3 mb-3;
}

.category-badge {
  @apply px-3 py-1 rounded-full bg-focus-primary/15 text-focus-accent;
  @apply font-mono text-xs uppercase tracking-wider;
}

.depth-time {
  @apply font-mono text-xs text-slate;
}

.depth-title {
  @apply font-sans text-lg font-semibold text-charcoal mb-2 line-clamp-2;
  @apply transition-colors;
}

.depth-card:hover .depth-title {
  @apply text-focus-accent;
}

.depth-summary {
  @apply font-sans text-sm text-slate leading-relaxed line-clamp-2 mb-4;
}

.depth-meta {
  @apply flex items-center justify-between;
}

.meta-author {
  @apply flex items-center gap-2;
}

.author-avatar {
  @apply w-6 h-6 rounded-full flex items-center justify-center;
  @apply bg-focus-primary/20 text-focus-accent;
  @apply font-sans text-xs font-semibold;
}

.author-name {
  @apply font-sans text-sm text-charcoal;
}

.meta-stats {
  @apply flex items-center gap-4;
}

.stat-item {
  @apply flex items-center gap-1 font-mono text-xs text-slate;
}

.remove-btn-depth {
  @apply px-3 py-1.5 rounded-full font-sans text-xs text-slate flex-shrink-0;
  @apply bg-slate/5 hover:bg-red-50 hover:text-red-500 transition-colors;
}

/* Vibe 模式：信号卡片 */
.signal-list {
  @apply space-y-4;
}

.signal-card {
  @apply p-5 rounded-2xl bg-white border border-slate/10;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:shadow-morandi hover:border-vibe-primary/20;
}

.signal-header {
  @apply mb-3;
}

.signal-author {
  @apply flex items-center gap-3;
}

.author-avatar-vibe {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
  @apply bg-vibe-primary/20 text-vibe-accent;
  @apply font-sans font-semibold text-sm;
}

.author-info {
  @apply flex flex-col;
}

.author-name-vibe {
  @apply font-sans text-sm font-medium text-charcoal;
}

.signal-time {
  @apply font-mono text-xs text-slate;
}

.signal-content {
  @apply font-sans text-base text-charcoal leading-relaxed mb-3;
}

.signal-tags {
  @apply flex flex-wrap gap-2 mb-4;
}

.signal-tag {
  @apply px-2.5 py-1 rounded-full bg-vibe-primary/15 text-vibe-accent;
  @apply font-mono text-xs;
}

.signal-footer {
  @apply flex items-center justify-between pt-4 border-t border-slate/10;
}

.signal-stats {
  @apply flex items-center gap-4;
}

.stat {
  @apply flex items-center gap-1 font-mono text-xs text-slate;
}

.remove-btn-signal {
  @apply px-3 py-1.5 rounded-full font-sans text-xs text-slate;
  @apply bg-slate/5 hover:bg-red-50 hover:text-red-500 transition-colors;
}
</style>
