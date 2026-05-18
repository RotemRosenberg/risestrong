'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { X, SkipForward } from 'lucide-react'
import { playBeep, playFanfare, unlockAudio } from '@/lib/soundEffect'

const REST_SEC = 90
const PREP_SEC = 3

interface Props {
  exerciseName: string
  totalSets: number
  workSec: number
  onSetComplete: (setIndex: number, heldSec: number) => void
  onClose: () => void
}

type Phase = 'prep' | 'work' | 'rest' | 'done'

interface State {
  phase: Phase
  currentSet: number
  remaining: number
}

type Action = { type: 'tick' } | { type: 'skip' }

function makeReducer(workSec: number, totalSets: number) {
  function transition(state: State): State {
    if (state.phase === 'prep') {
      return { phase: 'work', currentSet: 0, remaining: workSec }
    }
    if (state.phase === 'work') {
      if (state.currentSet < totalSets - 1) {
        return { phase: 'rest', currentSet: state.currentSet, remaining: REST_SEC }
      }
      return { phase: 'done', currentSet: state.currentSet, remaining: 0 }
    }
    if (state.phase === 'rest') {
      return { phase: 'work', currentSet: state.currentSet + 1, remaining: workSec }
    }
    return state
  }
  return function reducer(state: State, action: Action): State {
    if (state.phase === 'done') return state
    if (action.type === 'skip') return transition(state)
    if (state.remaining <= 1) return transition(state)
    return { ...state, remaining: state.remaining - 1 }
  }
}

export default function TimerOverlay({
  exerciseName,
  totalSets,
  workSec,
  onSetComplete,
  onClose,
}: Props) {
  // Stable reducer instance — workSec and totalSets are fixed for the lifetime of the overlay.
  const [reducer] = useState(() => makeReducer(workSec, totalSets))
  const [state, dispatch] = useReducer(reducer, {
    phase: 'prep',
    currentSet: 0,
    remaining: PREP_SEC,
  })

  // Unlock audio on mount — the click that opened this overlay is the gesture.
  useEffect(() => {
    unlockAudio()
  }, [])

  // Keep screen awake during the workout (best-effort).
  useEffect(() => {
    type WL = { release: () => Promise<void> }
    type WLNav = Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WL> } }
    const nav = navigator as WLNav
    let release: (() => Promise<void>) | null = null
    if (nav.wakeLock) {
      nav.wakeLock
        .request('screen')
        .then(wl => { release = () => wl.release() })
        .catch(() => { /* ignore */ })
    }
    return () => {
      release?.().catch(() => { /* ignore */ })
    }
  }, [])

  // Tick interval — runs while not done.
  useEffect(() => {
    if (state.phase === 'done') return
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(id)
  }, [state.phase, state.currentSet])

  // Phase-change cues (sound + vibration).
  useEffect(() => {
    if (state.phase === 'prep') return // countdown beep effect handles 3,2,1
    if (typeof navigator === 'undefined') return
    const v = (pattern: number[]) => {
      if ('vibrate' in navigator) navigator.vibrate(pattern)
    }
    if (state.phase === 'work') {
      playBeep('work-start')
      v([150])
    } else if (state.phase === 'rest') {
      playBeep('rest-start')
      v([80])
    } else if (state.phase === 'done') {
      playFanfare()
      v([100, 60, 100, 60, 200])
    }
  }, [state.phase, state.currentSet])

  // Countdown beeps at remaining = 3, 2, 1.
  useEffect(() => {
    if (state.phase === 'done') return
    if (state.remaining >= 1 && state.remaining <= 3) {
      playBeep('countdown')
    }
  }, [state.remaining, state.phase])

  // Notify parent when a work phase ends (set completed).
  const prevPhaseRef = useRef(state.phase)
  useEffect(() => {
    if (prevPhaseRef.current === 'work' && state.phase !== 'work') {
      onSetComplete(state.currentSet, workSec)
    }
    prevPhaseRef.current = state.phase
  }, [state.phase, state.currentSet, onSetComplete, workSec])

  // ── Styling per phase ───────────────────────────────────────────────────────

  const bgClass =
    state.phase === 'prep'  ? 'bg-amber-500'
    : state.phase === 'work'  ? 'bg-[#4CAF50]'
    : state.phase === 'rest'  ? 'bg-blue-500'
    :                           'bg-gradient-to-br from-emerald-500 via-emerald-400 to-amber-500'

  const phaseLabel =
    state.phase === 'prep' ? 'GET READY'
    : state.phase === 'work' ? 'WORK'
    : state.phase === 'rest' ? 'REST'
    :                          'COMPLETE!'

  const setDisplay =
    state.phase === 'prep' ? `${totalSets} sets · ${workSec}s each`
    : state.phase === 'done' ? 'All done!'
    : `Set ${state.currentSet + 1} of ${totalSets}`

  // Progress dots
  const dots = Array.from({ length: totalSets }).map((_, i) => {
    const done =
      state.phase === 'done' ||
      (state.phase === 'rest' && i <= state.currentSet) ||
      (state.phase === 'work' && i < state.currentSet)
    const active = state.phase !== 'done' && state.phase !== 'prep' && i === state.currentSet
    return { done, active }
  })

  return (
    <div
      className={`fixed inset-0 z-[100] ${bgClass} text-white flex flex-col transition-colors duration-500`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-2">
        <button
          onClick={onClose}
          className="p-2 -m-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Close timer"
        >
          <X size={28} />
        </button>
        <div className="text-sm font-semibold tracking-wide opacity-90">
          {setDisplay}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold opacity-90 mb-2">{exerciseName}</p>
        <p className="text-3xl sm:text-4xl font-extrabold tracking-[0.2em] opacity-95 mb-6">
          {phaseLabel}
        </p>

        {state.phase !== 'done' ? (
          <>
            <p
              className="leading-none font-black font-mono tabular-nums"
              style={{ fontSize: 'min(40vw, 14rem)' }}
            >
              {state.remaining}
            </p>
            <p className="text-sm uppercase tracking-widest opacity-75 mt-3">
              seconds
            </p>
          </>
        ) : (
          <div className="text-8xl mb-2">🎉</div>
        )}

        {/* Progress dots */}
        <div className="flex gap-2 mt-12">
          {dots.map((d, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                d.done ? 'bg-white' : d.active ? 'bg-white/70 ring-2 ring-white/80 ring-offset-2 ring-offset-transparent' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-2">
        {state.phase === 'done' ? (
          <button
            onClick={onClose}
            className="w-full bg-white text-emerald-700 font-bold py-4 rounded-2xl text-lg shadow-lg active:bg-gray-100 transition-colors"
          >
            Done
          </button>
        ) : (
          <button
            onClick={() => dispatch({ type: 'skip' })}
            className="w-full bg-white/15 backdrop-blur text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 active:bg-white/25 transition-colors"
          >
            <SkipForward size={18} />
            Skip {state.phase === 'work' ? 'set' : state.phase === 'rest' ? 'rest' : 'prep'}
          </button>
        )}
      </div>
    </div>
  )
}
