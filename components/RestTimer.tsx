'use client'

import { useEffect, useRef, useState } from 'react'

const DURATION = 90
const STORAGE_KEY = 'rest_timer_start'

interface Props {
  triggerKey: number // increment to start/reset the timer
}

export default function RestTimer({ triggerKey }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startCountdown(seconds: number) {
    clearTimer()
    setSecondsLeft(seconds)
    setVisible(true)
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function dismiss() {
    clearTimer()
    sessionStorage.removeItem(STORAGE_KEY)
    setVisible(false)
    setSecondsLeft(null)
  }

  // On mount (triggerKey=0): restore from sessionStorage
  // On any new trigger: start fresh 90-second timer
  useEffect(() => {
    if (triggerKey === 0) {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const elapsed = Math.floor((Date.now() - parseInt(saved)) / 1000)
        if (elapsed < DURATION) startCountdown(DURATION - elapsed)
      }
      return
    }
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
    startCountdown(DURATION)
    return clearTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey])

  // Auto-hide 3 seconds after reaching 0
  useEffect(() => {
    if (secondsLeft !== 0) return
    const t = setTimeout(() => {
      sessionStorage.removeItem(STORAGE_KEY)
      setVisible(false)
    }, 3000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  if (!visible || secondsLeft === null) return null

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    <div className="fixed bottom-[84px] left-4 right-4 z-40 bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl">
      {secondsLeft > 0 ? (
        <>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Rest</p>
            <p className="text-2xl font-bold font-mono">{timeStr}</p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </>
      ) : (
        <p className="text-lg font-semibold">✅ Ready! 🔔</p>
      )}
    </div>
  )
}
