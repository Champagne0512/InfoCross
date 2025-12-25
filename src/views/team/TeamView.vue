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
const isLoaded = ref(false)
const searchFocused = ref(false)

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
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
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
  <div class="discover-page">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-particle particle-1"></div>
      <div class="floating-particle particle-2"></div>
      <div class="floating-particle particle-3"></div>
      <div class="gradient-orb orb-1" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
      <div class="gradient-orb orb-2" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
    </div>

    <div class="relative z-10 space-y-10">
      <!-- 页面标题 -->
      <section class="hero-section" :class="{ 'loaded': isLoaded }">
        <div class="max-w-4xl mx-auto text-center">
          <p 
            class="hero-subtitle"
            :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
          >
            {{ pageConfig.subtitle }}
          </p>
          <h1 class="hero-title">
            <span class="title-text">{{ pageConfig.title }}</span>
            <span class="title-underline" :class="frequencyStore.isFocus ? 'underline-focus' : 'underline-vibe'"></span>
          </h1>
          <p class="hero-desc">
            {{ pageConfig.desc }}
          </p>
          <div class="hero-actions">
            <AppButton 
              variant="primary" 
              class="action-btn-primary"
              :class="frequencyStore.isVibe ? 'vibe-button' : ''"
              @click="$router.push('/publish?type=team&mode=' + frequencyStore.mode)"
            >
              {{ pageConfig.createText }}
            </AppButton>
            <AppButton variant="ghost" class="action-btn-ghost" @click="loadTeams">刷新列表</AppButton>
          </div>
          <p
            v-if="toastMessage"
            class="toast-message"
          >
            {{ toastMessage }}
          </p>
        </div>
      </section>

      <!-- 筛选面板 -->
      <section 
        class="filter-panel section-animate"
        :class="[
          { 'loaded': isLoaded },
          frequencyStore.isFocus 
            ? 'bg-card-focus border-focus-primary/20' 
            : 'bg-card-vibe border-vibe-primary/20'
        ]"
        style="--delay: 0.2s"
      >
        <!-- 筛选头部 -->
        <div class="filter-header">
          <div class="search-container" :class="{ 'search-active': searchFocused }">
            <label class="search-label">{{ pageConfig.searchLabel }}</label>
            <div class="search-wrapper">
              <div class="search-glow" :class="frequencyStore.isFocus ? 'glow-focus' : 'glow-vibe'"></div>
              <span class="search-icon">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.5 12h-.79l-.28-.27A6 6 0 1013.5 12zm-5 0a4 4 0 110-8 4 4 0 010 8zm5.71 1.29L17 16.09 15.59 17.5l-2.79-2.79 1.41-1.42z" />
                </svg>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="pageConfig.searchPlaceholder"
                class="search-input"
                :class="frequencyStore.isFocus
                  ? 'border-slate/20 focus:border-focus-primary focus:ring-focus-primary/20'
                  : 'border-vibe-primary/20 focus:border-vibe-primary focus:ring-vibe-primary/20'"
                @focus="searchFocused = true"
                @blur="searchFocused = false"
              />
            </div>
          </div>
          <button
            class="filter-toggle"
            :class="frequencyStore.isFocus 
              ? 'text-focus-accent hover:bg-focus-primary/10' 
              : 'text-vibe-accent hover:bg-vibe-primary/10'"
            @click="filterExpanded = !filterExpanded"
          >
            <span>{{ filterExpanded ? '收起筛选' : '展开筛选' }}</span>
            <span class="toggle-icon" :class="filterExpanded ? 'rotate-180' : ''">V</span>
          </button>
        </div>

        <!-- 筛选选项 -->
        <div 
          class="filter-options"
          :class="filterExpanded ? 'expanded' : ''"
        >
          <div class="filter-grid">
            <!-- 类型 -->
            <div class="filter-group">
              <label class="filter-label">
                {{ frequencyStore.isFocus ? '项目类型' : '约伴类型' }}
              </label>
              <div class="filter-buttons">
                <button
                  v-for="(type, index) in teamTypes"
                  :key="type.value"
                  class="filter-btn"
                  :class="selectedType === type.value
                    ? (frequencyStore.isFocus 
                        ? 'active-focus' 
                        : 'active-vibe')
                    : 'inactive'"
                  :style="{ animationDelay: `${index * 50}ms` }"
                  @click="selectedType = type.value"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- 学院 / 地点 -->
            <div class="filter-group">
              <label class="filter-label">
                {{ frequencyStore.isFocus ? '学院' : '地点' }}
              </label>
              <div class="filter-buttons">
                <button
                  v-for="(college, index) in colleges"
                  :key="college.value"
                  class="filter-btn"
                  :class="selectedCollege === college.value
                    ? (frequencyStore.isFocus 
                        ? 'active-focus' 
                        : 'active-vibe')
                    : 'inactive'"
                  :style="{ animationDelay: `${index * 50}ms` }"
                  @click="selectedCollege = college.value"
                >
                  {{ college.label }}
                </button>
              </div>
            </div>

            <!-- 技能 / 时效 -->
            <div class="filter-group">
              <label class="filter-label">
                {{ frequencyStore.isFocus ? '所需技能' : '时效' }}
              </label>
              <div class="filter-buttons">
                <template v-if="frequencyStore.isFocus">
                  <button
                    v-for="(skill, index) in skills"
                    :key="skill.value"
                    class="filter-btn"
                    :class="selectedSkill === skill.value
                      ? 'active-focus'
                      : 'inactive'"
                    :style="{ animationDelay: `${index * 50}ms` }"
                    @click="selectedSkill = skill.value"
                  >
                    {{ skill.label }}
                  </button>
                </template>
                <template v-else>
                  <button
                    v-for="(lifespan, index) in vibeLifespans"
                    :key="lifespan.value"
                    class="filter-btn"
                    :class="selectedSkill === lifespan.value
                      ? 'active-vibe'
                      : 'inactive'"
                    :style="{ animationDelay: `${index * 50}ms` }"
                    @click="selectedSkill = lifespan.value"
                  >
                    {{ lifespan.label }}
                  </button>
                </template>
              </div>
            </div>

            <!-- 状态 -->
            <div class="filter-group">
              <label class="filter-label">招募状态</label>
              <div class="filter-buttons">
                <button
                  v-for="(status, index) in statuses"
                  :key="status.value"
                  class="filter-btn"
                  :class="selectedStatus === status.value
                    ? (frequencyStore.isFocus 
                        ? 'active-focus' 
                        : 'active-vibe')
                    : 'inactive'"
                  :style="{ animationDelay: `${index * 50}ms` }"
                  @click="selectedStatus = status.value"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>

            <!-- 操作 -->
            <div class="filter-group filter-actions">
              <div class="actions-content">
                <AppButton variant="ghost" @click="resetFilters" class="reset-btn">
                  重置筛选
                </AppButton>
                <div class="result-count">
                  <p class="count-text">
                    找到 <span class="count-number" :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'">{{ filteredTeams.length }}</span> 个{{ pageConfig.countUnit }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 团队/约伴列表 -->
      <section class="teams-section section-animate" :class="{ 'loaded': isLoaded }" style="--delay: 0.4s">
        <div v-if="loading" class="teams-loading">
          <div 
            v-for="index in 6" 
            :key="index" 
            class="skeleton-card"
            :class="frequencyStore.isFocus ? 'bg-focus-primary/10' : 'bg-vibe-primary/10'"
            :style="{ animationDelay: `${index * 100}ms` }"
          />
        </div>
        
        <div v-else-if="filteredTeams.length === 0" class="empty-state">
          <div class="empty-card">
            <div 
              class="empty-icon"
              :class="frequencyStore.isFocus ? 'bg-focus-primary/20 text-focus-accent' : 'bg-vibe-primary/20 text-vibe-accent'"
            >
              ?
            </div>
            <h3 class="empty-title">
              {{ pageConfig.emptyTitle }}
            </h3>
            <p class="empty-desc">
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
        </div>
        
        <div v-else class="teams-grid">
          <div 
            v-for="(team, index) in filteredTeams" 
            :key="team.id"
            class="team-card-wrapper"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <TeamCard
              :team="team"
              :mode="frequencyStore.mode"
              @join="handleJoinTeam"
              @view="handleViewTeam"
            />
          </div>
        </div>
      </section>
    </div>
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
/* 页面基础 */
.discover-page {
  @apply relative;
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
  @apply w-80 h-80 -top-20 -right-20;
  animation: pulse-slow 15s ease-in-out infinite;
}

.orb-2 {
  @apply w-64 h-64 bottom-40 -left-20;
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
  @apply opacity-0 translate-y-6;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-section.loaded {
  @apply opacity-100 translate-y-0;
}

.hero-subtitle {
  @apply font-mono text-mono mb-4 tracking-wider;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.2s;
}

.hero-section.loaded .hero-subtitle {
  @apply opacity-100 translate-y-0;
}

.hero-title {
  @apply relative inline-block text-hero font-sans font-bold text-charcoal mb-6 leading-tight;
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
  @apply text-body font-sans text-slate mb-8 max-w-2xl mx-auto leading-relaxed;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.3s;
}

.hero-section.loaded .hero-desc {
  @apply opacity-100 translate-y-0;
}

.hero-actions {
  @apply flex justify-center gap-4;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.4s;
}

.hero-section.loaded .hero-actions {
  @apply opacity-100 translate-y-0;
}

.action-btn-primary,
.action-btn-ghost {
  @apply transition-all duration-300;
}

.action-btn-primary:hover,
.action-btn-ghost:hover {
  @apply -translate-y-0.5 shadow-lg;
}

.toast-message {
  @apply mt-4 text-center text-sm text-focus-accent;
  animation: fadeIn 0.3s ease-out;
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

/* 筛选面板 */
.filter-panel {
  @apply rounded-morandi p-6 shadow-morandi backdrop-blur-sm border;
  @apply transition-all duration-500;
}

.filter-header {
  @apply flex items-end gap-4;
}

.search-container {
  @apply flex-1;
}

.search-label {
  @apply block text-xs font-semibold text-slate mb-2;
}

.search-wrapper {
  @apply relative;
}

.search-glow {
  @apply absolute -inset-1 rounded-soft opacity-0 transition-opacity duration-300;
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
  @apply pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate/70;
  @apply transition-colors duration-300;
}

.search-active .search-icon {
  @apply text-charcoal;
}

.search-input {
  @apply relative w-full rounded-soft border px-11 py-3 font-sans text-sm outline-none bg-white;
  @apply transition-all duration-300 focus:ring-2;
}

.search-active .search-input {
  @apply shadow-lg;
}

.filter-toggle {
  @apply flex items-center gap-2 px-4 py-3 rounded-soft font-sans text-sm;
  @apply transition-all duration-300;
}

.filter-toggle:hover {
  @apply -translate-y-0.5;
}

.toggle-icon {
  @apply transition-transform duration-300 text-xs;
}

/* 筛选选项 */
.filter-options {
  @apply overflow-hidden transition-all duration-500;
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.filter-options.expanded {
  max-height: 1000px;
  opacity: 1;
  margin-top: 2rem;
}

.filter-grid {
  @apply grid gap-6 md:grid-cols-2 lg:grid-cols-5;
}

.filter-group {
  @apply space-y-3;
}

.filter-label {
  @apply block font-mono text-mono text-slate text-xs tracking-wider;
}

.filter-buttons {
  @apply space-y-2;
}

.filter-btn {
  @apply w-full text-left px-4 py-3 rounded-soft font-sans text-sm;
  @apply transition-all duration-300;
  animation: fadeIn 0.4s ease-out both;
}

.filter-btn:hover {
  @apply -translate-y-0.5;
}

.filter-btn.inactive {
  @apply bg-white border border-slate/20 text-slate hover:bg-slate/5;
}

.filter-btn.active-focus {
  @apply bg-focus-primary/20 text-focus-accent font-medium shadow-sm;
}

.filter-btn.active-vibe {
  @apply bg-vibe-primary/20 text-vibe-accent font-medium shadow-sm;
}

.filter-actions {
  @apply flex items-end;
}

.actions-content {
  @apply w-full space-y-3;
}

.reset-btn {
  @apply w-full transition-all duration-300;
}

.reset-btn:hover {
  @apply -translate-y-0.5;
}

.result-count {
  @apply text-center;
}

.count-text {
  @apply font-mono text-mono text-slate text-xs;
}

.count-number {
  @apply font-semibold;
}

/* 团队列表 */
.teams-section {
  @apply min-h-[400px];
}

.teams-loading {
  @apply grid gap-8 md:grid-cols-2;
}

.skeleton-card {
  @apply h-96 rounded-morandi;
  animation: pulse 1.5s ease-in-out infinite;
}

.teams-grid {
  @apply grid gap-8 md:grid-cols-2;
}

.team-card-wrapper {
  animation: slideUp 0.6s ease-out both;
}

/* 空状态 */
.empty-state {
  @apply flex justify-center;
}

.empty-card {
  @apply morandi-card-base p-12 text-center max-w-md;
  animation: fadeIn 0.6s ease-out;
}

.empty-icon {
  @apply w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 font-sans text-2xl;
}

.empty-title {
  @apply text-h2 font-sans font-semibold text-charcoal mb-3;
}

.empty-desc {
  @apply text-body font-sans text-slate mb-8;
}

/* Vibe 按钮 */
.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}

/* 反馈弹窗 */
.feedback-overlay {
  @apply fixed inset-0 z-40 flex items-center justify-center bg-charcoal/50 backdrop-blur;
}

.feedback-card {
  @apply w-full max-w-md rounded-3xl bg-white p-8 text-center border shadow-2xl;
  animation: modalIn 0.3s ease-out;
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
  @apply text-sm underline underline-offset-4 transition-colors duration-300;
}

.feedback-link:hover {
  @apply opacity-80;
}

.feedback-button {
  @apply w-full py-3 rounded-2xl text-white font-semibold shadow-lg;
  @apply transition-all duration-300;
}

.feedback-button:hover {
  @apply -translate-y-0.5 shadow-xl;
}

.feedback-fade-enter-active,
.feedback-fade-leave-active {
  transition: opacity 0.2s ease;
}

.feedback-fade-enter-from,
.feedback-fade-leave-to {
  opacity: 0;
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

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
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
  
  .filter-grid {
    @apply grid-cols-1;
  }
}
</style>
