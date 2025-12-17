<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TeamCard from '@/components/team/TeamCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import { fetchTeams } from '@/api/team'
import type { Team } from '@/types/models'

const teams = ref<Team[]>([])
const loading = ref(true)
const filterExpanded = ref(false)

// 筛选状态
const searchQuery = ref('')
const selectedType = ref<string>('all')
const selectedCollege = ref<string>('all')
const selectedSkill = ref<string>('all')
const selectedStatus = ref<string>('all')

// 筛选选项
const teamTypes = [
  { label: '全部类型', value: 'all' },
  { label: '项目合作', value: 'project' },
  { label: '比赛组队', value: 'competition' },
  { label: '科研团队', value: 'research' },
  { label: '学习小组', value: 'study' },
]

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

const statuses = [
  { label: '全部状态', value: 'all' },
  { label: '招募中', value: 'recruiting' },
  { label: '已满员', value: 'full' },
]

// 计算筛选结果
const filteredTeams = computed(() => {
  let result = teams.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(team => 
      team.name.toLowerCase().includes(query) ||
      team.description.toLowerCase().includes(query) ||
      team.requiredSkills?.some(skill => skill.toLowerCase().includes(query)) ||
      team.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 类型筛选
  if (selectedType.value !== 'all') {
    result = result.filter(team => team.type === selectedType.value)
  }

  // 学院筛选
  if (selectedCollege.value !== 'all') {
    result = result.filter(team => team.college === selectedCollege.value)
  }

  // 技能筛选
  if (selectedSkill.value !== 'all') {
    result = result.filter(team => 
      team.requiredSkills?.includes(selectedSkill.value) ||
      team.members?.some(member => member.skills?.includes(selectedSkill.value))
    )
  }

  // 状态筛选
  if (selectedStatus.value !== 'all') {
    if (selectedStatus.value === 'recruiting') {
      result = result.filter(team => team.currentMembers < team.maxMembers)
    } else if (selectedStatus.value === 'full') {
      result = result.filter(team => team.currentMembers >= team.maxMembers)
    }
  }

  return result
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
  // TODO: 实现加入团队逻辑
  console.log('申请加入团队:', team.name)
}

function handleViewTeam(team: Team) {
  // TODO: 实现查看团队详情
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
      <p class="font-mono text-mono text-slate mb-4 tracking-wider">TEAM COLLABORATION</p>
      <h1 class="text-hero font-sans font-bold text-charcoal mb-6 leading-tight">
        组队协作
      </h1>
      <p class="text-body font-sans text-slate mb-8 max-w-2xl mx-auto leading-relaxed">
        找到志同道合的队友，一起完成项目、参加比赛、进行科研。AI 智能匹配，让组队更高效。
      </p>
      <div class="flex justify-center gap-4">
        <AppButton variant="primary" @click="$router.push('/publish?type=team')">创建团队</AppButton>
        <AppButton variant="ghost" @click="loadTeams">刷新列表</AppButton>
      </div>
    </section>

    <!-- 筛选面板 -->
    <section class="morandi-card-mist p-6">
      <!-- 筛选头部：搜索框 + 展开按钮 -->
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <AppInput 
            label="搜索团队"
            v-model="searchQuery"
            placeholder="搜索团队名称、技能、描述..."
          />
        </div>
        <button
          class="flex items-center gap-2 px-4 py-3 rounded-soft font-sans text-sm text-slate hover:bg-slate/5 transition-all"
          @click="filterExpanded = !filterExpanded"
        >
          <span>{{ filterExpanded ? '收起筛选' : '展开筛选' }}</span>
          <span class="transition-transform" :class="filterExpanded ? 'rotate-180' : ''">▼</span>
        </button>
      </div>

      <!-- 筛选选项（可折叠） -->
      <div 
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-5 overflow-hidden transition-all duration-300"
        :class="filterExpanded ? 'mt-8 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 mt-0'"
      >
        <!-- 团队类型 -->
        <div>
          <label class="block font-mono text-mono text-slate text-xs mb-3 tracking-wider">团队类型</label>
          <div class="space-y-2">
            <button
              v-for="type in teamTypes"
              :key="type.value"
              class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
              :class="selectedType === type.value
                ? 'bg-morandi-lavender/10 text-charcoal font-medium'
                : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
              @click="selectedType = type.value"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <!-- 学院 -->
        <div>
          <label class="block font-mono text-mono text-slate text-xs mb-3 tracking-wider">学院</label>
          <div class="space-y-2">
            <button
              v-for="college in colleges"
              :key="college.value"
              class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
              :class="selectedCollege === college.value
                ? 'bg-morandi-lavender/10 text-charcoal font-medium'
                : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
              @click="selectedCollege = college.value"
            >
              {{ college.label }}
            </button>
          </div>
        </div>

        <!-- 技能 -->
        <div>
          <label class="block font-mono text-mono text-slate text-xs mb-3 tracking-wider">所需技能</label>
          <div class="space-y-2">
            <button
              v-for="skill in skills"
              :key="skill.value"
              class="w-full text-left px-4 py-3 rounded-soft font-sans text-sm transition-all"
              :class="selectedSkill === skill.value
                ? 'bg-morandi-lavender/10 text-charcoal font-medium'
                : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
              @click="selectedSkill = skill.value"
            >
              {{ skill.label }}
            </button>
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
                ? 'bg-morandi-lavender/10 text-charcoal font-medium'
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
            <AppButton 
              variant="ghost" 
              @click="resetFilters"
              class="w-full"
            >
              重置筛选
            </AppButton>
            <div class="text-center">
              <p class="font-mono text-mono text-slate text-xs">
                找到 {{ filteredTeams.length }} 个团队
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 团队列表 -->
    <section>
      <div v-if="loading" class="grid gap-8 md:grid-cols-2">
        <div v-for="index in 6" :key="index" class="h-96 rounded-morandi bg-mist animate-pulse" />
      </div>
      
      <div v-else-if="filteredTeams.length === 0" class="morandi-card-base p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-slate/10 flex items-center justify-center mx-auto mb-6">
          <span class="text-2xl text-slate">🔍</span>
        </div>
        <h3 class="text-h2 font-sans font-semibold text-charcoal mb-3">暂无匹配的团队</h3>
        <p class="text-body font-sans text-slate mb-8">尝试调整筛选条件，或创建一个新的团队</p>
        <AppButton variant="primary" @click="resetFilters">重置筛选</AppButton>
      </div>
      
      <div v-else class="grid gap-8 md:grid-cols-2">
        <TeamCard
          v-for="team in filteredTeams"
          :key="team.id"
          :team="team"
          @join="handleJoinTeam"
          @view="handleViewTeam"
        />
      </div>
    </section>
  </div>
</template>
