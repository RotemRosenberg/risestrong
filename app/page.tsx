'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDayInfo, toISODate, type DayInfo } from '@/lib/schedule'
import TodayHeader from '@/components/TodayHeader'
import WeighInCard from '@/components/WeighInCard'
import DayTypeCard from '@/components/DayTypeCard'

interface UserConfig {
  user_id: string
  start_date: string
  user_name: string
  goal_weight?: number
}

export default function TodayPage() {
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const today = new Date()

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const todayISO = toISODate(today)

        // Create default config row if none exists yet
        await supabase
          .from('user_config')
          .upsert(
            { user_id: user.id, start_date: todayISO, user_name: 'Rotem' },
            { onConflict: 'user_id', ignoreDuplicates: true }
          )

        const { data, error: fetchError } = await supabase
          .from('user_config')
          .select('*')
          .single()

        if (fetchError) throw fetchError

        setConfig(data)
        const startDate = new Date(data.start_date + 'T00:00:00')
        setDayInfo(getDayInfo(startDate, today))
      } catch {
        setError("Failed to load today's data — check your connection")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <main className="max-w-lg mx-auto px-4 pt-5 pb-8 space-y-4">
      {error && (
        <ErrorToast message={error} onClose={() => setError(null)} />
      )}

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
        </>
      )}
    </main>
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
    </main>
  )
}

function ErrorToast({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
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
