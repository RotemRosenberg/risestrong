'use client'

import { useCallback, useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { getDayInfo, toISODate } from '@/lib/schedule'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeightEntry   { date: string; weight_kg: number }
interface WeeklyMetric  { week_number: number; push_ups_max: number | null; pull_ups_max: number | null; dead_hang_sec: number | null; plank_sec: number | null }
interface DayProgress   { date: string; strength_done: boolean; cardio_done: boolean; weigh_in_done: boolean }

type TabKey = 'weight' | 'pushups' | 'pullups' | 'deathang'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weekNumFromDate(dateStr: string, startDate: Date): number {
  const d = new Date(dateStr + 'T00:00:00')
  return Math.max(1, Math.floor((d.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1)
}

function friendlyDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function calculateStreak(progress: DayProgress[], today: Date): number {
  const done = new Set(
    progress.filter(p => p.strength_done || p.cardio_done).map(p => p.date)
  )
  let streak = 0
  const d = new Date(today)
  d.setDate(d.getDate() - 1) // start from yesterday

  for (let safety = 0; safety < 365; safety++) {
    if (d.getDay() === 3) { d.setDate(d.getDate() - 1); continue } // skip Wed rest day
    if (done.has(toISODate(d))) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }
  if (done.has(toISODate(today))) streak++ // add today if completed
  return streak
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [today] = useState(() => new Date())
  const [loading, setLoading]     = useState(true)
  const [weights, setWeights]     = useState<WeightEntry[]>([])
  const [metrics, setMetrics]     = useState<WeeklyMetric[]>([])
  const [progress, setProgress]   = useState<DayProgress[]>([])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('weight')
  const [toast, setToast]         = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      const supabase = createClient()
      const [
        { data: wt },
        { data: mt },
        { data: pr },
        { data: cfg },
      ] = await Promise.all([
        supabase.from('weight_log').select('date,weight_kg').order('date', { ascending: true }),
        supabase.from('weekly_metrics').select('*').order('week_number', { ascending: true }),
        supabase.from('daily_progress').select('date,strength_done,cardio_done,weigh_in_done'),
        supabase.from('user_config').select('start_date').single(),
      ])
      if (wt)  setWeights(wt)
      if (mt)  setMetrics(mt)
      if (pr)  setProgress(pr)
      if (cfg?.start_date) setStartDate(new Date(cfg.start_date + 'T00:00:00'))
    } catch { /* tables may not exist yet */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function flash(msg: string) {
    setToast(msg); setTimeout(() => setToast(null), 3000)
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const latestMetric = metrics.length
    ? [...metrics].sort((a, b) => b.week_number - a.week_number)[0]
    : null

  const weightChange =
    weights.length >= 2 ? weights[weights.length - 1].weight_kg - weights[0].weight_kg : null

  const streak = calculateStreak(progress, today)

  const progressMap: Record<string, DayProgress> = {}
  progress.forEach(p => { progressMap[p.date] = p })

  // Chart data per tab
  const weightChartData = weights.map((w, i) => ({
    label: startDate ? `W${weekNumFromDate(w.date, startDate)}` : `W${i + 1}`,
    value: w.weight_kg,
  }))
  const pushupsData  = metrics.filter(m => m.push_ups_max).map(m => ({ label: `W${m.week_number}`, value: m.push_ups_max! }))
  const pullupsData  = metrics.filter(m => m.pull_ups_max).map(m => ({ label: `W${m.week_number}`, value: m.pull_ups_max! }))
  const deadhangData = metrics.filter(m => m.dead_hang_sec).map(m => ({ label: `W${m.week_number}`, value: m.dead_hang_sec! }))

  const chartDataMap: Record<TabKey, { label: string; value: number }[]> = {
    weight: weightChartData,
    pushups: pushupsData,
    pullups: pullupsData,
    deathang: deadhangData,
  }
  const emptyLabels: Record<TabKey, string> = {
    weight:   'Log your first weight to see progress here',
    pushups:  'Log your first push-ups max to see progress here',
    pullups:  'Log your first pull-ups max to see progress here',
    deathang: 'Log your first dead hang to see progress here',
  }
  const yLabels: Record<TabKey, string> = {
    weight: 'kg', pushups: 'reps', pullups: 'reps', deathang: 'sec',
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress</h1>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="📉" label="Weight change"
          value={weightChange !== null ? `${weightChange < 0 ? '−' : '+'}${Math.abs(weightChange).toFixed(1)} kg` : null}
          valueClass={weightChange === null ? '' : weightChange < 0 ? 'text-green-600' : 'text-red-500'}
        />
        <StatCard
          icon="💪" label="Push-ups max"
          value={latestMetric?.push_ups_max != null ? `${latestMetric.push_ups_max}` : null}
        />
        <StatCard
          icon="🔝" label="Pull-ups max"
          value={latestMetric?.pull_ups_max != null ? `${latestMetric.pull_ups_max}` : null}
        />
        <StatCard
          icon="⏱" label="Dead hang"
          value={latestMetric?.dead_hang_sec != null ? `${latestMetric.dead_hang_sec}s` : null}
        />
      </div>

      {/* ── Tabbed charts ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
          {([['weight','Weight'],['pushups','Push-ups'],['pullups','Pull-ups'],['deathang','Dead Hang']] as [TabKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                activeTab === key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <ProgressChart
          data={chartDataMap[activeTab]}
          yLabel={yLabels[activeTab]}
          emptyMsg={emptyLabels[activeTab]}
        />
      </div>

      {/* ── Streak ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 flex items-center gap-3">
        <span className="text-3xl">{streak > 0 ? '🔥' : '💤'}</span>
        <div>
          {streak > 0 ? (
            <>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{streak}-day streak!</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Keep it up — don&apos;t break the chain</p>
            </>
          ) : (
            <>
              <p className="font-bold text-gray-700 dark:text-gray-300">No active streak</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Start today!</p>
            </>
          )}
        </div>
      </div>

      {/* ── 12-week calendar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-3">12-Week Overview</h2>

        {!startDate ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Set your program start date in Settings to see the calendar.
          </p>
        ) : (
          <CalendarGrid
            startDate={startDate}
            today={today}
            progressMap={progressMap}
          />
        )}
      </div>

      {/* ── Log weekly numbers ── */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 rounded-2xl border-2 border-[#4CAF50] text-[#4CAF50] font-bold text-base hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
      >
        📝 Log This Week&apos;s Numbers
      </button>

      {/* ── Modal ── */}
      {showModal && (
        <MetricsModal
          today={today}
          startDate={startDate}
          metrics={metrics}
          onClose={() => setShowModal(false)}
          onSaved={() => { load(); flash('✅ Weekly numbers saved') }}
        />
      )}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, valueClass = 'text-gray-900 dark:text-gray-100',
}: {
  icon: string; label: string; value: string | null; valueClass?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      {value ? (
        <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      ) : (
        <>
          <p className="text-xl font-bold text-gray-300 dark:text-gray-600">—</p>
          <p className="text-xs text-gray-300 dark:text-gray-600">Not logged yet</p>
        </>
      )}
    </div>
  )
}

// ─── ProgressChart ────────────────────────────────────────────────────────────

function ProgressChart({
  data, yLabel, emptyMsg,
}: {
  data: { label: string; value: number }[]
  yLabel: string
  emptyMsg: string
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">{emptyMsg}</p>
    )
  }

  const values = data.map(d => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const domain: [number, number] = [Math.max(0, Math.floor(minV * 0.9)), Math.ceil(maxV * 1.1)]
  const w = Math.max(300, data.length * 68)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XTick = (props: any) => {
    const { x, y, payload } = props
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={14} textAnchor="middle" fill="#9ca3af" fontSize={11}>{payload.value}</text>
      </g>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div style={{ width: w, height: 200 }}>
        <BarChart width={w} height={200} data={data} margin={{ top: 20, right: 8, left: -20, bottom: 4 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235 / 0.5)" vertical={false} className="dark:stroke-gray-700/40" />
          <XAxis dataKey="label" tick={XTick} height={30} axisLine={false} tickLine={false} />
          <YAxis domain={domain} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} width={32} />
          <Tooltip
            formatter={v => [`${v} ${yLabel}`, '']}
            contentStyle={{ borderRadius: 12, fontSize: 13, border: 'none', backgroundColor: 'rgb(31 41 55)', color: '#fff' }}
          />
          <Bar dataKey="value" fill="#4CAF50" radius={[4, 4, 0, 0]} maxBarSize={40}>
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
              formatter={(v: unknown) => (typeof v === 'number' ? v : '')}
            />
          </Bar>
        </BarChart>
      </div>
    </div>
  )
}

// ─── CalendarGrid ─────────────────────────────────────────────────────────────

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type CellState = 'completed' | 'partial' | 'rest' | 'missed' | 'future' | 'today'

function getCellState(
  d: Date,
  today: Date,
  prog: DayProgress | undefined,
  isFuture: boolean
): CellState {
  const isRestDay = d.getDay() === 3
  if (isFuture) return isRestDay ? 'rest' : 'future'
  if (isRestDay) return 'rest'
  if (prog?.strength_done || prog?.cardio_done) return 'completed'
  if (prog) return 'partial' // row exists but no completion = started but not finished
  return 'missed'
}

const CELL_CLASSES: Record<CellState, string> = {
  completed: 'bg-[#4CAF50]',
  partial:   'bg-yellow-400',
  rest:      'bg-gray-200 dark:bg-gray-700',
  missed:    'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent',
  future:    'bg-gray-100 dark:bg-gray-800',
  today:     'ring-2 ring-blue-400 bg-gray-100 dark:bg-gray-800',
}

function CalendarGrid({
  startDate, today, progressMap,
}: {
  startDate: Date
  today: Date
  progressMap: Record<string, DayProgress>
}) {
  const todayISO = toISODate(today)
  // Rotate day-letter headers so column 0 matches the actual day startDate falls on
  const startDow = startDate.getDay() // 0=Sun, 1=Mon, ...
  const headers = Array.from({ length: 7 }, (_, i) => DAY_LABELS[(startDow + i) % 7])

  return (
    <div className="space-y-1">
      {/* Column headers — aligned to startDate's day of week */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-7 shrink-0" />
        {headers.map((l, i) => (
          <span key={i} className="w-6 text-center text-xs text-gray-400 dark:text-gray-500 shrink-0">{l}</span>
        ))}
      </div>

      {/* 12 weeks */}
      {Array.from({ length: 12 }, (_, wi) => (
        <div key={wi} className="flex items-center gap-1.5">
          <span className="w-7 text-right text-xs text-gray-400 dark:text-gray-500 shrink-0">W{wi + 1}</span>
          {Array.from({ length: 7 }, (_, di) => {
            const d = new Date(startDate)
            d.setDate(d.getDate() + wi * 7 + di)
            const iso = toISODate(d)
            const isFuture = d > today
            const isToday = iso === todayISO
            const prog = progressMap[iso]
            const state: CellState = isToday ? 'today' : getCellState(d, today, prog, isFuture)

            return (
              <div
                key={di}
                title={`${iso}${prog?.strength_done ? ' ✓' : ''}`}
                className={`w-6 h-6 rounded-full shrink-0 transition-colors ${CELL_CLASSES[state]}`}
              />
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
        {([
          ['bg-[#4CAF50]', 'Done'],
          ['bg-yellow-400', 'Partial'],
          ['bg-gray-200 dark:bg-gray-700', 'Rest'],
          ['border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent', 'Missed'],
          ['bg-gray-100 dark:bg-gray-800', 'Future'],
        ] as [string, string][]).map(([cls, lbl]) => (
          <div key={lbl} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${cls}`} />
            <span className="text-xs text-gray-400 dark:text-gray-500">{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MetricsModal ─────────────────────────────────────────────────────────────

function MetricsModal({
  today, startDate, metrics, onClose, onSaved,
}: {
  today: Date
  startDate: Date | null
  metrics: WeeklyMetric[]
  onClose: () => void
  onSaved: () => void
}) {
  const weekNumber = startDate ? getDayInfo(startDate, today).weekNumber : 1
  const existing = metrics.find(m => m.week_number === weekNumber)

  const [pushups,  setPushups]  = useState(existing?.push_ups_max?.toString()  ?? '')
  const [pullups,  setPullups]  = useState(existing?.pull_ups_max?.toString()  ?? '')
  const [deadHang, setDeadHang] = useState(existing?.dead_hang_sec?.toString() ?? '')
  const [plank,    setPlank]    = useState(existing?.plank_sec?.toString()     ?? '')
  const [saving,   setSaving]   = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('weekly_metrics').upsert(
        {
          user_id: user.id,
          week_number: weekNumber,
          push_ups_max:  pushups  ? parseInt(pushups)  : null,
          pull_ups_max:  pullups  ? parseInt(pullups)  : null,
          dead_hang_sec: deadHang ? parseInt(deadHang) : null,
          plank_sec:     plank    ? parseInt(plank)    : null,
        },
        { onConflict: 'user_id,week_number' }
      )
      onSaved()
      onClose()
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-6 sm:pb-0">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Week {weekNumber} Numbers</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {([
            ['Push-ups max', pushups,  setPushups,  'reps'],
            ['Pull-ups max', pullups,  setPullups,  'reps'],
            ['Dead hang',    deadHang, setDeadHang, 'sec'],
            ['Plank hold',   plank,    setPlank,    'sec'],
          ] as [string, string, (v: string) => void, string][]).map(([label, val, setter, unit]) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                <input
                  type="number"
                  inputMode="numeric"
                  value={val}
                  onChange={e => setter(e.target.value)}
                  placeholder="—"
                  className="flex-1 px-3 py-2 text-sm focus:outline-none w-0 bg-transparent text-gray-900 dark:text-gray-100"
                />
                <span className="text-xs text-gray-400 dark:text-gray-500 pr-2 shrink-0">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#4CAF50] hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-8 space-y-4">
      <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        {[0,1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-56 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
    </div>
  )
}
