'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toISODate } from '@/lib/schedule'

interface Props {
  today: Date
}

export default function WeighInCard({ today }: Props) {
  const todayISO = toISODate(today)
  const [input, setInput] = useState('')
  const [savedKg, setSavedKg] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [validationErr, setValidationErr] = useState('')

  useEffect(() => {
    async function loadExisting() {
      const supabase = createClient()
      const { data } = await supabase
        .from('weight_log')
        .select('weight_kg')
        .eq('date', todayISO)
        .maybeSingle()
      if (data) setSavedKg(data.weight_kg)
    }
    loadExisting()
  }, [todayISO])

  async function handleSave() {
    const kg = parseFloat(input)
    if (isNaN(kg) || kg < 20 || kg > 300) {
      setValidationErr('Enter a valid weight between 20 and 300 kg')
      return
    }
    setValidationErr('')
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase.from('weight_log').upsert(
      { user_id: user.id, date: todayISO, weight_kg: kg },
      { onConflict: 'user_id,date' }
    )
    await supabase.from('daily_progress').upsert(
      { user_id: user.id, date: todayISO, weigh_in_done: true },
      { onConflict: 'user_id,date' }
    )

    setSavedKg(kg)
    setEditing(false)
    setSaving(false)
  }

  // Saved state
  if (savedKg !== null && !editing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border-l-4 border-green-400 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
            Weekly Weigh-in
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ✓&nbsp;{savedKg} kg logged today
          </p>
        </div>
        <button
          onClick={() => { setEditing(true); setInput(String(savedKg)) }}
          className="text-sm text-gray-400 dark:text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-300"
        >
          Edit
        </button>
      </div>
    )
  }

  // Entry state
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border-l-4 border-green-400">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Weekly Weigh-in 🏋️</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Before eating, after waking up — most accurate reading
          </p>
        </div>
        <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ml-2">
          Required
        </span>
      </div>

      <div className="flex flex-col items-center mb-4">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="20"
          max="300"
          value={input}
          onChange={e => { setInput(e.target.value); setValidationErr('') }}
          placeholder="84.5"
          className="w-40 text-center text-5xl font-bold text-gray-900 dark:text-gray-100 border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-green-500 focus:outline-none pb-1 bg-transparent"
        />
        <span className="text-sm text-gray-400 dark:text-gray-500 mt-1">kg</span>
      </div>

      {validationErr && (
        <p className="text-red-500 text-sm text-center mb-3">{validationErr}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !input}
        className="w-full bg-[#4CAF50] hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        {saving ? 'Saving…' : 'Save Weight'}
      </button>
    </div>
  )
}
