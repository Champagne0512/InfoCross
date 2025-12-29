<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { fetchAdminStats, fetchAdminApplications } from '@/api/admin'
import { fetchArticles } from '@/api/article'
import type { Article } from '@/types/models'
import type { AdminStats, AdminApplicationItem } from '@/api/admin'
import AppButton from '@/components/common/AppButton.vue'
import { ShieldCheck, Database, Users, Sparkles, RefreshCw, Lock, TrendingUp } from 'lucide-vue-next'

const userStore = useUserStore()
const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

const email = ref('')
const password = ref('')
const loginLoading = ref(false)
const loginError = ref('')

const stats = ref<AdminStats | null>(null)
const applications = ref<AdminApplicationItem[]>([])
const spotlightArticles = ref<Article[]>([])
const dataLoading = ref(false)
const dataError = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    loginError.value = '请输入邮箱和密码'
    return
  }
  loginLoading.value = true
  loginError.value = ''
  try {
    await userStore.login(email.value, password.value)
    if (!userStore.isAdmin) {
      loginError.value = '此账号未开通管理员权限'
      await userStore.logout()
    }
  } catch (error: any) {
    loginError.value = error?.message ?? '登录失败，请稍后重试'
  } finally {
    loginLoading.value = false
  }
}

async function handleLogout() {
  await userStore.logout()
  stats.value = null
  applications.value = []
  spotlightArticles.value = []
}

async function loadDashboard() {
  if (!userStore.isAdmin) return
  dataLoading.value = true
  dataError.value = ''
  try {
    stats.value = await fetchAdminStats()
    applications.value = await fetchAdminApplications()
    spotlightArticles.value = await fetchArticles({ limit: 4 })
  } catch (error: any) {
    console.error('[admin-dashboard] load failed', error)
    dataError.value = error?.message ?? '加载后台数据失败'
  } finally {
    dataLoading.value = false
  }
}

watch(
  () => userStore.isAdmin,
  (value) => {
    if (value) {
      loadDashboard()
    }
  },
  { immediate: true },
)

const statCards = computed(() => [
  {
    label: '资讯总量',
    value: stats.value?.totalArticles ?? 0,
    icon: Database,
    gradient: 'from-morandi-green/20 to-morandi-green/5',
    iconColor: 'text-morandi-green',
  },
  {
    label: '活跃小组',
    value: stats.value?.activeTeams ?? 0,
    icon: Users,
    gradient: 'from-vibe-primary/20 to-vibe-primary/5',
    iconColor: 'text-vibe-accent',
  },
  {
    label: '待审核申请',
    value: stats.value?.pendingApplications ?? 0,
    icon: ShieldCheck,
    gradient: 'from-focus-primary/20 to-focus-primary/5',
    iconColor: 'text-focus-accent',
  },
  {
    label: '近 7 日新用户',
    value: stats.value?.newUsers7d ?? 0,
    icon: TrendingUp,
    gradient: 'from-morandi-blue/20 to-morandi-blue/5',
    iconColor: 'text-morandi-blue',
  },
])
</script>

<template>
  <div class="admin-container">
    <header class="page-header" :class="{ 'loaded': isLoaded }">
      <div class="header-content">
        <div class="flex items-center justify-center gap-3 mb-2">
          <div class="shield-icon">
            <ShieldCheck :size="24" />
          </div>
          <p class="header-subtitle">ADMIN CONSOLE</p>
        </div>
        <h1 class="header-title">
          <span class="title-text">管理后台</span>
          <span class="title-underline"></span>
        </h1>
        <p class="header-desc">统一监控平台内容流、招募热度与用户增长</p>
      </div>
    </header>

    <div v-if="!userStore.isAdmin" class="login-section section-animate" :class="{ 'loaded': isLoaded }">
      <div class="login-card">
        <div class="login-icon">
          <Lock :size="32" />
        </div>
        <h2 class="login-title">管理员身份验证</h2>
        <p class="login-desc">使用被授予权限的账号登录以访问后台面板</p>
        
        <div class="form-group">
          <label>邮箱</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="admin@infocross.edu"
            @keydown.enter="handleLogin"
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••"
            @keydown.enter="handleLogin"
          />
        </div>
        
        <p v-if="loginError" class="error-text">{{ loginError }}</p>
        
        <AppButton 
          class="w-full" 
          :loading="loginLoading" 
          @click="handleLogin"
        >
          进入控制台
        </AppButton>
      </div>
    </div>

    <div v-else class="dashboard-content">
      <div class="action-bar section-animate" :class="{ 'loaded': isLoaded }">
        <div class="welcome-info">
          <p class="welcome-label">欢迎回来</p>
          <p class="welcome-name">{{ userStore.profile?.username }}</p>
        </div>
        <div class="action-buttons">
          <AppButton 
            variant="ghost" 
            :loading="dataLoading" 
            @click="loadDashboard"
          >
            <RefreshCw :size="18" />
            刷新数据
          </AppButton>
          <AppButton variant="secondary" @click="handleLogout">
            退出登录
          </AppButton>
        </div>
      </div>

      <p v-if="dataError" class="error-banner">{{ dataError }}</p>

      <div class="stat-grid section-animate" :class="{ 'loaded': isLoaded }" style="--delay: 0.1s">
        <div 
          v-for="(card, index) in statCards" 
          :key="card.label" 
          class="stat-card"
          :style="{ animationDelay: `${0.1 + index * 0.05}s` }"
        >
          <div class="stat-header">
            <div :class="['stat-icon-wrapper', 'bg-gradient-to-br', card.gradient]">
              <component :is="card.icon" :size="20" :class="card.iconColor" />
            </div>
            <p class="stat-label">{{ card.label }}</p>
          </div>
          <p class="stat-value">{{ card.value }}</p>
        </div>
      </div>

      <div class="content-grid section-animate" :class="{ 'loaded': isLoaded }" style="--delay: 0.2s">
        <section class="content-panel">
          <header class="panel-header">
            <div>
              <h3 class="panel-title">最新申请</h3>
              <p class="panel-desc">追踪跨小组的协作热度与邀约质量</p>
            </div>
          </header>
          
          <div v-if="applications.length === 0" class="empty-state">
            <Users :size="32" class="empty-icon" />
            <p>暂无待处理申请</p>
          </div>
          
          <ul v-else class="application-list">
            <li 
              v-for="(item, index) in applications" 
              :key="item.id" 
              class="application-item"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <div class="application-content">
                <div class="application-header">
                  <p class="applicant-name">{{ item.applicantName }}</p>
                  <span 
                    class="mode-badge" 
                    :class="item.mode === 'focus' ? 'badge-focus' : 'badge-vibe'"
                  >
                    {{ item.mode.toUpperCase() }}
                  </span>
                </div>
                <p class="application-detail">
                  {{ item.applicantCollege || '未标注学院' }} · 申请加入 {{ item.teamName }}
                </p>
                <p v-if="item.message" class="application-message">{{ item.message }}</p>
              </div>
              <div class="application-meta">
                <span class="meta-time">
                  {{ new Date(item.createdAt).toLocaleString('zh-CN', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) }}
                </span>
              </div>
            </li>
          </ul>
        </section>

        <section class="content-panel">
          <header class="panel-header">
            <div>
              <h3 class="panel-title">推荐内容</h3>
              <p class="panel-desc">最近收录的跨学科活动</p>
            </div>
          </header>
          
          <div v-if="spotlightArticles.length === 0" class="empty-state">
            <Sparkles :size="32" class="empty-icon" />
            <p>暂无活动可展示</p>
          </div>
          
          <ul v-else class="article-list">
            <li 
              v-for="(article, index) in spotlightArticles" 
              :key="article.id" 
              class="article-item"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <div class="article-content">
                <p class="article-title">{{ article.title }}</p>
                <p class="article-summary">{{ article.summary }}</p>
              </div>
              <div class="article-meta">
                <span class="meta-tag">{{ article.college }}</span>
                <span class="meta-tag">{{ article.category }}</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  @apply min-h-screen px-8 py-8 space-y-8;
}

.page-header {
  @apply text-center space-y-6 pb-8;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-header.loaded {
  @apply opacity-100 translate-y-0;
}

.page-header:not(.loaded) {
  @apply opacity-0 translate-y-6;
}

.header-content {
  @apply max-w-2xl mx-auto;
}

.shield-icon {
  @apply w-12 h-12 rounded-2xl flex items-center justify-center;
  @apply bg-gradient-to-br from-focus-primary/20 to-vibe-primary/20;
  @apply text-focus-accent;
}

.header-subtitle {
  @apply font-mono text-xs text-slate tracking-[0.3em];
}

.header-title {
  @apply relative inline-block text-display font-sans font-bold text-charcoal mt-4 mb-2;
}

.title-text {
  @apply relative z-10;
}

.title-underline {
  @apply absolute -bottom-1 left-0 h-1 rounded-full;
  @apply bg-gradient-to-r from-focus-accent/30 to-vibe-accent/30;
  @apply w-0 transition-all duration-700 ease-out;
}

.page-header.loaded .title-underline {
  @apply w-full;
  transition-delay: 0.5s;
}

.header-desc {
  @apply text-body font-sans text-slate mt-2;
}

.section-animate {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--delay, 0s);
}

.section-animate.loaded {
  @apply opacity-100 translate-y-0;
}

.section-animate:not(.loaded) {
  @apply opacity-0 translate-y-8;
}

.login-section {
  @apply max-w-md mx-auto;
}

.login-card {
  @apply rounded-morandi bg-white border border-slate/10 p-8 shadow-morandi-lg;
  @apply space-y-6;
}

.login-icon {
  @apply w-16 h-16 rounded-2xl mx-auto flex items-center justify-center;
  @apply bg-gradient-to-br from-slate/10 to-slate/5;
  @apply text-slate;
}

.login-title {
  @apply text-2xl font-sans font-semibold text-charcoal text-center;
}

.login-desc {
  @apply text-sm font-sans text-slate text-center;
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply block text-sm font-sans font-medium text-slate;
}

.form-group input {
  @apply w-full rounded-soft border border-slate/20 px-4 py-3;
  @apply font-sans text-sm text-charcoal;
  @apply transition-all duration-300;
  @apply focus:outline-none focus:border-focus-primary focus:ring-2 focus:ring-focus-primary/20;
}

.error-text {
  @apply text-sm font-sans text-red-500 text-center;
}

.error-banner {
  @apply rounded-soft bg-red-50 border border-red-200 px-4 py-3;
  @apply text-sm font-sans text-red-600;
}

.dashboard-content {
  @apply space-y-6;
}

.action-bar {
  @apply flex items-center justify-between flex-wrap gap-4;
  @apply rounded-morandi bg-white border border-slate/10 px-6 py-4 shadow-morandi-sm;
}

.welcome-info {
  @apply space-y-1;
}

.welcome-label {
  @apply font-mono text-xs text-slate tracking-wider;
}

.welcome-name {
  @apply font-sans text-lg font-semibold text-charcoal;
}

.action-buttons {
  @apply flex gap-3 flex-wrap;
}

.stat-grid {
  @apply grid gap-4 md:grid-cols-2 lg:grid-cols-4;
}

.stat-card {
  @apply rounded-morandi bg-white border border-slate/10 p-5 shadow-morandi-sm;
  @apply transition-all duration-300 hover:shadow-morandi hover:-translate-y-1;
  animation: slideUp 0.5s ease-out both;
}

.stat-header {
  @apply flex items-center gap-3 mb-3;
}

.stat-icon-wrapper {
  @apply w-10 h-10 rounded-xl flex items-center justify-center;
}

.stat-label {
  @apply font-sans text-sm text-slate;
}

.stat-value {
  @apply font-sans text-3xl font-bold text-charcoal;
}

.content-grid {
  @apply grid gap-6 lg:grid-cols-2;
}

.content-panel {
  @apply rounded-morandi bg-white border border-slate/10 p-6 shadow-morandi-sm;
  @apply transition-all duration-300 hover:shadow-morandi;
}

.panel-header {
  @apply flex items-start justify-between mb-6 pb-4 border-b border-slate/10;
}

.panel-title {
  @apply font-sans text-xl font-semibold text-charcoal;
}

.panel-desc {
  @apply font-sans text-sm text-slate mt-1;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 gap-3;
}

.empty-icon {
  @apply text-slate/30;
}

.empty-state p {
  @apply font-sans text-sm text-slate/70;
}

.application-list {
  @apply space-y-3;
}

.application-item {
  @apply rounded-soft border border-slate/10 p-4;
  @apply bg-slate/5 transition-all duration-300;
  @apply hover:bg-slate/10 hover:border-slate/20;
  animation: slideUp 0.5s ease-out both;
}

.application-content {
  @apply space-y-2;
}

.application-header {
  @apply flex items-center justify-between gap-3;
}

.applicant-name {
  @apply font-sans font-semibold text-charcoal;
}

.mode-badge {
  @apply px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wide;
}

.badge-focus {
  @apply bg-focus-primary/15 text-focus-accent;
}

.badge-vibe {
  @apply bg-vibe-primary/15 text-vibe-accent;
}

.application-detail {
  @apply font-sans text-sm text-slate;
}

.application-message {
  @apply font-sans text-sm text-slate/80 italic;
}

.application-meta {
  @apply mt-3 pt-3 border-t border-slate/10;
}

.meta-time {
  @apply font-mono text-xs text-slate/70;
}

.article-list {
  @apply space-y-3;
}

.article-item {
  @apply rounded-soft border border-slate/10 p-4;
  @apply bg-slate/5 transition-all duration-300;
  @apply hover:bg-slate/10 hover:border-slate/20;
  animation: slideUp 0.5s ease-out both;
}

.article-content {
  @apply space-y-2 mb-3;
}

.article-title {
  @apply font-sans font-semibold text-charcoal;
}

.article-summary {
  @apply font-sans text-sm text-slate line-clamp-2;
}

.article-meta {
  @apply flex gap-3 flex-wrap;
}

.meta-tag {
  @apply px-2.5 py-1 rounded-full;
  @apply bg-slate/10 font-mono text-[10px] text-slate tracking-wide;
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

@media (max-width: 768px) {
  .admin-container {
    @apply px-4 py-6;
  }
  
  .action-bar {
    @apply flex-col items-stretch;
  }
  
  .action-buttons {
    @apply w-full;
  }
  
  .action-buttons button {
    @apply flex-1;
  }
}
</style>
