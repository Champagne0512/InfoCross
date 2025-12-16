<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useAuth } from '@/composables/useAuth'

const email = ref('student@infocross.edu')
const password = ref('infocross-demo')
const route = useRoute()
const router = useRouter()
const { login, loading } = useAuth()

async function submit() {
  await login(email.value, password.value)
  router.push((route.query.redirect as string) ?? '/')
}
</script>

<template>
  <div class="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
    <div class="absolute inset-0 opacity-70">
      <div class="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-gradient-aurora blur-[200px]" />
      <div class="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-neon-cyan/30 to-neon-purple/30 blur-[200px]" />
    </div>
    <div class="relative z-10 w-full max-w-5xl px-6">
      <div class="glass-panel overflow-hidden border-white/10 md:grid md:grid-cols-2">
        <div class="flex flex-col items-center justify-center bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 p-12 text-center">
          <p class="text-caption text-neon-cyan">Nexus</p>
          <h1 class="mt-4 font-display text-hero text-white">连接不同学科的人</h1>
          <p class="mt-4 max-w-sm font-body text-body text-white/70">
            通过 Supabase Auth 管理账号，AI 标签帮助你突破信息茧房。
          </p>
          <div class="mt-8 grid w-full gap-3">
            <div class="stats-tile">
              <span class="text-caption text-white/70">AI Powered</span>
              <p class="text-2xl font-display text-white">LLM + pgvector</p>
            </div>
            <div class="stats-tile">
              <span class="text-caption text-white/70">Cross-Discipline</span>
              <p class="text-2xl font-display text-white">破壁指数 89%</p>
            </div>
          </div>
        </div>
        <div class="p-12">
          <p class="text-caption text-neon-cyan">Login</p>
          <h2 class="mt-3 font-display text-h1 text-white">欢迎回到 InfoCross</h2>
          <form class="mt-8 space-y-6" @submit.prevent="submit">
            <AppInput label="校园邮箱" v-model="email" type="email" placeholder="name@campus.edu" />
            <AppInput label="密码" v-model="password" type="password" />
            <AppButton variant="primary" class="w-full justify-center" :loading="loading">
              进入破壁空间
            </AppButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
