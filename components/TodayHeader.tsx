import type { Phase } from '@/lib/program'

const PHASE_BADGE: Record<number, string> = {
  1: 'bg-teal-500',
  2: 'bg-blue-500',
  3: 'bg-orange-500',
}

interface Props {
  userName: string
  weekNumber: number
  phase: 1 | 2 | 3
  phaseData: Phase
  today: Date
}

export default function TodayHeader({ userName, weekNumber, phase, today }: Props) {
  const hour = today.getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-1 pt-1">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {greeting}, {userName} 👋
        </h1>
        <span
          className={`shrink-0 text-white text-xs font-semibold px-2.5 py-1 rounded-full ${PHASE_BADGE[phase]}`}
        >
          Week {weekNumber} · Phase {phase}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{dateStr}</p>
    </div>
  )
}
