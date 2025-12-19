<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import TagBadge from '@/components/business/TagBadge.vue'
import { createArticle } from '@/api/article'
import { createTeam } from '@/api/team'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { ArticleCategory, Team } from '@/types/models'

const frequencyStore = useFrequencyStore()
const route = useRoute()
const router = useRouter()

const isTeamMode = computed(() => (route.query.type ?? '') === 'team')

watch(
  () => route.query.mode,
  (value) => {
    if (value === 'focus' && frequencyStore.mode !== 'focus') {
      frequencyStore.setMode('focus')
    } else if (value === 'vibe' && frequencyStore.mode !== 'vibe') {
      frequencyStore.setMode('vibe')
    }
  },
  { immediate: true },
)

// 获取默认日期时间，格式化为 datetime-local 输入框所需格式
// 12点前默认填充当天12:00，12-18点默认填充当天18:00，18点后默认填充次日12:00
const getDefaultDateTime = () => {
  const now = new Date()
  const hour = now.getHours()

  if (hour < 12) {
    now.setHours(12, 0, 0, 0)
  } else if (hour < 18) {
    now.setHours(18, 0, 0, 0)
  } else {
    // 18点后填充次日12点
    now.setDate(now.getDate() + 1)
    now.setHours(12, 0, 0, 0)
  }

  // 格式化为 YYYY-MM-DDTHH:mm
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const form = reactive({
  title: '',
  content: '',
  category: 'lecture',
  eventTime: getDefaultDateTime(),
  location: '',
  tags: '',
  lifespan: '4h', // Vibe 模式专用
  college: '',
  maxMembers: '5',
  skills: '',
  deadline: '',
})

const creating = ref(false)
const successDialog = reactive({
  open: false,
  title: '',
  description: '',
  actionLabel: '',
  actionTo: '',
})

// Focus 模式分类
const focusCategories = [
  { label: '讲座 Lecture', value: 'lecture' },
  { label: '比赛 Competition', value: 'competition' },
  { label: '研究 Research', value: 'research' },
  { label: '通知 Notice', value: 'notice' },
]

// Vibe 模式分类
const vibeCategories = [
  { label: '约饭', value: 'meal' },
  { label: '运动', value: 'sports' },
  { label: '拼车', value: 'carpool' },
  { label: '游戏', value: 'gaming' },
  { label: '自习', value: 'study' },
]

const focusTeamCategories = [
  { label: '科研团队', value: 'research' },
  { label: '比赛组队', value: 'competition' },
  { label: '项目合作', value: 'project' },
  { label: '学习小组', value: 'study' },
]

const vibeTeamCategories = [
  { label: '约饭搭子', value: 'meal' },
  { label: '运动约伴', value: 'sports' },
  { label: '拼车出行', value: 'carpool' },
  { label: '游戏开黑', value: 'gaming' },
  { label: '自习搭子', value: 'study' },
]

// Vibe 模式时效选项
const lifespanOptions = [
  { label: '2小时', value: '2h' },
  { label: '4小时', value: '4h' },
  { label: '今天内', value: 'today' },
  { label: '本周内', value: 'week' },
]

const categories = computed(() => {
  if (isTeamMode.value) {
    return frequencyStore.isFocus ? focusTeamCategories : vibeTeamCategories
  }
  return frequencyStore.isFocus ? focusCategories : vibeCategories
})

// 页面配置
const pageConfig = computed(() => {
  if (isTeamMode.value) {
    if (frequencyStore.isFocus) {
      return {
        subtitle: 'TEAM LAUNCH',
        title: '发起协作小组',
        desc: '描述项目使命、需要的技能与时间安排，AI 会为你生成破壁推荐与申请模版。',
        titleLabel: '小组名称',
        titlePlaceholder: 'RAG 推荐引擎 Demo 团队',
        contentLabel: '项目简介',
        contentPlaceholder: '写明项目阶段、分工需求、沟通方式……',
        submitText: '创建小组',
        aiText: 'AI 辅助填充',
        previewTitle: '小组预览',
        helperTitle: '招募建议',
      }
    }
    return {
      subtitle: 'VIBE CREW',
      title: '发起即时约伴',
      desc: '说明集合点、氛围和过期时间，InfoCross 会把它推送给合拍的人。',
      titleLabel: '约伴主题',
      titlePlaceholder: '夜跑呼吸 Vibe 队',
      contentLabel: '约伴说明',
      contentPlaceholder: '写明人数、时间、氛围或自带物品等。',
      submitText: '发布约伴',
      aiText: '智能填充',
      previewTitle: '约伴预览',
      helperTitle: '发布提示',
    }
  }

  if (frequencyStore.isFocus) {
    return {
      subtitle: 'CANVAS',
      title: '发布活动',
      desc: '便利贴式表单 + 实时预览。填写信息后右侧即可看到卡片成品，AI 将自动生成摘要与标签。',
      titleLabel: '活动标题',
      titlePlaceholder: 'AI 伦理破壁研讨会',
      contentLabel: '正文内容',
      contentPlaceholder: '粘贴活动详情或描述海报信息...',
      submitText: '提交信息',
      aiText: 'AI 辅助填充',
      previewTitle: '实时预览',
      helperTitle: 'AI 发布建议',
    }
  }
  return {
    subtitle: 'QUICK POST',
    title: '发起约伴',
    desc: '快速发布限时动态，找到志同道合的伙伴。动态将在设定时间后自动消失。',
    titleLabel: '约伴主题',
    titlePlaceholder: '二食堂约饭',
    contentLabel: '详细说明',
    contentPlaceholder: '说明时间、地点、人数要求...',
    submitText: '立即发布',
    aiText: '智能填充',
    previewTitle: '动态预览',
    helperTitle: '灵感提示',
  }
})

const focusHelperTips = [
  {
    title: '补全行动要点',
    desc: '明确时间 / 地点 / 人数与报名方式，AI 才能生成更精准摘要。',
  },
  {
    title: '突出跨界亮点',
    desc: '在正文里写清“需要什么学科/技能”，有助于匹配破壁伙伴。',
  },
  {
    title: '善用标签',
    desc: '标签控制在 3~5 个，优先选择项目主题 + 技能需求。',
  },
]

const vibeHelperTips = [
  {
    title: '时间 + 地点明确',
    desc: '约伴信息越具体，越容易被附近的人看到并响应。',
  },
  {
    title: '限定人数/氛围',
    desc: '写出人数或氛围关键词，匹配更合拍的搭子。',
  },
  {
    title: '提醒有效期',
    desc: '说明动态什么时候结束，避免错过。',
  },
]

const helperTips = computed(() =>
  frequencyStore.isFocus ? focusHelperTips : vibeHelperTips,
)

async function submit() {
  creating.value = true
  try {
    if (isTeamMode.value) {
      const team = await createTeam({
        name: form.title,
        description: form.content,
        type: (form.category as Team['type']) ?? 'project',
        college: form.college || form.location || '未标注学院',
        requiredSkills: form.skills
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        maxMembers: Number(form.maxMembers) || 5,
        deadline: form.deadline || undefined,
        isVibe: frequencyStore.isVibe,
      })
      resetForm()
      openSuccessDialog({
        title: '小组创建成功',
        description: `「${team.name}」已发布到 ${frequencyStore.isFocus ? '发现协作' : '即时约伴'}。`,
        actionLabel: '前往项目广场',
        actionTo: '/team',
      })
      return
    }

    const article = await createArticle({
      title: form.title,
      content: form.content,
      summary: form.content.slice(0, 60),
      category: form.category as ArticleCategory,
      eventTime: form.eventTime,
      location: form.location,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      college: form.college || 'InfoCross 团队',
    })
    resetForm()
    openSuccessDialog({
      title: '发布成功',
      description: `「${article.title}」已经上架 InfoCross。`,
      actionLabel: '返回首页',
      actionTo: '/',
    })
  } finally {
    creating.value = false
  }
}

function useAiAssist() {
  if (!form.content) {
    form.content = frequencyStore.isFocus 
      ? '上传海报后，AI 将自动识别时间、地点并生成摘要与标签。'
      : '今晚 6 点，二食堂门口集合，一起吃饭聊天！'
  }
  if (!form.eventTime) {
    form.eventTime = new Date().toISOString().slice(0, 16)
  }
}

function resetForm() {
  form.title = ''
  form.content = ''
  form.eventTime = getDefaultDateTime()
  form.location = ''
  form.tags = ''
  form.college = ''
  form.maxMembers = '5'
  form.skills = ''
  form.deadline = ''
}

function openSuccessDialog(payload: {
  title: string
  description: string
  actionLabel: string
  actionTo: string
}) {
  successDialog.title = payload.title
  successDialog.description = payload.description
  successDialog.actionLabel = payload.actionLabel
  successDialog.actionTo = payload.actionTo
  successDialog.open = true
}

function closeSuccessDialog() {
  successDialog.open = false
}

function confirmSuccessAction() {
  const target = successDialog.actionTo
  closeSuccessDialog()
  if (target) {
    router.push(target)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <section class="max-w-4xl">
      <p 
        class="font-sans text-caption text-slate mb-2 tracking-wider uppercase"
        :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
      >
        {{ pageConfig.subtitle }}
      </p>
      <h1 class="text-display font-sans font-semibold text-charcoal mb-3">{{ pageConfig.title }}</h1>
      <p class="text-body font-sans text-slate">{{ pageConfig.desc }}</p>
    </section>

    <!-- 主内容 -->
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)]">
      <!-- 左侧表单 -->
      <section 
        class="rounded-morandi p-8 transition-all duration-500 shadow-morandi"
        :class="frequencyStore.isFocus 
          ? 'bg-card-focus border border-focus-primary/20' 
          : 'bg-card-vibe border border-vibe-primary/20'"
      >
        <form class="space-y-6" @submit.prevent="submit">
          <div class="grid gap-4 md:grid-cols-2">
            <AppInput 
              :label="pageConfig.titleLabel" 
              v-model="form.title" 
              :placeholder="pageConfig.titlePlaceholder" 
            />
            <label class="flex flex-col gap-2 text-sm font-medium text-charcoal">
            <span class="font-sans text-[0.7rem] uppercase tracking-[0.3em] text-slate/80">
              {{ isTeamMode ? (frequencyStore.isFocus ? '项目类型' : '约伴类型') : '类别' }}
            </span>
              <select
                v-model="form.category"
                class="rounded-soft border border-slate/20 bg-white px-4 py-3 text-base text-charcoal font-sans focus:border-slate focus:outline-none transition-all"
                :class="frequencyStore.isFocus ? 'focus:border-focus-primary' : 'focus:border-vibe-primary'"
              >
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </label>
            
            <!-- Vibe 模式显示时效选项 -->
            <template v-if="frequencyStore.isVibe">
              <label class="flex flex-col gap-2 text-sm font-medium text-charcoal">
                <span class="font-sans text-[0.7rem] uppercase tracking-[0.3em] text-slate/80">有效期</span>
                <select
                  v-model="form.lifespan"
                  class="rounded-soft border border-slate/20 bg-white px-4 py-3 text-base text-charcoal font-sans focus:border-vibe-primary focus:outline-none transition-all"
                >
                  <option v-for="opt in lifespanOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </label>
            </template>
            <template v-else>
              <AppInput :label="isTeamMode ? '起始时间' : '时间'" v-model="form.eventTime" type="datetime-local" :mono="true" />
            </template>
            
            <AppInput :label="isTeamMode ? '学院 / 集合地点' : '地点'" v-model="form.location" placeholder="图书馆 B1" />
            <AppInput v-if="isTeamMode" label="学院 / 组织名" v-model="form.college" placeholder="信息科学学院" />
            <AppInput 
              label="标签 (逗号分隔)" 
              v-model="form.tags" 
              :placeholder="frequencyStore.isFocus ? 'AI, 伦理, 设计' : '约饭, 聊天, 交友'" 
            />
            <AppInput 
              v-if="isTeamMode"
              label="人数上限"
              v-model="form.maxMembers"
              type="number"
              placeholder="5"
            />
            <AppInput 
              v-if="isTeamMode"
              label="需要技能 (逗号分隔)"
              v-model="form.skills"
              placeholder="前端, 数据分析"
            />
            <AppInput 
              v-if="isTeamMode"
              label="截止日期"
              v-model="form.deadline"
              type="date"
            />
          </div>
          
          <label class="flex flex-col gap-2 text-sm font-medium text-charcoal">
            <span class="font-sans text-[0.7rem] uppercase tracking-[0.3em] text-slate/80">{{ pageConfig.contentLabel }}</span>
            <textarea
              v-model="form.content"
              rows="6"
              class="rounded-soft border border-slate/20 bg-white p-4 text-base text-charcoal font-sans outline-none transition focus:border-slate"
              :class="frequencyStore.isFocus ? 'focus:border-focus-primary' : 'focus:border-vibe-primary'"
              :placeholder="pageConfig.contentPlaceholder"
            />
          </label>
          
          <div class="flex flex-wrap gap-4">
            <AppButton 
              type="submit" 
              :loading="creating"
              :class="frequencyStore.isVibe ? 'vibe-button' : ''"
            >
              {{ pageConfig.submitText }}
            </AppButton>
            <AppButton variant="ghost" type="button" @click="useAiAssist">
              {{ pageConfig.aiText }}
            </AppButton>
          </div>
          
        </form>
      </section>

      <!-- 右侧预览 -->
      <aside class="space-y-4">
        <!-- 实时预览 -->
        <div 
          class="rounded-morandi p-5 transition-all duration-500 shadow-morandi"
          :class="frequencyStore.isFocus 
            ? 'bg-card-base border border-slate/10' 
            : 'bg-card-vibe border border-vibe-primary/20'"
        >
          <p class="font-sans text-xs font-semibold text-slate tracking-wide uppercase">{{ pageConfig.previewTitle }}</p>
          <div class="mt-4 rounded-morandi border border-slate/10 bg-white p-5 shadow-morandi-sm">
            <div class="flex items-center justify-between">
              <span 
                class="px-3 py-1 rounded-full font-sans text-xs font-semibold"
                :class="frequencyStore.isFocus 
                  ? 'bg-focus-primary/10 text-focus-accent' 
                  : 'bg-vibe-primary/20 text-vibe-accent'"
              >
                {{ form.category }}
              </span>
              <span class="font-sans text-xs text-slate">
                {{ frequencyStore.isVibe ? form.lifespan + ' 后过期' : (form.eventTime || '待定') }}
              </span>
            </div>
            <h3 class="mt-3 text-h2 font-sans font-semibold text-charcoal">
              {{ form.title || (frequencyStore.isFocus ? '活动标题预览' : '约伴主题预览') }}
            </h3>
            <p class="mt-2 line-clamp-3 text-body font-sans text-slate">
              {{ form.content || 'AI 将在此生成摘要...' }}
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <TagBadge v-for="tag in form.tags.split(',').filter(Boolean)" :key="tag" :label="tag" />
            </div>
            <div 
              class="mt-5 p-3 rounded-soft"
              :class="frequencyStore.isFocus ? 'bg-morandi-lavender/10' : 'bg-vibe-secondary/20'"
            >
              <span 
                class="font-sans text-xs font-semibold block mb-1 uppercase"
                :class="frequencyStore.isFocus ? 'text-morandi-lavender' : 'text-vibe-accent'"
              >
                {{ frequencyStore.isFocus ? '破壁推荐理由' : '约伴提示' }}
              </span>
              <span class="text-caption font-sans text-slate">
                {{ frequencyStore.isFocus 
                    ? `为你的 ${form.tags.split(',')[0] || '兴趣'} 提供补全视角`
                    : '动态将在有效期后自动消失' 
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- 技能缺口 / 热门约伴 -->
        <div 
          class="rounded-morandi border border-dashed p-5"
          :class="frequencyStore.isFocus 
            ? 'border-focus-primary/30 bg-focus-primary/5' 
            : 'border-vibe-primary/30 bg-vibe-primary/10'"
        >
          <p class="font-sans text-xs font-semibold text-slate tracking-wide uppercase">{{ pageConfig.helperTitle }}</p>
          <ul class="mt-4 space-y-3">
            <li
              v-for="tip in helperTips"
              :key="tip.title"
              class="rounded-soft bg-white px-4 py-3 shadow-morandi-sm"
            >
              <p class="font-sans font-semibold text-charcoal mb-1">{{ tip.title }}</p>
              <p class="text-caption font-sans text-slate">{{ tip.desc }}</p>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>

  <Transition name="fade">
    <div
      v-if="successDialog.open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4"
      @click.self="closeSuccessDialog"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-morandi">
        <p class="font-mono text-xs tracking-[0.3em] text-slate uppercase mb-2">InfoCross</p>
        <h3 class="text-h2 font-sans font-semibold text-charcoal mb-3">{{ successDialog.title }}</h3>
        <p class="text-body font-sans text-slate mb-6">{{ successDialog.description }}</p>
        <div class="flex flex-wrap gap-3">
          <AppButton class="flex-1" @click="confirmSuccessAction">{{ successDialog.actionLabel || '好的' }}</AppButton>
          <AppButton variant="ghost" class="flex-1" @click="closeSuccessDialog">留在此页</AppButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}
</style>
