<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Crown, Users, Clock, ChevronRight } from 'lucide-vue-next'
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

const stats = computed(() => ({
  owned: sortedTeams.value.filter(t => t.isOwner).length,
  joined: sortedTeams.value.filter(t => !t.isOwner).length,
  pending: filteredApplications.value.filter((app) => app.status !== 'approved').length,
}))
</script>

<template>
  <div class="space-y-8">
    <!-- 页面头部 -->
    <section class="header-section">
      <div class="header-left">
        <p class="font-mono text-mono text-slate tracking-wider">INFOCROSS CREW</p>
        <h1 class="text-display font-sans font-bold text-charcoal leading-tight">协作空间</h1>
        <p class="text-body font-sans text-slate leading-relaxed max-w-md">
          统一管理你加入与发起的队伍，查看申请状态，与队员保持沟通
        </p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card" :class="frequencyStore.isFocus ? 'stat-card-focus' : 'stat-card-vibe'">
          <p class="font-mono text-3xl font-bold" :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'">{{ stats.owned }}</p>
          <p class="font-sans text-sm text-slate mt-1">发起队伍</p>
        </div>
        <div class="stat-card" :class="frequencyStore.isFocus ? 'stat-card-focus' : 'stat-card-vibe'">
          <p class="font-mono text-3xl font-bold" :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'">{{ stats.joined }}</p>
          <p class="font-sans text-sm text-slate mt-1">已加入</p>
        </div>
        <div class="stat-card" :class="frequencyStore.isFocus ? 'stat-card-focus' : 'stat-card-vibe'">
          <p class="font-mono text-3xl font-bold" :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'">{{ stats.pending }}</p>
          <p class="font-sans text-sm text-slate mt-1">待确认</p>
        </div>
      </div>
    </section>

    <!-- 小组列表 -->
    <section>
      <header class="flex items-center justify-between mb-6">
        <div>
          <p class="font-mono text-mono text-xs text-slate tracking-wider mb-1">MY TEAMS</p>
          <h2 class="text-h2 font-sans font-semibold text-charcoal">我的小组</h2>
        </div>
      </header>

      <!-- 加载状态 -->
      <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="index in 6" :key="index" class="team-card-skeleton">
          <div class="h-4 w-24 bg-slate/10 rounded mb-3"></div>
          <div class="h-6 w-3/4 bg-slate/10 rounded mb-2"></div>
          <div class="h-4 w-full bg-slate/10 rounded"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!sortedTeams.length" class="empty-state">
        <div class="empty-icon">
          <Users :size="32" class="text-slate/40" />
        </div>
        <p class="font-sans text-slate mb-4">当前模式下暂无小组</p>
        <RouterLink 
          to="/team" 
          class="font-sans text-sm"
          :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
        >
          去组队大厅探索 →
        </RouterLink>
      </div>

      <!-- 小组列表 -->
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(team, index) in sortedTeams"
          :key="team.id"
          class="team-card cursor-pointer"
          :class="{ 'team-card-owner': team.isOwner }"
          :style="{ animationDelay: `${index * 50}ms` }"
          @mouseenter="hoveredTeamId = team.id"
          @mouseleave="hoveredTeamId = null"
          @click="router.push(`/team/${team.id}`)"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="avatar-wrapper">
              <div 
                class="team-avatar"
                :class="frequencyStore.isFocus ? 'avatar-focus' : 'avatar-vibe'"
              >
                {{ team.name.charAt(0).toUpperCase() }}
              </div>
              <div
                v-if="team.isOwner"
                class="owner-mark"
                :class="frequencyStore.isFocus ? 'owner-mark-focus' : 'owner-mark-vibe'"
                aria-label="创建者身份标记"
              >
                <Crown :size="10" stroke-width="1.8" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-sans font-semibold text-charcoal truncate">{{ team.name }}</h3>
              <p class="font-mono text-xs text-slate">{{ team.college }}</p>
            </div>
            <ChevronRight 
              :size="18" 
              class="chevron-icon"
              :class="hoveredTeamId === team.id ? 'chevron-active' : ''"
            />
          </div>

          <!-- 卡片内容 -->
          <p class="font-sans text-sm text-slate line-clamp-2 mb-4">{{ team.description }}</p>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <div class="flex items-center gap-4">
              <div class="stat-item">
                <Users :size="14" class="text-slate/60" />
                <span class="font-mono text-xs text-slate">{{ team.currentMembers }}/{{ team.maxMembers }}</span>
              </div>
              <div class="stat-item">
                <Clock :size="14" class="text-slate/60" />
                <span class="font-mono text-xs text-slate">{{ team.createdAt.slice(5, 10) }}</span>
              </div>
            </div>
            <button 
              v-if="team.isOwner"
              class="action-btn action-btn-primary"
              :class="frequencyStore.isFocus ? 'btn-focus' : 'btn-vibe'"
            >
              管理
            </button>
            <button v-else class="action-btn action-btn-ghost">
              查看
            </button>
          </div>

          <!-- 悬浮光效 -->
          <div class="card-glow" :class="frequencyStore.isFocus ? 'glow-focus' : 'glow-vibe'"></div>
        </div>
      </div>
    </section>

    <!-- 申请状态 -->
    <section class="mt-10">
      <header class="flex items-center justify-between mb-6">
        <div>
          <p class="font-mono text-mono text-xs text-slate tracking-wider mb-1">APPLICATIONS</p>
          <h2 class="text-h2 font-sans font-semibold text-charcoal">申请记录</h2>
        </div>
        <RouterLink 
          to="/team" 
          class="font-sans text-sm"
          :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
        >
          继续申请 →
        </RouterLink>
      </header>

      <div v-if="applicationsLoading" class="space-y-3">
        <div
          v-for="index in 3"
          :key="index"
          class="application-skeleton"
        ></div>
      </div>

      <div v-else-if="filteredApplications.length" class="space-y-3">
        <div
          v-for="(app, index) in filteredApplications"
          :key="app.id"
          class="application-card"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <div class="flex-1">
            <p class="font-sans font-medium text-charcoal">{{ app.teamName }}</p>
            <p v-if="app.preferredRole" class="text-xs text-slate/70 mt-0.5">意向角色：{{ app.preferredRole }}</p>
            <p class="font-sans text-sm text-slate">{{ app.message || '未填写备注' }}</p>
          </div>
          <div class="application-side">
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
            <button
              v-if="app.status === 'pending'"
              type="button"
              class="application-cancel-btn"
              :disabled="cancelingApplications[app.id]"
              @click="revokeApplication(app.id)"
            >
              {{ cancelingApplications[app.id] ? '撤销中…' : '撤销申请' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="application-empty" :class="frequencyStore.isFocus ? 'empty-focus' : 'empty-vibe'">
        <p class="font-sans text-slate mb-2">暂无申请记录</p>
        <RouterLink
          to="/team"
          class="font-sans text-sm"
          :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
        >
          去组队大厅探索 →
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 头部区域 */

.header-section {
  @apply flex flex-col lg:flex-row items-start justify-between gap-6 py-4;
}

.header-left {
  @apply flex-1 space-y-2;
}

/* 统计卡片 */
.stats-cards {
  @apply grid grid-cols-3 gap-3 w-full lg:max-w-md;
}

.stat-card {
  @apply px-4 py-4 rounded-xl bg-white border border-slate/10 text-center;
  @apply transition-all duration-300 hover:shadow-morandi hover:-translate-y-0.5;
}

.stat-card-focus {
  @apply hover:border-focus-primary/30;
}

.stat-card-vibe {
  @apply hover:border-vibe-primary/30;
}

/* 小组卡片骨架屏 */
.team-card-skeleton {
  @apply rounded-2xl bg-white/60 p-5 animate-pulse;
}

/* 空状态 */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply w-16 h-16 rounded-full bg-slate/5 flex items-center justify-center mb-4;
}

/* 小组卡片 */
.team-card {
  @apply relative rounded-2xl bg-white p-5 border border-slate/10;
  @apply transition-all duration-300 ease-out;
  @apply hover:shadow-morandi-hover hover:-translate-y-1;
  @apply animate-fade-in;
  overflow: hidden;
}

.team-card-owner {
  @apply border-2;
  border-color: var(--owner-border-color, rgba(147, 168, 172, 0.3));
}

/* 头像与创建者标记 */
.avatar-wrapper {
  @apply relative;
}

.owner-mark {
  @apply absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center;
  @apply text-[10px] border backdrop-blur-xl bg-white/90;
}

.owner-mark-focus {
  border-color: rgba(147, 168, 172, 0.6);
  color: #62838a;
  box-shadow: 0 4px 12px rgba(147, 168, 172, 0.35);
}

.owner-mark-vibe {
  border-color: rgba(196, 136, 126, 0.6);
  color: #a55f54;
  box-shadow: 0 4px 12px rgba(196, 136, 126, 0.35);
}

/* 卡片头部 */
.card-header {
  @apply flex items-center gap-3 mb-3;
}

.team-avatar {
  @apply w-10 h-10 rounded-xl flex items-center justify-center;
  @apply font-sans font-bold text-white text-sm;
  @apply transition-transform duration-300;
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

/* 箭头图标 */
.chevron-icon {
  @apply text-slate/30 transition-all duration-300;
}

.chevron-active {
  @apply text-slate/60 translate-x-1;
}

/* 卡片底部 */
.card-footer {
  @apply flex items-center justify-between pt-3 border-t border-slate/10;
}

.stat-item {
  @apply flex items-center gap-1.5;
}

/* 操作按钮 */
.action-btn {
  @apply px-3 py-1.5 rounded-full font-sans text-xs font-medium;
  @apply transition-all duration-200;
}

.action-btn-primary {
  @apply text-white;
}

.btn-focus {
  @apply bg-focus-accent hover:bg-focus-accent/90;
}

.btn-vibe {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}

.action-btn-ghost {
  @apply bg-slate/5 text-slate hover:bg-slate/10;
}

/* 悬浮光效 */
.card-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none;
  @apply rounded-2xl;
}

.team-card:hover .card-glow {
  @apply opacity-100;
}

.glow-focus {
  background: radial-gradient(circle at 50% 0%, rgba(147, 168, 172, 0.08) 0%, transparent 70%);
}

.glow-vibe {
  background: radial-gradient(circle at 50% 0%, rgba(167, 139, 250, 0.08) 0%, transparent 70%);
}

/* 申请卡片 */
.application-card {
  @apply flex items-center gap-4 p-4 rounded-xl bg-white border border-slate/10;
  @apply transition-all duration-300;
  @apply hover:shadow-morandi-sm;
  @apply animate-slide-up;
}

.application-side {
  @apply flex flex-col items-end gap-2 min-w-[110px];
}

.application-cancel-btn {
  @apply text-xs font-sans text-slate underline decoration-dotted decoration-1 underline-offset-4;
  @apply transition-colors duration-200;
}

.application-cancel-btn:hover {
  @apply text-charcoal;
}

.application-cancel-btn:disabled {
  @apply text-slate/50 cursor-not-allowed;
}

.application-skeleton {
  @apply h-16 rounded-xl bg-white border border-slate/10 relative overflow-hidden;
}

.application-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(147,168,172,0.08), rgba(255,255,255,0));
  animation: shimmer 1.5s infinite;
}

.application-empty {
  @apply flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate/20 py-10 bg-white/60 text-center;
}

.empty-focus {
  @apply border-focus-primary/40;
}

.empty-vibe {
  @apply border-vibe-primary/40;
}

/* 状态标签 */
.status-badge {
  @apply px-3 py-1 rounded-full font-mono text-xs;
}

.status-success {
  @apply bg-emerald-50 text-emerald-600;
}

.status-pending {
  @apply bg-amber-50 text-amber-600;
}

.status-danger {
  @apply bg-red-50 text-red-500;
}

/* 动画 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
