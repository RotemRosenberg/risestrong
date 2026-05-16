'use client'

import type { Exercise } from '@/lib/program'
import ExerciseAnimation from './ExerciseAnimation'

interface Props {
  exercise: Exercise
  exerciseId: string
  onClose: () => void
}

export default function YoutubeModal({ exercise, exerciseId, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-gray-800">
        <button
          onClick={onClose}
          className="text-white font-medium text-base flex items-center gap-2 active:opacity-70"
        >
          ✕ Back to workout
        </button>
        <span className="text-gray-400 text-sm font-medium">{exercise.name}</span>
      </div>

      {/* Animation */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xs">
          <ExerciseAnimation exerciseId={exerciseId} />
        </div>
      </div>

      {/* Muscle tags */}
      <div className="px-4 pb-2 shrink-0 flex flex-wrap gap-1.5 justify-center">
        {exercise.muscles.map(m => (
          <span key={m} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-0.5 rounded-full capitalize">
            {m}
          </span>
        ))}
      </div>

      {/* Technique tip */}
      <div className="px-5 py-4 shrink-0">
        <p className="text-gray-300 text-sm italic leading-relaxed text-center">
          {exercise.technique}
        </p>
      </div>
    </div>
  )
}
