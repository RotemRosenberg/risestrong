'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { toISODate } from '@/lib/schedule'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeightEntry {
  id?: number
  user_id: string
  date: string
  weight_kg: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(delta: number): { text: string; cls: string } {
  if (delta === 0) return { text: '0 kg', cls: 'text-gray-500' }
  const abs = Math.abs(delta).toFixed(1)
  return delta < 0
    ? { text: `−${abs} kg`, cls: 'text-green-600 font-semibold' }
    : { text: `+${abs} kg`, cls: 'text-red-500 font-semibold' }
}

function friendlyDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WeightPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [goalWeight, setGoalWeight] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputKg, setInputKg] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [today] = useState(() => new Date())
  const todayISO = toISODate(today)
  const todayEntry = entries.find(e => e.date === todayISO) ?? null

  // ── Load ───────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      const supabase = createClient()
      const [{ data: rows }, { data: cfg }] = await Promise.all([
        supabase
          .from('weight_log')
          .select('*')
          .order('date', { ascending: true }),
        supabase.from('user_config').select('goal_weight').single(),
      ])
      if (rows) setEntries(rows)
      if (cfg?.goal_weight) setGoalWeight(cfg.goal_weight)
    } catch {
      // table may not exist yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Pre-fill input when today's entry loads
  useEffect(() => {
    if (todayEntry) setInputKg(String(todayEntry.weight_kg))
  }, [todayEntry])

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    const kg = parseFloat(inputKg)
    if (isNaN(kg) || kg < 20 || kg > 300) {
      flash('Enter a valid weight (20–300 kg)')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('weight_log').upsert(
        { user_id: user.id, date: todayISO, weight_kg: kg },
        { onConflict: 'user_id,date' }
      )
      await supabase.from('daily_progress').upsert(
        { user_id: user.id, date: todayISO, weigh_in_done: true },
        { onConflict: 'user_id,date' }
      )
      await load()
      flash('✅ Weight saved')
    } catch {
      flash('Failed to save weight')
    } finally {
      setSaving(false)
    }
  }

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const first = entries[0] ?? null
  const last = entries[entries.length - 1] ?? null
  const prev = entries[entries.length - 2] ?? null

  const totalDelta = first && last ? last.weight_kg - first.weight_kg : null
  const weekDelta = prev && last ? last.weight_kg - prev.weight_kg : null
  const goalRemaining = goalWeight && last ? last.weight_kg - goalWeight : null

  // Chart data
  const chartData = entries.map((e, i) => {
    const prevW = i > 0 ? entries[i - 1].weight_kg : null
    const delta = prevW !== null ? +(e.weight_kg - prevW).toFixed(1) : null
    const color =
      i === 0 ? '#9ca3af' : e.weight_kg < entries[i - 1].weight_kg ? '#4CAF50' : '#f97316'
    return { label: `W${i + 1}`, weight: e.weight_kg, delta, color }
  })

  const weights = entries.map(e => e.weight_kg)
  const minW = weights.length ? Math.min(...weights) : 60
  const maxW = weights.length ? Math.max(...weights) : 100
  const yDomain: [number, number] = [Math.floor(minW - 2), Math.ceil(maxW + 2)]
  const chartWidth = Math.max(320, chartData.length * 68)

  // ── Custom X tick ──────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XTick = (props: any) => {
    const { x, y, index } = props
    const item = chartData[index]
    if (!item) return null
    const d = item.delta
    const arrowColor = d === null ? '' : d < 0 ? '#16a34a' : d > 0 ? '#ef4444' : '#9ca3af'
    const arrowText = d === null ? '' : d === 0 ? '—' : d < 0 ? `↓${Math.abs(d)}` : `↑${d}`
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={14} textAnchor="middle" fill="#9ca3af" fontSize={11}>
          {item.label}
        </text>
        {arrowText && (
          <text dy={27} textAnchor="middle" fill={arrowColor} fontSize={11} fontWeight={600}>
            {arrowText}
          </text>
        )}
      </g>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">Weight</h1>

      {/* Explanation */}
      <div className="bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-600 leading-relaxed">
        📋 Weigh yourself every Sunday morning before eating and after waking up.
        This gives the most accurate and consistent readings over time.
      </div>

      {/* Quick entry */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="font-bold text-gray-800">Log Weight</h2>
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="20"
            max="300"
            value={inputKg}
            onChange={e => setInputKg(e.target.value)}
            placeholder="84.5"
            className="w-36 text-center text-5xl font-bold text-gray-900 border-0 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none pb-1 bg-transparent"
          />
          <span className="text-sm text-gray-400">kg</span>
          <span className="text-xs text-gray-400 mt-1">{friendlyDate(todayISO)}</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !inputKg}
          className="w-full bg-[#4CAF50] hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          {saving ? 'Saving…' : todayEntry ? 'Update Weight' : "Save Today's Weight"}
        </button>
      </div>

      {/* Summary cards */}
      {entries.length >= 1 && (
        <div className="grid grid-cols-3 gap-2">
          <SummaryCard
            label="Total change"
            value={totalDelta !== null ? fmt(totalDelta) : null}
            fallback="—"
          />
          <SummaryCard
            label="Last week"
            value={weekDelta !== null ? fmt(weekDelta) : null}
            fallback="—"
          />
          <SummaryCard
            label="To goal"
            value={
              goalRemaining !== null
                ? {
                    text:
                      goalRemaining <= 0
                        ? '🎯 Done!'
                        : `${goalRemaining.toFixed(1)} kg`,
                    cls:
                      goalRemaining <= 0
                        ? 'text-green-600 font-semibold'
                        : 'text-amber-600 font-semibold',
                  }
                : null
            }
            fallback="No goal"
          />
        </div>
      )}

      {/* Chart */}
      {entries.length >= 2 && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-3">Progress</h2>
          <div className="overflow-x-auto -mx-1 px-1">
            <div style={{ width: chartWidth, height: 240 }}>
              <BarChart
                width={chartWidth}
                height={240}
                data={chartData}
                margin={{ top: 24, right: 12, left: -16, bottom: 8 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={XTick}
                  height={48}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={yDomain}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}`}
                  width={36}
                />
                <Tooltip
                  formatter={(v) => [`${v} kg`, 'Weight']}
                  contentStyle={{ borderRadius: 12, fontSize: 13 }}
                />
                <Bar dataKey="weight" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                  <LabelList
                    dataKey="weight"
                    position="top"
                    style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                    formatter={(v) => (typeof v === 'number' ? v.toFixed(1) : '')}
                  />
                </Bar>
              </BarChart>
            </div>
          </div>
        </div>
      )}

      {/* History list */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-bold text-gray-800 mb-3">History</h2>

        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No weight entries yet. Start by logging your weight above.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {[...entries].reverse().map((entry, i, arr) => {
              const nextEntry = arr[i + 1] // "next" in reversed = previous in time
              const delta = nextEntry ? entry.weight_kg - nextEntry.weight_kg : null
              return (
                <div key={entry.date} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {friendlyDate(entry.date)}
                    </p>
                    {delta !== null && (
                      <p className={`text-xs mt-0.5 ${fmt(delta).cls}`}>
                        {fmt(delta).text}
                      </p>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {entry.weight_kg.toFixed(1)}{' '}
                    <span className="text-sm font-normal text-gray-400">kg</span>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  fallback,
}: {
  label: string
  value: { text: string; cls: string } | null
  fallback: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
      <p className="text-xs text-gray-400 leading-tight mb-1">{label}</p>
      {value ? (
        <p className={`text-base ${value.cls}`}>{value.text}</p>
      ) : (
        <p className="text-base text-gray-400">{fallback}</p>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-8 space-y-4">
      <div className="h-7 w-24 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="h-44 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map(i => <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
    </div>
  )
}
