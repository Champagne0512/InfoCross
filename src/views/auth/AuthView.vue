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
  <div class="min-h-screen flex items-center justify-center relative">
    <!-- 背景光效 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-0 left-0 w-96 h-96 bg-neon-purple/20 rounded-full filter blur-3xl animate-float"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-neon-cyan/20 rounded-full filter blur-3xl animate-float" style="animation-delay: 3s;"></div>
    </div>
    
    <div class="w-full max-w-5xl mx-6 relative z-10">
      <div class="glass-card overflow-hidden md:grid md:grid-cols-2">
        <!-- 左侧品牌区 -->
        <div class="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10">
          <div class="space-y-8 text-center">
            <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">Nexus</p>
            <h1 class="text-hero font-display font-bold gradient-text">连接不同学科的人</h1>
            <p class="text-body font-body text-text-secondary max-w-sm">
              通过 Supabase Auth 管理账号，AI 标签帮助你突破信息茧房。
            </p>
            <div class="flex justify-center gap-4 pt-4">
              <div class="data-tile">AI Powered</div>
              <div class="data-tile">Cross-Discipline</div>
            </div>
          </div>
        </div>
        
        <!-- 右侧登录表单 -->
        <div class="p-12">
          <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">Login</p>
          <h2 class="text-display font-display font-semibold mt-3 text-text-primary">欢迎回到 InfoCross</h2>
          <form class="mt-8 space-y-6" @submit.prevent="submit">
            <AppInput label="校园邮箱" v-model="email" type="email" placeholder="name@campus.edu" />
            <AppInput label="密码" v-model="password" type="password" />
            <AppButton variant="neon" class="w-full justify-center" :loading="loading">进入破壁空间</AppButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
