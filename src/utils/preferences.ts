import type { UserPreferences } from '@/types'

export function resolveTheme(
  theme: UserPreferences['theme'],
): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

export function applyPreferences(preferences: UserPreferences): void {
  const root = document.documentElement
  const resolved = resolveTheme(preferences.theme)

  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('high-contrast', preferences.highContrast)
  root.dataset.theme = preferences.theme
  root.style.setProperty('--font-scale', String(preferences.fontScale))
}
