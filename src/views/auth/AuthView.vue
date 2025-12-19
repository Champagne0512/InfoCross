<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'
import { useRoute, useRouter } from 'vue-router'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useAuth } from '@/composables/useAuth'

const { t } = useI18n()
const email = ref('student@infocross.edu')
const password = ref('infocross-demo')
const username = ref('')
const college = ref('')
const major = ref('')
const tagsInput = ref('')
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
      feedback.value = t('auth.loginSuccess')
    } else {
      await register({
        email: email.value,
        password: password.value,
        username: username.value || email.value.split('@')[0] || email.value,
        college: college.value,
        major: major.value,
        tags: tagsInput.value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      feedbackType.value = 'success'
      feedback.value = t('auth.registerSuccess')
    }
    router.push((route.query.redirect as string) ?? '/')
  } catch (error) {
    feedbackType.value = 'error'
    const errMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as any).message)
        : ''
    feedback.value = errMessage || t('auth.operationFailed')
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
          <p class="font-mono text-xs text-ink-soft">Nexus Identity</p>
          <h1 class="text-3xl font-semibold text-ink">{{ t('auth.connectPeople') }}</h1>
          <p class="text-sm text-ink-soft">
            {{ t('auth.authDesc') }}
          </p>
          <div class="grid gap-3">
            <div class="rounded-2xl border border-border bg-white p-4">
              <p class="font-mono text-xs text-ink-soft">Wall-Breaker</p>
              <p class="text-2xl font-semibold text-intelligence">89%</p>
              <p class="text-xs text-ink-soft">{{ t('auth.crossMatch') }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-white p-4">
              <p class="font-mono text-xs text-ink-soft">AI Smart Brief</p>
              <p class="text-2xl font-semibold text-academic">TL;DR</p>
              <p class="text-xs text-ink-soft">{{ t('auth.aiSmartBrief') }}</p>
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
              {{ t('auth.login') }}
            </button>
            <button
              class="pill-button"
              :class="{ 'is-active': mode === 'register' }"
              type="button"
              @click="mode = 'register'"
            >
              {{ t('auth.register') }}
            </button>
          </div>
          <h2 class="mt-4 text-xl font-semibold text-ink">
            {{ mode === 'login' ? t('auth.welcomeBack') : t('auth.createIdentity') }}
          </h2>
          <form class="mt-6 space-y-5" @submit.prevent="submit">
            <AppInput :label="t('auth.campusEmail')" v-model="email" type="email" placeholder="name@campus.edu" />
            <AppInput :label="t('auth.password')" v-model="password" type="password" />
            <div v-if="mode === 'register'" class="space-y-4">
              <AppInput :label="t('auth.nickname')" v-model="username" placeholder="Explorer" />
              <AppInput :label="t('auth.college')" v-model="college" placeholder="Computer Science" />
              <AppInput :label="t('auth.major')" v-model="major" placeholder="AI" />
              <AppInput :label="t('auth.interestTags')" v-model="tagsInput" placeholder="Photography, AI, Philosophy" />
            </div>
            <AppButton variant="primary" type="submit" class="w-full justify-center" :loading="loading">
              {{ mode === 'login' ? t('auth.enterSpace') : t('auth.registerAndLogin') }}
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
