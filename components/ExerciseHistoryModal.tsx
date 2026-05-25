'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Exercise } from '@/lib/program'

interface SessionRow {
  date: string
  set_index: number
  actual_reps: number | null
  completed: boolean
}

interface Session {
  date: string
  maxReps: number
  setCount: number
}

interface Props {
  exerciseId: string
  exercise: Exercise
  onClose: () => void
}

export default function ExerciseHistoryModal({ exerciseId, exercise, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('exercise_sets')
          .select('date, set_index, actual_reps, completed')
          .eq('exercise_id', exerciseId)
          .order('date', { ascending: true })

        if (data) {
          const byDate = new Map<string, SessionRow[]>()
          for (const row of data as SessionRow[]) {
            if (!row.completed) continue
            const arr = byDate.get(row.date) ?? []
            arr.push(row)
            byDate.set(row.date, arr)
          }

          const result: Session[] = []
          for (const [date, rows] of byDate.entries()) {
            const reps = rows
              .map(r => r.actual_reps ?? 0)
              .filter(r => r > 0)
            if (reps.length === 0) continue
            result.push({
              date,
              maxReps: Math.max(...reps),
              setCount: rows.length,
            })
          }
          result.sort((a, b) => a.date.localeCompare(b.date))
          setSessions(result)
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [exerciseId])

  const pr = sessions.length > 0 ? Math.max(...sessions.map(s => s.maxReps)) : 0
  const unit = exercise.timed ? 'sec' : 'reps'

  const chartData = sessions.slice(-12).map(s => ({
    label: new Date(s.date + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }),
    value: s.maxReps,
  }))

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
              {exercise.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">History</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-[#4CAF50] rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-5xl">📊</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                No completed sets yet. Once you finish your first session for this exercise, your progress will show up here.
              </p>
            </div>
          ) : (
            <>
              {/* PR card */}
              <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white rounded-2xl p-5 text-center shadow-lg">
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-90">
                  Personal Record
                </p>
                <p className="text-6xl font-black mt-2 tabular-nums">{pr}</p>
                <p className="text-xs opacity-90 mt-1 uppercase tracking-widest">{unit}</p>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 px-1">
                  Max {unit} per session
                </p>
                <Chart data={chartData} pr={pr} />
              </div>

              {/* Recent sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-4 pt-3 pb-2">
                  Recent sessions
                </p>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sessions.slice(-6).reverse().map(s => {
                    const isPr = s.maxReps === pr
                    return (
                      <div key={s.date} className="flex items-center justify-between px-4 py-2.5">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {new Date(s.date + 'T00:00:00').toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          {s.setCount} sets · best{' '}
                          <span className={isPr ? 'text-amber-500' : 'text-[#4CAF50]'}>
                            {s.maxReps}
                          </span>
                          {isPr && <span className="text-xs">🏆</span>}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Chart({ data, pr }: { data: { label: string; value: number }[]; pr: number }) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
        Not enough data yet
      </p>
    )
  }
  const values = data.map(d => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values, pr)
  const domain: [number, number] = [Math.max(0, Math.floor(minV * 0.85)), Math.ceil(maxV * 1.1)]
  const w = Math.max(280, data.length * 60)

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div style={{ width: w, height: 180 }}>
        <BarChart
          width={w}
          height={180}
          data={data}
          margin={{ top: 18, right: 8, left: -20, bottom: 4 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235 / 0.5)" vertical={false} className="dark:stroke-gray-700" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} height={22} />
          <YAxis
            domain={domain}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: 'rgb(76 175 80 / 0.08)' }}
            contentStyle={{
              borderRadius: 12,
              fontSize: 12,
              border: 'none',
              backgroundColor: 'rgb(31 41 55)',
              color: '#fff',
            }}
            formatter={v => [`${v}`, '']}
          />
          <Bar dataKey="value" fill="#4CAF50" radius={[4, 4, 0, 0]} maxBarSize={40}>
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }}
              formatter={(v: unknown) => (typeof v === 'number' ? v : '')}
            />
          </Bar>
        </BarChart>
      </div>
    </div>
  )
}
