<script setup lang="ts">
import { computed } from 'vue'
import TagBadge from '@/components/business/TagBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import type { Team } from '@/types/models'

const props = defineProps<{
  team: Team
}>()

const emit = defineEmits<{
  join: [Team]
  view: [Team]
}>()

// 莫兰迪配色 - 根据团队类型
const teamTypeStyles = {
  'project': {
    topBar: 'bg-[#93A8AC]/30 group-hover:bg-[#93A8AC]/50',
    icon: 'bg-gradient-to-br from-[#93A8AC] to-[#93A8AC]/80',
    label: '项目'
  },
  'competition': {
    topBar: 'bg-[#A6B9A8]/30 group-hover:bg-[#A6B9A8]/50',
    icon: 'bg-gradient-to-br from-[#A6B9A8] to-[#A6B9A8]/80',
    label: '比赛'
  },
  'research': {
    topBar: 'bg-[#B4A8BF]/30 group-hover:bg-[#B4A8BF]/50',
    icon: 'bg-gradient-to-br from-[#B4A8BF] to-[#B4A8BF]/80',
    label: '研究'
  },
  'study': {
    topBar: 'bg-[#D9A69F]/30 group-hover:bg-[#D9A69F]/50',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#D9A69F]/80',
    label: '学习'
  },
}

const teamStyle = computed(() => teamTypeStyles[props.team.type] || teamTypeStyles.project)
const isFull = computed(() => props.team.currentMembers >= props.team.maxMembers)

const missingSkills = computed(() => {
  const has = props.team.members.flatMap(m => m.skills || [])
  const needs = props.team.requiredSkills || []
  return needs.filter(s => !has.includes(s))
})
</script>

<template>
  <article class="morandi-card p-0 overflow-hidden group transition-all duration-300" :class="isFull ? 'opacity-75' : ''">
    <!-- 顶部莫兰迪色条 -->
    <div :class="['h-1.5 transition-all duration-300', teamStyle.topBar]"></div>
    
    <div class="p-8">
      <!-- 头部：团队类型 + 状态 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <TagBadge :label="teamStyle.label" :accent="team.type === 'research'" />
          <span v-if="isFull" class="px-3 py-1 rounded-full bg-slate/10 text-slate font-mono text-mono text-xs">已满员</span>
          <span v-else class="px-3 py-1 rounded-full bg-morandi-green/10 text-morandi-green font-mono text-mono text-xs">招募中</span>
        </div>
        <span class="font-mono text-mono text-slate text-xs tracking-wider">{{ team.createdAt }}</span>
      </div>

      <!-- 主体：图标 + 内容 -->
      <div class="flex gap-6 mb-6">
        <!-- 团队图标 -->
        <div :class="['w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-sans font-bold text-white shadow-md', teamStyle.icon]">
          {{ team.name.charAt(0).toUpperCase() }}
        </div>
        
        <!-- 团队信息 -->
        <div class="flex-1">
          <h3 class="text-h2 font-sans font-semibold text-charcoal leading-snug mb-3">{{ team.name }}</h3>
          <p class="text-body font-sans text-slate leading-relaxed line-clamp-3 mb-3">{{ team.description }}</p>
          <div class="flex items-center gap-4 text-sm">
            <span class="font-mono text-mono text-slate">👥 {{ team.currentMembers }}/{{ team.maxMembers }}</span>
            <span class="font-mono text-mono text-slate">🏫 {{ team.college }}</span>
          </div>
        </div>
      </div>

      <!-- 技能标签 -->
      <div class="mb-6">
        <p class="font-mono text-mono text-slate text-xs mb-3 tracking-wider">已具备技能</p>
        <div class="flex flex-wrap gap-2">
          <TagBadge v-for="skill in team.members.flatMap(m => m.skills || []).slice(0, 4)" :key="skill" :label="skill" />
        </div>
      </div>

      <!-- 缺失技能（如果有） -->
      <div v-if="missingSkills.length > 0" class="mb-6 p-4 rounded-soft bg-morandi-lavender/5 border border-dashed border-morandi-lavender/30">
        <p class="font-mono text-mono text-morandi-lavender text-xs mb-3 tracking-wider">技能缺口</p>
        <div class="flex flex-wrap gap-2">
          <TagBadge v-for="skill in missingSkills" :key="skill" :label="skill" accent />
        </div>
      </div>

      <!-- 成员头像 -->
      <div class="mb-6">
        <p class="font-mono text-mono text-slate text-xs mb-3 tracking-wider">团队成员</p>
        <div class="flex -space-x-2">
          <div
            v-for="member in team.members.slice(0, 5)"
            :key="member.id"
            class="w-10 h-10 rounded-full border-2 border-white bg-morandi-green flex items-center justify-center font-sans text-sm font-semibold text-white"
            :title="member.name"
          >
            {{ member.name.charAt(0).toUpperCase() }}
          </div>
          <div
            v-if="team.members.length > 5"
            class="w-10 h-10 rounded-full border-2 border-white bg-slate flex items-center justify-center font-mono text-mono text-xs text-white"
          >
            +{{ team.members.length - 5 }}
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <AppButton 
          variant="primary" 
          @click="emit('join', team)"
          :disabled="isFull"
          class="flex-1"
        >
          {{ isFull ? '已满员' : '申请加入' }}
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