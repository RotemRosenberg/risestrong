'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, BarChart2, Scale, Settings } from 'lucide-react'

const tabs = [
  { href: '/',         label: 'Today',    Icon: Home },
  { href: '/schedule', label: 'Schedule', Icon: CalendarDays },
  { href: '/progress', label: 'Progress', Icon: BarChart2 },
  { href: '/weight',   label: 'Weight',   Icon: Scale },
  { href: '/settings', label: 'Settings', Icon: Settings },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              <Icon size={22} className={active ? 'text-[#4CAF50]' : 'text-gray-400 dark:text-gray-500'} />
              <span className={`text-xs font-medium ${active ? 'text-[#4CAF50]' : 'text-gray-400 dark:text-gray-500'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
