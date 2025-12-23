<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Heart, MessageCircle, Bookmark, Eye, Clock, Edit, Trash2 } from 'lucide-vue-next'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { ForumThread } from '@/types/models'

const router = useRouter()
const frequencyStore = useFrequencyStore()

const loading = ref(true)
const myPosts = ref<ForumThread[]>([])

// 模拟数据
onMounted(async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  myPosts.value = [
    {
      id: 1,
      createdAt: '2024-12-21T10:00:00Z',
      updatedAt: '2024-12-21T10:00:00Z',
      authorId: 'current-user',
      authorName: 'ChenChen',
      isAnonymous: false,
      type: 'depth',
      category: 'guide',
      title: '我的编程学习之路：从零基础到全栈开发',
      contentText: '分享我这两年的编程学习经验...',
      summary: '一份完整的编程学习路线图，包含资源推荐和学习方法。',
      aiTags: ['编程', '学习路线', '经验分享'],
      sentimentScore: 0.9,
      readTimeMinutes: 10,
      viewCount: 3456,
      likeCount: 567,
      commentCount: 89,
      shareCount: 123,
      bookmarkCount: 234,
      sourceCollege: '计算机学院',
    },
    {
      id: 2,
      createdAt: '2024-12-20T15:30:00Z',
      updatedAt: '2024-12-20T15:30:00Z',
      authorId: 'current-user',
      authorName: 'ChenChen',
      isAnonymous: false,
      type: 'signal',
      contentText: '今天在实验室调了一整天的 bug，终于找到问题了！原来是一个小小的拼写错误，教训深刻。',
      aiTags: ['编程', 'debug', '日常'],
      sentimentScore: 0.75,
      readTimeMinutes: 1,
      viewCount: 456,
      likeCount: 78,
      commentCount: 23,
      shareCount: 5,
      bookmarkCount: 12,
      sourceCollege: '计算机学院',
    },
    {
      id: 3,
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T09:00:00Z',
      authorId: 'current-user',
      authorName: 'ChenChen',
      isAnonymous: false,
      type: 'depth',
      category: 'review',
      title: 'Vue 3 Composition API 实战总结',
      contentText: '使用 Vue 3 开发项目的一些心得体会...',
      summary: 'Vue 3 Composition API 的实战经验和最佳实践。',
      aiTags: ['Vue3', '前端', '技术分享'],
      sentimentScore: 0.88,
      readTimeMinutes: 8,
      viewCount: 2345,
      likeCount: 345,
      commentCount: 56,
      shareCount: 78,
      bookmarkCount: 156,
      sourceCollege: '计算机学院',
    },
    {
      id: 4,
      createdAt: '2024-12-18T14:00:00Z',
      updatedAt: '2024-12-18T14:00:00Z',
      authorId: 'current-user',
      authorName: 'ChenChen',
      isAnonymous: false,
      type: 'signal',
      contentText: '推荐一个超好用的 VS Code 插件：GitHub Copilot，写代码效率提升了好多！',
      aiTags: ['工具推荐', 'VSCode', '效率'],
      sentimentScore: 0.92,
      readTimeMinutes: 1,
      viewCount: 678,
      likeCount: 123,
      commentCount: 45,
      shareCount: 34,
      bookmarkCount: 67,
      sourceCollege: '计算机学院',
    },
  ]
  loading.value = false
})

const filteredPosts = computed(() => {
  if (frequencyStore.isFocus) {
    return myPosts.value.filter(t => t.type === 'depth')
  }
  return myPosts.value.filter(t => t.type === 'signal')
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

function goToThread(thread: ForumThread) {
  router.push(`/forum?thread=${thread.id}`)
}

function editPost(thread: ForumThread) {
  console.log('编辑帖子:', thread.id)
  // TODO: 实现编辑功能
}

function deletePost(thread: ForumThread) {
  if (confirm('确定要删除这篇帖子吗？')) {
    myPosts.value = myPosts.value.filter(p => p.id !== thread.id)
  }
}
</script>

<template>
  <div class="posts-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="router.back()">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-info">
          <h1 class="page-title">我的帖子</h1>
          <p class="page-desc">
            {{ filteredPosts.length }} 篇{{ frequencyStore.isFocus ? '深度文章' : '动态信号' }}
          </p>
        </div>
      </div>
    </header>

    <!-- 帖子列表 -->
    <section class="posts-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-line w-3/4 h-5"></div>
          <div class="skeleton-line w-full h-4 mt-3"></div>
          <div class="skeleton-line w-1/2 h-3 mt-4"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!filteredPosts.length" class="empty-state">
        <div class="empty-icon" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
          <MessageCircle :size="32" />
        </div>
        <p class="empty-text">
          还没有发布{{ frequencyStore.isFocus ? '深度文章' : '动态信号' }}
        </p>
        <button 
          class="empty-action"
          :class="frequencyStore.isFocus ? 'action-focus' : 'action-vibe'"
          @click="router.push('/publish')"
        >
          发布第一篇
        </button>
      </div>

      <!-- Focus 模式：深度文章列表 -->
      <div v-else-if="frequencyStore.isFocus" class="depth-list">
        <article
          v-for="thread in filteredPosts"
          :key="thread.id"
          class="depth-card"
        >
          <div class="depth-content" @click="goToThread(thread)">
            <div class="depth-header">
              <span class="category-badge">
                {{ thread.category === 'guide' ? 'Guide' : thread.category === 'review' ? 'Review' : 'Post' }}
              </span>
              <span class="depth-time">发布于 {{ relativeTime(thread.createdAt) }}</span>
            </div>
            <h3 class="depth-title">{{ thread.title }}</h3>
            <p class="depth-summary">{{ thread.summary || thread.contentText }}</p>
            <div class="depth-meta">
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
                  <MessageCircle :size="14" />
                  {{ thread.commentCount }}
                </span>
                <span class="stat-item">
                  <Bookmark :size="14" />
                  {{ thread.bookmarkCount }}
                </span>
              </div>
            </div>
          </div>
          <div class="depth-actions">
            <button class="action-btn edit-btn" @click="editPost(thread)">
              <Edit :size="16" />
              编辑
            </button>
            <button class="action-btn delete-btn" @click="deletePost(thread)">
              <Trash2 :size="16" />
              删除
            </button>
          </div>
        </article>
      </div>

      <!-- Vibe 模式：信号卡片列表 -->
      <div v-else class="signal-list">
        <div
          v-for="thread in filteredPosts"
          :key="thread.id"
          class="signal-card"
        >
          <div class="signal-main" @click="goToThread(thread)">
            <div class="signal-header">
              <div class="signal-author">
                <div class="author-avatar-vibe">{{ thread.authorName?.charAt(0) || 'U' }}</div>
                <div class="author-info">
                  <span class="author-name-vibe">{{ thread.authorName }}</span>
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
            </div>
          </div>
          <div class="signal-actions">
            <button class="action-btn-small edit-btn" @click="editPost(thread)">
              <Edit :size="14" />
            </button>
            <button class="action-btn-small delete-btn" @click="deletePost(thread)">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.posts-page {
  @apply space-y-6;
}

/* 头部 */
.page-header {
  @apply flex items-center justify-between pb-6 border-b border-slate/10;
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

.header-right {
  @apply flex items-center gap-4;
}

/* 列表 */
.posts-list {
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
  @apply transition-all duration-200 hover:shadow-morandi hover:border-focus-primary/20;
}

.depth-content {
  @apply flex-1 min-w-0 cursor-pointer;
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

.meta-stats {
  @apply flex items-center gap-4;
}

.stat-item {
  @apply flex items-center gap-1 font-mono text-xs text-slate;
}

.depth-actions {
  @apply flex flex-col gap-2 flex-shrink-0;
}

.action-btn {
  @apply flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs;
  @apply transition-colors;
}

.edit-btn {
  @apply text-morandi-blue bg-morandi-blue/10 hover:bg-morandi-blue/20;
}

.delete-btn {
  @apply text-slate bg-slate/5 hover:bg-red-50 hover:text-red-500;
}

/* Vibe 模式：信号卡片 */
.signal-list {
  @apply space-y-4;
}

.signal-card {
  @apply flex items-start justify-between gap-4 p-5 rounded-2xl bg-white border border-slate/10;
  @apply transition-all duration-200 hover:shadow-morandi hover:border-vibe-primary/20;
}

.signal-main {
  @apply flex-1 min-w-0 cursor-pointer;
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

.signal-actions {
  @apply flex flex-col gap-2 flex-shrink-0;
}

.action-btn-small {
  @apply p-2 rounded-full transition-colors;
}

.action-btn-small.edit-btn {
  @apply text-morandi-blue bg-morandi-blue/10 hover:bg-morandi-blue/20;
}

.action-btn-small.delete-btn {
  @apply text-slate bg-slate/5 hover:bg-red-50 hover:text-red-500;
}
</style>
