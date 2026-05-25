'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const t = localStorage.getItem('theme')
    if (t === 'light' || t === 'dark' || t === 'system') return t
  } catch { /* ignore */ }
  return 'system'
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  const prefersDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', prefersDark)
}

const OPTIONS: { value: Theme; Icon: typeof Sun; label: string }[] = [
  { value: 'light',  Icon: Sun,     label: 'Light' },
  { value: 'system', Icon: Monitor, label: 'Auto'  },
  { value: 'dark',   Icon: Moon,    label: 'Dark'  },
]

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Sync with stored value after mount (avoids hydration mismatch).
  useEffect(() => {
    setTheme(readStoredTheme())
    setMounted(true)
  }, [])

  // Listen to system preference changes when in 'system' mode.
  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  function change(t: Theme) {
    setTheme(t)
    try { localStorage.setItem('theme', t) } catch { /* ignore */ }
    applyTheme(t)
  }

  return (
    <div className="inline-flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            onClick={() => change(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              active
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
