<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { fetchAdminStats, fetchAdminApplications } from '@/api/admin'
import { fetchArticles } from '@/api/article'
import type { Article } from '@/types/models'
import type { AdminStats, AdminApplicationItem } from '@/api/admin'
import AppButton from '@/components/common/AppButton.vue'
import { ShieldCheck, Database, Users, Sparkles, RefreshCw } from 'lucide-vue-next'

const userStore = useUserStore()

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
    accent: 'bg-morandi-green/15 text-morandi-green',
  },
  {
    label: '活跃小组',
    value: stats.value?.activeTeams ?? 0,
    icon: Users,
    accent: 'bg-vibe-primary/10 text-vibe-primary',
  },
  {
    label: '待审核申请',
    value: stats.value?.pendingApplications ?? 0,
    icon: ShieldCheck,
    accent: 'bg-focus-primary/10 text-focus-primary',
  },
  {
    label: '近 7 日新用户',
    value: stats.value?.newUsers7d ?? 0,
    icon: Sparkles,
    accent: 'bg-charcoal/10 text-charcoal',
  },
])
</script>

<template>
  <div class="admin-page">
    <section class="admin-hero">
      <p class="hero-label">INFOCROSS ADMIN CONSOLE</p>
      <h1>跨学科情报的指挥舱</h1>
      <p>
        这里统一监控 InfoCross 的内容流、招募热度与用户增长。访问前需通过管理员身份验证，保持与主站一致的
        Nexus Design System 语言。
      </p>
    </section>

    <section class="admin-panel">
      <div v-if="!userStore.isAdmin" class="login-card">
        <h2>管理员登录</h2>
        <p>使用被授予权限的校园邮箱登录，以访问后台面板。</p>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="email" type="email" placeholder="admin@campus.edu" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="••••••••" />
        </div>
        <p v-if="loginError" class="error-text">{{ loginError }}</p>
        <AppButton class="w-full" :loading="loginLoading" @click="handleLogin">
          进入控制台
        </AppButton>
      </div>

      <div v-else class="dashboard">
        <header class="dash-header">
          <div>
            <p class="welcome-label">欢迎回来，管理员</p>
            <h2>平台运行总览</h2>
          </div>
          <div class="header-actions">
            <AppButton variant="ghost" :loading="dataLoading" @click="loadDashboard">
              <RefreshCw :size="18" /> 刷新
            </AppButton>
            <AppButton variant="secondary" @click="handleLogout">退出登录</AppButton>
          </div>
        </header>
        <p v-if="dataError" class="error-text">{{ dataError }}</p>

        <div class="stat-grid">
          <article v-for="card in statCards" :key="card.label" class="stat-card">
            <span :class="['stat-icon', card.accent]">
              <component :is="card.icon" :size="24" />
            </span>
            <p class="stat-label">{{ card.label }}</p>
            <p class="stat-value">{{ card.value }}</p>
          </article>
        </div>

        <div class="panel-grid">
          <section class="panel-block">
            <header class="panel-header">
              <h3>最新入驻与申请</h3>
              <p>追踪跨小组的协作热度与邀约质量。</p>
            </header>
            <div v-if="applications.length === 0" class="empty-state">暂无待处理申请</div>
            <ul v-else class="application-list">
              <li v-for="item in applications" :key="item.id" class="application-item">
                <div>
                  <p class="applicant">{{ item.applicantName }} · {{ item.applicantCollege || '未标注学院' }}</p>
                  <p class="message">{{ item.message || '暂无补充说明' }}</p>
                </div>
                <div class="meta">
                  <span class="badge" :class="item.mode === 'focus' ? 'badge-focus' : 'badge-vibe'">{{ item.mode.toUpperCase() }}</span>
                  <span class="team-name">{{ item.teamName }}</span>
                  <span class="time">{{ new Date(item.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
                </div>
              </li>
            </ul>
          </section>

          <section class="panel-block">
            <header class="panel-header">
              <h3>AI 推荐焦点</h3>
              <p>最近收录的跨学科活动，便于运营精选。</p>
            </header>
            <div v-if="spotlightArticles.length === 0" class="empty-state">暂无活动可展示</div>
            <ul v-else class="article-list">
              <li v-for="article in spotlightArticles" :key="article.id" class="article-item">
                <div>
                  <p class="article-title">{{ article.title }}</p>
                  <p class="article-summary">{{ article.summary }}</p>
                </div>
                <div class="article-meta">
                  <span>{{ article.college }}</span>
                  <span>{{ article.category }}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-page {
  @apply min-h-screen bg-[#0d0f13] text-white px-6 py-10 grid gap-8 lg:grid-cols-[1.1fr_minmax(0,1fr)];
}

.admin-hero {
  @apply rounded-3xl border border-white/10 bg-gradient-to-br from-charcoal via-[#161922] to-black p-8 space-y-6 shadow-morandi-lg;
}

.hero-label {
  @apply font-mono text-xs tracking-[0.5em] text-slate/70;
}

.admin-hero h1 {
  @apply text-4xl font-semibold;
}

.admin-hero p {
  @apply text-base text-slate/80 leading-relaxed;
}

.admin-panel {
  @apply rounded-3xl bg-white text-charcoal p-8 shadow-morandi-xl flex flex-col;
}

.login-card {
  @apply space-y-5;
}

.login-card h2 {
  @apply text-2xl font-semibold;
}

.form-group {
  @apply flex flex-col gap-2;
}

.form-group label {
  @apply text-sm font-medium text-slate;
}

.form-group input {
  @apply rounded-2xl border border-slate/30 px-4 py-3 text-sm focus:border-charcoal focus:outline-none;
}

.error-text {
  @apply text-sm text-red-500;
}

.dashboard {
  @apply flex flex-col gap-8;
}

.dash-header {
  @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
}

.welcome-label {
  @apply text-sm text-slate;
}

.header-actions {
  @apply flex gap-3 flex-wrap;
}

.stat-grid {
  @apply grid gap-4 md:grid-cols-2;
}

.stat-card {
  @apply rounded-2xl border border-slate/10 p-5 bg-slate/5 flex flex-col gap-2;
}

.stat-icon {
  @apply inline-flex h-10 w-10 items-center justify-center rounded-xl;
}

.stat-label {
  @apply text-sm text-slate;
}

.stat-value {
  @apply text-3xl font-semibold text-charcoal;
}

.panel-grid {
  @apply grid gap-6 lg:grid-cols-2;
}

.panel-block {
  @apply rounded-3xl border border-slate/10 p-6 bg-white;
}

.panel-header h3 {
  @apply text-xl font-semibold;
}

.panel-header p {
  @apply text-sm text-slate mt-1;
}

.empty-state {
  @apply text-center text-slate/70 py-10;
}

.application-list {
  @apply divide-y divide-slate/10 mt-4;
}

.application-item {
  @apply py-4 flex flex-col gap-3;
}

.applicant {
  @apply font-medium text-charcoal;
}

.message {
  @apply text-sm text-slate;
}

.meta {
  @apply flex flex-wrap gap-2 items-center text-xs text-slate/80;
}

.badge {
  @apply px-3 py-1 rounded-full font-mono text-[11px] tracking-wide;
}

.badge-focus {
  @apply bg-focus-primary/15 text-focus-primary;
}

.badge-vibe {
  @apply bg-vibe-primary/15 text-vibe-primary;
}

.team-name {
  @apply font-medium text-charcoal;
}

.article-list {
  @apply space-y-4 mt-4;
}

.article-item {
  @apply rounded-2xl border border-slate/10 p-4 bg-slate/5;
}

.article-title {
  @apply font-semibold text-charcoal;
}

.article-summary {
  @apply text-sm text-slate mt-1 line-clamp-2;
}

.article-meta {
  @apply mt-3 text-xs uppercase tracking-wide text-slate flex gap-4;
}
</style>
