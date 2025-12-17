<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TeamCard from '@/components/team/TeamCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import { fetchTeams } from '@/api/team'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { Team } from '@/types/models'

const frequencyStore = useFrequencyStore()

const teams = ref<Team[]>([])
const loading = ref(true)
const filterExpanded = ref(false)

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
const filteredTeams = computed(() => {
  let result = teams.value

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
      title: '组队协作',
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
    title: '即时约伴',
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

async function loadTeams() {
  loading.value = true
  try {
    teams.value = await fetchTeams()
  } finally {
    loading.value = false
  }
}

async function handleJoinTeam(team: Team) {
  console.log('申请加入团队:', team.name)
}

function handleViewTeam(team: Team) {
  console.log('查看团队详情:', team.name)
}

function resetFilters() {
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedCollege.value = 'all'
  selectedSkill.value = 'all'
  selectedStatus.value = 'all'
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
          <AppInput 
            :label="pageConfig.searchLabel"
            v-model="searchQuery"
            :placeholder="pageConfig.searchPlaceholder"
          />
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
</template>

<style scoped>
.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}
</style>
