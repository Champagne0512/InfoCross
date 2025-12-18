<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import TagBadge from '@/components/business/TagBadge.vue'
import { createArticle } from '@/api/article'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { ArticleCategory } from '@/types/models'

const frequencyStore = useFrequencyStore()

const form = reactive({
  title: '',
  content: '',
  category: 'lecture',
  eventTime: '',
  location: '',
  tags: '',
  lifespan: '4h', // Vibe 模式专用
})

const creating = ref(false)
const successMessage = ref('')

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

// Vibe 模式时效选项
const lifespanOptions = [
  { label: '2小时', value: '2h' },
  { label: '4小时', value: '4h' },
  { label: '今天内', value: 'today' },
  { label: '本周内', value: 'week' },
]

const categories = computed(() => 
  frequencyStore.isFocus ? focusCategories : vibeCategories
)

// 页面配置
const pageConfig = computed(() => {
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
  successMessage.value = ''
  try {
    const article = await createArticle({
      title: form.title,
      content: form.content,
      summary: form.content.slice(0, 60),
      category: form.category as ArticleCategory,
      eventTime: form.eventTime,
      location: form.location,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      college: 'InfoCross 团队',
    })
    successMessage.value = `提交成功：${article.title}`
    form.title = ''
    form.content = ''
    form.eventTime = ''
    form.location = ''
    form.tags = ''
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
  successMessage.value = 'AI 已完成字段预填，确认后发布。'
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
            <span class="font-sans text-xs font-semibold text-slate">类别</span>
              <select
                v-model="form.category"
                class="rounded-soft border border-slate/20 bg-white px-4 py-3 text-base text-charcoal focus:border-slate focus:outline-none transition-all"
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
                <span class="font-sans text-xs font-semibold text-slate">有效期</span>
                <select
                  v-model="form.lifespan"
                  class="rounded-soft border border-slate/20 bg-white px-4 py-3 text-base text-charcoal focus:border-vibe-primary focus:outline-none transition-all"
                >
                  <option v-for="opt in lifespanOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </label>
            </template>
            <template v-else>
              <AppInput label="时间" v-model="form.eventTime" type="datetime-local" :mono="true" />
            </template>
            
            <AppInput label="地点" v-model="form.location" placeholder="图书馆 B1" />
            <AppInput 
              label="标签 (逗号分隔)" 
              v-model="form.tags" 
              :placeholder="frequencyStore.isFocus ? 'AI, 伦理, 设计' : '约饭, 聊天, 交友'" 
            />
          </div>
          
          <label class="flex flex-col gap-2 text-sm font-medium text-charcoal">
            <span class="font-sans text-xs font-semibold text-slate">{{ pageConfig.contentLabel }}</span>
            <textarea
              v-model="form.content"
              rows="6"
              class="rounded-soft border border-slate/20 bg-white p-4 text-base text-charcoal outline-none transition focus:border-slate"
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
          
          <p 
            v-if="successMessage" 
            class="font-sans text-xs"
            :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
          >
            {{ successMessage }}
          </p>
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
</template>

<style scoped>
.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}
</style>
