import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import en from './locales/en'

export type SupportedLocale = 'zh-CN' | 'en'

export const supportedLocales: { code: SupportedLocale; name: string; nativeName: string }[] = [
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'EN' },
]

// 获取保存的语言或浏览器语言
function getDefaultLocale(): SupportedLocale {
  const saved = localStorage.getItem('locale')
  if (saved && supportedLocales.some((l) => l.code === saved)) {
    return saved as SupportedLocale
  }

  // 尝试匹配浏览器语言
  const browserLang = navigator.language
  if (browserLang.startsWith('en')) return 'en'

  return 'zh-CN'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    en,
  },
})

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}

export default i18n
