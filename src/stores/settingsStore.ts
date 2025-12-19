import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { setLocale, type SupportedLocale } from '@/i18n'
import type { FrequencyMode } from './frequencyStore'
import { supabase } from '@/api/client'

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<SupportedLocale>(
    (localStorage.getItem('locale') as SupportedLocale) || 'zh-CN'
  )
  const defaultMode = ref<FrequencyMode>(
    (localStorage.getItem('defaultMode') as FrequencyMode) || 'focus'
  )
  const loading = ref(false)

  // 监听语言变化
  watch(locale, (newLocale) => {
    setLocale(newLocale)
  })

  // 设置语言
  function setLanguage(newLocale: SupportedLocale) {
    locale.value = newLocale
    setLocale(newLocale)
  }

  // 设置默认模式（需要登录）
  async function setDefaultMode(mode: FrequencyMode, userId?: string) {
    defaultMode.value = mode
    localStorage.setItem('defaultMode', mode)

    // 如果已登录，同步到服务器
    if (userId) {
      loading.value = true
      try {
        await supabase.from('profiles').update({ default_mode: mode }).eq('id', userId)
      } catch (error) {
        console.error('Failed to save default mode:', error)
      } finally {
        loading.value = false
      }
    }
  }

  // 从服务器加载用户设置
  async function loadUserSettings(userId: string) {
    loading.value = true
    try {
      const { data } = await supabase
        .from('profiles')
        .select('default_mode')
        .eq('id', userId)
        .single()

      if (data?.default_mode) {
        defaultMode.value = data.default_mode as FrequencyMode
        localStorage.setItem('defaultMode', data.default_mode)
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取默认模式
  function getDefaultMode(): FrequencyMode {
    return defaultMode.value
  }

  return {
    locale,
    defaultMode,
    loading,
    setLanguage,
    setDefaultMode,
    loadUserSettings,
    getDefaultMode,
  }
})
