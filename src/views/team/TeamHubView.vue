<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { fetchTeams } from '@/api/team'
import type { Team } from '@/types/models'
import { useFrequencyStore } from '@/stores/frequencyStore'

const teams = ref<Team[]>([])
const loading = ref(true)
const { profile } = useAuth()
const frequencyStore = useFrequencyStore()

const userId = computed(() => profile.value?.id ?? '')

const ownedTeams = computed(() =>
  teams.value.filter((team) => team.ownerId === userId.value),
)

const joinedTeams = computed(() =>
  teams.value.filter(
    (team) => team.members.some((member) => member.id === userId.value) && team.ownerId !== userId.value,
  ),
)

const ownedFocus = computed(() => ownedTeams.value.filter((team) => !team.isVibe))
const ownedVibe = computed(() => ownedTeams.value.filter((team) => team.isVibe))
const joinedFocus = computed(() => joinedTeams.value.filter((team) => !team.isVibe))
const joinedVibe = computed(() => joinedTeams.value.filter((team) => team.isVibe))

const ownedDisplay = computed(() => (frequencyStore.isFocus ? ownedFocus.value : ownedVibe.value))
const joinedDisplay = computed(() => (frequencyStore.isFocus ? joinedFocus.value : joinedVibe.value))

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
  owned: ownedDisplay.value.length,
  joined: joinedDisplay.value.length,
  pending: filteredApplications.value.filter((app) => app.status !== '已通过').length,
}))
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-3xl bg-gradient-to-br from-white via-cream to-focus-primary/5 p-8 shadow-morandi">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-caption uppercase tracking-[0.3em] text-slate">InfoCross Crew</p>
          <h1 class="text-hero font-semibold text-charcoal">我的协作空间</h1>
          <p class="text-body text-slate mt-3 max-w-2xl">
            统一管理你加入与发起的队伍，查看申请状态，与队长保持轻盈沟通。
          </p>
          <div class="flex items-center gap-3 mt-4">
            <RouterLink to="/team" class="inline-flex items-center gap-2 text-focus-accent text-sm">
              返回组队大厅
              <span aria-hidden="true">→</span>
            </RouterLink>
            <span class="px-3 py-1 rounded-full text-xs"
              :class="frequencyStore.isFocus ? 'bg-focus-primary/10 text-focus-accent' : 'bg-vibe-primary/15 text-vibe-accent'"
            >
              当前模式 · {{ frequencyStore.isFocus ? 'Focus' : 'Vibe' }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="glass-stat">
            <p class="text-caption text-slate">发起队伍</p>
            <p class="text-hero font-semibold">{{ stats.owned }}</p>
          </div>
          <div class="glass-stat">
            <p class="text-caption text-slate">已加入</p>
            <p class="text-hero font-semibold">{{ stats.joined }}</p>
          </div>
          <div class="glass-stat">
            <p class="text-caption text-slate">待确认</p>
            <p class="text-hero font-semibold">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="glass-panel">
        <header class="flex items-center justify-between mb-4">
          <div>
            <p class="text-caption uppercase tracking-[0.3em] text-slate">我发起的</p>
            <h2 class="text-h3 font-semibold text-charcoal">{{ frequencyStore.isFocus ? 'Focus 项目' : 'Vibe 场景' }}</h2>
          </div>
          <RouterLink to="/publish" class="text-focus-accent text-sm">发起新项目</RouterLink>
        </header>
        <div v-if="loading" class="space-y-3">
          <div v-for="index in 3" :key="index" class="h-16 rounded-2xl bg-slate/10 animate-pulse"></div>
        </div>
        <div v-else-if="!ownedDisplay.length" class="text-slate text-sm">当前模式下暂无发起的队伍，可切换模式或发起新项目。</div>
        <ul v-else class="space-y-3">
          <li
            v-for="team in ownedDisplay"
            :key="team.id"
            class="rounded-2xl bg-white/80 p-4 shadow-morandi-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-h4 font-semibold">{{ team.name }}</h3>
              <span class="text-caption text-slate">{{ team.currentMembers }}/{{ team.maxMembers }}</span>
            </div>
            <p class="text-caption text-slate line-clamp-2">{{ team.description }}</p>
            <div class="mt-3 flex gap-2 text-sm">
              <button class="px-3 py-1 rounded-full bg-charcoal text-white">管理成员</button>
              <button class="px-3 py-1 rounded-full border border-slate/20">查看申请</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="glass-panel">
        <header class="flex items-center justify-between mb-4">
          <div>
            <p class="text-caption uppercase tracking-[0.3em] text-slate">我加入的</p>
            <h2 class="text-h3 font-semibold text-charcoal">Focus / Vibe</h2>
          </div>
          <div class="flex gap-2 text-xs">
            <span class="px-3 py-1 rounded-full bg-focus-primary/10 text-focus-accent">
              Focus {{ joinedFocus.length }}
            </span>
            <span class="px-3 py-1 rounded-full bg-vibe-primary/15 text-vibe-accent">
              Vibe {{ joinedVibe.length }}
            </span>
          </div>
        </header>
        <div v-if="loading" class="space-y-3">
          <div v-for="index in 3" :key="index" class="h-16 rounded-2xl bg-slate/10 animate-pulse"></div>
        </div>
        <div v-else-if="!joinedDisplay.length" class="text-slate text-sm">
          当前模式下你还没有加入队伍，去组队页探索一下。
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="team in joinedDisplay"
            :key="team.id"
            class="rounded-2xl bg-white/80 p-4 shadow-morandi-sm"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-h4 font-semibold">{{ team.name }}</h3>
                <p class="text-caption text-slate">{{ team.college }}</p>
              </div>
              <span class="text-caption" :class="team.isVibe ? 'text-vibe-accent' : 'text-focus-accent'">
                {{ team.isVibe ? 'Vibe' : 'Focus' }}
              </span>
            </div>
            <p class="mt-2 text-caption text-slate line-clamp-2">{{ team.description }}</p>
            <div class="mt-2 text-xs text-slate">最近更新：{{ team.createdAt.slice(0, 10) }}</div>
          </li>
        </ul>
      </div>
    </section>

    <section class="glass-panel">
      <header class="flex items-center justify-between mb-4">
        <div>
          <p class="text-caption uppercase tracking-[0.3em] text-slate">申请状态</p>
          <h2 class="text-h3 font-semibold text-charcoal">
            {{ frequencyStore.isFocus ? 'Focus 申请记录' : 'Vibe 申请记录' }}
          </h2>
        </div>
        <RouterLink to="/team" class="text-sm text-focus-accent">继续申请</RouterLink>
      </header>
      <div v-if="!filteredApplications.length" class="text-slate text-sm">
        当前模式下暂无申请记录，去组队页探索新的队伍吧。
      </div>
      <ul v-else class="space-y-3">
        <li
          v-for="app in filteredApplications"
          :key="app.teamName"
          class="rounded-2xl bg-white/80 p-4 shadow-morandi-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-charcoal">{{ app.teamName }}</p>
              <p class="text-caption text-slate">{{ app.message }}</p>
            </div>
            <span class="text-caption px-3 py-1 rounded-full"
              :class="app.status === '已通过'
                ? 'bg-focus-primary/15 text-focus-accent'
                : 'bg-amber-100 text-amber-700'"
            >
              {{ app.status }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.glass-panel {
  @apply rounded-3xl bg-gradient-to-br from-white/95 to-cream shadow-xl border border-white/40 p-6;
}
.glass-stat {
  @apply rounded-2xl bg-white/80 px-5 py-4 shadow-lg text-center;
}
</style>
