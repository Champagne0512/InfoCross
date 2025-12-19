<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
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
  ChevronUp,
  ChevronDown,
} from 'lucide-vue-next'
import {
  fetchForumThreads,
  fetchHotTopics,
  fetchRelatedResources,
  fetchComments,
  likeThread,
  createThread,
  createComment,
  bookmarkThread,
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

// 阅览模式状态
const isReadingMode = ref(false)

// 切换阅览模式
function toggleReadingMode() {
  isReadingMode.value = !isReadingMode.value
}

// 监听滚动事件，向下滚动时进入阅览模式
function handleScroll(event: WheelEvent) {
  if (!isReadingMode.value && event.deltaY > 30) {
    isReadingMode.value = true
  }
}

// 监听阅览模式变化，控制body滚动
watch(isReadingMode, (reading) => {
  if (reading) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  window.removeEventListener('wheel', handleScroll)
  document.body.style.overflow = ''
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
  // 添加滚动监听
  window.addEventListener('wheel', handleScroll, { passive: true })
  // 加载数据
  await Promise.all([loadSignalThreads(), loadDepthThreads(), loadHotTopics()])
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
    const [resources, threadComments] = await Promise.all([
      fetchRelatedResources(thread.id),
      fetchComments(thread.id),
    ])
    relatedResources.value = resources
    comments.value = threadComments
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
    await likeThread(thread.id)
    // 乐观更新
    const idx = signalThreads.value.findIndex((t) => t.id === thread.id)
    if (idx !== -1) {
      const current = signalThreads.value[idx]
      if (current) {
        signalThreads.value[idx] = {
          ...current,
          likeCount: current.likeCount + 1,
        }
      }
    }
  } catch (error) {
    console.error('点赞失败', error)
  }
}

function handleSignalComment(thread: ForumThread) {
  // TODO: 打开评论弹窗
  console.log('comment thread', thread.id)
}

function handleSignalShare(thread: ForumThread) {
  // 复制链接到剪贴板
  const url = `${window.location.origin}/forum/${thread.id}`
  navigator.clipboard.writeText(url)
  console.log('share thread', thread.id)
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
    await bookmarkThread(selectedDepth.value.id)
    // 可以添加 toast 提示
  } catch (error) {
    console.error('收藏失败', error)
  }
}
</script>

<template>
  <div
    class="forum-wrapper transition-colors duration-500"
    :class="[
      frequencyStore.isFocus ? 'bg-focus-bg' : 'bg-vibe-bg',
      isReadingMode ? 'reading-mode' : ''
    ]"
  >
    <!-- Hero 区域 - 初始状态（竖直排列） -->
    <section v-if="!isReadingMode" class="hero hero-initial">
      <p
        class="hero-subtitle transition-colors duration-300"
        :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
      >
        {{ t('forum.theSpectrum') }}
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
      </div>

      <!-- 切换到阅览模式的按钮 -->
      <button
        class="mode-toggle-btn"
        :class="frequencyStore.isFocus ? 'toggle-focus' : 'toggle-vibe'"
        @click="toggleReadingMode"
      >
        <ChevronUp :size="20" />
      </button>
    </section>

    <!-- Hero 区域 - 阅览状态（水平排列，固定在顶部） -->
    <header v-else class="hero-compact">
      <div class="compact-content">
        <div class="compact-left">
          <h1 class="compact-title font-sans">{{ heroContent.title }}</h1>
          <SpectrumTabs v-model="mode" :compact="true" />
        </div>
        <div class="compact-right">
          <!-- 模式说明 - 紧凑模式下显示在发布按钮左侧 -->
          <Transition name="hint-fade" mode="out-in">
            <span
              v-if="frequencyStore.isFocus"
              key="focus"
              class="compact-mode-hint font-mono text-focus-accent"
            >
              {{ t('forum.focusMode') }}
            </span>
            <span
              v-else
              key="vibe"
              class="compact-mode-hint font-mono text-vibe-accent"
            >
              {{ t('forum.vibeMode') }}
            </span>
          </Transition>
          <AppButton
            variant="primary"
            size="sm"
            :class="frequencyStore.isVibe ? 'vibe-button' : ''"
            @click="openPostModal"
          >
            {{ heroContent.action }}
          </AppButton>
          <!-- 切换回初始模式的按钮 -->
          <button
            class="mode-toggle-btn compact-toggle"
            :class="frequencyStore.isFocus ? 'toggle-focus' : 'toggle-vibe'"
            @click="toggleReadingMode"
          >
            <ChevronDown :size="20" />
          </button>
        </div>
      </div>
    </header>

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
                @like="handleSignalLike"
                @comment="handleSignalComment"
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
                    {{ topic.threadCount }} {{ t('forum.discussions') }} · {{ t('forum.heat') }}
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
                <AppButton variant="ghost" @click="handleBookmark">{{ t('forum.saveToBookmark') }}</AppButton>
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

              <!-- 统计数据 -->
              <div class="detail-stats">
                <span class="stat-item font-mono">
                  <Eye :size="14" class="stat-icon" /> {{ selectedDepth.viewCount }}
                </span>
                <span class="stat-item font-mono">
                  <Heart :size="14" class="stat-icon" /> {{ selectedDepth.likeCount }}
                </span>
                <span class="stat-item font-mono">
                  <MessageCircle :size="14" class="stat-icon" /> {{ selectedDepth.commentCount }}
                </span>
              </div>

              <div class="detail-divider" />

              <!-- 相关资源 -->
              <div class="related-panel">
                <div class="related-header">
                  <p class="related-title font-mono flex items-center gap-1">
                    <Link :size="12" /> {{ t('forum.relatedResources') }}
                  </p>
                  <span v-if="sidebarLoading" class="loading-text font-mono">{{ t('common.loading') }}</span>
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
                      {{ resource.type === 'team' ? t('team.teamType') : t('team.eventType') }}
                    </span>
                    <span class="resource-title font-sans">{{ resource.title }}</span>
                  </li>
                </ul>
                <p v-else class="aside-desc font-sans">{{ t('forum.noRelatedResources') }}</p>
              </div>

              <!-- 评论区 -->
              <div class="comments-panel">
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
                      {{ t('common.send') }}
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
                        {{ (comment.authorName || 'A')[0] }}
                      </div>
                      <div class="comment-content">
                        <div class="comment-meta font-mono">
                          <span class="comment-author">{{ comment.authorName || t('forum.anonymousUser') }}</span>
                          <span class="comment-time">
                            {{ new Date(comment.createdAt).toLocaleDateString() }}
                          </span>
                        </div>
                        <p class="comment-text font-sans">{{ comment.content }}</p>
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
                <label class="form-label font-mono">{{ t('forum.articleTitle') }}</label>
                <input
                  v-model="postTitle"
                  type="text"
                  class="form-input font-sans"
                  :placeholder="t('forum.articleTitle')"
                />
              </div>
              <div class="form-group">
                <label class="form-label font-mono">{{ t('forum.category') }}</label>
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
                {{ mode === 'signal' ? t('forum.signalContent') : t('forum.articleContent') }}
              </label>
              <textarea
                v-model="postContent"
                class="form-textarea font-sans"
                :rows="mode === 'signal' ? 4 : 8"
                :placeholder="
                  mode === 'signal'
                    ? t('forum.shareSignalPlaceholder')
                    : t('forum.writeArticlePlaceholder')
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
  @apply flex-1 w-full min-h-screen px-6 lg:px-12 py-12 space-y-10 transition-all duration-500;
}

.forum-wrapper.reading-mode {
  @apply pt-20 space-y-6 px-6 lg:px-12;
  @apply h-screen overflow-hidden fixed top-0 bottom-0;
  left: 15rem;
  right: 0;
  touch-action: none;
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
.mode-toggle-btn {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
  @apply border shadow-morandi-sm;
  @apply transition-all duration-300 cursor-pointer;
  @apply hover:shadow-morandi hover:scale-105;
  @apply mt-6 mx-auto;
}

.toggle-focus {
  @apply bg-white border-focus-primary/30 text-focus-accent;
  @apply hover:bg-focus-primary/10;
}

.toggle-vibe {
  @apply bg-white border-vibe-primary/30 text-vibe-accent;
  @apply hover:bg-vibe-primary/10;
}

/* 阅览模式的紧凑 Header */
.hero-compact {
  @apply fixed top-0 z-40;
  left: 15rem;
  right: 0;
  @apply bg-transparent;
  @apply py-3;
  @apply transition-all duration-500;
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.compact-content {
  @apply w-full flex items-center justify-between gap-4 px-6 lg:px-12;
}

.compact-left {
  @apply flex items-center gap-6;
}

.compact-title {
  @apply text-h3 font-semibold text-charcoal whitespace-nowrap;
}

.compact-right {
  @apply flex items-center gap-3;
}

.compact-mode-hint {
  @apply text-xs tracking-wider uppercase whitespace-nowrap;
}

.compact-toggle {
  @apply mt-0;
}

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

.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}

/* Signal 模式样式 */
.signal-section,
.depth-section {
  @apply w-full;
}

.reading-mode .signal-section,
.reading-mode .depth-section {
  @apply flex-1;
  overflow: hidden;
  height: calc(100vh - 100px);
}


.signal-grid {
  @apply grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_320px];
}

.reading-mode .signal-grid {
  height: 100%;
  overflow: hidden;
  /* 情报流自动扩展，侧边栏固定宽度 */
  grid-template-columns: 1fr 280px;
}

.signal-feed {
  @apply space-y-6 relative;
}

.reading-mode .signal-feed {
  @apply pr-2 pb-8;
  height: calc(100vh - 140px);
  overflow-y: auto;
  overscroll-behavior: contain;
  /* 自动扩展 */
  flex: 1;
  min-width: 0;
}

.signal-aside {
  @apply space-y-6;
}

.reading-mode .signal-aside {
  height: calc(100vh - 140px);
  overflow-y: auto;
  overscroll-behavior: contain;
  /* 固定宽度 */
  width: 280px;
  flex-shrink: 0;
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
}

@media (min-width: 1024px) {
  .depth-grid {
    grid-template-columns: 360px minmax(0, 1fr);
    align-items: start;
  }
}

.reading-mode .depth-grid {
  height: 100%;
  overflow: hidden;
  grid-template-columns: 360px minmax(0, 1fr);
}

.depth-list {
  @apply rounded-morandi bg-white shadow-morandi border overflow-hidden;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  overscroll-behavior: contain;
  width: 100%;
}

@media (min-width: 1024px) {
  .depth-list {
    width: 360px;
    flex-shrink: 0;
  }
}

.reading-mode .depth-list {
  height: calc(100vh - 180px);
  max-height: none;
  width: 360px;
}

.depth-detail {
  @apply rounded-morandi bg-white shadow-morandi border border-slate/10 p-8 flex flex-col gap-6;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.reading-mode .depth-detail {
  height: calc(100vh - 180px);
  max-height: none;
  /* 自动扩展填满剩余空间 */
  flex: 1;
  min-width: 0;
  max-width: 820px;
  margin-right: auto;
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
  @apply flex gap-6;
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
  @apply bg-white rounded-morandi shadow-morandi-lg w-full max-w-lg border-2 overflow-hidden;
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
</style>
