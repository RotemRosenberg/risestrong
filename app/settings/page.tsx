'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserConfig {
  user_id: string
  start_date: string
  user_name: string
  starting_weight?: number | null
  goal_weight?: number | null
  reminder_time?: string | null
}

type ToastState = { message: string; variant: 'success' | 'error' } | null

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()

  // Remote state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [notifPermission, setNotifPermission] = useState<
    NotificationPermission | 'unsupported'
  >('default')

  // Form fields
  const [userName, setUserName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startingWeight, setStartingWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [reminderTime, setReminderTime] = useState('')

  // ── Init ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission)
    } else {
      setNotifPermission('unsupported')
    }

    async function loadConfig() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) setUserEmail(user.email)

        const { data } = await supabase
          .from('user_config')
          .select('*')
          .single()

        if (data) {
          setUserName(data.user_name ?? '')
          setStartDate(data.start_date ?? '')
          setStartingWeight(data.starting_weight?.toString() ?? '')
          setGoalWeight(data.goal_weight?.toString() ?? '')
          setReminderTime(data.reminder_time ?? '')
        }
      } catch {
        // Table may not exist yet — form stays at defaults
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('user_config').upsert(
        {
          user_id: user.id,
          user_name: userName,
          start_date: startDate,
          starting_weight: startingWeight ? parseFloat(startingWeight) : null,
          goal_weight: goalWeight ? parseFloat(goalWeight) : null,
          reminder_time: reminderTime || null,
        },
        { onConflict: 'user_id' }
      )
      flash('✅ Settings saved', 'success')
    } catch {
      flash('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await Promise.all([
        supabase.from('daily_progress').delete().eq('user_id', user.id),
        supabase.from('exercise_sets').delete().eq('user_id', user.id),
        supabase.from('weight_log').delete().eq('user_id', user.id),
      ])

      setShowResetConfirm(false)
      flash('Progress reset', 'success')
    } catch {
      flash('Failed to reset progress', 'error')
    } finally {
      setResetting(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleEnableNotifications() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setNotifPermission(result)
  }

  function flash(message: string, variant: 'success' | 'error') {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.variant === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-8 sm:pb-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Reset All Progress?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              This will permanently delete all your workout progress and weight logs.
              Your settings will be kept. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {resetting ? 'Resetting…' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* ── Card 1: Profile ── */}
      <SettingsCard title="Profile">
        <Field label="Display name">
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Rotem"
            className={inputCls}
          />
        </Field>
        <Field label="Program start date">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={inputCls}
          />
          <p className="text-xs text-amber-600 mt-1.5 leading-snug">
            ⚠️ Changing this will recalculate your current week and phase
          </p>
        </Field>
      </SettingsCard>

      {/* ── Card: Appearance ── */}
      <SettingsCard title="Appearance">
        <Field label="Theme">
          <ThemeToggle />
        </Field>
      </SettingsCard>

      {/* ── Card 2: Weight Goals ── */}
      <SettingsCard title="Weight Goals">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starting weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={startingWeight}
              onChange={e => setStartingWeight(e.target.value)}
              placeholder="85.0"
              className={inputCls}
            />
          </Field>
          <Field label="Goal weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={goalWeight}
              onChange={e => setGoalWeight(e.target.value)}
              placeholder="75.0"
              className={inputCls}
            />
          </Field>
        </div>
      </SettingsCard>

      {/* ── Card 3: Notifications ── */}
      <SettingsCard title="Notifications">
        <Field label="Daily reminder time">
          <input
            type="time"
            value={reminderTime}
            onChange={e => setReminderTime(e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Browser notifications</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Status:{' '}
              <span
                className={
                  notifPermission === 'granted'
                    ? 'text-green-600 font-semibold'
                    : notifPermission === 'denied'
                    ? 'text-red-600 font-semibold'
                    : notifPermission === 'unsupported'
                    ? 'text-gray-400'
                    : 'text-amber-600 font-semibold'
                }
              >
                {notifPermission === 'granted'
                  ? 'Granted'
                  : notifPermission === 'denied'
                  ? 'Denied'
                  : notifPermission === 'unsupported'
                  ? 'Not supported'
                  : 'Not set'}
              </span>
            </p>
          </div>

          {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
            <button
              onClick={handleEnableNotifications}
              disabled={notifPermission === 'denied'}
              className="text-sm font-semibold text-[#4CAF50] border border-[#4CAF50] px-3 py-1.5 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {notifPermission === 'denied' ? 'Blocked' : 'Enable Notifications'}
            </button>
          )}
        </div>
      </SettingsCard>

      {/* ── Save button ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#4CAF50] hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-base transition-colors shadow-sm"
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>

      {/* ── Card 4: Danger Zone ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-red-200 dark:border-red-900/50 space-y-2">
        <h2 className="font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug">
          Permanently deletes all workout logs and weight entries. Your config is preserved.
        </p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full mt-1 py-2.5 rounded-xl border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          Reset All Progress
        </button>
      </div>

      {/* ── Account ── */}
      <div className="flex flex-col items-center gap-2 pt-2 pb-2">
        {userEmail && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Logged in as {userEmail}</p>
        )}
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors'

function SettingsCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 space-y-3">
      <h2 className="font-bold text-gray-800 dark:text-gray-200">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">{label}</label>
      {children}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-8 space-y-4">
      <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-lg w-28 animate-pulse" />
      {[0, 1, 2].map(i => (
        <div key={i} className="h-36 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}
