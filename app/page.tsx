'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getDayInfo, toISODate, type DayInfo } from '@/lib/schedule'
import { EXERCISES, WARMUP, COOLDOWN } from '@/lib/program'
import TodayHeader from '@/components/TodayHeader'
import WeighInCard from '@/components/WeighInCard'
import DayTypeCard from '@/components/DayTypeCard'
import ExerciseCard from '@/components/ExerciseCard'
import RestTimer from '@/components/RestTimer'

// ─── Types ────────────────────────────────────────────────────────────────────

type SetsMap = Record<string, { completed: boolean[]; reps: number[] }>

interface UserConfig {
  user_id: string
  start_date: string
  user_name: string
  goal_weight?: number
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const [today] = useState(() => new Date())
  const todayISO = useMemo(() => toISODate(today), [today])

  // Core data
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Exercise sets
  const [setsMap, setSetsMap] = useState<SetsMap>({})
  const hasInteracted = useRef(false)
  const [completionFired, setCompletionFired] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  // UI
  const [warmupOpen, setWarmupOpen] = useState(false)
  const [cooldownOpen, setCooldownOpen] = useState(false)
  const [warmupChecked, setWarmupChecked] = useState<boolean[]>(
    () => Array(WARMUP.length).fill(false)
  )
  const [cooldownChecked, setCooldownChecked] = useState<boolean[]>(
    () => Array(COOLDOWN.length).fill(false)
  )
  const [restTrigger, setRestTrigger] = useState(0)

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Ensure config exists
        await supabase
          .from('user_config')
          .upsert(
            { user_id: user.id, start_date: todayISO, user_name: 'Rotem' },
            { onConflict: 'user_id', ignoreDuplicates: true }
          )

        const [{ data: cfg, error: cfgErr }, { data: setsRows }, { data: progress }] =
          await Promise.all([
            supabase.from('user_config').select('*').single(),
            supabase.from('exercise_sets').select('*').eq('date', todayISO),
            supabase.from('daily_progress').select('strength_done').eq('date', todayISO).maybeSingle(),
          ])

        if (cfgErr) throw cfgErr

        setConfig(cfg)
        if (progress?.strength_done) setCompletionFired(true)

        const startDate = new Date(cfg.start_date + 'T00:00:00')
        const di = getDayInfo(startDate, today)
        setDayInfo(di)

        // Build setsMap from workout + saved rows
        if (di.workout) {
          const map: SetsMap = {}
          for (const we of di.workout.exercises) {
            const completed = Array<boolean>(we.sets).fill(false)
            const reps = Array<number>(we.sets).fill(we.reps)
            if (setsRows) {
              for (const row of setsRows) {
                if (row.exercise_id === we.exerciseId && row.set_index < we.sets) {
                  completed[row.set_index] = row.completed
                  if (row.actual_reps != null) reps[row.set_index] = row.actual_reps
                }
              }
            }
            map[we.exerciseId] = { completed, reps }
          }
          setSetsMap(map)
        }
      } catch {
        setError("Failed to load today's data — check your connection")
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Completion check ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasInteracted.current || !dayInfo?.workout || completionFired) return
    if (Object.keys(setsMap).length === 0) return

    const allDone = dayInfo.workout.exercises.every(
      we => setsMap[we.exerciseId]?.completed.every(Boolean) ?? false
    )
    if (!allDone) return

    setCompletionFired(true)
    setShowBanner(true)
    setTimeout(() => setShowBanner(false), 2000)

    // Confetti burst
    const colors = ['#4CAF50', '#ffffff', '#a5d6a7']
    const end = Date.now() + 2000
    const burst = () => {
      confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors })
      confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors })
      if (Date.now() < end) requestAnimationFrame(burst)
    }
    burst()

    // Mark strength done
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('daily_progress').upsert(
        { user_id: user.id, date: todayISO, strength_done: true },
        { onConflict: 'user_id,date' }
      )
    })()
  }, [setsMap, dayInfo, completionFired, todayISO])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSetToggle = useCallback(
    (exerciseId: string, setIndex: number) => {
      hasInteracted.current = true
      let toggled = false

      setSetsMap(prev => {
        const ex = prev[exerciseId]
        if (!ex) return prev
        const newCompleted = [...ex.completed]
        newCompleted[setIndex] = !newCompleted[setIndex]
        toggled = newCompleted[setIndex]
        return { ...prev, [exerciseId]: { ...ex, completed: newCompleted } }
      })

      setRestTrigger(t => t + 1)

      // Supabase async write
      ;(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('exercise_sets').upsert(
          {
            user_id: user.id,
            date: todayISO,
            exercise_id: exerciseId,
            set_index: setIndex,
            completed: toggled,
          },
          { onConflict: 'user_id,date,exercise_id,set_index' }
        )
      })()
    },
    [todayISO]
  )

  const handleRepsChange = useCallback(
    (exerciseId: string, setIndex: number, reps: number) => {
      setSetsMap(prev => {
        const ex = prev[exerciseId]
        if (!ex) return prev
        const newReps = [...ex.reps]
        newReps[setIndex] = reps
        return { ...prev, [exerciseId]: { ...ex, reps: newReps } }
      })

      ;(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('exercise_sets').upsert(
          {
            user_id: user.id,
            date: todayISO,
            exercise_id: exerciseId,
            set_index: setIndex,
            actual_reps: reps,
          },
          { onConflict: 'user_id,date,exercise_id,set_index' }
        )
      })()
    },
    [todayISO]
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  const workout = dayInfo?.workout ?? null
  const completedExercises = workout
    ? workout.exercises.filter(we => setsMap[we.exerciseId]?.completed.every(Boolean)).length
    : 0

  return (
    <main className="max-w-lg mx-auto px-4 pt-5 pb-8 space-y-4">
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}

      {/* Completion banner */}
      {showBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-600 text-white px-10 py-6 rounded-3xl shadow-2xl text-2xl font-bold text-center">
            🎉 יום אימון הושלם!
          </div>
        </div>
      )}

      {/* Rest timer */}
      <RestTimer triggerKey={restTrigger} />

      {config && dayInfo && (
        <>
          <TodayHeader
            userName={config.user_name}
            weekNumber={dayInfo.weekNumber}
            phase={dayInfo.phase}
            phaseData={dayInfo.phaseData}
            today={today}
          />

          {dayInfo.isSunday && <WeighInCard today={today} />}

          <DayTypeCard dayInfo={dayInfo} />

          {/* Exercise list — only on strength days */}
          {workout && (
            <div className="space-y-3">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                  <span className="font-semibold">Exercises</span>
                  <span>
                    {completedExercises} / {workout.exercises.length} done
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CAF50] rounded-full transition-all duration-500"
                    style={{
                      width: `${(completedExercises / workout.exercises.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Warm-up */}
              <Collapsible
                title="🔥 Warm-up"
                open={warmupOpen}
                onToggle={() => setWarmupOpen(o => !o)}
              >
                {WARMUP.map((item, i) => (
                  <CheckItem
                    key={i}
                    checked={warmupChecked[i]}
                    onChange={() =>
                      setWarmupChecked(prev => {
                        const next = [...prev]
                        next[i] = !next[i]
                        return next
                      })
                    }
                    label={item.name}
                    meta={`${item.duration} · ${item.description}`}
                  />
                ))}
              </Collapsible>

              {/* Exercise cards */}
              {workout.exercises.map(we => {
                const exercise = EXERCISES[we.exerciseId]
                if (!exercise) return null
                const saved = setsMap[we.exerciseId] ?? {
                  completed: Array<boolean>(we.sets).fill(false),
                  reps: Array<number>(we.sets).fill(we.reps),
                }
                return (
                  <ExerciseCard
                    key={we.exerciseId}
                    exercise={exercise}
                    workoutExercise={we}
                    savedSets={saved.completed}
                    savedReps={saved.reps}
                    onSetToggle={i => handleSetToggle(we.exerciseId, i)}
                    onRepsChange={(i, reps) => handleRepsChange(we.exerciseId, i, reps)}
                  />
                )
              })}

              {/* Cool-down */}
              <Collapsible
                title="❄️ Cool-down"
                open={cooldownOpen}
                onToggle={() => setCooldownOpen(o => !o)}
              >
                {COOLDOWN.map((item, i) => (
                  <CheckItem
                    key={i}
                    checked={cooldownChecked[i]}
                    onChange={() =>
                      setCooldownChecked(prev => {
                        const next = [...prev]
                        next[i] = !next[i]
                        return next
                      })
                    }
                    label={item.name}
                    meta={`${item.duration} · ${item.description}`}
                  />
                ))}
              </Collapsible>
            </div>
          )}
        </>
      )}
    </main>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Collapsible({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-4 space-y-2 border-t border-gray-100">{children}</div>}
    </div>
  )
}

function CheckItem({
  checked,
  onChange,
  label,
  meta,
}: {
  checked: boolean
  onChange: () => void
  label: string
  meta: string
}) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-start gap-3 text-left py-2"
    >
      <div
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-[#4CAF50] border-[#4CAF50]' : 'border-gray-300'
        }`}
      >
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <div>
        <p className={`text-sm font-medium ${checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{meta}</p>
      </div>
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <main className="max-w-lg mx-auto px-4 pt-5 pb-8 space-y-4">
      <div className="animate-pulse space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded-lg w-52" />
          <div className="h-6 bg-gray-200 rounded-full w-28" />
        </div>
        <div className="h-4 bg-gray-200 rounded-lg w-36" />
      </div>
      <div className="animate-pulse bg-gray-200 rounded-2xl h-32" />
      <div className="animate-pulse bg-gray-200 rounded-2xl h-28" />
      <div className="animate-pulse bg-gray-200 rounded-2xl h-36" />
    </main>
  )
}

function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
      {message}
    </div>
  )
}
