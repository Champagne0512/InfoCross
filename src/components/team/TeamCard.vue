<script setup lang="ts">
import { computed } from 'vue'
import TagBadge from '@/components/business/TagBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import type { Team } from '@/types/models'

type FrequencyMode = 'focus' | 'vibe'

const props = withDefaults(defineProps<{
  team: Team
  mode?: FrequencyMode
}>(), {
  mode: 'focus'
})

const emit = defineEmits<{
  join: [Team]
  view: [Team]
}>()

// Focus 模式配色 - 冷静学术风
const focusTypeStyles = {
  project: {
    topBar: 'bg-[#93A8AC]/30 group-hover:bg-[#93A8AC]/50',
    icon: 'bg-gradient-to-br from-[#93A8AC] to-[#93A8AC]/80',
    label: '项目'
  },
  competition: {
    topBar: 'bg-[#A6B9A8]/30 group-hover:bg-[#A6B9A8]/50',
    icon: 'bg-gradient-to-br from-[#A6B9A8] to-[#A6B9A8]/80',
    label: '比赛'
  },
  research: {
    topBar: 'bg-[#B4A8BF]/30 group-hover:bg-[#B4A8BF]/50',
    icon: 'bg-gradient-to-br from-[#B4A8BF] to-[#B4A8BF]/80',
    label: '研究'
  },
  study: {
    topBar: 'bg-[#93A8AC]/30 group-hover:bg-[#93A8AC]/50',
    icon: 'bg-gradient-to-br from-[#93A8AC] to-[#93A8AC]/80',
    label: '学习'
  },
}

// Vibe 模式配色 - 温暖活力风
const vibeTypeStyles = {
  meal: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '约饭'
  },
  sports: {
    topBar: 'bg-[#E8D5B7]/50 group-hover:bg-[#E8D5B7]/70',
    icon: 'bg-gradient-to-br from-[#E8D5B7] to-[#D4C4A8]',
    label: '运动'
  },
  carpool: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '拼车'
  },
  gaming: {
    topBar: 'bg-[#E8D5B7]/50 group-hover:bg-[#E8D5B7]/70',
    icon: 'bg-gradient-to-br from-[#E8D5B7] to-[#D4C4A8]',
    label: '游戏'
  },
  study: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '自习'
  },
  project: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '活动'
  },
  competition: {
    topBar: 'bg-[#E8D5B7]/50 group-hover:bg-[#E8D5B7]/70',
    icon: 'bg-gradient-to-br from-[#E8D5B7] to-[#D4C4A8]',
    label: '比赛'
  },
  research: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '研究'
  },
}

const teamStyle = computed(() => {
  const styles = props.mode === 'focus' ? focusTypeStyles : vibeTypeStyles
  return styles[props.team.type as keyof typeof styles] || (props.mode === 'focus' ? focusTypeStyles.project : vibeTypeStyles.project)
})

const isFull = computed(() => props.team.currentMembers >= props.team.maxMembers)

const missingSkills = computed(() => {
  const has = props.team.members.flatMap(m => m.skills || [])
  const needs = props.team.requiredSkills || []
  return needs.filter(s => !has.includes(s))
})

function formatTimestamp(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 · ${hours}:${minutes}`
}

const createdAtLabel = computed(() => formatTimestamp(props.team.createdAt))
const deadlineLabel = computed(() => formatTimestamp(props.team.deadline))
</script>

<template>
  <article class="morandi-card p-0 overflow-hidden group transition-all duration-300" :class="isFull ? 'opacity-75' : ''">
    <!-- 顶部色条 -->
    <div :class="['h-1.5 transition-all duration-300', teamStyle.topBar]"></div>
    
    <div class="p-6">
      <!-- 头部：团队类型 + 状态 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <TagBadge :label="teamStyle.label" :accent="team.type === 'research'" />
          <span v-if="isFull" class="px-3 py-1 rounded-full bg-slate/10 text-slate font-mono text-mono text-xs">已满员</span>
          <span v-else-if="mode === 'vibe'" class="px-3 py-1 rounded-full bg-vibe-primary/20 text-vibe-accent font-mono text-mono text-xs">热门</span>
          <span v-else class="px-3 py-1 rounded-full bg-morandi-green/10 text-morandi-green font-mono text-mono text-xs">招募中</span>
        </div>
        <!-- Vibe 模式显示倒计时 -->
        <span v-if="mode === 'vibe'" class="px-3 py-1 rounded-full bg-vibe-secondary/30 text-vibe-accent font-mono text-mono text-xs">
          {{ deadlineLabel ? `${deadlineLabel} 截止` : '限时动态' }}
        </span>
        <span v-else class="font-mono text-mono text-slate text-xs tracking-wider">{{ createdAtLabel }}</span>
      </div>

      <!-- 主体：图标 + 内容 -->
      <div class="flex gap-4 mb-4">
        <!-- 团队图标 -->
        <div :class="['w-16 h-16 rounded-xl flex items-center justify-center text-xl font-sans font-bold text-white shadow-md', teamStyle.icon]">
          {{ team.name.charAt(0).toUpperCase() }}
        </div>
        
        <!-- 团队信息 -->
        <div class="flex-1">
          <h3 class="text-lg font-sans font-semibold text-charcoal leading-snug mb-2">{{ team.name }}</h3>
          <p class="text-sm font-sans text-slate leading-relaxed line-clamp-2 mb-2">{{ team.description }}</p>
          <div class="flex items-center gap-3 text-xs">
            <span class="font-mono text-mono text-slate">{{ team.currentMembers }}/{{ team.maxMembers }} 人</span>
            <span class="font-mono text-mono text-slate">{{ team.college }}</span>
          </div>        </div>
      </div>

      <!-- 技能标签 -->
      <div class="mb-4">
        <p class="font-mono text-mono text-slate text-xs mb-2 tracking-wider">已具备技能</p>
        <div class="flex flex-wrap gap-2">
          <TagBadge v-for="skill in team.members.flatMap(m => m.skills || []).slice(0, 4)" :key="skill" :label="skill" />
        </div>
      </div>

      <!-- 缺失技能（如果有） -->
      <div v-if="missingSkills.length > 0 && mode === 'focus'" class="mb-4 p-3 rounded-soft bg-focus-primary/5 border border-dashed border-focus-primary/30">
        <p class="font-mono text-mono text-focus-accent text-xs mb-2 tracking-wider">技能缺口</p>
        <div class="flex flex-wrap gap-2">
          <TagBadge v-for="skill in missingSkills" :key="skill" :label="skill" accent />
        </div>
      </div>

      <!-- 成员头像 -->
      <div class="mb-4">
        <p class="font-mono text-mono text-slate text-xs mb-2 tracking-wider">{{ mode === 'focus' ? '团队成员' : '已参与' }}</p>
        <div class="flex -space-x-2">
          <div
            v-for="member in team.members.slice(0, 5)"
            :key="member.id"
            class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-sans text-xs font-semibold text-white"
            :class="mode === 'focus' ? 'bg-focus-primary' : 'bg-vibe-primary'"
            :title="member.name"
          >
            {{ member.name.charAt(0).toUpperCase() }}
          </div>
          <div
            v-if="team.members.length > 5"
            class="w-8 h-8 rounded-full border-2 border-white bg-slate flex items-center justify-center font-mono text-mono text-xs text-white"
          >
            +{{ team.members.length - 5 }}
          </div>        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <AppButton 
          variant="primary" 
          @click="emit('join', team)"
          :disabled="isFull"
          class="flex-1"
          :class="mode === 'vibe' ? 'vibe-join-btn' : ''"
        >
          {{ isFull ? '已满员' : (mode === 'vibe' ? '立即参与' : '申请加入') }}
        </AppButton>
        <AppButton 
          variant="ghost" 
          @click="emit('view', team)"
          class="px-6"
        >
          详情
        </AppButton>
      </div>
    </div>
  </article>
</template>

<style scoped>
.vibe-join-btn {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}
</style>
