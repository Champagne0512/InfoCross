<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Crown, Users, Clock, ChevronRight, ArrowRight, FileText, Zap } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { fetchTeams } from '@/api/team'
import { fetchTeamApplications, cancelTeamApplication } from '@/api/teamWorkspace'
import type { Team, TeamApplication, TeamApplicationStatus } from '@/types/models'
import { useFrequencyStore } from '@/stores/frequencyStore'

const router = useRouter()

interface TeamWithRole extends Team {
  isOwner: boolean
}

const teams = ref<Team[]>([])
const loading = ref(true)
const { profile } = useAuth()
const frequencyStore = useFrequencyStore()
const hoveredTeamId = ref<number | null>(null)

const userId = computed(() => profile.value?.id ?? '')

// 合并所有小组，添加 isOwner 标记
const allMyTeams = computed<TeamWithRole[]>(() => {
  const myTeams = teams.value.filter(
    (team) => team.ownerId === userId.value || team.members.some((member) => member.id === userId.value)
  )
  return myTeams.map((team) => ({
    ...team,
    isOwner: team.ownerId === userId.value,
  }))
})

// 根据模式筛选
const displayTeams = computed(() => 
  allMyTeams.value.filter((team) => frequencyStore.isFocus ? !team.isVibe : team.isVibe)
)

// 按创建者优先排序（自己创建的排前面）
const sortedTeams = computed(() => 
  [...displayTeams.value].sort((a, b) => {
    if (a.isOwner && !b.isOwner) return -1
    if (!a.isOwner && b.isOwner) return 1
    return 0
  })
)

const ownedTeams = computed(() => sortedTeams.value.filter((team) => team.isOwner))
const joinedTeams = computed(() => sortedTeams.value.filter((team) => !team.isOwner))

// 分离我创建的和我加入的
const applications = ref<TeamApplication[]>([])
const applicationsLoading = ref(true)
const cancelingApplications = ref<Record<number, boolean>>({})
const applicationStatusText: Record<TeamApplicationStatus, string> = {
  pending: '待回复',
  approved: '已通过',
  rejected: '已拒绝',
}

async function loadTeams() {
  loading.value = true
  try {
    teams.value = await fetchTeams()
  } finally {
    loading.value = false
  }
}

async function loadApplications() {
  applicationsLoading.value = true
  try {
    applications.value = await fetchTeamApplications()
  } catch (error) {
    console.error('加载申请记录失败', error)
    applications.value = []
  } finally {
    applicationsLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadTeams(), loadApplications()])
})

const filteredApplications = computed(() =>
  applications.value.filter((app) => (frequencyStore.isFocus ? app.mode === 'focus' : app.mode === 'vibe')),
)

function getApplicationStatusLabel(status: TeamApplicationStatus) {
  return applicationStatusText[status]
}

async function revokeApplication(applicationId: number) {
  cancelingApplications.value = { ...cancelingApplications.value, [applicationId]: true }
  try {
    await cancelTeamApplication(applicationId)
    applications.value = applications.value.filter((app) => app.id !== applicationId)
  } catch (error) {
    console.error('撤销申请失败', error)
  } finally {
    cancelingApplications.value = { ...cancelingApplications.value, [applicationId]: false }
  }
}
</script>

<template>
  <div class="collaboration-hub">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-orb orb-1" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
      <div class="floating-orb orb-2" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
      <div class="floating-orb orb-3" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
    </div>

    <!-- 英雄区域 -->
    <section class="hero-zone">
      <div class="hero-content">
        <p class="hero-eyebrow" :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'">
          COLLABORATION STATION
        </p>
        <h1 class="hero-title">
          让创意在这里
          <span class="title-highlight" :class="frequencyStore.isFocus ? 'highlight-focus' : 'highlight-vibe'">
            碰撞
          </span>
        </h1>
        <p class="hero-desc">
          管理你的团队，追踪协作进展，发现更多可能
        </p>
        
      </div>
    </section>

    <!-- 主要内容区域 -->
    <section class="content-area">
      <!-- 我创建的团队 -->
      <div class="team-section owned-section">
        <div class="section-header">
          <div class="header-icon" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
            <Crown :size="24" />
          </div>
          <div class="header-text">
            <h2 class="section-title">我创建的团队</h2>
            <p class="section-subtitle">{{ ownedTeams.length }} 个团队正在运行</p>
          </div>
        </div>

        <div v-if="loading" class="teams-skeleton">
          <div v-for="i in 2" :key="i" class="skeleton-card"></div>
        </div>

        <div v-else-if="ownedTeams.length" class="teams-grid">
          <div
            v-for="(team, index) in ownedTeams"
            :key="team.id"
            class="team-card premium-card"
            :style="{ animationDelay: `${index * 150}ms` }"
            @mouseenter="hoveredTeamId = team.id"
            @mouseleave="hoveredTeamId = null"
            @click="router.push(`/team/${team.id}`)"
          >
            <div class="card-glow" :class="frequencyStore.isFocus ? 'glow-focus' : 'glow-vibe'"></div>
            <div class="card-content">
              <div class="team-header">
                <div 
                  class="team-avatar large-avatar"
                  :class="frequencyStore.isFocus ? 'avatar-focus' : 'avatar-vibe'"
                >
                  {{ team.name.charAt(0).toUpperCase() }}
                  <div class="avatar-pulse"></div>
                </div>
                <div class="crown-badge">
                  <Crown :size="14" />
                </div>
              </div>
              
              <div class="team-info">
                <h3 class="team-name">{{ team.name }}</h3>
                <p class="team-desc">{{ team.description }}</p>
                
                <div class="team-metrics">
                  <div class="metric">
                    <Users :size="16" />
                    <span>{{ team.currentMembers }}/{{ team.maxMembers }} 成员</span>
                  </div>
                  <div class="metric">
                    <Clock :size="16" />
                    <span>{{ team.createdAt.slice(5, 10) }}</span>
                  </div>
                </div>
              </div>

              <div class="card-action">
                <ChevronRight 
                  :size="20" 
                  class="action-arrow"
                  :class="hoveredTeamId === team.id ? 'arrow-active' : ''"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <Zap :size="48" class="text-slate/30" />
          </div>
          <h3 class="empty-title">还没有创建团队</h3>
          <p class="empty-desc">发起一个项目，开始你的协作之旅</p>
          <RouterLink to="/team" class="empty-action" :class="frequencyStore.isFocus ? 'action-focus' : 'action-vibe'">
            立即创建
          </RouterLink>
        </div>
      </div>

      <!-- 我加入的团队 -->
      <div class="team-section joined-section">
        <div class="section-header">
          <div class="header-icon" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
            <Users :size="24" />
          </div>
          <div class="header-text">
            <h2 class="section-title">我加入的团队</h2>
            <p class="section-subtitle">{{ joinedTeams.length }} 个协作正在进行</p>
          </div>
        </div>

        <div v-if="loading" class="teams-skeleton">
          <div v-for="i in 3" :key="i" class="skeleton-card"></div>
        </div>

        <div v-else-if="joinedTeams.length" class="teams-grid">
          <div
            v-for="(team, index) in joinedTeams"
            :key="team.id"
            class="team-card member-card"
            :style="{ animationDelay: `${index * 150}ms` }"
            @mouseenter="hoveredTeamId = team.id"
            @mouseleave="hoveredTeamId = null"
            @click="router.push(`/team/${team.id}`)"
          >
            <div class="card-glow" :class="frequencyStore.isFocus ? 'glow-focus' : 'glow-vibe'"></div>
            <div class="card-content">
              <div class="team-header">
                <div 
                  class="team-avatar"
                  :class="frequencyStore.isFocus ? 'avatar-focus' : 'avatar-vibe'"
                >
                  {{ team.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              
              <div class="team-info">
                <h3 class="team-name">{{ team.name }}</h3>
                <p class="team-desc">{{ team.description }}</p>
                
                <div class="team-metrics">
                  <div class="metric">
                    <Users :size="16" />
                    <span>{{ team.currentMembers }}/{{ team.maxMembers }}</span>
                  </div>
                  <div class="metric">
                    <span class="college-tag">{{ team.college }}</span>
                  </div>
                </div>
              </div>

              <div class="card-action">
                <ChevronRight 
                  :size="20" 
                  class="action-arrow"
                  :class="hoveredTeamId === team.id ? 'arrow-active' : ''"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <Users :size="48" class="text-slate/30" />
          </div>
          <h3 class="empty-title">还没有加入团队</h3>
          <p class="empty-desc">探索有趣的项目，找到志同道合的伙伴</p>
          <RouterLink to="/team" class="empty-action" :class="frequencyStore.isFocus ? 'action-focus' : 'action-vibe'">
            去探索
          </RouterLink>
        </div>
      </div>

      <!-- 申请记录 -->
      <div class="applications-section">
        <div class="section-header">
          <div class="header-icon" :class="frequencyStore.isFocus ? 'icon-focus' : 'icon-vibe'">
            <FileText :size="24" />
          </div>
          <div class="header-text">
            <h2 class="section-title">申请记录</h2>
            <p class="section-subtitle">跟踪你的申请状态</p>
          </div>
          <RouterLink 
            to="/team" 
            class="section-action"
            :class="frequencyStore.isFocus ? 'action-focus' : 'action-vibe'"
          >
            继续申请
            <ArrowRight :size="16" />
          </RouterLink>
        </div>

        <div v-if="applicationsLoading" class="applications-skeleton">
          <div v-for="i in 3" :key="i" class="skeleton-application"></div>
        </div>

        <div v-else-if="filteredApplications.length" class="applications-list">
          <div
            v-for="(app, index) in filteredApplications"
            :key="app.id"
            class="application-card"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="application-content">
              <!-- 状态标签 - 右上角 -->
              <div class="application-status-corner">
                <span 
                  class="status-badge"
                  :class="{
                    'status-success': app.status === 'approved',
                    'status-pending': app.status === 'pending',
                    'status-danger': app.status === 'rejected'
                  }"
                >
                  {{ getApplicationStatusLabel(app.status) }}
                </span>
              </div>

              <!-- 主要内容 -->
              <div class="application-main">
                <h4 class="application-team">{{ app.teamName }}</h4>
                
                <p v-if="app.preferredRole" class="application-role">
                  意向角色：{{ app.preferredRole }}
                </p>
                
                <p class="application-message">
                  {{ app.message || '未填写申请说明' }}
                </p>
              </div>

              <!-- 撤销按钮 - 右下角 -->
              <div v-if="app.status === 'pending'" class="application-action-corner">
                <button
                  type="button"
                  class="cancel-button"
                  :disabled="cancelingApplications[app.id]"
                  @click="revokeApplication(app.id)"
                >
                  {{ cancelingApplications[app.id] ? '撤销中...' : '撤销申请' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-applications">
          <div class="empty-icon">
            <FileText :size="48" class="text-slate/30" />
          </div>
          <h3 class="empty-title">暂无申请记录</h3>
          <p class="empty-desc">去组队大厅发现感兴趣的团队</p>
          <RouterLink to="/team" class="empty-action" :class="frequencyStore.isFocus ? 'action-focus' : 'action-vibe'">
            开始探索
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.collaboration-hub {
  @apply relative min-h-screen;
}

/* 动态背景 */
.background-animation {
  @apply fixed inset-0 pointer-events-none overflow-hidden;
  z-index: -1;
}

.floating-orb {
  @apply absolute rounded-full opacity-20;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  @apply w-32 h-32 top-20 left-10;
  animation-delay: 0s;
}

.orb-2 {
  @apply w-24 h-24 top-1/2 right-20;
  animation-delay: 2s;
}

.orb-3 {
  @apply w-20 h-20 bottom-32 left-1/3;
  animation-delay: 4s;
}

.orb-focus {
  background: radial-gradient(circle, rgba(147, 168, 172, 0.3) 0%, transparent 70%);
}

.orb-vibe {
  background: radial-gradient(circle, rgba(217, 166, 159, 0.3) 0%, transparent 70%);
}

/* 英雄区域 */
.hero-zone {
  @apply pt-8 pb-12 text-center;
}

.hero-content {
  @apply max-w-4xl mx-auto space-y-6;
}

.hero-eyebrow {
  @apply font-mono text-xs tracking-[0.5em] uppercase text-slate/70;
  animation: slideDown 0.8s ease-out;
}

.hero-title {
  @apply text-4xl lg:text-5xl font-sans font-bold text-charcoal leading-tight;
  animation: slideUp 1s ease-out 0.2s both;
}

.title-highlight {
  @apply relative;
}

.highlight-focus {
  @apply text-focus-accent;
}

.highlight-vibe {
  @apply text-vibe-accent;
}

.title-highlight::after {
  content: '';
  @apply absolute -bottom-2 left-0 right-0 h-1 rounded-full;
  animation: expandWidth 1.2s ease-out 0.8s both;
}

.highlight-focus::after {
  @apply bg-focus-accent/30;
}

.highlight-vibe::after {
  @apply bg-vibe-accent/30;
}

.hero-desc {
  @apply text-lg text-slate max-w-2xl mx-auto;
  animation: fadeIn 1s ease-out 0.4s both;
}

/* 内容区域 */
.content-area {
  @apply space-y-12 pb-16;
}

/* 区块样式 */
.team-section,
.applications-section {
  @apply space-y-6;
}

.section-header {
  @apply flex items-center justify-between;
}

.header-icon {
  @apply w-12 h-12 rounded-2xl flex items-center justify-center;
  @apply transition-all duration-300;
}

.icon-focus {
  @apply bg-focus-primary/15 text-focus-accent;
}

.icon-vibe {
  @apply bg-vibe-primary/15 text-vibe-accent;
}

.header-text {
  @apply flex-1 ml-4;
}

.section-title {
  @apply text-2xl font-sans font-bold text-charcoal;
}

.section-subtitle {
  @apply text-base text-slate mt-1;
}

.section-action {
  @apply flex items-center gap-2 font-sans text-base font-medium;
  @apply transition-colors duration-200;
}

.action-focus {
  @apply text-focus-accent hover:text-focus-accent/80;
}

.action-vibe {
  @apply text-vibe-accent hover:text-vibe-accent/80;
}

/* 团队网格 */
.teams-grid {
  @apply grid gap-4 md:grid-cols-2 xl:grid-cols-3 max-w-[1100px];
}

.team-card {
  @apply relative rounded-2xl bg-white border border-slate/10 p-5;
  @apply cursor-pointer transition-all duration-300;
  @apply hover:shadow-2xl hover:-translate-y-1.5;
  animation: slideUp 0.6s ease-out both;
  overflow: hidden;
}

.premium-card {
  @apply border-2;
}

.premium-card.team-card {
  border-color: rgba(147, 168, 172, 0.3);
}

.card-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-500;
  @apply rounded-3xl pointer-events-none;
}

.team-card:hover .card-glow {
  @apply opacity-100;
}

.glow-focus {
  background: radial-gradient(circle at 50% 0%, rgba(147, 168, 172, 0.1) 0%, transparent 70%);
}

.glow-vibe {
  background: radial-gradient(circle at 50% 0%, rgba(217, 166, 159, 0.1) 0%, transparent 70%);
}

.card-content {
  @apply relative z-10 space-y-3;
}

.team-header {
  @apply relative flex items-center justify-center;
}

.team-avatar {
  @apply w-14 h-14 rounded-2xl flex items-center justify-center;
  @apply font-sans font-bold text-white text-lg;
  @apply transition-transform duration-300;
  position: relative;
}

.large-avatar {
  @apply w-16 h-16 text-xl;
}

.team-card:hover .team-avatar {
  @apply scale-110;
}

.avatar-focus {
  @apply bg-gradient-to-br from-focus-primary to-focus-accent;
}

.avatar-vibe {
  @apply bg-gradient-to-br from-vibe-primary to-vibe-accent;
}

.avatar-pulse {
  @apply absolute inset-0 rounded-2xl opacity-0;
  background: inherit;
  animation: pulse-ring 2s ease-out infinite;
}

.crown-badge {
  @apply absolute -top-2 -right-2 w-8 h-8 rounded-full;
  @apply bg-amber-100 text-amber-600 flex items-center justify-center;
  @apply border-2 border-white shadow-lg;
}

.team-info {
  @apply text-center space-y-3;
}

.team-name {
  @apply text-xl font-sans font-bold text-charcoal;
}

.team-desc {
  @apply text-base text-slate line-clamp-2 leading-relaxed;
}

.team-metrics {
  @apply flex items-center justify-center gap-4;
}

.metric {
  @apply flex items-center gap-2 font-sans text-sm text-slate;
}

.college-tag {
  @apply px-3 py-1 rounded-full bg-slate/10 font-mono text-xs;
}

.card-action {
  @apply flex justify-center;
}

.action-arrow {
  @apply text-slate/40 transition-all duration-300;
}

.arrow-active {
  @apply text-slate/70 scale-125;
}

/* 申请记录 */
.applications-list {
  @apply space-y-3;
}

.application-card {
  @apply relative rounded-xl bg-white border border-slate/10 p-4;
  @apply transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5;
  animation: slideUp 0.6s ease-out both;
}

.application-content {
  @apply relative;
}

.application-status-corner {
  @apply absolute top-0 right-0;
}

.application-main {
  @apply pr-20 pb-8 space-y-3;
}

.application-action-corner {
  @apply absolute bottom-0 right-0;
}

.application-team {
  @apply text-base font-sans font-bold text-charcoal;
}

.application-role {
  @apply text-sm text-slate;
}

.application-message {
  @apply text-sm text-slate/80 leading-relaxed;
}

.status-badge {
  @apply px-2.5 py-1 rounded-full font-mono text-xs font-medium;
}

.status-success {
  @apply bg-emerald-100 text-emerald-700;
}

.status-pending {
  @apply bg-amber-100 text-amber-700;
}

.status-danger {
  @apply bg-red-100 text-red-600;
}

.cancel-button {
  @apply px-3 py-1.5 rounded-lg font-sans text-xs;
  @apply bg-slate/10 text-slate hover:bg-red-50 hover:text-red-500;
  @apply transition-colors duration-200;
}

.cancel-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* 空状态 */
.empty-state,
.empty-applications {
  @apply py-12 text-center space-y-3;
}

.empty-icon {
  @apply flex justify-center mb-4;
}

.empty-title {
  @apply text-lg font-sans font-semibold text-charcoal;
}

.empty-desc {
  @apply text-sm text-slate;
}

.empty-action {
  @apply inline-flex items-center px-4 py-2 rounded-lg;
  @apply font-sans text-sm font-medium text-white;
  @apply transition-all duration-200 hover:scale-105;
}

/* 骨架屏 */
.teams-skeleton,
.applications-skeleton {
  @apply grid gap-4 md:grid-cols-2 lg:grid-cols-3;
}

.skeleton-card {
  @apply h-48 rounded-2xl bg-slate/10 animate-pulse;
}

.skeleton-application {
  @apply h-24 rounded-xl bg-slate/10 animate-pulse;
}

/* 动画定义 */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(10px) rotate(240deg); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes expandWidth {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-title {
    @apply text-2xl;
  }
  
  .quick-stats {
    @apply flex-col gap-2;
  }
  
  .stat-connector {
    @apply w-0.5 h-3;
  }
  
  .teams-grid {
    @apply grid-cols-1;
  }
}
</style>
