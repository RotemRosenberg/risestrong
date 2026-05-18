'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Square } from 'lucide-react'
import type { Exercise, WorkoutExercise } from '@/lib/program'
import YoutubeModal from './YoutubeModal'

interface Props {
  exercise: Exercise
  workoutExercise: WorkoutExercise
  savedSets: boolean[]
  savedReps: number[]
  onSetToggle: (setIndex: number) => void
  onRepsChange: (setIndex: number, reps: number) => void
}

export default function ExerciseCard({
  exercise,
  workoutExercise,
  savedSets,
  savedReps,
  onSetToggle,
  onRepsChange,
}: Props) {
  const [showModal, setShowModal] = useState(false)

  const completedCount = savedSets.filter(Boolean).length
  const allDone = completedCount === workoutExercise.sets
  const someDone = completedCount > 0 && !allDone

  const cardClass = allDone
    ? 'bg-green-50 border-2 border-green-400'
    : someDone
    ? 'bg-white border-2 border-blue-300'
    : 'bg-white border border-gray-200'

  const targetLabel = `${workoutExercise.sets} × ${workoutExercise.reps}${exercise.timed ? 's' : ''}${workoutExercise.eachSide ? ' each side' : ''}`

  // ── Timer state (timed exercises only) ─────────────────────────────────────
  // Only one set can run at a time within a single ExerciseCard.
  const [runningSet, setRunningSet] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Refs mirror latest values so effects and callbacks can read fresh state.
  const savedSetsRef = useRef(savedSets)
  const remainingRef = useRef(remaining)
  useEffect(() => { savedSetsRef.current = savedSets }, [savedSets])
  useEffect(() => { remainingRef.current = remaining }, [remaining])

  // Clean up interval on unmount.
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  function clearTimerInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  function startTimer(setIndex: number) {
    // If another set is running, finish it first with elapsed-so-far.
    if (runningSet !== null && runningSet !== setIndex) {
      const target = workoutExercise.reps
      const held = Math.max(0, target - remainingRef.current)
      clearTimerInterval()
      onRepsChange(runningSet, held)
      if (!savedSetsRef.current[runningSet]) onSetToggle(runningSet)
    }

    const targetSec = workoutExercise.reps
    setRunningSet(setIndex)
    setRemaining(targetSec)
    clearTimerInterval()

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          // Final tick — stop the interval and defer completion side effects
          // to the next macrotask so we don't fire setState chains inside an
          // updater.
          clearTimerInterval()
          setTimeout(() => {
            setRunningSet(null)
            onRepsChange(setIndex, targetSec)
            if (!savedSetsRef.current[setIndex]) onSetToggle(setIndex)
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([200, 80, 200])
            }
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function stopTimerEarly() {
    if (runningSet === null) return
    const target = workoutExercise.reps
    const held = Math.max(0, target - remainingRef.current)
    const idx = runningSet
    clearTimerInterval()
    setRunningSet(null)
    setRemaining(0)
    onRepsChange(idx, held)
    if (!savedSetsRef.current[idx]) onSetToggle(idx)
  }

  return (
    <>
      <div className={`${cardClass} rounded-2xl shadow-sm p-4 space-y-3 transition-colors`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 leading-tight">{exercise.name}</h3>
          <span className="text-xs text-gray-400 shrink-0 pt-0.5">Target: {targetLabel}</span>
        </div>

        {/* Muscle tags */}
        <div className="flex flex-wrap gap-1.5">
          {exercise.muscles.map(m => (
            <span
              key={m}
              className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full capitalize"
            >
              {m}
            </span>
          ))}
        </div>

        {/* Watch demo */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          ▶ Watch Demo
        </button>

        {/* Technique */}
        <p className="text-xs text-gray-400 italic leading-relaxed">
          {exercise.technique}
        </p>

        {/* Sets */}
        <div className="space-y-2">
          {exercise.timed ? (
            // ── Timed set buttons ──────────────────────────────────────────
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: workoutExercise.sets }).map((_, i) => {
                const isRunning = runningSet === i
                const isDone = savedSets[i]
                const targetSec = workoutExercise.reps

                if (isRunning) {
                  return (
                    <button
                      key={i}
                      onClick={stopTimerEarly}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border bg-amber-400 border-amber-500 text-white flex items-center gap-2 min-w-[110px] justify-center"
                    >
                      <span className="font-mono text-base tabular-nums">{remaining}s</span>
                      <Square size={14} fill="currentColor" />
                    </button>
                  )
                }
                if (isDone) {
                  return (
                    <button
                      key={i}
                      onClick={() => onSetToggle(i)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border bg-[#4CAF50] border-[#4CAF50] text-white"
                    >
                      ✓ Set {i + 1}
                    </button>
                  )
                }
                return (
                  <button
                    key={i}
                    onClick={() => startTimer(i)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border bg-white border-gray-300 text-gray-700 hover:border-gray-400 flex items-center gap-1.5"
                  >
                    <Play size={12} fill="currentColor" />
                    Set {i + 1} · {targetSec}s
                  </button>
                )
              })}
            </div>
          ) : (
            // ── Regular set buttons ────────────────────────────────────────
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: workoutExercise.sets }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onSetToggle(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    savedSets[i]
                      ? 'bg-[#4CAF50] border-[#4CAF50] text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {savedSets[i] ? `✓ Set ${i + 1}` : `Set ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Actual reps / seconds inputs */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: workoutExercise.sets }).map((_, i) => {
              const isRunning = runningSet === i
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={savedReps[i] ?? workoutExercise.reps}
                    disabled={isRunning}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v)) onRepsChange(i, v)
                    }}
                    className="w-12 text-center text-sm border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                    min="0"
                    max="999"
                  />
                  <span className="text-xs text-gray-400">
                    {exercise.timed ? 'sec' : 'reps'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <YoutubeModal exercise={exercise} exerciseId={workoutExercise.exerciseId} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
