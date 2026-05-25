'use client'

import type { DayType } from '@/lib/program'
import type { DayInfo } from '@/lib/schedule'

interface Props {
  userName: string
  dayInfo: DayInfo
  workoutProgress: number // 0-100
  today: Date
}

const DAY_GRADIENTS: Record<DayType, string> = {
  strength_a: 'from-teal-500 via-teal-600 to-emerald-700',
  strength_b: 'from-blue-500 via-blue-600 to-indigo-700',
  cardio:     'from-green-500 via-emerald-500 to-teal-700',
  rest:       'from-slate-600 via-slate-700 to-slate-800',
}

const DAY_META: Record<DayType, { emoji: string; title: string; restSubtitle: string }> = {
  strength_a: { emoji: '💪', title: 'Strength A · Push',         restSubtitle: '' },
  strength_b: { emoji: '💪', title: 'Strength B · Pull & Legs',  restSubtitle: '' },
  cardio:     { emoji: '🏃', title: 'Cardio',                     restSubtitle: '60 min elliptical' },
  rest:       { emoji: '🧘', title: 'Rest Day',                   restSubtitle: 'Active recovery — light walk or stretching' },
}

export default function TodayHero({ userName, dayInfo, workoutProgress, today }: Props) {
  const hour = today.getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const dayType = dayInfo.schedule.type
  const gradient = DAY_GRADIENTS[dayType]
  const meta = DAY_META[dayType]
  const exerciseCount = dayInfo.workout?.exercises.length ?? 0
  const isStrength = dayType === 'strength_a' || dayType === 'strength_b'

  const subtitle = isStrength
    ? `${exerciseCount} exercises · ~45 min`
    : meta.restSubtitle

  return (
    <div className="space-y-2">
      <div
        className={`relative bg-gradient-to-br ${gradient} text-white rounded-3xl shadow-lg overflow-hidden`}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-5 space-y-5">
          {/* Top: greeting + phase chip */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight">
                {greeting}, {userName} 👋
              </h1>
              <p className="text-sm opacity-90 mt-0.5">{dateStr}</p>
            </div>
            <span className="shrink-0 bg-white/20 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              W{dayInfo.weekNumber} · P{dayInfo.phase}
            </span>
          </div>

          {/* Bottom: day type + progress ring */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{meta.emoji}</span>
                <h2 className="text-lg font-bold leading-tight truncate">{meta.title}</h2>
              </div>
              <p className="text-sm opacity-90 leading-snug">{subtitle}</p>
            </div>
            {dayInfo.workout && (
              <ProgressRing percent={workoutProgress} />
            )}
          </div>
        </div>
      </div>

      {/* Cardio-before-strength warning */}
      {isStrength && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-sm text-amber-800 dark:text-amber-200">
          ⚠️ Do your 60 min elliptical <strong>BEFORE</strong> strength training
        </div>
      )}
    </div>
  )
}

function ProgressRing({ percent, size = 68 }: { percent: number; size?: number }) {
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - clamped / 100)
  const center = size / 2

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-sm font-bold tabular-nums">{Math.round(clamped)}%</span>
    </div>
  )
}
