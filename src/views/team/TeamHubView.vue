<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Crown, Users, Clock, ChevronRight } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { fetchTeams } from '@/api/team'
import type { Team } from '@/types/models'
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

const applications = ref([
  { teamName: 'RAG 推荐引擎 Demo 团队', status: '已通过', message: '等待队长安排第一次群聊', mode: 'focus' },
  { teamName: '社区公益黑客松筹备组', status: '待回复', message: '队长通常 24h 内确认', mode: 'focus' },
  { teamName: '夜跑呼吸 Vibe 队', status: '已发送', message: '动态有效期内可随时撤回', mode: 'vibe' },
])

onMounted(async () => {
  loading.value = true
  try {
    teams.value = await fetchTeams()
  } finally {
    loading.value = false
  }
})

const filteredApplications = computed(() =>
  applications.value.filter((app) => (frequencyStore.isFocus ? app.mode === 'focus' : app.mode === 'vibe')),
)

const stats = computed(() => ({
  owned: sortedTeams.value.filter(t => t.isOwner).length,
  joined: sortedTeams.value.filter(t => !t.isOwner).length,
  pending: filteredApplications.value.filter((app) => app.status !== '已通过').length,
}))
</script>

<template>
  <div class="space-y-8">
    <!-- 页面头部 -->
    <section class="header-section">
      <div class="header-left">
        <p class="font-mono text-mono text-slate mb-2 tracking-wider">INFOCROSS CREW</p>
        <h1 class="text-hero font-sans font-bold text-charcoal mb-3 leading-tight">协作空间</h1>
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
        <RouterLink 
          to="/publish" 
          class="px-4 py-2 rounded-full font-sans text-sm font-medium transition-all duration-300"
          :class="frequencyStore.isFocus 
            ? 'bg-focus-accent text-white hover:bg-focus-accent/90' 
            : 'bg-vibe-accent text-white hover:bg-vibe-accent/90'"
        >
          发起新项目
        </RouterLink>
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
          <!-- 创建者标志 -->
          <div v-if="team.isOwner" class="owner-badge">
            <Crown :size="12" />
            <span>创建者</span>
          </div>

          <!-- 卡片头部 -->
          <div class="card-header">
            <div 
              class="team-avatar"
              :class="frequencyStore.isFocus ? 'avatar-focus' : 'avatar-vibe'"
            >
              {{ team.name.charAt(0).toUpperCase() }}
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
    <section v-if="filteredApplications.length" class="mt-10">
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

      <div class="space-y-3">
        <div
          v-for="(app, index) in filteredApplications"
          :key="app.teamName"
          class="application-card"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <div class="flex-1">
            <p class="font-sans font-medium text-charcoal">{{ app.teamName }}</p>
            <p class="font-sans text-sm text-slate">{{ app.message }}</p>
          </div>
          <span 
            class="status-badge"
            :class="{
              'status-success': app.status === '已通过',
              'status-pending': app.status === '待回复',
              'status-sent': app.status === '已发送'
            }"
          >
            {{ app.status }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 头部区域 */
.header-section {
  @apply flex items-start justify-between py-8 lg:py-10 gap-8;
}

.header-left {
  @apply flex-1;
}

/* 统计卡片 */
.stats-cards {
  @apply flex gap-4;
}

.stat-card {
  @apply px-6 py-5 rounded-2xl bg-white border border-slate/10 text-center min-w-[100px];
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

/* 创建者标志 */
.owner-badge {
  @apply absolute top-3 right-3 flex items-center gap-1;
  @apply px-2 py-1 rounded-full;
  @apply bg-gradient-to-r from-amber-400 to-orange-400;
  @apply text-white text-xs font-medium;
  @apply shadow-sm;
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
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

.status-sent {
  @apply bg-slate/10 text-slate;
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
</style>
