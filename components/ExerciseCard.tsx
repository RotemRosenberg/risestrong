'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, BarChart3 } from 'lucide-react'
import type { Exercise, WorkoutExercise } from '@/lib/program'
import InlineVideo from './InlineVideo'
import TimerOverlay from './TimerOverlay'
import ExerciseHistoryModal from './ExerciseHistoryModal'
import { unlockAudio } from '@/lib/soundEffect'

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
  const [showTimer, setShowTimer] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const completedCount = savedSets.filter(Boolean).length
  const allDone = completedCount === workoutExercise.sets
  const someDone = completedCount > 0 && !allDone

  const cardClass = allDone
    ? 'bg-green-50 dark:bg-green-950/40 border-2 border-green-400 dark:border-green-700'
    : someDone
    ? 'bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700'
    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'

  const targetLabel = `${workoutExercise.sets} × ${workoutExercise.reps}${exercise.timed ? 's' : ''}${workoutExercise.eachSide ? ' each side' : ''}`

  // Mirror latest savedSets so the overlay callback can guard against double-toggles.
  const savedSetsRef = useRef(savedSets)
  useEffect(() => { savedSetsRef.current = savedSets }, [savedSets])

  function handleOverlaySetComplete(setIndex: number, heldSec: number) {
    onRepsChange(setIndex, heldSec)
    if (!savedSetsRef.current[setIndex]) onSetToggle(setIndex)
  }

  function openTimer() {
    // Unlock audio under the user gesture so iOS doesn't block beeps.
    unlockAudio()
    setShowTimer(true)
  }

  return (
    <>
      <div className={`${cardClass} rounded-2xl shadow-sm overflow-hidden transition-colors`}>
        {/* Inline demo video — first thing in the card */}
        <InlineVideo youtubeUrl={exercise.youtube_url} className="rounded-none" />

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 -m-1 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors text-left"
              aria-label={`Show ${exercise.name} history`}
            >
              <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{exercise.name}</h3>
              <BarChart3 size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 pt-0.5">Target: {targetLabel}</span>
          </div>

          {/* Muscle tags */}
          <div className="flex flex-wrap gap-1.5">
            {exercise.muscles.map(m => (
              <span
                key={m}
                className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full capitalize"
              >
                {m}
              </span>
            ))}
          </div>

          {/* Technique */}
          <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
            {exercise.technique}
          </p>

          {/* Run All Sets — only for timed exercises */}
          {exercise.timed && (
            <button
              onClick={openTimer}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-bold transition-colors shadow-sm ${
                allDone
                  ? 'bg-white dark:bg-gray-800 border-2 border-[#4CAF50] text-[#4CAF50]'
                  : 'bg-[#4CAF50] hover:bg-green-600 text-white'
              }`}
            >
              {allDone ? <RotateCcw size={18} /> : <Play size={18} fill="currentColor" />}
              {allDone
                ? 'Redo Workout'
                : `Run All Sets · ${workoutExercise.sets} × ${workoutExercise.reps}s`}
            </button>
          )}

          {/* Sets */}
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: workoutExercise.sets }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onSetToggle(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    savedSets[i]
                      ? 'bg-[#4CAF50] border-[#4CAF50] text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {savedSets[i] ? `✓ Set ${i + 1}` : `Set ${i + 1}`}
                </button>
              ))}
            </div>

            {/* Actual reps / seconds inputs */}
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: workoutExercise.sets }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={savedReps[i] ?? workoutExercise.reps}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v)) onRepsChange(i, v)
                    }}
                    className="w-12 text-center text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg py-1 focus:outline-none focus:border-blue-400"
                    min="0"
                    max="999"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {exercise.timed ? 'sec' : 'reps'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTimer && exercise.timed && (
        <TimerOverlay
          exerciseName={exercise.name}
          totalSets={workoutExercise.sets}
          workSec={workoutExercise.reps}
          onSetComplete={handleOverlaySetComplete}
          onClose={() => setShowTimer(false)}
        />
      )}

      {showHistory && (
        <ExerciseHistoryModal
          exerciseId={workoutExercise.exerciseId}
          exercise={exercise}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  )
}
