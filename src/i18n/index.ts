import { inject, ref } from 'vue'
import zhCN from './locales/zh-CN'
import en from './locales/en'
import type { App } from 'vue'

export type SupportedLocale = 'zh-CN' | 'en'

export const supportedLocales: { code: SupportedLocale; name: string; nativeName: string }[] = [
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
]

function getDefaultLocale(): SupportedLocale {
  const saved = localStorage.getItem('locale') as SupportedLocale | null
  if (saved && supportedLocales.some((l) => l.code === saved)) {
    return saved
  }
  if (navigator.language?.startsWith('en')) return 'en'
  return 'zh-CN'
}

const currentLocale = ref<SupportedLocale>(getDefaultLocale())
const messages: Record<SupportedLocale, Record<string, any>> = {
  'zh-CN': zhCN,
  en,
}

function translate(locale: SupportedLocale, key: string): string {
  const dict = messages[locale] ?? {}
  const segments = key.split('.')
  let current: any = dict
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment]
    } else {
      return key
    }
  }
  return typeof current === 'string' ? current : key
}

const I18N_SYMBOL = Symbol('infocross-i18n')

const context = {
  locale: currentLocale,
  t: (key: string) => translate(currentLocale.value, key),
}

const i18nPlugin = {
  install(app: App) {
    app.provide(I18N_SYMBOL, context)
    app.config.globalProperties.$t = context.t
  },
}

export function setLocale(locale: SupportedLocale) {
  currentLocale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}

export function useI18n() {
  const injected = inject<typeof context>(I18N_SYMBOL, context)
  return injected
}

export default i18nPlugin
