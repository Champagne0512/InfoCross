<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Heart, MessageCircle, Bookmark, Eye, Clock, Edit, Trash2, X, Pencil } from 'lucide-vue-next'
import { useFrequencyStore } from '@/stores/frequencyStore'
import { fetchUserThreads, updateThread, deleteThread } from '@/api/forum'
import type { ForumThread, DepthCategory } from '@/types/models'

const router = useRouter()
const frequencyStore = useFrequencyStore()

const loading = ref(true)
const myPosts = ref<ForumThread[]>([])

// 编辑对话框状态
const editDialog = reactive({
  open: false,
  loading: false,
  thread: null as ForumThread | null,
  form: {
    title: '',
    contentText: '',
    category: '' as DepthCategory | '',
    tags: '',
  },
})

// 深度文章分类选项
const depthCategories = [
  { label: '测评 Review', value: 'review' },
  { label: '指南 Guide', value: 'guide' },
  { label: '讨论 Discussion', value: 'discussion' },
  { label: '辩论 Debate', value: 'debate' },
  { label: '提问 Question', value: 'question' },
]

onMounted(async () => {
  loading.value = true
  try {
    myPosts.value = await fetchUserThreads()
  } catch (error) {
    console.error('获取帖子失败:', error)
  } finally {
    loading.value = false
  }
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

// 检查帖子是否被编辑过
const isEdited = (thread: ForumThread) => {
  if (!thread.updatedAt || !thread.createdAt) return false
  const created = new Date(thread.createdAt).getTime()
  const updated = new Date(thread.updatedAt).getTime()
  // 如果更新时间比创建时间晚超过1分钟，认为是编辑过
  return updated - created > 60000
}

function goToThread(thread: ForumThread) {
  router.push(`/forum?thread=${thread.id}`)
}

function openEditDialog(thread: ForumThread) {
  editDialog.thread = thread
  editDialog.form.title = thread.title || ''
  editDialog.form.contentText = thread.contentText
  editDialog.form.category = thread.category || ''
  editDialog.form.tags = thread.aiTags?.join(', ') || ''
  editDialog.open = true
}

function closeEditDialog() {
  editDialog.open = false
  editDialog.thread = null
  editDialog.form.title = ''
  editDialog.form.contentText = ''
  editDialog.form.category = ''
  editDialog.form.tags = ''
}

async function submitEdit() {
  if (!editDialog.thread) return
  
  editDialog.loading = true
  try {
    const updatedThread = await updateThread(editDialog.thread.id, {
      title: editDialog.form.title || undefined,
      contentText: editDialog.form.contentText,
      category: editDialog.form.category as DepthCategory || undefined,
      aiTags: editDialog.form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    
    // 更新本地数据
    const index = myPosts.value.findIndex(p => p.id === updatedThread.id)
    if (index !== -1) {
      myPosts.value[index] = updatedThread
    }
    
    closeEditDialog()
  } catch (error) {
    console.error('编辑失败:', error)
    alert('编辑失败，请重试')
  } finally {
    editDialog.loading = false
  }
}

async function handleDeletePost(thread: ForumThread) {
  if (!confirm('确定要删除这篇帖子吗？删除后无法恢复。')) return
  
  try {
    await deleteThread(thread.id)
    myPosts.value = myPosts.value.filter(p => p.id !== thread.id)
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
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
              <div class="depth-time-info">
                <span class="depth-time">发布于 {{ relativeTime(thread.createdAt) }}</span>
                <span v-if="isEdited(thread)" class="edited-badge">
                  <Pencil :size="10" />
                  编辑于 {{ relativeTime(thread.updatedAt) }}
                </span>
              </div>
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
            <button class="action-btn edit-btn" @click="openEditDialog(thread)">
              <Edit :size="16" />
              编辑
            </button>
            <button class="action-btn delete-btn" @click="handleDeletePost(thread)">
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
                  <div class="signal-time-info">
                    <span class="signal-time">{{ relativeTime(thread.createdAt) }}</span>
                    <span v-if="isEdited(thread)" class="edited-badge-small">
                      <Pencil :size="9" />
                      已编辑
                    </span>
                  </div>
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
            <button class="action-btn-small edit-btn" @click="openEditDialog(thread)" title="编辑">
              <Edit :size="14" />
            </button>
            <button class="action-btn-small delete-btn" @click="handleDeletePost(thread)" title="删除">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 编辑对话框 -->
    <Transition name="fade">
      <div
        v-if="editDialog.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4"
        @click.self="closeEditDialog"
      >
        <div class="edit-dialog">
          <div class="dialog-header">
            <h3 class="dialog-title">编辑{{ editDialog.thread?.type === 'depth' ? '文章' : '动态' }}</h3>
            <button class="close-btn" @click="closeEditDialog">
              <X :size="20" />
            </button>
          </div>
          
          <form class="dialog-form" @submit.prevent="submitEdit">
            <!-- 深度文章显示标题和分类 -->
            <template v-if="editDialog.thread?.type === 'depth'">
              <div class="form-group">
                <label class="form-label">标题</label>
                <input
                  v-model="editDialog.form.title"
                  type="text"
                  class="form-input"
                  placeholder="文章标题"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">分类</label>
                <select v-model="editDialog.form.category" class="form-select">
                  <option value="">选择分类</option>
                  <option v-for="cat in depthCategories" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
              </div>
            </template>
            
            <div class="form-group">
              <label class="form-label">内容</label>
              <textarea
                v-model="editDialog.form.contentText"
                class="form-textarea"
                :rows="editDialog.thread?.type === 'depth' ? 8 : 4"
                placeholder="写点什么..."
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">标签 (逗号分隔)</label>
              <input
                v-model="editDialog.form.tags"
                type="text"
                class="form-input"
                placeholder="标签1, 标签2, 标签3"
              />
            </div>
            
            <div class="dialog-footer">
              <button type="button" class="btn-cancel" @click="closeEditDialog">
                取消
              </button>
              <button 
                type="submit" 
                class="btn-submit"
                :disabled="editDialog.loading || !editDialog.form.contentText.trim()"
              >
                {{ editDialog.loading ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
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
  @apply flex items-center justify-between gap-3 mb-3;
}

.category-badge {
  @apply px-3 py-1 rounded-full bg-focus-primary/15 text-focus-accent;
  @apply font-mono text-xs uppercase tracking-wider;
}

.depth-time-info {
  @apply flex items-center gap-2;
}

.depth-time {
  @apply font-mono text-xs text-slate;
}

.edited-badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full;
  @apply bg-amber-50 text-amber-600;
  @apply font-mono text-xs;
}

.edited-badge-small {
  @apply inline-flex items-center gap-0.5 text-amber-600;
  @apply font-mono text-xs;
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

.signal-time-info {
  @apply flex items-center gap-2;
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

/* 编辑对话框 */
.edit-dialog {
  @apply w-full max-w-lg rounded-2xl bg-white shadow-morandi overflow-hidden;
}

.dialog-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-slate/10;
}

.dialog-title {
  @apply font-sans text-lg font-semibold text-charcoal;
}

.close-btn {
  @apply p-1.5 rounded-full text-slate hover:bg-slate/10 transition-colors;
}

.dialog-form {
  @apply p-6 space-y-4;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block font-sans text-xs font-medium text-slate uppercase tracking-wider;
}

.form-input {
  @apply w-full px-4 py-2.5 rounded-xl border border-slate/20 bg-white;
  @apply font-sans text-sm text-charcoal;
  @apply focus:outline-none focus:border-focus-primary focus:ring-2 focus:ring-focus-primary/10;
  @apply transition-all;
}

.form-select {
  @apply w-full px-4 py-2.5 rounded-xl border border-slate/20 bg-white;
  @apply font-sans text-sm text-charcoal;
  @apply focus:outline-none focus:border-focus-primary focus:ring-2 focus:ring-focus-primary/10;
  @apply transition-all;
}

.form-textarea {
  @apply w-full px-4 py-3 rounded-xl border border-slate/20 bg-white resize-none;
  @apply font-sans text-sm text-charcoal leading-relaxed;
  @apply focus:outline-none focus:border-focus-primary focus:ring-2 focus:ring-focus-primary/10;
  @apply transition-all;
}

.dialog-footer {
  @apply flex items-center justify-end gap-3 pt-4 border-t border-slate/10;
}

.btn-cancel {
  @apply px-4 py-2 rounded-full font-sans text-sm text-slate;
  @apply hover:bg-slate/5 transition-colors;
}

.btn-submit {
  @apply px-5 py-2 rounded-full font-sans text-sm font-medium text-white;
  @apply bg-focus-accent hover:bg-focus-accent/90;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
