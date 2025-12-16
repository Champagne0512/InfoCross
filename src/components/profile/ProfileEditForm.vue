<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserProfile } from '@/types/models'
import { updateProfile, uploadAvatar } from '@/api/auth'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  profile: UserProfile
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const userStore = useUserStore()

const form = ref({
  username: props.profile.username,
  college: props.profile.college,
  major: props.profile.major,
  tags: props.profile.tags.join(', ')
})

const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(props.profile.avatarUrl || null)
const isUploading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)

const avatarUrl = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  if (props.profile.avatarUrl) return props.profile.avatarUrl
  return null
})

function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    avatarFile.value = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(avatarFile.value)
  }
}

async function handleSubmit() {
  error.value = null
  isSaving.value = true

  try {
    let avatarUrl = props.profile.avatarUrl

    if (avatarFile.value) {
      isUploading.value = true
      avatarUrl = await uploadAvatar(props.profile.id, avatarFile.value)
      isUploading.value = false
    }

    await updateProfile(props.profile.id, {
      username: form.value.username.trim(),
      college: form.value.college.trim(),
      major: form.value.major.trim(),
      tags: form.value.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      avatarUrl
    })

    await userStore.init()
    emit('updated')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '更新失败，请重试'
    console.error('更新个人资料失败:', err)
  } finally {
    isSaving.value = false
    isUploading.value = false
  }
}

function handleCancel() {
  emit('close')
}
</script>

<template>
  <div class="p-8">
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-h2 font-sans font-bold text-charcoal">编辑个人资料</h2>
      <button 
        @click="handleCancel"
        class="p-2 rounded-lg hover:bg-slate/10 transition-colors"
      >
        <svg class="w-5 h-5 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- 表单 -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 头像上传 -->
      <div>
        <label class="block text-sm font-sans font-medium text-charcoal mb-3">头像</label>
        <div class="flex items-center gap-4">
          <div class="relative">
            <div 
              v-if="avatarUrl || avatarPreview"
              class="w-20 h-20 rounded-xl overflow-hidden shadow-md"
            >
              <img :src="avatarPreview || avatarUrl" :alt="form.username" class="w-full h-full object-cover" />
            </div>
            <div 
              v-else
              class="w-20 h-20 rounded-xl bg-gradient-to-br from-morandi-blue to-morandi-lavender flex items-center justify-center text-white text-2xl font-sans font-bold shadow-md"
            >
              {{ form.username.charAt(0).toUpperCase() }}
            </div>
            
            <!-- 上传中遮罩 -->
            <div v-if="isUploading" class="absolute inset-0 bg-charcoal/50 rounded-xl flex items-center justify-center">
              <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          </div>
          
          <div>
            <input 
              type="file" 
              id="avatar" 
              accept="image/*"
              @change="handleAvatarChange"
              class="hidden"
            />
            <label 
              for="avatar"
              class="inline-block px-4 py-2 rounded-lg bg-white border border-slate/20 text-sm font-sans text-slate hover:bg-slate/5 cursor-pointer transition-colors"
            >
              选择图片
            </label>
            <p class="text-xs text-slate mt-1">支持 JPG, PNG 格式，最大 2MB</p>
          </div>
        </div>
      </div>

      <!-- 用户名 -->
      <div>
        <label for="username" class="block text-sm font-sans font-medium text-charcoal mb-2">用户名</label>
        <input 
          type="text" 
          id="username"
          v-model="form.username"
          required
          class="w-full px-4 py-3 rounded-lg border border-slate/20 bg-white font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-morandi-lavender/20 focus:border-morandi-lavender transition-colors"
        />
      </div>

      <!-- 学院 -->
      <div>
        <label for="college" class="block text-sm font-sans font-medium text-charcoal mb-2">学院</label>
        <input 
          type="text" 
          id="college"
          v-model="form.college"
          required
          class="w-full px-4 py-3 rounded-lg border border-slate/20 bg-white font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-morandi-lavender/20 focus:border-morandi-lavender transition-colors"
        />
      </div>

      <!-- 专业 -->
      <div>
        <label for="major" class="block text-sm font-sans font-medium text-charcoal mb-2">专业</label>
        <input 
          type="text" 
          id="major"
          v-model="form.major"
          required
          class="w-full px-4 py-3 rounded-lg border border-slate/20 bg-white font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-morandi-lavender/20 focus:border-morandi-lavender transition-colors"
        />
      </div>

      <!-- 兴趣标签 -->
      <div>
        <label for="tags" class="block text-sm font-sans font-medium text-charcoal mb-2">
          兴趣标签
          <span class="text-xs text-slate font-normal ml-2">用逗号分隔</span>
        </label>
        <input 
          type="text" 
          id="tags"
          v-model="form.tags"
          placeholder="例如: AI, 摄影, 创业"
          class="w-full px-4 py-3 rounded-lg border border-slate/20 bg-white font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-morandi-lavender/20 focus:border-morandi-lavender transition-colors"
        />
      </div>

      <!-- 按钮组 -->
      <div class="flex gap-4 pt-4">
        <button 
          type="button"
          @click="handleCancel"
          class="flex-1 px-6 py-3 rounded-lg bg-white border border-slate/20 font-sans font-medium text-slate hover:bg-slate/5 transition-colors"
        >
          取消
        </button>
        <button 
          type="submit"
          :disabled="isSaving"
          class="flex-1 px-6 py-3 rounded-lg bg-morandi-lavender font-sans font-medium text-white hover:bg-morandi-lavender/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <div v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>{{ isSaving ? '保存中...' : '保存更改' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>