<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'
import SpectrumTabs from '@/components/forum/SpectrumTabs.vue'
import SignalFeedItem from '@/components/forum/SignalFeedItem.vue'
import DepthArticleCard from '@/components/forum/DepthArticleCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useAuth } from '@/composables/useAuth'
import { useFrequencyStore } from '@/stores/frequencyStore'
import {
  Radio,
  BookOpen,
  Flame,
  Lightbulb,
  Link,
  MessageCircle,
  Eye,
  Heart,
  Bookmark,
  Maximize2,
  Minimize2,
  Share2,
} from 'lucide-vue-next'
import {
  fetchForumThreads,
  fetchHotTopics,
  fetchRelatedResources,
  fetchComments,
  likeThread,
  likeComment,
  createThread,
  createComment,
  bookmarkThread,
  shareThread,
  incrementViewCount,
  checkUserInteractions,
  checkUserCommentLikes,
} from '@/api/forum'
import type {
  ForumThread,
  ForumThreadType,
  ForumHotTopic,
  ForumComment,
  DepthCategory,
} from '@/types/models'

const { t } = useI18n()
const { profile } = useAuth()
const userCollege = computed(() => profile.value?.college)
const frequencyStore = useFrequencyStore()

// 建立映射关系：Focus ↔ depth，Vibe ↔ signal
const mode = computed<ForumThreadType>({
  get: () => (frequencyStore.isFocus ? 'depth' : 'signal'),
  set: (value) => {
    frequencyStore.setMode(value === 'depth' ? 'focus' : 'vibe')
  },
})

// 数据状态
const signalThreads = ref<ForumThread[]>([])
const depthThreads = ref<ForumThread[]>([])
const hotTopics = ref<ForumHotTopic[]>([])
const selectedDepth = ref<ForumThread | null>(null)
const relatedResources = ref<Array<{ type: string; title: string; id: number }>>([])
const comments = ref<ForumComment[]>([])

// 加载状态
const signalLoading = ref(false)
const depthLoading = ref(false)
const sidebarLoading = ref(false)
const commentsLoading = ref(false)

// 发帖相关
const showPostModal = ref(false)
const postContent = ref('')
const postTitle = ref('')
const postCategory = ref<DepthCategory>('discussion')
const postAnonymous = ref(false)
const posting = ref(false)

// 深度文章分类筛选
const selectedCategory = ref<DepthCategory | 'all'>('all')
const depthCategories = computed(() => [
  { value: 'all' as const, label: t('forum.categories.all') },
  { value: 'review' as DepthCategory, label: t('forum.categories.review') },
  { value: 'guide' as DepthCategory, label: t('forum.categories.guide') },
  { value: 'discussion' as DepthCategory, label: t('forum.categories.discussion') },
  { value: 'debate' as DepthCategory, label: t('forum.categories.debate') },
  { value: 'question' as DepthCategory, label: t('forum.categories.question') },
])

// 评论相关
const newComment = ref('')
const commentAnonymous = ref(false)
const submittingComment = ref(false)

// 用户交互状态
const userLikedThreads = ref<Set<number>>(new Set())
const userBookmarkedThreads = ref<Set<number>>(new Set())
const userLikedComments = ref<Set<number>>(new Set())

// 专注模式
const compactMode = ref(false)

// 评论区 ref
const commentsPanelRef = ref<HTMLElement | null>(null)

function enterCompactMode() {
  compactMode.value = true
}

function exitCompactMode() {
  compactMode.value = false
}

watch(compactMode, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

// 筛选后的深度文章
const filteredDepthThreads = computed(() => {
  if (selectedCategory.value === 'all') return depthThreads.value
  return depthThreads.value.filter((t) => t.category === selectedCategory.value)
})

const heroContent = computed(() => {
  if (mode.value === 'signal') {
    return {
      title: t('forum.signalChannel'),
      subtitle: t('forum.signalSubtitle'),
      description: t('forum.signalDesc'),
      action: t('forum.publishSignal'),
    }
  }
  return {
    title: t('forum.depthChannel'),
    subtitle: t('forum.depthSubtitle'),
    description: t('forum.depthDesc'),
    action: t('forum.writeArticle'),
  }
})

onMounted(async () => {
  await Promise.all([loadSignalThreads(), loadDepthThreads(), loadHotTopics()])
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// 监听模式变化，重新加载数据
watch(
  () => frequencyStore.mode,
  () => {
    if (frequencyStore.isFocus && depthThreads.value.length === 0) {
      loadDepthThreads()
    } else if (frequencyStore.isVibe && signalThreads.value.length === 0) {
      loadSignalThreads()
    }
  },
)

watch(selectedDepth, async (thread) => {
  if (!thread) {
    relatedResources.value = []
    comments.value = []
    return
  }
  sidebarLoading.value = true
  commentsLoading.value = true
  try {
    // 增加浏览量
    incrementViewCount(thread.id)

    const [resources, threadComments, interactions] = await Promise.all([
      fetchRelatedResources(thread.id),
      fetchComments(thread.id),
      checkUserInteractions(thread.id),
    ])
    relatedResources.value = resources
    comments.value = threadComments

    // 更新用户交互状态
    if (interactions.liked) {
      userLikedThreads.value.add(thread.id)
    }
    if (interactions.bookmarked) {
      userBookmarkedThreads.value.add(thread.id)
    }

    // 获取评论点赞状态
    if (threadComments.length > 0) {
      const commentIds = threadComments.map((c) => c.id)
      const likedCommentIds = await checkUserCommentLikes(commentIds)
      likedCommentIds.forEach((id) => userLikedComments.value.add(id))
    }
  } finally {
    sidebarLoading.value = false
    commentsLoading.value = false
  }
})

async function loadSignalThreads() {
  signalLoading.value = true
  try {
    signalThreads.value = await fetchForumThreads({ type: 'signal' })
  } finally {
    signalLoading.value = false
  }
}

async function loadDepthThreads() {
  depthLoading.value = true
  try {
    depthThreads.value = await fetchForumThreads({ type: 'depth' })
    if (!selectedDepth.value && depthThreads.value.length) {
      selectedDepth.value = depthThreads.value[0] ?? null
    }
  } finally {
    depthLoading.value = false
  }
}

async function loadHotTopics() {
  hotTopics.value = await fetchHotTopics()
}

function handleDepthSelect(thread: ForumThread) {
  selectedDepth.value = thread
}

async function handleSignalLike(thread: ForumThread) {
  try {
    const result = await likeThread(thread.id)
    const idx = signalThreads.value.findIndex((t) => t.id === thread.id)
    if (idx !== -1) {
      const current = signalThreads.value[idx]
      if (current) {
        signalThreads.value[idx] = {
          ...current,
          likeCount: result.likeCount,
        }
      }
    }
    // 更新用户点赞状态
    if (result.liked) {
      userLikedThreads.value.add(thread.id)
    } else {
      userLikedThreads.value.delete(thread.id)
    }
  } catch (error) {
    console.error('点赞失败', error)
  }
}

// Signal 评论相关 - 改为展开式
const expandedThreadComments = ref<Map<number, ForumComment[]>>(new Map())
const expandedThreadLoading = ref<Set<number>>(new Set())

async function handleSignalToggleComments(thread: ForumThread) {
  // 如果已经加载过，不重复加载
  if (expandedThreadComments.value.has(thread.id)) return
  
  expandedThreadLoading.value.add(thread.id)
  
  // 增加浏览量
  incrementViewCount(thread.id)

  try {
    const [threadComments, interactions] = await Promise.all([
      fetchComments(thread.id),
      checkUserInteractions(thread.id),
    ])
    expandedThreadComments.value.set(thread.id, threadComments)
    if (interactions.liked) {
      userLikedThreads.value.add(thread.id)
    }

    // 获取评论点赞状态
    if (threadComments.length > 0) {
      const commentIds = threadComments.map((c) => c.id)
      const likedCommentIds = await checkUserCommentLikes(commentIds)
      likedCommentIds.forEach((id) => userLikedComments.value.add(id))
    }
  } catch (error) {
    console.error('加载评论失败', error)
  } finally {
    expandedThreadLoading.value.delete(thread.id)
  }
}

async function handleSignalSubmitComment(payload: { thread: ForumThread; content: string; anonymous: boolean }) {
  const { thread, content, anonymous } = payload
  if (!content.trim()) return
  
  try {
    const comment = await createComment(thread.id, content, anonymous)
    
    // 更新评论列表
    const existingComments = expandedThreadComments.value.get(thread.id) || []
    expandedThreadComments.value.set(thread.id, [...existingComments, comment])
    
    // 更新帖子评论数
    const idx = signalThreads.value.findIndex((t) => t.id === thread.id)
    if (idx !== -1) {
      const current = signalThreads.value[idx]
      if (current) {
        signalThreads.value[idx] = {
          ...current,
          commentCount: current.commentCount + 1,
        }
      }
    }
  } catch (error) {
    console.error('评论失败', error)
  }
}

async function handleSignalShare(thread: ForumThread) {
  const url = `${window.location.origin}/forum/${thread.id}`
  try {
    await navigator.clipboard.writeText(url)
    // 记录分享并更新计数
    const newCount = await shareThread(thread.id)
    const idx = signalThreads.value.findIndex((t) => t.id === thread.id)
    if (idx !== -1) {
      const current = signalThreads.value[idx]
      if (current) {
        signalThreads.value[idx] = {
          ...current,
          shareCount: newCount,
        }
      }
    }
  } catch (error) {
    console.error('分享失败', error)
  }
}

async function handleCommentLike(comment: ForumComment) {
  try {
    const result = await likeComment(comment.id)
    // 更新评论点赞数
    const idx = comments.value.findIndex((c) => c.id === comment.id)
    if (idx !== -1) {
      const existing = comments.value[idx]
      if (existing) {
        comments.value[idx] = { ...existing, likeCount: result.likeCount }
      }
    }
    // 同时更新展开式评论列表
    expandedThreadComments.value.forEach((commentList, threadId) => {
      const commentIdx = commentList.findIndex((c) => c.id === comment.id)
      if (commentIdx !== -1) {
        const existing = commentList[commentIdx]
        if (existing) {
          commentList[commentIdx] = { ...existing, likeCount: result.likeCount }
          expandedThreadComments.value.set(threadId, [...commentList])
        }
      }
    })
    // 更新用户点赞状态
    if (result.liked) {
      userLikedComments.value.add(comment.id)
    } else {
      userLikedComments.value.delete(comment.id)
    }
  } catch (error) {
    console.error('评论点赞失败', error)
  }
}

function openPostModal() {
  showPostModal.value = true
  postContent.value = ''
  postTitle.value = ''
  postAnonymous.value = false
}

function closePostModal() {
  showPostModal.value = false
}

async function submitPost() {
  if (!postContent.value.trim()) return

  posting.value = true
  try {
    const newThread = await createThread({
      type: mode.value,
      contentText: postContent.value,
      title: mode.value === 'depth' ? postTitle.value : undefined,
      category: mode.value === 'depth' ? postCategory.value : undefined,
      isAnonymous: postAnonymous.value,
      sourceCollege: profile.value?.college,
    })

    // 添加到列表顶部
    if (mode.value === 'signal') {
      signalThreads.value.unshift(newThread)
    } else {
      depthThreads.value.unshift(newThread)
      selectedDepth.value = newThread
    }

    closePostModal()
  } catch (error) {
    console.error('发帖失败', error)
  } finally {
    posting.value = false
  }
}

async function submitComment() {
  if (!newComment.value.trim() || !selectedDepth.value) return

  submittingComment.value = true
  try {
    const comment = await createComment(
      selectedDepth.value.id,
      newComment.value,
      commentAnonymous.value,
    )
    comments.value.push(comment)
    newComment.value = ''
    commentAnonymous.value = false

    // 更新评论数
    if (selectedDepth.value) {
      selectedDepth.value = {
        ...selectedDepth.value,
        commentCount: selectedDepth.value.commentCount + 1,
      }
    }
  } catch (error) {
    console.error('评论失败', error)
  } finally {
    submittingComment.value = false
  }
}

async function handleBookmark() {
  if (!selectedDepth.value) return
  try {
    const result = await bookmarkThread(selectedDepth.value.id)
    const threadId = selectedDepth.value.id

    selectedDepth.value = {
      ...selectedDepth.value,
      bookmarkCount: result.bookmarkCount,
    }

    const idx = depthThreads.value.findIndex((t) => t.id === threadId)
    if (idx !== -1) {
      const existing = depthThreads.value[idx]
      if (existing) {
        depthThreads.value[idx] = { ...existing, bookmarkCount: result.bookmarkCount }
      }
    }

    if (result.bookmarked) {
      userBookmarkedThreads.value.add(threadId)
    } else {
      userBookmarkedThreads.value.delete(threadId)
    }
  } catch (error) {
    console.error('收藏失败', error)
  }
}

async function handleDepthLike() {
  if (!selectedDepth.value) return
  try {
    const result = await likeThread(selectedDepth.value.id)
    const threadId = selectedDepth.value.id
    selectedDepth.value = { ...selectedDepth.value, likeCount: result.likeCount }
    // 同步更新列表中的数据
    const idx = depthThreads.value.findIndex((t) => t.id === threadId)
    if (idx !== -1) {
      const existing = depthThreads.value[idx]
      if (existing) {
        depthThreads.value[idx] = { ...existing, likeCount: result.likeCount }
      }
    }
    if (result.liked) {
      userLikedThreads.value.add(threadId)
    } else {
      userLikedThreads.value.delete(threadId)
    }
  } catch (error) {
    console.error('点赞失败', error)
  }
}

async function handleDepthShare() {
  if (!selectedDepth.value) return
  const url = `${window.location.origin}/forum/${selectedDepth.value.id}`
  try {
    await navigator.clipboard.writeText(url)
    const newCount = await shareThread(selectedDepth.value.id)
    const threadId = selectedDepth.value.id
    selectedDepth.value = { ...selectedDepth.value, shareCount: newCount }
    const idx = depthThreads.value.findIndex((t) => t.id === threadId)
    if (idx !== -1) {
      const existing = depthThreads.value[idx]
      if (existing) {
        depthThreads.value[idx] = { ...existing, shareCount: newCount }
      }
    }
  } catch (error) {
    console.error('分享失败', error)
  }
}

function isThreadLiked(threadId: number): boolean {
  return userLikedThreads.value.has(threadId)
}

function isThreadBookmarked(threadId: number): boolean {
  return userBookmarkedThreads.value.has(threadId)
}

function isCommentLiked(commentId: number): boolean {
  return userLikedComments.value.has(commentId)
}

function scrollToComments() {
  commentsPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div
    class="forum-wrapper transition-colors duration-500"
    :class="[
      frequencyStore.isFocus ? 'bg-focus-bg' : 'bg-vibe-bg',
      compactMode ? 'compact-mode' : ''
    ]"
  >
    <!-- Hero 区域 -->
    <section v-if="!compactMode" class="hero hero-initial">
      <p
        class="hero-subtitle transition-colors duration-300"
        :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
      >
        The Spectrum · 全谱论坛
      </p>
      <h1 class="hero-title font-sans">{{ heroContent.title }}</h1>
      <p class="hero-desc font-sans">{{ heroContent.description }}</p>

      <div class="hero-tabs">
        <SpectrumTabs v-model="mode" />
      </div>

      <div class="hero-actions">
        <AppButton
          variant="primary"
          :class="frequencyStore.isVibe ? 'vibe-button' : ''"
          @click="openPostModal"
        >
          {{ heroContent.action }}
        </AppButton>
        <button class="focus-toggle focus-toggle--ghost" @click="enterCompactMode">
          <Maximize2 :size="16" />
          <span>进入专注</span>
        </button>
      </div>
    </section>

    <header v-else class="compact-bar">
      <div class="compact-left">
        <div>
          <p class="compact-label">The Spectrum</p>
          <h2 class="compact-title">{{ heroContent.title }}</h2>
        </div>
        <SpectrumTabs v-model="mode" :compact="true" />
      </div>
      <div class="compact-right">
        <AppButton
          variant="primary"
          size="sm"
          :class="frequencyStore.isVibe ? 'vibe-button' : ''"
          @click="openPostModal"
        >
          {{ heroContent.action }}
        </AppButton>
        <button class="focus-toggle focus-toggle--solid" @click="exitCompactMode">
          <Minimize2 :size="16" />
          <span>退出专注</span>
        </button>
      </div>
    </header>

    <div class="forum-content">
      <!-- Signal 模式 (Vibe) -->
      <Transition name="fade-slide" mode="out-in">
        <section v-if="mode === 'signal'" key="signal" class="signal-section">
        <div class="signal-grid">
          <!-- 情报流 -->
          <div class="signal-feed scrollable-content">
            <div v-if="signalLoading" class="skeleton-list">
              <div v-for="index in 4" :key="index" class="skeleton-card animate-pulse" />
            </div>
            <TransitionGroup v-else name="list" tag="div" class="space-y-6">
              <SignalFeedItem
                v-for="(thread, index) in signalThreads"
                :key="thread.id"
                :thread="thread"
                :user-college="userCollege || undefined"
                :is-last="index === signalThreads.length - 1"
                :liked="isThreadLiked(thread.id)"
                :comments="expandedThreadComments.get(thread.id)"
                :comments-loading="expandedThreadLoading.has(thread.id)"
                :liked-comments="userLikedComments"
                @like="handleSignalLike"
                @toggle-comments="handleSignalToggleComments"
                @submit-comment="handleSignalSubmitComment"
                @like-comment="handleCommentLike"
                @share="handleSignalShare"
              />
            </TransitionGroup>

            <!-- 空状态 -->
            <div
              v-if="!signalLoading && signalThreads.length === 0"
              class="empty-state"
            >
              <div class="empty-icon bg-vibe-primary/20 text-vibe-accent">
                <Radio :size="28" />
              </div>
              <h3 class="font-sans text-h2 text-charcoal">{{ t('forum.noSignal') }}</h3>
              <p class="font-sans text-body text-slate">{{ t('forum.beFirstSignal') }}</p>
            </div>
          </div>

          <!-- 侧边栏 -->
          <aside class="signal-aside">
            <!-- 热门合辑 -->
            <div
              class="hot-topic-card transition-all duration-300"
              :class="frequencyStore.isVibe ? 'border-vibe-primary/20' : 'border-slate/10'"
            >
              <h3 class="font-sans flex items-center gap-2">
                <Flame :size="20" class="text-vibe-accent" />
                {{ t('forum.hotTopics') }}
              </h3>
              <p class="aside-desc font-sans">{{ t('forum.hotTopicsDesc') }}</p>
              <ul class="hot-topic-list">
                <li
                  v-for="topic in hotTopics"
                  :key="topic.id"
                  class="hot-topic-item transition-colors duration-200 hover:bg-vibe-primary/10"
                >
                  <p class="topic-title font-sans">{{ topic.title }}</p>
                  <p class="topic-meta font-mono">
                    {{ topic.threadCount }} 条讨论 · 热度
                    {{ Math.round(topic.heatScore * 100) }}%
                  </p>
                </li>
              </ul>
            </div>

            <!-- 匿名提示 -->
            <div class="tip-card border-vibe-primary/20 bg-vibe-primary/5">
              <h4 class="font-sans text-vibe-accent flex items-center gap-2">
                <Lightbulb :size="16" />
                {{ t('common.anonymous') }}
              </h4>
              <p class="font-sans text-sm text-slate">
                {{ t('forum.anonymousTip') }}
              </p>
            </div>
          </aside>
        </div>
        </section>
      </Transition>

      <!-- Depth 模式 (Focus) -->
      <Transition name="fade-slide" mode="out-in">
        <section v-if="mode === 'depth'" key="depth" class="depth-section">
        <!-- 分类筛选 -->
        <div class="category-filter">
          <button
            v-for="cat in depthCategories"
            :key="cat.value"
            class="category-btn font-sans transition-all duration-200"
            :class="
              selectedCategory === cat.value
                ? 'category-active'
                : 'category-inactive'
            "
            @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>

        <div class="depth-grid">
          <!-- 文章列表 -->
          <div
            class="depth-list scrollable-content transition-all duration-300"
            :class="frequencyStore.isFocus ? 'border-focus-primary/20' : 'border-slate/10'"
          >
            <div v-if="depthLoading" class="skeleton-list depth">
              <div v-for="index in 4" :key="index" class="skeleton-line animate-pulse" />
            </div>
            <TransitionGroup v-else name="list" tag="div">
              <DepthArticleCard
                v-for="thread in filteredDepthThreads"
                :key="thread.id"
                :thread="thread"
                :active="selectedDepth?.id === thread.id"
                @select="handleDepthSelect"
              />
            </TransitionGroup>

            <!-- 空状态 -->
            <div
              v-if="!depthLoading && filteredDepthThreads.length === 0"
              class="empty-state p-8"
            >
              <div class="empty-icon bg-focus-primary/20 text-focus-accent">
                <BookOpen :size="28" />
              </div>
              <h3 class="font-sans text-h2 text-charcoal">{{ t('forum.noArticle') }}</h3>
              <p class="font-sans text-body text-slate">
                {{ selectedCategory === 'all' ? t('forum.beFirstArticle') : t('forum.noCategoryArticle') }}
              </p>
            </div>
          </div>

          <!-- 文章详情 -->
          <Transition name="fade" mode="out-in">
            <div v-if="selectedDepth" :key="selectedDepth.id" class="depth-detail scrollable-content">
              <div class="detail-header">
                <div>
                  <p
                    class="detail-label font-mono"
                    :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-morandi-blue'"
                  >
                    {{ selectedDepth.category?.toUpperCase() || 'DEPTH' }}
                  </p>
                  <h2 class="font-sans text-display text-charcoal">
                    {{ selectedDepth.title }}
                  </h2>
                  <p class="detail-meta font-mono">
                    {{ selectedDepth.authorName || t('forum.anonymousAuthor') }} ·
                    {{ selectedDepth.readTimeMinutes }} {{ t('forum.minRead') }} ·
                    {{ new Date(selectedDepth.createdAt).toLocaleDateString() }}
                  </p>
                </div>
              </div>

              <p class="detail-summary font-sans">
                {{ selectedDepth.summary || selectedDepth.contentText }}
              </p>

              <!-- 标签 -->
              <div v-if="selectedDepth.aiTags.length" class="detail-tags">
                <span
                  v-for="tag in selectedDepth.aiTags"
                  :key="tag"
                  class="tag-pill font-mono"
                  :class="
                    frequencyStore.isFocus
                      ? 'bg-focus-primary/15 text-focus-accent'
                      : 'bg-morandi-lavender/15 text-morandi-lavender'
                  "
                >
                  {{ tag }}
                </span>
              </div>

              <!-- 统计数据和交互按钮 -->
              <div class="detail-stats">
                <div class="stats-actions">
                  <button
                    class="stat-btn font-mono"
                    :class="{ 'stat-active': isThreadLiked(selectedDepth.id) }"
                    @click="handleDepthLike"
                  >
                    <Heart :size="14" :fill="isThreadLiked(selectedDepth.id) ? 'currentColor' : 'none'" />
                    {{ selectedDepth.likeCount }}
                  </button>
                  <button class="stat-btn font-mono" @click="scrollToComments">
                    <MessageCircle :size="14" /> {{ selectedDepth.commentCount }}
                  </button>
                  <button
                    class="stat-btn font-mono"
                    :class="{ 'stat-active': isThreadBookmarked(selectedDepth.id) }"
                    @click="handleBookmark"
                  >
                    <Bookmark
                      :size="14"
                      :fill="isThreadBookmarked(selectedDepth.id) ? 'currentColor' : 'none'"
                    />
                    {{ selectedDepth.bookmarkCount }}
                  </button>
                  <button class="stat-btn font-mono" @click="handleDepthShare">
                    <Share2 :size="14" /> {{ selectedDepth.shareCount }}
                  </button>
                </div>
                <span class="stat-item font-mono">
                  <Eye :size="14" class="stat-icon" /> {{ selectedDepth.viewCount }}
                </span>
              </div>

              <div class="detail-divider" />

              <!-- 相关资源 -->
              <div class="related-panel">
                <div class="related-header">
                  <p class="related-title font-mono flex items-center gap-1">
                    <Link :size="12" /> 相关资源
                  </p>
                  <span v-if="sidebarLoading" class="loading-text font-mono">加载中...</span>
                </div>
                <ul v-if="relatedResources.length" class="related-list">
                  <li
                    v-for="resource in relatedResources"
                    :key="resource.id"
                    class="related-item transition-colors duration-200 hover:bg-focus-primary/10"
                  >
                    <span
                      class="resource-type font-mono"
                      :class="
                        resource.type === 'team'
                          ? 'text-morandi-green'
                          : 'text-morandi-blue'
                      "
                    >
                      {{ resource.type === 'team' ? '组队' : '活动' }}
                    </span>
                    <span class="resource-title font-sans">{{ resource.title }}</span>
                  </li>
                </ul>
                <p v-else class="aside-desc font-sans">{{ t('forum.noRelatedResources') }}</p>
              </div>

              <!-- 评论区 -->
              <div ref="commentsPanelRef" class="comments-panel">
                <div class="comments-header">
                  <p class="comments-title font-mono flex items-center gap-1">
                    <MessageCircle :size="12" /> {{ t('forum.comments') }} ({{ comments.length }})
                  </p>
                </div>

                <!-- 评论输入框 -->
                <div class="comment-input-area">
                  <textarea
                    v-model="newComment"
                    class="comment-input font-sans"
                    rows="2"
                    :placeholder="t('forum.writeComment')"
                  />
                  <div class="comment-input-actions">
                    <label class="anonymous-toggle">
                      <input v-model="commentAnonymous" type="checkbox" class="toggle-input" />
                      <span class="toggle-label font-sans text-xs">{{ t('common.anonymous') }}</span>
                    </label>
                    <AppButton
                      variant="primary"
                      size="sm"
                      :loading="submittingComment"
                      :disabled="!newComment.trim()"
                      @click="submitComment"
                    >
                      发送
                    </AppButton>
                  </div>
                </div>

                <div v-if="commentsLoading" class="text-center py-4">
                  <span class="font-mono text-sm text-slate">{{ t('forum.loadingComments') }}</span>
                </div>
                <div v-else-if="comments.length === 0" class="text-center py-4">
                  <span class="font-sans text-sm text-slate">{{ t('forum.noComments') }}</span>
                </div>
                <div v-else class="comments-list">
                  <TransitionGroup name="list" tag="div">
                    <div
                      v-for="comment in comments"
                      :key="comment.id"
                      class="comment-item"
                    >
                      <div class="comment-avatar">
                        {{ (comment.authorName || '匿')[0] }}
                      </div>
                      <div class="comment-content">
                        <div class="comment-meta font-mono">
                          <span class="comment-author">{{ comment.authorName || t('forum.anonymousUser') }}</span>
                          <span class="comment-time">
                            {{ new Date(comment.createdAt).toLocaleDateString() }}
                          </span>
                        </div>
                        <p class="comment-text font-sans">{{ comment.content }}</p>
                        <button
                          class="comment-like-btn font-mono"
                          :class="{ 'comment-liked': isCommentLiked(comment.id) }"
                          @click="handleCommentLike(comment)"
                        >
                          <Heart :size="12" :fill="isCommentLiked(comment.id) ? 'currentColor' : 'none'" />
                          {{ comment.likeCount || 0 }}
                        </button>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        </section>
      </Transition>
    </div>

    <!-- 发帖弹窗 -->
    <Transition name="modal">
      <div v-if="showPostModal" class="modal-overlay" @click.self="closePostModal">
        <div
          class="modal-content"
          :class="frequencyStore.isFocus ? 'border-focus-primary/30' : 'border-vibe-primary/30'"
        >
          <div class="modal-header">
            <h3 class="font-sans text-h2 text-charcoal">
              {{ mode === 'signal' ? t('forum.publishSignal') : t('forum.writeArticle') }}
            </h3>
            <button class="close-btn" @click="closePostModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- 深度模式需要标题和分类 -->
            <template v-if="mode === 'depth'">
              <div class="form-group">
                <label class="form-label font-mono">标题</label>
                <input
                  v-model="postTitle"
                  type="text"
                  class="form-input font-sans"
                  placeholder="给你的文章起个标题"
                />
              </div>
              <div class="form-group">
                <label class="form-label font-mono">分类</label>
                <div class="category-select">
                  <button
                    v-for="cat in depthCategories.filter((c) => c.value !== 'all')"
                    :key="cat.value"
                    class="cat-option font-sans"
                    :class="postCategory === cat.value ? 'cat-selected' : ''"
                    @click="postCategory = cat.value as DepthCategory"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>
            </template>

            <div class="form-group">
              <label class="form-label font-mono">
                {{ mode === 'signal' ? '情报内容' : '正文' }}
              </label>
              <textarea
                v-model="postContent"
                class="form-textarea font-sans"
                :rows="mode === 'signal' ? 4 : 12"
                :placeholder="
                  mode === 'signal'
                    ? '分享你知道的校园情报...'
                    : '写下你的经验、测评或思考...'
                "
              />
            </div>

            <div class="form-group">
              <label class="anonymous-toggle">
                <input v-model="postAnonymous" type="checkbox" class="toggle-input" />
                <span class="toggle-label font-sans">{{ t('forum.anonymousPost') }}</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <AppButton variant="ghost" @click="closePostModal">{{ t('common.cancel') }}</AppButton>
            <AppButton
              variant="primary"
              :loading="posting"
              :disabled="!postContent.trim() || (mode === 'depth' && !postTitle.trim())"
              :class="frequencyStore.isVibe ? 'vibe-button' : ''"
              @click="submitPost"
            >
              {{ t('common.publish') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.forum-wrapper {
  @apply w-full px-6 lg:px-12 py-12 gap-6 transition-all duration-500;
  @apply flex flex-col;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
}

.forum-wrapper.compact-mode {
  @apply py-6 gap-4;
}

.forum-content {
  @apply flex-1 w-full min-h-0;
}

/* 可滚动内容区域 */
.scrollable-content {
  @apply overflow-y-auto;
  overscroll-behavior: contain;
}

.hero {
  @apply w-full text-center;
}

.hero-initial {
  @apply relative;
}

/* 切换按钮样式 */
.hero-subtitle {
  @apply font-mono text-xs tracking-[0.3em] uppercase mb-3;
}

.hero-title {
  @apply text-hero font-bold text-charcoal;
}

.hero-desc {
  @apply text-body text-slate mt-4 max-w-3xl mx-auto;
}

.hero-actions {
  @apply flex flex-wrap justify-center gap-4 mt-8;
}

.hero-tabs {
  @apply flex justify-center mt-6;
}

.focus-toggle {
  @apply inline-flex items-center gap-2 rounded-full text-sm transition-all duration-200;
  @apply font-sans;
}

.focus-toggle--ghost {
  @apply px-4 py-2 border border-slate/30 text-slate hover:text-charcoal hover:border-charcoal/40 bg-white/70;
}

.focus-toggle--solid {
  @apply px-4 py-2 bg-charcoal text-white hover:bg-charcoal/90 shadow-morandi-sm;
}

.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}

.compact-bar {
  @apply flex items-center justify-between rounded-2xl bg-white/80 shadow-morandi-sm border border-slate/10 px-5 py-4;
}

.compact-left {
  @apply flex items-center gap-6;
}

.compact-right {
  @apply flex items-center gap-3;
}

.compact-label {
  @apply font-mono text-xs tracking-[0.3em] uppercase text-slate;
}

.compact-title {
  @apply text-h3 font-semibold text-charcoal;
}

/* Signal 模式样式 */
.signal-section,
.depth-section {
  @apply w-full h-full flex flex-col;
}


.signal-grid {
  @apply grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_320px];
  @apply flex-1 min-h-0;
}

.signal-feed {
  @apply space-y-6 relative pr-2;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.signal-feed::-webkit-scrollbar {
  display: none;
}

.signal-aside {
  @apply space-y-6;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.signal-aside::-webkit-scrollbar {
  display: none;
}

.hot-topic-card,
.tip-card {
  @apply rounded-morandi bg-white p-6 shadow-morandi border transition-all duration-300;
}

.hot-topic-card h3 {
  @apply text-h2 font-semibold text-charcoal mb-2;
}

.aside-desc {
  @apply text-sm text-slate;
}

.hot-topic-list {
  @apply mt-4 space-y-3;
}

.hot-topic-item {
  @apply px-4 py-3 rounded-soft bg-cream border border-slate/5 cursor-pointer;
}

.topic-title {
  @apply text-base text-charcoal;
}

.topic-meta {
  @apply text-xs text-slate mt-1;
}

.tip-card {
  @apply border;
}

.tip-card h4 {
  @apply font-semibold mb-2;
}

/* Depth 模式样式 */
.category-filter {
  @apply flex flex-wrap gap-2 mb-6;
}

.category-btn {
  @apply px-4 py-2 rounded-full text-sm font-medium;
}

.category-active {
  @apply bg-focus-primary text-white shadow-md;
}

.category-inactive {
  @apply bg-white text-slate hover:bg-focus-primary/10 hover:text-focus-accent border border-slate/10;
}

.depth-grid {
  @apply grid gap-8;
  @apply flex-1 min-h-0;
}

@media (min-width: 1024px) {
  .depth-grid {
    grid-template-columns: 360px minmax(0, 1fr);
    align-items: start;
  }
}

.depth-list {
  @apply rounded-morandi bg-white shadow-morandi border overflow-hidden;
  @apply h-full;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  width: 100%;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.depth-list::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1024px) {
  .depth-list {
    width: 360px;
    flex-shrink: 0;
  }
}

.depth-detail {
  @apply rounded-morandi bg-white shadow-morandi border border-slate/10 p-8 flex flex-col gap-6;
  @apply h-full;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.depth-detail::-webkit-scrollbar {
  display: none;
}

.detail-header {
  @apply flex flex-col md:flex-row md:items-start md:justify-between gap-4;
}

.detail-label {
  @apply text-xs tracking-widest uppercase mb-2;
}

.detail-meta {
  @apply text-xs text-slate mt-2;
}

.detail-summary {
  @apply text-body text-charcoal leading-relaxed;
}

.detail-tags {
  @apply flex flex-wrap gap-2;
}

.tag-pill {
  @apply px-3 py-1 rounded-full text-xs;
}

.detail-stats {
  @apply flex items-center justify-between;
}

.stats-actions {
  @apply flex items-center gap-4;
}

.stat-item {
  @apply flex items-center gap-1 text-sm text-slate;
}

.stat-icon {
  @apply text-base;
}

.detail-divider {
  @apply h-px bg-slate/10;
}

.related-panel,
.comments-panel {
  @apply rounded-xl bg-cream p-4 border border-slate/10;
}

.related-header,
.comments-header {
  @apply flex items-center justify-between mb-3;
}

.related-title,
.comments-title {
  @apply text-xs tracking-[0.2em] uppercase text-slate;
}

.loading-text {
  @apply text-xs text-slate;
}

.related-list {
  @apply space-y-2;
}

.related-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-soft bg-white border border-slate/5 cursor-pointer;
}

.resource-type {
  @apply text-xs uppercase tracking-widest;
}

.resource-title {
  @apply text-sm text-charcoal;
}

/* 评论区样式 */
.comment-input-area {
  @apply mb-4 p-3 rounded-soft bg-white border border-slate/10;
}

.comment-input {
  @apply w-full px-3 py-2 rounded-soft border border-slate/15 bg-cream text-charcoal resize-none focus:outline-none focus:border-focus-primary transition-colors text-sm;
}

.comment-input-actions {
  @apply flex items-center justify-between mt-2;
}

.comments-list {
  @apply space-y-4 mt-4;
}

.comment-item {
  @apply flex gap-3 p-3 rounded-soft bg-white transition-colors hover:bg-slate/5;
}

.comment-avatar {
  @apply w-8 h-8 rounded-full bg-focus-primary/20 text-focus-accent flex items-center justify-center text-sm font-semibold flex-shrink-0;
}

.comment-content {
  @apply flex-1;
}

.comment-meta {
  @apply flex items-center gap-2 text-xs text-slate mb-1;
}

.comment-author {
  @apply text-charcoal font-medium;
}

.comment-text {
  @apply text-sm text-charcoal;
}

/* 空状态 */
.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.empty-icon {
  @apply w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4;
}

/* 骨架屏 */
.skeleton-list {
  @apply space-y-4;
}

.skeleton-card {
  @apply h-32 rounded-morandi bg-slate/10;
}

.skeleton-line {
  @apply h-20 border-b border-slate/10 bg-slate/5;
}

/* 弹窗样式 */
.modal-overlay {
  @apply fixed inset-0 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-morandi shadow-morandi-lg w-full max-w-2xl border-2 overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-slate/10;
}

.close-btn {
  @apply w-8 h-8 rounded-full hover:bg-slate/10 flex items-center justify-center text-slate transition-colors;
}

.modal-body {
  @apply p-6 space-y-4;
}

.modal-footer {
  @apply flex justify-end gap-3 p-6 border-t border-slate/10 bg-cream/50;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-xs text-slate uppercase tracking-wider;
}

.form-input {
  @apply w-full px-4 py-3 rounded-soft border border-slate/20 bg-white text-charcoal focus:outline-none focus:border-focus-primary transition-colors;
}

.form-textarea {
  @apply w-full px-4 py-3 rounded-soft border border-slate/20 bg-white text-charcoal resize-none focus:outline-none focus:border-focus-primary transition-colors;
}

.category-select {
  @apply flex flex-wrap gap-2;
}

.cat-option {
  @apply px-3 py-1.5 rounded-full text-sm border border-slate/20 text-slate hover:border-focus-primary hover:text-focus-accent transition-all;
}

.cat-selected {
  @apply bg-focus-primary text-white border-focus-primary;
}

.anonymous-toggle {
  @apply flex items-center gap-2 cursor-pointer;
}

.toggle-input {
  @apply w-4 h-4 rounded accent-focus-primary;
}

.toggle-label {
  @apply text-sm text-slate;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: all 0.3s ease;
}

.hint-fade-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.4s ease;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

/* 统计按钮样式 */
.stat-btn {
  @apply flex items-center gap-1 text-sm text-slate cursor-pointer transition-colors duration-200 hover:text-focus-accent;
}

.stat-btn.stat-active {
  @apply text-focus-accent;
}

/* 评论点赞按钮 */
.comment-like-btn {
  @apply flex items-center gap-1 text-xs text-slate mt-2 cursor-pointer transition-colors duration-200 hover:text-vibe-accent;
}

.comment-like-btn.comment-liked {
  @apply text-vibe-accent;
}
</style>
