<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { 
  Calendar, Users, MessageCircle, 
  ArrowRight, Clock, MapPin, Sparkles
} from 'lucide-vue-next'
import ArticleCard from '@/components/business/ArticleCard.vue'
import { fetchArticles, fetchRecommendedArticles } from '@/api/article'
import { fetchTeams } from '@/api/team'
import { fetchForumThreads } from '@/api/forum'
import type { Article, Team, ForumThread } from '@/types/models'
import { useAuth } from '@/composables/useAuth'
import { recordInteraction } from '@/api/interaction'
import { useFrequencyStore } from '@/stores/frequencyStore'

const router = useRouter()
const frequencyStore = useFrequencyStore()
const { t } = useI18n()
const { profile } = useAuth()

const articles = ref<Article[]>([])
const recommended = ref<Article[]>([])
const teams = ref<Team[]>([])
const forumThreads = ref<ForumThread[]>([])
const searchQuery = ref('')
const loading = ref(true)

// 页面配置
const displayName = computed(() => profile.value?.username || 'Explorer')

const pageConfig = computed(() => {
  if (frequencyStore.isFocus) {
    return {
      greeting: `${t('home.greeting.focus')}, ${displayName.value}`,
      desc: t('home.desc.focus'),
      searchPlaceholder: t('home.searchPlaceholder.focus'),
      quickActions: [
        { label: t('home.publishActivity'), path: '/publish', icon: Calendar },
        { label: t('nav.collaboration'), path: '/team', icon: Users },
        { label: t('forum.title'), path: '/forum', icon: MessageCircle },
      ],
      sectionTitles: {
        recommended: t('home.aiRecommend.focus'),
        teams: t('team.recruiting'),
        forum: t('forum.hotTopics'),
      }
    }
  }
  return {
    greeting: `${t('home.greeting.vibe')}, ${displayName.value}`,
    desc: t('home.desc.vibe'),
    searchPlaceholder: t('home.searchPlaceholder.vibe'),
    quickActions: [
      { label: t('home.startMeetup'), path: '/publish', icon: Users },
      { label: t('home.aiRecommend.vibe'), path: '/team', icon: Sparkles },
      { label: t('nav.forum'), path: '/forum', icon: MessageCircle },
    ],
    sectionTitles: {
      recommended: t('home.aiRecommend.vibe'),
      teams: t('team.types.meal'),
      forum: t('home.insightTitle.vibe'),
    }
  }
})

// 筛选当前模式的数据
const focusCategories = ['lecture', 'competition', 'research', 'notice']
const vibeCategories = ['meal', 'sports', 'carpool', 'chat']

const modeArticles = computed(() => {
  const allowed = frequencyStore.isFocus ? focusCategories : vibeCategories
  return articles.value.filter(a => allowed.includes(a.category))
})

const modeRecommended = computed(() => {
  const allowed = frequencyStore.isFocus ? focusCategories : vibeCategories
  return recommended.value.filter(a => allowed.includes(a.category))
})

const modeTeams = computed(() => 
  teams.value.filter(t => frequencyStore.isFocus ? !t.isVibe : t.isVibe).slice(0, 4)
)

const latestArticles = computed(() => modeArticles.value.slice(0, 6))
const aiRecommended = computed(() => modeRecommended.value.slice(0, 3))

onMounted(async () => {
  await loadData()
})

watch(() => frequencyStore.mode, () => {
  // 模式切换时可以重新加载数据
})

async function loadData() {
  loading.value = true
  try {
    const [articlesData, recommendedData, teamsData, forumData] = await Promise.all([
      fetchArticles(),
      fetchRecommendedArticles(profile.value?.tags ?? []),
      fetchTeams(),
      fetchForumThreads({ type: 'signal' }),
    ])
    articles.value = articlesData
    recommended.value = recommendedData
    teams.value = teamsData
    forumThreads.value = forumData
  } finally {
    loading.value = false
  }
}

async function handleBookmark(article: Article) {
  await recordInteraction({ articleId: article.id, type: 'bookmark' })
}

function handleSearch() {
  if (!searchQuery.value.trim()) return
  console.log('搜索:', searchQuery.value)
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ pageConfig.greeting }}</h1>
        <p class="hero-desc">{{ pageConfig.desc }}</p>
        
        <!-- 搜索栏 -->
        <div class="search-wrapper">
          <div class="search-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="pageConfig.searchPlaceholder"
            class="search-input"
            :class="frequencyStore.isFocus ? 'search-focus' : 'search-vibe'"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 快捷入口 -->
        <div class="quick-actions">
          <button
            v-for="action in pageConfig.quickActions"
            :key="action.path"
            class="quick-action-btn"
            :class="frequencyStore.isFocus ? 'action-focus' : 'action-vibe'"
            @click="navigateTo(action.path)"
          >
            <component :is="action.icon" :size="18" />
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 主内容区域 -->
    <section class="main-content">
      <!-- AI 推荐区块 -->
      <div class="content-section">
        <header class="section-header">
          <div class="section-title-group">
            <Sparkles :size="20" :class="frequencyStore.isFocus ? 'text-morandi-lavender' : 'text-vibe-accent'" />
            <h2 class="section-title">{{ pageConfig.sectionTitles.recommended }}</h2>
          </div>
          <button class="see-more-btn" @click="navigateTo('/team')">
            {{ t('common.more') }}
            <ArrowRight :size="16" />
          </button>
        </header>
        
        <div v-if="loading" class="loading-grid">
          <div v-for="i in 3" :key="i" class="skeleton-card" />
        </div>
        <div v-else class="article-grid">
          <ArticleCard
            v-for="article in aiRecommended"
            :key="article.id"
            :article="article"
            :mode="frequencyStore.mode"
            @bookmark="handleBookmark"
          />
        </div>
      </div>

      <!-- 双栏布局：团队招募 + 论坛热议 -->
      <div class="two-column-section">
        <!-- 团队招募 -->
        <div class="column-card">
          <header class="column-header">
            <div class="section-title-group">
              <Users :size="20" :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'" />
              <h2 class="section-title">{{ pageConfig.sectionTitles.teams }}</h2>
            </div>
            <button class="see-more-btn" @click="navigateTo('/team')">
              {{ t('common.more') }}
              <ArrowRight :size="14" />
            </button>
          </header>
          
          <div v-if="loading" class="team-loading">
            <div v-for="i in 3" :key="i" class="skeleton-team" />
          </div>
          <div v-else class="team-list">
            <div
              v-for="team in modeTeams"
              :key="team.id"
              class="team-item"
              @click="navigateTo(`/team/${team.id}`)"
            >
              <div 
                class="team-avatar"
                :class="frequencyStore.isFocus ? 'avatar-focus' : 'avatar-vibe'"
              >
                {{ team.name.charAt(0) }}
              </div>
              <div class="team-info">
                <h3 class="team-name">{{ team.name }}</h3>
                <p class="team-meta">
                  <span class="meta-item">
                    <Users :size="12" />
                    {{ team.currentMembers }}/{{ team.maxMembers }}
                  </span>
                  <span class="meta-item">
                    <MapPin :size="12" />
                    {{ team.college }}
                  </span>
                </p>
              </div>
              <ArrowRight :size="16" class="team-arrow" />
            </div>
            
            <div v-if="!modeTeams.length" class="empty-hint">
              {{ t('common.noData') }}
            </div>
          </div>
        </div>

        <!-- 论坛热议 -->
        <div class="column-card">
          <header class="column-header">
            <div class="section-title-group">
              <MessageCircle :size="20" :class="frequencyStore.isFocus ? 'text-morandi-blue' : 'text-vibe-accent'" />
              <h2 class="section-title">{{ pageConfig.sectionTitles.forum }}</h2>
            </div>
            <button class="see-more-btn" @click="navigateTo('/forum')">
              {{ t('common.more') }}
              <ArrowRight :size="14" />
            </button>
          </header>
          
          <div v-if="loading" class="forum-loading">
            <div v-for="i in 4" :key="i" class="skeleton-forum" />
          </div>
          <div v-else class="forum-list">
            <div
              v-for="thread in forumThreads.slice(0, 5)"
              :key="thread.id"
              class="forum-item"
              @click="navigateTo('/forum')"
            >
              <div class="forum-content">
                <p class="forum-text">{{ thread.contentText }}</p>
                <div class="forum-meta">
                  <span>{{ thread.authorName }}</span>
                  <span>{{ thread.likeCount }} {{ t('common.like') }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="!forumThreads.length" class="empty-hint">
              {{ t('common.noData') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 最新动态流 -->
      <div class="content-section">
        <header class="section-header">
          <div class="section-title-group">
            <Clock :size="20" class="text-slate" />
            <h2 class="section-title">{{ frequencyStore.isFocus ? t('home.stats.newActivities') : t('home.stats.newDynamics') }}</h2>
          </div>
          <div class="filter-tabs">
            <button 
              class="filter-tab active"
              :class="frequencyStore.isFocus ? 'tab-focus' : 'tab-vibe'"
            >
              {{ t('common.all') }}
            </button>
          </div>
        </header>
        
        <div v-if="loading" class="loading-grid loading-grid-2">
          <div v-for="i in 4" :key="i" class="skeleton-card" />
        </div>
        <div v-else class="article-grid article-grid-2">
          <ArticleCard
            v-for="article in latestArticles"
            :key="article.id"
            :article="article"
            :mode="frequencyStore.mode"
            @bookmark="handleBookmark"
          />
        </div>
        
        <div v-if="latestArticles.length" class="load-more">
          <button class="load-more-btn">
            {{ t('common.more') }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  @apply space-y-8;
}

/* Hero 区域 */
.hero-section {
  @apply py-8 lg:py-10;
}

.hero-content {
  @apply max-w-xl text-center space-y-5 mx-auto;
}

.hero-title {
  @apply text-hero font-sans font-bold text-charcoal leading-tight;
}

.hero-desc {
  @apply text-body font-sans text-slate leading-relaxed;
}

/* 搜索栏 */
.search-wrapper {
  @apply relative max-w-lg mx-auto;
}

.search-icon {
  @apply absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate;
}

.search-input {
  @apply w-full pl-12 pr-10 py-3 rounded-full border bg-white/80 backdrop-blur-sm;
  @apply font-sans text-body text-charcoal placeholder:text-slate/60;
  @apply transition-all duration-300 focus:outline-none focus:ring-2;
}

.search-focus {
  @apply border-slate/20 focus:border-focus-primary focus:ring-focus-primary/20;
}

.search-vibe {
  @apply border-vibe-primary/20 focus:border-vibe-primary focus:ring-vibe-primary/20;
}

.search-clear {
  @apply absolute inset-y-0 right-4 flex items-center text-slate hover:text-charcoal transition-colors;
}

/* 快捷入口 */
.quick-actions {
  @apply flex justify-center gap-3;
}

.quick-action-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-full;
  @apply font-sans text-sm font-medium;
  @apply transition-all duration-200 hover:scale-105;
}

.action-focus {
  @apply bg-focus-primary/10 text-focus-accent hover:bg-focus-primary/20;
}

.action-vibe {
  @apply bg-vibe-primary/10 text-vibe-accent hover:bg-vibe-primary/20;
}

/* 主内容区域 */
.main-content {
  @apply space-y-10;
}

/* 区块通用样式 */
.content-section {
  @apply space-y-6;
}

.section-header {
  @apply flex items-center justify-between;
}

.section-title-group {
  @apply flex items-center gap-2;
}

.section-title {
  @apply text-h2 font-sans font-semibold text-charcoal;
}

.see-more-btn {
  @apply flex items-center gap-1 font-sans text-sm text-slate hover:text-charcoal transition-colors;
}

/* 文章网格 */
.article-grid {
  @apply grid gap-6 md:grid-cols-2 lg:grid-cols-3;
}

.article-grid-2 {
  @apply lg:grid-cols-2;
}

/* 双栏布局 */
.two-column-section {
  @apply grid gap-6 lg:grid-cols-2;
}

.column-card {
  @apply rounded-2xl bg-white border border-slate/10 p-6;
  @apply transition-all duration-300 hover:shadow-morandi;
  @apply flex flex-col;
}

.column-card .team-list,
.column-card .forum-list {
  @apply flex-1;
}

.column-header {
  @apply flex items-center justify-between mb-4 pb-4 border-b border-slate/10;
}

/* 团队列表 */
.team-list {
  @apply space-y-3;
}

.team-item {
  @apply flex items-center gap-3 p-3 rounded-xl;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:bg-slate/5;
}

.team-avatar {
  @apply w-10 h-10 rounded-xl flex items-center justify-center;
  @apply font-sans font-bold text-white text-sm;
}

.avatar-focus {
  @apply bg-gradient-to-br from-focus-primary to-focus-accent;
}

.avatar-vibe {
  @apply bg-gradient-to-br from-vibe-primary to-vibe-accent;
}

.team-info {
  @apply flex-1 min-w-0;
}

.team-name {
  @apply font-sans text-sm font-medium text-charcoal truncate;
}

.team-meta {
  @apply flex items-center gap-3 mt-0.5;
}

.meta-item {
  @apply flex items-center gap-1 font-mono text-xs text-slate;
}

.team-arrow {
  @apply text-slate/30 transition-colors;
}

.team-item:hover .team-arrow {
  @apply text-slate;
}

/* 论坛列表 */
.forum-list {
  @apply space-y-3;
}

.forum-item {
  @apply p-3 rounded-xl cursor-pointer transition-all duration-200;
  @apply hover:bg-slate/5;
}

.forum-text {
  @apply font-sans text-sm text-charcoal line-clamp-2;
}

.forum-meta {
  @apply flex items-center gap-3 mt-2 font-mono text-xs text-slate;
}

/* 筛选标签 */
.filter-tabs {
  @apply flex gap-2;
}

.filter-tab {
  @apply px-3 py-1.5 rounded-full font-sans text-sm transition-all;
  @apply bg-slate/5 text-slate hover:bg-slate/10;
}

.filter-tab.active.tab-focus {
  @apply bg-focus-accent text-white;
}

.filter-tab.active.tab-vibe {
  @apply bg-vibe-accent text-white;
}

/* 加载更多 */
.load-more {
  @apply flex justify-center pt-4;
}

.load-more-btn {
  @apply px-6 py-2 rounded-full border border-slate/20;
  @apply font-sans text-sm text-slate hover:bg-slate/5 transition-all;
}

/* 空状态 */
.empty-hint {
  @apply text-center py-8 font-sans text-sm text-slate;
}

/* 骨架屏 */
.loading-grid {
  @apply grid gap-6 md:grid-cols-2 lg:grid-cols-3;
}

.loading-grid-2 {
  @apply lg:grid-cols-2;
}

.skeleton-card {
  @apply h-64 rounded-2xl bg-slate/10 animate-pulse;
}

.team-loading,
.forum-loading {
  @apply space-y-3;
}

.skeleton-team {
  @apply h-16 rounded-xl bg-slate/10 animate-pulse;
}

.skeleton-forum {
  @apply h-20 rounded-xl bg-slate/10 animate-pulse;
}
</style>
