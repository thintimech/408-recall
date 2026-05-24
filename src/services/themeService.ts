export type ThemeMode = 'dark' | 'light' | 'system'

const STORAGE_KEY = '408-recall-theme'
const mql = window.matchMedia('(prefers-color-scheme: light)')

mql.addEventListener('change', () => {
  if (getStoredTheme() === 'system') applyTheme('system')
})

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
  return 'dark'
}

export function setStoredTheme(mode: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY, mode)
  applyTheme(mode)
}

export function applyTheme(mode?: ThemeMode): void {
  const resolved = mode ?? getStoredTheme()
  let effective: 'dark' | 'light'

  if (resolved === 'system') {
    effective = mql.matches ? 'light' : 'dark'
  } else {
    effective = resolved
  }

  document.documentElement.setAttribute('data-theme', effective)
}
