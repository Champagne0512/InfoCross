<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Globe, Zap } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settingsStore'
import { useFrequencyStore, type FrequencyMode } from '@/stores/frequencyStore'
import { useAuth } from '@/composables/useAuth'
import type { SupportedLocale } from '@/i18n'

const { t } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()
const frequencyStore = useFrequencyStore()
const { profile } = useAuth()

const saveMessage = ref('')

function selectLanguage(code: SupportedLocale) {
  settingsStore.setLanguage(code)
  showSaveMessage()
}

async function selectDefaultMode(mode: FrequencyMode) {
  if (!profile.value) return
  await settingsStore.setDefaultMode(mode, profile.value.id)
  frequencyStore.setMode(mode)
  showSaveMessage()
}

function showSaveMessage() {
  saveMessage.value = t('settings.saved')
  setTimeout(() => {
    saveMessage.value = ''
  }, 2000)
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-cream">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 bg-cream/80 backdrop-blur-sm border-b border-slate/10">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-slate/10 transition-colors">
          <ArrowLeft :size="20" class="text-charcoal" />
        </button>
        <h1 class="text-h3 font-sans font-bold text-charcoal">{{ t('settings.title') }}</h1>
        <div class="w-9"></div>
      </div>
    </header>

    <!-- 保存提示 -->
    <Transition name="slide-down">
      <div
        v-if="saveMessage"
        class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-charcoal text-white rounded-soft shadow-lg"
      >
        {{ saveMessage }}
      </div>
    </Transition>

    <!-- 设置列表 -->
    <div class="p-4 space-y-6">
      <!-- 语言设置 -->
      <div class="bg-white rounded-morandi p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-morandi-lavender/20 flex items-center justify-center">
              <Globe :size="20" class="text-morandi-lavender" />
            </div>
            <div>
              <h3 class="text-body font-sans font-medium text-charcoal">{{ t('settings.language') }}</h3>
              <p class="text-caption font-sans text-slate">{{ t('settings.languageDesc') }}</p>
            </div>
          </div>
          <!-- 中英切换按钮 -->
          <div class="settings-switch-group flex rounded-full bg-slate/10 p-1">
            <button
              class="settings-switch-btn rounded-full text-sm font-sans font-medium transition-all"
              :class="
                settingsStore.locale === 'zh-CN'
                  ? 'bg-morandi-lavender text-white'
                  : 'text-slate hover:text-charcoal'
              "
              @click="selectLanguage('zh-CN')"
            >
              中文
            </button>
            <button
              class="settings-switch-btn rounded-full text-sm font-sans font-medium transition-all"
              :class="
                settingsStore.locale === 'en'
                  ? 'bg-morandi-lavender text-white'
                  : 'text-slate hover:text-charcoal'
              "
              @click="selectLanguage('en')"
            >
              EN
            </button>
          </div>
        </div>
      </div>

      <!-- 默认模式设置 -->
      <div class="bg-white rounded-morandi p-4 shadow-sm" :class="{ 'opacity-60': !profile }">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              :class="
                settingsStore.defaultMode === 'focus'
                  ? 'bg-focus-primary/20'
                  : 'bg-vibe-primary/20'
              "
            >
              <Zap
                :size="20"
                :class="settingsStore.defaultMode === 'focus' ? 'text-focus-primary' : 'text-vibe-primary'"
              />
            </div>
            <div>
              <h3 class="text-body font-sans font-medium text-charcoal">{{ t('settings.defaultMode') }}</h3>
              <p class="text-caption font-sans text-slate">
                {{ profile ? t('settings.defaultModeDesc') : t('settings.loginRequired') }}
              </p>
            </div>
          </div>
          <!-- 模式切换按钮 - 默认选项在左侧 -->
          <div
            class="settings-switch-group flex rounded-full p-1 transition-colors"
            :class="settingsStore.defaultMode === 'focus' ? 'bg-focus-primary/10' : 'bg-vibe-primary/10'"
          >
            <button
              class="settings-switch-btn rounded-full text-sm font-sans font-medium transition-all"
              :class="
                settingsStore.defaultMode === 'focus'
                  ? 'bg-focus-primary text-white'
                  : 'text-slate hover:text-charcoal'
              "
              :disabled="!profile"
              @click="selectDefaultMode('focus')"
            >
              Focus
            </button>
            <button
              class="settings-switch-btn rounded-full text-sm font-sans font-medium transition-all"
              :class="
                settingsStore.defaultMode === 'vibe'
                  ? 'bg-vibe-primary text-white'
                  : 'text-slate hover:text-charcoal'
              "
              :disabled="!profile"
              @click="selectDefaultMode('vibe')"
            >
              Vibe
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* 
 * 设置页面切换按钮统一宽度规则：
 * - 所有切换按钮组使用 settings-switch-group 类
 * - 所有切换按钮使用 settings-switch-btn 类
 * - 按钮组和按钮宽度统一，新增按钮自动对齐
 */
.settings-switch-group {
  min-width: 140px;
}

.settings-switch-btn {
  min-width: 60px;
  padding: 6px 16px;
  text-align: center;
}
</style>
