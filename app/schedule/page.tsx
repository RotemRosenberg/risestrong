'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getDayInfo, progressedTarget, toISODate, type DayInfo } from '@/lib/schedule'
import { EXERCISES, PHASES } from '@/lib/program'

const TOTAL_WEEKS = 12

interface WeekDay {
  date: Date
  iso: string
  dayInfo: DayInfo
  isToday: boolean
  isPast: boolean
}

interface TypeStyle {
  bg: string
  icon: string
  title: string
  subtitle: string
}

function getTypeStyle(dayInfo: DayInfo): TypeStyle {
  switch (dayInfo.schedule.type) {
    case 'strength_a':
      return { bg: 'bg-teal-500',  icon: '💪', title: 'Strength A · Push',       subtitle: 'Push focus' }
    case 'strength_b':
      return { bg: 'bg-blue-500',  icon: '💪', title: 'Strength B · Pull & Legs', subtitle: 'Pull & legs focus' }
    case 'cardio':
      return { bg: 'bg-green-500', icon: '🏃', title: 'Cardio',                   subtitle: '60 min elliptical' }
    case 'rest':
    default:
      return { bg: 'bg-gray-400',  icon: '🧘', title: 'Rest Day',                 subtitle: 'Active recovery — light walk or stretching' }
  }
}

export default function SchedulePage() {
  const [today] = useState(() => new Date())
  const todayISO = useMemo(() => toISODate(today), [today])

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: cfg } = await supabase
          .from('user_config')
          .select('start_date')
          .single()
        if (cfg?.start_date) {
          const sd = new Date(cfg.start_date + 'T00:00:00')
          setStartDate(sd)
          const di = getDayInfo(sd, today)
          const target = di.notStarted ? 1 : Math.min(Math.max(di.weekNumber, 1), TOTAL_WEEKS)
          setCurrentWeek(target)
        }
      } catch {
        /* table missing — handled below */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [today])

  const weekDays: WeekDay[] = useMemo(() => {
    if (!startDate) return []
    const out: WeekDay[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + (currentWeek - 1) * 7 + i)
      const iso = toISODate(d)
      out.push({
        date: d,
        iso,
        dayInfo: getDayInfo(startDate, d),
        isToday: iso === todayISO,
        isPast: d.getTime() < today.getTime() && iso !== todayISO,
      })
    }
    return out
  }, [startDate, currentWeek, today, todayISO])

  if (loading) return <Skeleton />

  if (!startDate) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Schedule</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Set your program start date in Settings to see your full 12-week schedule.
          </p>
        </div>
      </div>
    )
  }

  const phase: 1 | 2 | 3 = currentWeek <= 4 ? 1 : currentWeek <= 8 ? 2 : 3
  const phaseData = PHASES[phase - 1]

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Schedule</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Preview your upcoming workouts</p>
      </div>

      {/* Phase pills */}
      <div className="flex gap-2">
        {PHASES.map(p => {
          const startWk = p.number === 1 ? 1 : p.number === 2 ? 5 : 9
          const isActive = p.number === phase
          const activeBg =
            p.number === 1 ? 'bg-teal-500' : p.number === 2 ? 'bg-blue-500' : 'bg-orange-500'
          return (
            <button
              key={p.number}
              onClick={() => setCurrentWeek(startWk)}
              className={`flex-1 px-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? `${activeBg} text-white shadow-sm`
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div>Phase {p.number}</div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">{p.name}</div>
            </button>
          )
        })}
      </div>

      {/* Week navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-3 flex items-center justify-between">
        <button
          onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
          disabled={currentWeek === 1}
          className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="text-center">
          <div className="font-bold text-gray-900 dark:text-gray-100">Week {currentWeek} of {TOTAL_WEEKS}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{phaseData.name}</div>
        </div>
        <button
          onClick={() => setCurrentWeek(w => Math.min(TOTAL_WEEKS, w + 1))}
          disabled={currentWeek === TOTAL_WEEKS}
          className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {weekDays.map(d => <DayCard key={d.iso} day={d} />)}
      </div>
    </div>
  )
}

// ─── DayCard ──────────────────────────────────────────────────────────────────

function DayCard({ day }: { day: WeekDay }) {
  const { date, dayInfo, isToday, isPast } = day
  const { workout } = dayInfo
  const style = getTypeStyle(dayInfo)

  const dateLabel = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-opacity ${
        isToday ? 'ring-2 ring-blue-400' : ''
      } ${isPast ? 'opacity-60' : ''}`}
    >
      {/* Coloured header strip */}
      <div className={`${style.bg} px-4 py-2.5 text-white flex items-center justify-between`}>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold opacity-90 uppercase tracking-wide">
            {dateLabel}
          </div>
          <h3 className="text-sm font-bold leading-snug truncate">{style.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isToday && (
            <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
              TODAY
            </span>
          )}
          <span className="text-2xl">{style.icon}</span>
        </div>
      </div>

      {/* Body */}
      {workout ? (
        <div className="p-4 space-y-1.5">
          {workout.exercises.map((we, i) => {
            const ex = EXERCISES[we.exerciseId]
            if (!ex) return null
            const reps = progressedTarget(we.reps, dayInfo.weekInPhase, ex.timed)
            const unit = ex.timed ? 's' : ''
            const each = we.eachSide ? ' each side' : ''
            const target = `${we.sets} × ${reps}${unit}${each}`
            return (
              <div
                key={i}
                className="flex items-start justify-between gap-3 text-sm py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
              >
                <span className="text-gray-800 dark:text-gray-200 flex-1 leading-snug">{ex.name}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap pt-0.5">{target}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{style.subtitle}</div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
      <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}
