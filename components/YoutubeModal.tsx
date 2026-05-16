'use client'

import { useState } from 'react'
import type { Exercise } from '@/lib/program'

interface Props {
  exercise: Exercise
  onClose: () => void
}

export default function YoutubeModal({ exercise, onClose }: Props) {
  const [src, setSrc] = useState(
    `${exercise.youtube_url}?autoplay=1&rel=0&modestbranding=1`
  )

  function handleClose() {
    setSrc('') // stops audio immediately before unmount
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center h-14 px-4 shrink-0">
        <button
          onClick={handleClose}
          className="text-white font-medium text-base flex items-center gap-2 active:opacity-70"
        >
          ✕ Back to workout
        </button>
      </div>

      {/* Video */}
      <iframe
        title={exercise.name}
        src={src}
        className="flex-1 w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      {/* Technique tip */}
      <div className="px-4 py-3 bg-black/60 shrink-0">
        <p className="text-white/70 text-sm italic leading-snug">
          {exercise.technique}
        </p>
      </div>
    </div>
  )
}
