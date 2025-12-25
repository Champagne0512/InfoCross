<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'
import { 
  Users, MessageCircle, 
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
const isLoaded = ref(false)
const searchFocused = ref(false)

// 页面配置
const displayName = computed(() => profile.value?.username || 'Explorer')

const pageConfig = computed(() => {
  if (frequencyStore.isFocus) {
    return {
      greeting: `${t('home.greeting.focus')}, ${displayName.value}`,
      desc: t('home.desc.focus'),
      searchPlaceholder: t('home.searchPlaceholder.focus'),
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
  // 触发加载动画
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
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
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-particle particle-1"></div>
      <div class="floating-particle particle-2"></div>
      <div class="floating-particle particle-3"></div>
      <div class="gradient-orb orb-1" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
      <div class="gradient-orb orb-2" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
    </div>

    <!-- Hero 区域 -->
    <section class="hero-section" :class="{ 'loaded': isLoaded }">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-text">{{ pageConfig.greeting }}</span>
          <span class="title-underline" :class="frequencyStore.isFocus ? 'underline-focus' : 'underline-vibe'"></span>
        </h1>
        <p class="hero-desc">{{ pageConfig.desc }}</p>
        
        <!-- 搜索栏 -->
        <div class="search-wrapper" :class="{ 'search-active': searchFocused }">
          <div class="search-glow" :class="frequencyStore.isFocus ? 'glow-focus' : 'glow-vibe'"></div>
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
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </section>

    <!-- 主内容区域 -->
    <section class="main-content">
      <!-- AI 推荐区块 -->
      <div class="content-section section-animate" :class="{ 'loaded': isLoaded }" style="--delay: 0.2s">
        <header class="section-header">
          <div class="section-title-group">
            <div class="icon-wrapper" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
              <Sparkles :size="20" />
            </div>
            <h2 class="section-title">{{ pageConfig.sectionTitles.recommended }}</h2>
          </div>
          <button class="see-more-btn group" @click="navigateTo('/team')">
            {{ t('common.more') }}
            <ArrowRight :size="16" class="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </header>
        
        <div v-if="loading" class="loading-grid">
          <div v-for="i in 3" :key="i" class="skeleton-card" />
        </div>
        <div v-else class="article-grid">
          <div 
            v-for="(article, index) in aiRecommended" 
            :key="article.id"
            class="article-card-wrapper"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <ArticleCard
              :article="article"
              :mode="frequencyStore.mode"
              @bookmark="handleBookmark"
            />
          </div>
        </div>
      </div>

      <!-- 双栏布局：团队招募 + 论坛热议 -->
      <div class="two-column-section section-animate" :class="{ 'loaded': isLoaded }" style="--delay: 0.4s">
        <!-- 团队招募 -->
        <div class="column-card">
          <div class="card-shine"></div>
          <header class="column-header">
            <div class="section-title-group">
              <div class="icon-wrapper" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
                <Users :size="20" />
              </div>
              <h2 class="section-title">{{ pageConfig.sectionTitles.teams }}</h2>
            </div>
            <button class="see-more-btn group" @click="navigateTo('/team')">
              {{ t('common.more') }}
              <ArrowRight :size="14" class="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </header>
          
          <div v-if="loading" class="team-loading">
            <div v-for="i in 3" :key="i" class="skeleton-team" />
          </div>
          <div v-else class="team-list">
            <div
              v-for="(team, index) in modeTeams"
              :key="team.id"
              class="team-item"
              :style="{ animationDelay: `${index * 80}ms` }"
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
          <div class="card-shine"></div>
          <header class="column-header">
            <div class="section-title-group">
              <div class="icon-wrapper" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
                <MessageCircle :size="20" />
              </div>
              <h2 class="section-title">{{ pageConfig.sectionTitles.forum }}</h2>
            </div>
            <button class="see-more-btn group" @click="navigateTo('/forum')">
              {{ t('common.more') }}
              <ArrowRight :size="14" class="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </header>
          
          <div v-if="loading" class="forum-loading">
            <div v-for="i in 4" :key="i" class="skeleton-forum" />
          </div>
          <div v-else class="forum-list">
            <div
              v-for="(thread, index) in forumThreads.slice(0, 5)"
              :key="thread.id"
              class="forum-item"
              :style="{ animationDelay: `${index * 80}ms` }"
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
      <div class="content-section section-animate" :class="{ 'loaded': isLoaded }" style="--delay: 0.6s">
        <header class="section-header">
          <div class="section-title-group">
            <div class="icon-wrapper icon-neutral">
              <Clock :size="20" />
            </div>
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
          <div 
            v-for="(article, index) in latestArticles" 
            :key="article.id"
            class="article-card-wrapper"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <ArticleCard
              :article="article"
              :mode="frequencyStore.mode"
              @bookmark="handleBookmark"
            />
          </div>
        </div>
        
        <div v-if="latestArticles.length" class="load-more">
          <button class="load-more-btn">
            <span>{{ t('common.more') }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  @apply space-y-8 relative;
}

/* 动态背景 */
.background-animation {
  @apply fixed inset-0 pointer-events-none overflow-hidden;
  z-index: 0;
}

.floating-particle {
  @apply absolute rounded-full opacity-15;
  background: linear-gradient(135deg, rgba(147, 168, 172, 0.4), rgba(217, 166, 159, 0.4));
}

.particle-1 {
  @apply w-2 h-2 top-32 left-20;
  animation: float 8s ease-in-out infinite;
}

.particle-2 {
  @apply w-3 h-3 top-1/2 right-32;
  animation: float 10s ease-in-out infinite 2s;
}

.particle-3 {
  @apply w-1.5 h-1.5 bottom-40 left-1/3;
  animation: float 7s ease-in-out infinite 1s;
}

.gradient-orb {
  @apply absolute rounded-full opacity-10;
  filter: blur(60px);
}

.orb-1 {
  @apply w-80 h-80 -top-20 -left-20;
  animation: pulse-slow 15s ease-in-out infinite;
}

.orb-2 {
  @apply w-64 h-64 bottom-20 -right-20;
  animation: pulse-slow 12s ease-in-out infinite 3s;
}

.orb-focus {
  background: radial-gradient(circle, rgba(147, 168, 172, 0.5) 0%, transparent 70%);
}

.orb-vibe {
  background: radial-gradient(circle, rgba(217, 166, 159, 0.5) 0%, transparent 70%);
}

/* Hero 区域 */
.hero-section {
  @apply py-8 lg:py-10 relative z-10;
  @apply opacity-0 translate-y-6;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-section.loaded {
  @apply opacity-100 translate-y-0;
}

.hero-content {
  @apply max-w-xl text-center space-y-5 mx-auto;
}

.hero-title {
  @apply relative inline-block text-hero font-sans font-bold text-charcoal leading-tight;
}

.title-text {
  @apply relative z-10;
}

.title-underline {
  @apply absolute -bottom-1 left-0 h-1 rounded-full;
  @apply w-0 transition-all duration-700 ease-out;
}

.hero-section.loaded .title-underline {
  @apply w-full;
  transition-delay: 0.5s;
}

.underline-focus {
  @apply bg-focus-accent/30;
}

.underline-vibe {
  @apply bg-vibe-accent/30;
}

.hero-desc {
  @apply text-body font-sans text-slate leading-relaxed;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.3s;
}

.hero-section.loaded .hero-desc {
  @apply opacity-100 translate-y-0;
}

/* 搜索栏 */
.search-wrapper {
  @apply relative max-w-lg mx-auto;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.4s;
}

.hero-section.loaded .search-wrapper {
  @apply opacity-100 translate-y-0;
}

.search-glow {
  @apply absolute -inset-1 rounded-full opacity-0 transition-opacity duration-300;
  filter: blur(8px);
}

.search-active .search-glow {
  @apply opacity-100;
}

.glow-focus {
  background: rgba(147, 168, 172, 0.3);
}

.glow-vibe {
  background: rgba(217, 166, 159, 0.3);
}

.search-icon {
  @apply absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate;
  @apply transition-colors duration-300;
}

.search-active .search-icon {
  @apply text-charcoal;
}

.search-input {
  @apply relative w-full pl-12 pr-10 py-3 rounded-full border bg-white/80 backdrop-blur-sm;
  @apply font-sans text-body text-charcoal placeholder:text-slate/60;
  @apply transition-all duration-300 focus:outline-none focus:ring-2;
}

.search-focus {
  @apply border-slate/20 focus:border-focus-primary focus:ring-focus-primary/20;
}

.search-vibe {
  @apply border-vibe-primary/20 focus:border-vibe-primary focus:ring-vibe-primary/20;
}

.search-active .search-input {
  @apply shadow-lg;
}

.search-clear {
  @apply absolute inset-y-0 right-4 flex items-center text-slate hover:text-charcoal transition-colors;
}

/* 主内容区域 */
.main-content {
  @apply space-y-10 relative z-10;
}

/* 区块动画 */
.section-animate {
  @apply opacity-0 translate-y-8;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--delay, 0s);
}

.section-animate.loaded {
  @apply opacity-100 translate-y-0;
}

/* 区块通用样式 */
.content-section {
  @apply space-y-6;
}

.section-header {
  @apply flex items-center justify-between;
}

.section-title-group {
  @apply flex items-center gap-3;
}

.icon-wrapper {
  @apply w-9 h-9 rounded-xl flex items-center justify-center;
  @apply transition-all duration-300;
}

.icon-focus {
  @apply bg-focus-primary/15 text-focus-accent;
}

.icon-vibe {
  @apply bg-vibe-primary/15 text-vibe-accent;
}

.icon-neutral {
  @apply bg-slate/10 text-slate;
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

.article-card-wrapper {
  animation: slideUp 0.6s ease-out both;
}

/* 双栏布局 */
.two-column-section {
  @apply grid gap-6 lg:grid-cols-2;
}

.column-card {
  @apply relative rounded-2xl bg-white border border-slate/10 p-6;
  @apply transition-all duration-500;
  @apply flex flex-col overflow-hidden;
}

.column-card:hover {
  @apply shadow-morandi-lg -translate-y-1;
}

.card-shine {
  @apply absolute inset-0 opacity-0 transition-opacity duration-500;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
}

.column-card:hover .card-shine {
  @apply opacity-100;
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
  @apply cursor-pointer transition-all duration-300;
  @apply hover:bg-slate/5;
  animation: slideUp 0.5s ease-out both;
}

.team-item:hover {
  @apply translate-x-1;
}

.team-avatar {
  @apply w-10 h-10 rounded-xl flex items-center justify-center;
  @apply font-sans font-bold text-white text-sm;
  @apply transition-transform duration-300;
}

.team-item:hover .team-avatar {
  @apply scale-110;
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
  @apply transition-colors duration-300;
}

.team-item:hover .team-name {
  @apply text-charcoal;
}

.team-meta {
  @apply flex items-center gap-3 mt-0.5;
}

.meta-item {
  @apply flex items-center gap-1 font-mono text-xs text-slate;
}

.team-arrow {
  @apply text-slate/30 transition-all duration-300;
}

.team-item:hover .team-arrow {
  @apply text-slate translate-x-1;
}

/* 论坛列表 */
.forum-list {
  @apply space-y-3;
}

.forum-item {
  @apply p-3 rounded-xl cursor-pointer transition-all duration-300;
  @apply hover:bg-slate/5;
  animation: slideUp 0.5s ease-out both;
}

.forum-item:hover {
  @apply translate-x-1;
}

.forum-text {
  @apply font-sans text-sm text-charcoal line-clamp-2;
  @apply transition-colors duration-300;
}

.forum-item:hover .forum-text {
  @apply text-charcoal;
}

.forum-meta {
  @apply flex items-center gap-3 mt-2 font-mono text-xs text-slate;
}

/* 筛选标签 */
.filter-tabs {
  @apply flex gap-2;
}

.filter-tab {
  @apply px-3 py-1.5 rounded-full font-sans text-sm transition-all duration-300;
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
  @apply relative px-6 py-2 rounded-full border border-slate/20;
  @apply font-sans text-sm text-slate transition-all duration-300;
  @apply hover:bg-slate/5 hover:border-slate/30 hover:-translate-y-0.5;
  @apply overflow-hidden;
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

/* 动画定义 */
@keyframes float {
  0%, 100% { 
    transform: translateY(0px) translateX(0px); 
  }
  25% { 
    transform: translateY(-15px) translateX(5px); 
  }
  50% { 
    transform: translateY(-8px) translateX(-5px); 
  }
  75% { 
    transform: translateY(-20px) translateX(3px); 
  }
}

@keyframes pulse-slow {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.1; 
  }
  50% { 
    transform: scale(1.15); 
    opacity: 0.15; 
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .orb-1,
  .orb-2 {
    @apply w-48 h-48;
  }
  
  .floating-particle {
    @apply opacity-10;
  }
}
</style>
