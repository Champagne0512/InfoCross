<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useAuth } from '@/composables/useAuth'

const email = ref('student@infocross.edu')
const password = ref('infocross-demo')
const username = ref('')
const college = ref('计算机学院')
const major = ref('人工智能')
const tagsInput = ref('AI, 跨学科')
const mode = ref<'login' | 'register'>('login')
const feedback = ref('')
const feedbackType = ref<'success' | 'error' | ''>('')
const route = useRoute()
const router = useRouter()
const { login, register, loading } = useAuth()

async function submit() {
  feedback.value = ''
  feedbackType.value = ''
  try {
    if (mode.value === 'login') {
      await login(email.value, password.value)
      feedbackType.value = 'success'
      feedback.value = '登录成功，正在进入 InfoCross...'
    } else {
      await register({
        email: email.value,
        password: password.value,
        username: username.value || email.value.split('@')[0] || email.value,
        college: college.value,
        major: major.value,
        tags: tagsInput.value
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })
      feedbackType.value = 'success'
      feedback.value = '注册成功，已为你登录'
    }
    router.push((route.query.redirect as string) ?? '/')
  } catch (error) {
    feedbackType.value = 'error'
    const errMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as any).message)
        : ''
    feedback.value = errMessage || '操作失败，请稍后重试或检查邮箱/密码。'
    console.error('Auth error:', error)
  }
}
</script>

<template>
  <div class="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
    <div class="absolute inset-0 opacity-70">
      <div class="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-gradient-aurora blur-[200px]" />
      <div class="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-neon-cyan/30 to-neon-purple/30 blur-[200px]" />
    </div>
    <div class="relative z-10 w-full max-w-5xl px-6">
      <div class="rounded-3xl border border-border bg-white shadow-sheet md:grid md:grid-cols-2">
        <div class="flex flex-col justify-center gap-6 border-b border-border bg-neutral p-10 md:border-b-0 md:border-r">
          <p class="font-data text-xs text-ink-soft">Nexus Identity</p>
          <h1 class="text-3xl font-semibold text-ink">连接不同学科的人</h1>
          <p class="text-sm text-ink-soft">
            使用校园邮箱登录，体验 AI 省流摘要、破壁推荐、技能互补组队与 Explorer Footprint。
          </p>
          <div class="grid gap-3">
            <div class="rounded-2xl border border-border bg-white p-4">
              <p class="font-data text-xs text-ink-soft">Wall-Breaker</p>
              <p class="text-2xl font-semibold text-intelligence">89%</p>
              <p class="text-xs text-ink-soft">跨学科匹配率</p>
            </div>
            <div class="rounded-2xl border border-border bg-white p-4">
              <p class="font-data text-xs text-ink-soft">AI Smart Brief</p>
              <p class="text-2xl font-semibold text-academic">TL;DR</p>
              <p class="text-xs text-ink-soft">LLM 摘要代理</p>
            </div>
          </div>
        </div>
        <div class="p-10">
          <div class="flex items-center gap-3">
            <button
              class="pill-button"
              :class="{ 'is-active': mode === 'login' }"
              type="button"
              @click="mode = 'login'"
            >
              登录
            </button>
            <button
              class="pill-button"
              :class="{ 'is-active': mode === 'register' }"
              type="button"
              @click="mode = 'register'"
            >
              注册
            </button>
          </div>
          <h2 class="mt-4 text-xl font-semibold text-ink">
            {{ mode === 'login' ? '欢迎回到 InfoCross' : '创建破壁身份' }}
          </h2>
          <form class="mt-6 space-y-5" @submit.prevent="submit">
            <AppInput label="校园邮箱" v-model="email" type="email" placeholder="name@campus.edu" />
            <AppInput label="密码" v-model="password" type="password" />
            <div v-if="mode === 'register'" class="space-y-4">
              <AppInput label="昵称/真实姓名" v-model="username" placeholder="李同学 / Explorer" />
              <AppInput label="学院" v-model="college" placeholder="信息科学学院" />
              <AppInput label="专业" v-model="major" placeholder="人工智能" />
              <AppInput label="兴趣标签 (逗号分隔)" v-model="tagsInput" placeholder="摄影, AI, 哲学" />
            </div>
            <AppButton variant="primary" type="submit" class="w-full justify-center" :loading="loading">
              {{ mode === 'login' ? '进入破壁空间' : '注册并登录' }}
            </AppButton>
          </form>
          <p
            v-if="feedback"
            class="mt-4 text-sm"
            :class="feedbackType === 'success' ? 'text-intelligence' : 'text-life'"
          >
            {{ feedback }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
