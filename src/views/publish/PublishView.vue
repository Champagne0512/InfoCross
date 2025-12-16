<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import TagBadge from '@/components/business/TagBadge.vue'
import { createArticle } from '@/api/article'
import type { ArticleCategory } from '@/types/models'

const form = reactive({
  title: '',
  content: '',
  category: 'lecture',
  eventTime: '',
  location: '',
  tags: '',
})

const creating = ref(false)
const successMessage = ref('')
const skillGaps = ['财务分析', 'UI 设计', '文案策划']

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
    form.content = '上传海报后，AI 将自动识别时间、地点并生成 TL;DR 与标签。'
  }
  if (!form.eventTime) {
    form.eventTime = new Date().toISOString().slice(0, 16)
  }
  successMessage.value = 'AI 已完成字段预填，确认后发布。'
}
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)]">
    <section class="panel">
      <header class="space-y-3">
        <p class="font-data text-xs text-intelligence">CANVAS · 组队发布</p>
        <h1 class="text-2xl font-semibold text-ink">技能互补型招募画布</h1>
        <p class="text-sm text-ink-soft">
          便利贴式表单 + 实时预览。填写信息后右侧即可看到卡片成品，AI 将自动生成 TL;DR 与技能缺口。
        </p>
      </header>
      <form class="mt-6 space-y-6" @submit.prevent="submit">
        <div class="grid gap-4 md:grid-cols-2">
          <AppInput label="活动标题" v-model="form.title" placeholder="AI 伦理破壁研讨会" />
          <label class="flex flex-col gap-2 text-sm font-medium text-ink">
            <span class="font-data text-xs text-ink-soft">类别</span>
            <select
              v-model="form.category"
              class="rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink focus:border-ink focus:outline-none"
            >
              <option value="lecture">讲座 Lecture</option>
              <option value="competition">比赛 Competition</option>
              <option value="research">研究 Research</option>
              <option value="notice">通知 Notice</option>
            </select>
          </label>
          <AppInput label="时间" v-model="form.eventTime" type="datetime-local" :mono="true" />
          <AppInput label="地点" v-model="form.location" placeholder="图书馆 B1" />
          <AppInput label="标签 (逗号分隔)" v-model="form.tags" placeholder="AI, 伦理, 设计, 摄影" />
        </div>
        <label class="flex flex-col gap-2 text-sm font-medium text-ink">
          <span class="font-data text-xs text-ink-soft">正文内容</span>
          <textarea
            v-model="form.content"
            rows="6"
            class="rounded-xl border border-border bg-surface p-4 text-base text-ink outline-none transition focus:border-ink"
            placeholder="粘贴活动详情或描述海报信息..."
          />
        </label>
        <div class="flex flex-wrap gap-4">
          <AppButton type="submit" :loading="creating">提交信息</AppButton>
          <AppButton variant="ghost" type="button" @click="useAiAssist">AI 辅助填充</AppButton>
        </div>
        <p v-if="successMessage" class="font-data text-xs text-intelligence">{{ successMessage }}</p>
      </form>
    </section>
    <aside class="space-y-4">
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-subtle">
        <p class="font-data text-xs text-ink-soft">实时预览</p>
        <div class="mt-4 rounded-2xl border border-border bg-white p-5 shadow-sheet">
          <div class="flex items-center justify-between">
            <span class="category-chip bg-intelligence/10 text-intelligence">{{ form.category }}</span>
            <span class="font-data text-[0.6rem] text-ink-soft">{{ form.eventTime || '待定' }}</span>
          </div>
          <h3 class="mt-3 text-xl font-semibold text-ink">{{ form.title || '活动标题预览' }}</h3>
          <p class="mt-2 line-clamp-3 text-sm text-ink-soft">
            {{ form.content || 'AI 将在此生成摘要...' }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <TagBadge v-for="tag in form.tags.split(',').filter(Boolean)" :key="tag" :label="tag" />
          </div>
          <div class="ai-ribbon mt-5">
            <span class="font-data text-[0.6rem] text-intelligence">破壁推荐理由</span>
            <span class="text-xs text-intelligence">为你的 {{ form.tags.split(',')[0] || '兴趣' }} 提供补全视角</span>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-dashed border-border bg-neutral p-5">
        <p class="font-data text-xs text-ink-soft">技能缺口</p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="gap in skillGaps"
            :key="gap"
            class="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-subtle"
          >
            <span class="font-semibold text-ink">{{ gap }}</span>
            <button class="text-sm text-intelligence underline">申请填补</button>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>
