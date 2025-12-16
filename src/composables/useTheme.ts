import { onMounted, ref } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'infocross-theme'

export function useTheme() {
  const theme = ref<Theme>('light')

  const applyTheme = (value: Theme) => {
    theme.value = value
    document.documentElement.classList.toggle('dark', value === 'dark')
    localStorage.setItem(STORAGE_KEY, value)
  }

  const toggleTheme = () => {
    applyTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored) {
      applyTheme(stored)
    }
  })

  return {
    theme,
    toggleTheme,
  }
}
