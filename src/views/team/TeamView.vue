<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TeamCard from '@/components/team/TeamCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import { fetchTeams } from '@/api/team'
import { useFrequencyStore } from '@/stores/frequencyStore'
import JoinTeamModal from '@/components/team/JoinTeamModal.vue'
import TeamDetailModal from '@/components/team/TeamDetailModal.vue'
import type { Team } from '@/types/models'
import { useAuth } from '@/composables/useAuth'
import { createTeamApplication } from '@/api/teamWorkspace'

const frequencyStore = useFrequencyStore()
const { profile } = useAuth()
const currentUserId = computed(() => profile.value?.id || '')

const teams = ref<Team[]>([])
const loading = ref(true)
const filterExpanded = ref(false)
const showDrawer = ref(false)
const selectedTeam = ref<Team | null>(null)
const detailTeam = ref<Team | null>(null)
const showDetailModal = ref(false)
const toastMessage = ref('')
const feedbackDialog = ref<{ teamName: string; mode: 'focus' | 'vibe' } | null>(null)

// 筛选状态
const searchQuery = ref('')
const selectedType = ref<string>('all')
const selectedCollege = ref<string>('all')
const selectedSkill = ref<string>('all')
const selectedStatus = ref<string>('all')

// Focus 模式筛选选项
const focusTeamTypes = [
  { label: '全部类型', value: 'all' },
  { label: '科研团队', value: 'research' },
  { label: '比赛组队', value: 'competition' },
  { label: '项目合作', value: 'project' },
  { label: '学习小组', value: 'study' },
]

// Vibe 模式筛选选项
const vibeTeamTypes = [
  { label: '全部类型', value: 'all' },
  { label: '约饭搭子', value: 'meal' },
  { label: '运动约伴', value: 'sports' },
  { label: '拼车出行', value: 'carpool' },
  { label: '游戏开黑', value: 'gaming' },
  { label: '自习搭子', value: 'study' },
]

const teamTypes = computed(() => 
  frequencyStore.isFocus ? focusTeamTypes : vibeTeamTypes
)

const colleges = [
  { label: '全部学院', value: 'all' },
  { label: '计算机学院', value: '计算机学院' },
  { label: '建筑学院', value: '建筑学院' },
  { label: '商学院', value: '商学院' },
  { label: '文学院', value: '文学院' },
]

const skills = [
  { label: '全部技能', value: 'all' },
  { label: '前端开发', value: '前端开发' },
  { label: '后端开发', value: '后端开发' },
  { label: 'UI设计', value: 'UI设计' },
  { label: '数据分析', value: '数据分析' },
  { label: 'AI/ML', value: 'AI/ML' },
  { label: '产品运营', value: '产品运营' },
]

// Vibe 模式的时效选项
const vibeLifespans = [
  { label: '全部时效', value: 'all' },
  { label: '2小时内', value: '2h' },
  { label: '今天内', value: 'today' },
  { label: '本周内', value: 'week' },
]

const statuses = [
  { label: '全部状态', value: 'all' },
  { label: '招募中', value: 'recruiting' },
  { label: '已满员', value: 'full' },
]

// 计算筛选结果
const userId = computed(() => profile.value?.id ?? '')

const visibleTeams = computed(() =>
  teams.value.filter((team) => {
    const matchesMode = frequencyStore.isFocus ? !team.isVibe : Boolean(team.isVibe)
    if (!matchesMode) return false
    if (!userId.value) return true
    const isOwner = team.ownerId === userId.value
    const isMember = team.members.some((member) => member.id === userId.value)
    return !isOwner && !isMember
  })
)

const filteredTeams = computed(() => {
  let result = visibleTeams.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(team => 
      team.name.toLowerCase().includes(query) ||
      team.description.toLowerCase().includes(query) ||
      team.requiredSkills?.some(skill => skill.toLowerCase().includes(query)) ||
      team.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (selectedType.value !== 'all') {
    result = result.filter(team => team.type === selectedType.value)
  }

  if (selectedCollege.value !== 'all') {
    result = result.filter(team => team.college === selectedCollege.value)
  }

  if (selectedSkill.value !== 'all') {
    result = result.filter(team => 
      team.requiredSkills?.includes(selectedSkill.value) ||
      team.members?.some(member => member.skills?.includes(selectedSkill.value))
    )
  }

  if (selectedStatus.value !== 'all') {
    if (selectedStatus.value === 'recruiting') {
      result = result.filter(team => team.currentMembers < team.maxMembers)
    } else if (selectedStatus.value === 'full') {
      result = result.filter(team => team.currentMembers >= team.maxMembers)
    }
  }

  return result
})

// 页面配置
const pageConfig = computed(() => {
  if (frequencyStore.isFocus) {
    return {
      subtitle: 'DEEP FOCUS',
      title: '发现协作',
      desc: '跨学科科研组队、高难度课程问答、考研资料共享。内容越沉淀越有价值。',
      createText: '发起长期项目',
      searchLabel: '搜索项目/团队',
      searchPlaceholder: '搜索科研项目、比赛、技能...',
      emptyTitle: '暂无匹配的项目',
      emptyDesc: '尝试调整筛选条件，或发起一个新项目',
      countUnit: '团队',
    }
  }
  return {
    subtitle: 'VIBE MODE',
    title: '发现约伴',
    desc: '约饭搭子、运动约伴、拼车出行。所有动态限时可见，永远新鲜。',
    createText: '发起即时约伴',
    searchLabel: '搜索约伴',
    searchPlaceholder: '搜索约饭、运动、拼车...',
    emptyTitle: '暂无约伴动态',
    emptyDesc: '成为第一个发起约伴的人吧',
    countUnit: '约伴',
  }
})

onMounted(async () => {
  await loadTeams()
})

watch(
  () => frequencyStore.mode,
  async () => {
    resetFilters()
    await loadTeams()
  },
)

async function loadTeams() {
  loading.value = true
  try {
    teams.value = await fetchTeams({ mode: frequencyStore.mode })
  } finally {
    loading.value = false
  }
}

async function handleJoinTeam(team: Team) {
  selectedTeam.value = team
  showDrawer.value = true
}

function handleViewTeam(team: Team) {
  detailTeam.value = team
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  detailTeam.value = null
}

function resetFilters() {
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedCollege.value = 'all'
  selectedSkill.value = 'all'
  selectedStatus.value = 'all'
}

async function handleDrawerSubmit(payload: { teamId: number; role: string; message: string }) {
  try {
    const messageParts: string[] = []
    if (payload.role) {
      messageParts.push(`意向角色：${payload.role}`)
    }
    if (payload.message) {
      messageParts.push(payload.message)
    }
    await createTeamApplication(payload.teamId, {
      preferredRole: payload.role || undefined,
      message: messageParts.join(' | ') || undefined,
      mode: frequencyStore.isFocus ? 'focus' : 'vibe',
    })
    toastMessage.value = ''
    showDrawer.value = false
    const targetTeam = teams.value.find((team) => team.id === payload.teamId) || selectedTeam.value
    feedbackDialog.value = {
      teamName: targetTeam?.name ?? '该小组',
      mode: frequencyStore.mode,
    }
  } catch (error) {
    toastMessage.value = '申请提交失败，请稍后再试。'
    console.error(error)
  }
}

function closeFeedbackDialog() {
  feedbackDialog.value = null
}
</script>

<template>
  <div class="space-y-10">
    <!-- 页面标题 -->
    <section class="max-w-4xl mx-auto text-center">
      <p 
        class="font-mono text-mono mb-4 tracking-wider transition-colors duration-300"
        :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
      >
        {{ pageConfig.subtitle }}
      </p>
      <h1 class="text-hero font-sans font-bold text-charcoal mb-6 leading-tight">
        {{ pageConfig.title }}
      </h1>
      <p class="text-body font-sans text-slate mb-8 max-w-2xl mx-auto leading-relaxed">
        {{ pageConfig.desc }}
      </p>
      <div class="flex justify-center gap-4">
        <AppButton 
          variant="primary" 
          :class="frequencyStore.isVibe ? 'vibe-button' : ''"
          @click="$router.push('/publish?type=team&mode=' + frequencyStore.mode)"
        >
          {{ pageConfig.createText }}
        </AppButton>
        <AppButton variant="ghost" @click="loadTeams">刷新列表</AppButton>
      </div>
      <p
        v-if="toastMessage"
        class="mt-4 text-center text-sm text-focus-accent"
      >
        {{ toastMessage }}
      </p>
    </section>

    <!-- 筛选面板 -->
    <section 
      class="rounded-morandi p-6 transition-all duration-500 shadow-morandi backdrop-blur-sm"
      :class="frequencyStore.isFocus 
        ? 'bg-card-focus border border-focus-primary/20' 
        : 'bg-card-vibe border border-vibe-primary/20'"
    >
      <!-- 筛选头部 -->
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <label class="block text-xs font-semibold text-slate mb-2">{{ pageConfig.searchLabel }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate/70">
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.5 12h-.79l-.28-.27A6 6 0 1013.5 12zm-5 0a4 4 0 110-8 4 4 0 010 8zm5.71 1.29L17 16.09 15.59 17.5l-2.79-2.79 1.41-1.42z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="pageConfig.searchPlaceholder"
              class="w-full rounded-soft border px-11 py-3 font-sans text-sm outline-none transition"
              :class="frequencyStore.isFocus
                ? 'border-slate/20 bg-white focus:border-focus-primary focus:ring-2 focus:ring-focus-primary/20'
                : 'border-vibe-primary/20 bg-white focus:border-vibe-primary focus:ring-2 focus:ring-vibe-primary/20'"
            />
          </div>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-3 rounded-soft font-sans text-sm transition-all"
          :class="frequencyStore.isFocus 
            ? 'text-focus-accent hover:bg-focus-primary/10' 
            : 'text-vibe-accent hover:bg-vibe-primary/10'"
          @click="filterExpanded = !filterExpanded"
        >
          <span>{{ filterExpanded ? '收起筛选' : '展开筛选' }}</span>
          <span class="transition-transform text-xs" :class="filterExpanded ? 'rotate-180' : ''">V</span>
        </button>
      </div>

      <!-- 筛选选项 -->
      <div 
        class="overflow-hidden transition-all duration-300"
        :class="filterExpanded ? 'mt-8 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 mt-0'"
      >
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <!-- 类型 -->
          <div>
            <label class="block font-mono text-mono text-slate text-xs mb-3 tracking-wider">
              {{ frequencyStore.isFocus ? '项目类型' : '约伴类型' }}
            </label>
            <div class="space-y-2">
              <button
                v-for="type in teamTypes"
                :key="type.value"
                class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
                :class="selectedType === type.value
                  ? (frequencyStore.isFocus 
                      ? 'bg-focus-primary/20 text-focus-accent font-medium' 
                      : 'bg-vibe-primary/20 text-vibe-accent font-medium')
                  : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
                @click="selectedType = type.value"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- 学院 / 地点 -->
          <div>
            <label class="block font-mono text-mono text-slate text-xs mb-3 tracking-wider">
              {{ frequencyStore.isFocus ? '学院' : '地点' }}
            </label>
            <div class="space-y-2">
              <button
                v-for="college in colleges"
                :key="college.value"
                class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
                :class="selectedCollege === college.value
                  ? (frequencyStore.isFocus 
                      ? 'bg-focus-primary/20 text-focus-accent font-medium' 
                      : 'bg-vibe-primary/20 text-vibe-accent font-medium')
                  : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
                @click="selectedCollege = college.value"
              >
                {{ college.label }}
              </button>
            </div>
          </div>

          <!-- 技能 / 时效 -->
          <div>
            <label class="block font-mono text-mono text-slate text-xs mb-3 tracking-wider">
              {{ frequencyStore.isFocus ? '所需技能' : '时效' }}
            </label>
            <div class="space-y-2">
              <template v-if="frequencyStore.isFocus">
                <button
                  v-for="skill in skills"
                  :key="skill.value"
                  class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
                  :class="selectedSkill === skill.value
                    ? 'bg-focus-primary/20 text-focus-accent font-medium'
                    : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
                  @click="selectedSkill = skill.value"
                >
                  {{ skill.label }}
                </button>
              </template>
              <template v-else>
                <button
                  v-for="lifespan in vibeLifespans"
                  :key="lifespan.value"
                  class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
                  :class="selectedSkill === lifespan.value
                    ? 'bg-vibe-primary/20 text-vibe-accent font-medium'
                    : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
                  @click="selectedSkill = lifespan.value"
                >
                  {{ lifespan.label }}
                </button>
              </template>
            </div>
          </div>

          <!-- 状态 -->
          <div>
            <label class="block font-mono text-mono text-slate text-xs mb-3 tracking-wider">招募状态</label>
            <div class="space-y-2">
              <button
                v-for="status in statuses"
                :key="status.value"
                class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
                :class="selectedStatus === status.value
                  ? (frequencyStore.isFocus 
                      ? 'bg-focus-primary/20 text-focus-accent font-medium' 
                      : 'bg-vibe-primary/20 text-vibe-accent font-medium')
                  : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
                @click="selectedStatus = status.value"
              >
                {{ status.label }}
              </button>
            </div>
          </div>

          <!-- 操作 -->
          <div class="flex items-end">
            <div class="w-full space-y-3">
              <AppButton variant="ghost" @click="resetFilters" class="w-full">
                重置筛选
              </AppButton>
              <div class="text-center">
                <p class="font-mono text-mono text-slate text-xs">
                  找到 {{ filteredTeams.length }} 个{{ pageConfig.countUnit }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 团队/约伴列表 -->
    <section>
      <div v-if="loading" class="grid gap-8 md:grid-cols-2">
        <div 
          v-for="index in 6" 
          :key="index" 
          class="h-96 rounded-morandi animate-pulse"
          :class="frequencyStore.isFocus ? 'bg-focus-primary/10' : 'bg-vibe-primary/10'"
        />
      </div>
      
      <div v-else-if="filteredTeams.length === 0" class="morandi-card-base p-12 text-center">
        <div 
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 font-sans text-2xl"
          :class="frequencyStore.isFocus ? 'bg-focus-primary/20 text-focus-accent' : 'bg-vibe-primary/20 text-vibe-accent'"
        >
          ?
        </div>
        <h3 class="text-h2 font-sans font-semibold text-charcoal mb-3">
          {{ pageConfig.emptyTitle }}
        </h3>
        <p class="text-body font-sans text-slate mb-8">
          {{ pageConfig.emptyDesc }}
        </p>
        <AppButton 
          variant="primary" 
          :class="frequencyStore.isVibe ? 'vibe-button' : ''"
          @click="resetFilters"
        >
          重置筛选
        </AppButton>
      </div>
      
      <div v-else class="grid gap-8 md:grid-cols-2">
        <TeamCard
          v-for="team in filteredTeams"
          :key="team.id"
          :team="team"
          :mode="frequencyStore.mode"
          @join="handleJoinTeam"
          @view="handleViewTeam"
        />
      </div>
    </section>
  </div>

<JoinTeamModal
  :open="showDrawer"
  :team="selectedTeam"
  :mode="frequencyStore.mode"
  @close="showDrawer = false"
  @submit="handleDrawerSubmit"
/>

<TeamDetailModal
  :open="showDetailModal"
  :team="detailTeam"
  :mode="frequencyStore.mode"
  :current-user-id="currentUserId"
  @close="closeDetailModal"
/>

  <transition name="feedback-fade">
    <div v-if="feedbackDialog" class="feedback-overlay">
      <div
        class="feedback-card"
        :class="feedbackDialog.mode === 'focus' ? 'border-focus-primary/30' : 'border-vibe-primary/30'"
      >
        <div
          class="feedback-icon"
          :class="feedbackDialog.mode === 'focus' ? 'text-focus-accent bg-focus-primary/15' : 'text-vibe-accent bg-vibe-primary/15'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="w-6 h-6">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h3 class="feedback-title">申请已发送</h3>
        <p class="feedback-desc">
          你对「{{ feedbackDialog.teamName }}」的小组申请已提交，需要队长或管理员通过后才能加入。
          可前往协作空间的申请记录或消息中心查看审批进度。
        </p>
        <div class="feedback-actions">
          <RouterLink
            to="/team/hub"
            class="feedback-link"
            :class="feedbackDialog.mode === 'focus' ? 'text-focus-accent' : 'text-vibe-accent'"
            @click="closeFeedbackDialog"
          >
            查看申请记录
          </RouterLink>
          <button
            class="feedback-button"
            :class="feedbackDialog.mode === 'focus' ? 'bg-focus-accent' : 'bg-vibe-accent'"
            @click="closeFeedbackDialog"
          >
            好的
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}

.feedback-overlay {
  @apply fixed inset-0 z-40 flex items-center justify-center bg-charcoal/50 backdrop-blur;
}

.feedback-card {
  @apply w-full max-w-md rounded-3xl bg-white p-8 text-center border shadow-2xl;
}

.feedback-icon {
  @apply w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4;
}

.feedback-title {
  @apply text-2xl font-semibold text-charcoal mb-2;
}

.feedback-desc {
  @apply text-sm text-slate leading-relaxed;
}

.feedback-actions {
  @apply mt-6 flex flex-col gap-3;
}

.feedback-link {
  @apply text-sm underline underline-offset-4;
}

.feedback-button {
  @apply w-full py-3 rounded-2xl text-white font-semibold shadow-lg;
}

.feedback-fade-enter-active,
.feedback-fade-leave-active {
  transition: opacity 0.2s ease;
}

.feedback-fade-enter-from,
.feedback-fade-leave-to {
  opacity: 0;
}
</style>
