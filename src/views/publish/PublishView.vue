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
    form.content = '上传海报后，AI 将自动识别时间、地点并生成摘要。'
  }
  if (!form.eventTime) {
    form.eventTime = new Date().toISOString().slice(0, 16)
  }
  successMessage.value = 'AI 已完成字段预填，确认后发布。'
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <div class="glass-card p-8">
      <header class="space-y-6">
        <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">Publish Center</p>
        <h1 class="text-hero font-display font-bold gradient-text">发布活动·AI 辅助录入</h1>
        <p class="text-body font-body text-text-secondary max-w-3xl">
          上传海报或复制活动详情，AI 会自动识别并生成摘要/标签。
        </p>
        <div class="flex gap-3">
          <TagBadge label="OCR" :accent="true" />
          <TagBadge label="摘要" :accent="true" />
          <TagBadge label="pgvector" />
          <TagBadge label="Auto-Tag" :accent="true" />
        </div>
      </header>

      <form class="mt-12 space-y-8" @submit.prevent="submit">
        <div class="grid gap-6 md:grid-cols-2">
          <AppInput label="活动标题" v-model="form.title" placeholder="Supabase 破壁沙龙" />
          <label class="flex flex-col gap-2 font-mono text-mono text-text-secondary uppercase tracking-wider">
            类别
            <select 
              v-model="form.category" 
              class="px-4 py-3 rounded-button glass-card border-glass-border focus:border-neon-cyan/50 focus:shadow-glow-cyan focus:outline-none transition-all duration-300 font-body text-body"
            >
              <option value="lecture">讲座 Lecture</option>
              <option value="competition">比赛 Competition</option>
              <option value="research">研究 Research</option>
              <option value="notice">通知 Notice</option>
            </select>
          </label>
          <AppInput label="时间" v-model="form.eventTime" type="datetime-local" :mono="true" />
          <AppInput label="地点" v-model="form.location" placeholder="信息楼 B103" />
          <AppInput label="标签 (逗号分隔)" v-model="form.tags" placeholder="AI, 创新, 跨学科" />
        </div>

        <label class="flex flex-col gap-2 text-body font-body font-medium text-text-primary">
          <span class="font-mono text-mono text-text-secondary uppercase tracking-wider">正文内容</span>
          <textarea
            v-model="form.content"
            rows="6"
            class="w-full p-4 rounded-button glass-card border-glass-border focus:border-neon-cyan/50 focus:shadow-glow-cyan focus:outline-none transition-all duration-300 font-body text-body resize-none"
            placeholder="粘贴活动详情或描述海报信息..."
          />
        </label>

        <div class="flex flex-wrap gap-4">
          <AppButton variant="neon" type="submit" :loading="creating">提交信息</AppButton>
          <AppButton variant="glass" type="button" @click="useAiAssist">AI 辅助填充</AppButton>
        </div>
        <p v-if="successMessage" class="font-mono text-mono text-neon-cyan uppercase tracking-wider flex items-center gap-2 animate-glow">
          <span>✦</span>
          {{ successMessage }}
        </p>
      </form>
    </div>
  </div>
</template>
