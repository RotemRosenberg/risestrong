// Web Audio synthesised beeps. Avoids shipping any audio files.
//
// On iOS Safari and other mobile browsers, AudioContext is suspended until the
// first user gesture. Call unlockAudio() from a click handler before any beep.

let audioCtx: AudioContext | null = null

type BeepKind = 'work-start' | 'rest-start' | 'countdown' | 'phase-end' | 'fanfare'

const CONFIG: Record<BeepKind, { freq: number; dur: number; type: OscillatorType; volume: number }> = {
  'work-start':  { freq: 880,  dur: 0.20, type: 'square', volume: 0.35 },
  'rest-start':  { freq: 440,  dur: 0.30, type: 'sine',   volume: 0.30 },
  'countdown':   { freq: 660,  dur: 0.09, type: 'square', volume: 0.25 },
  'phase-end':   { freq: 1100, dur: 0.18, type: 'sine',   volume: 0.30 },
  'fanfare':     { freq: 1320, dur: 0.35, type: 'sine',   volume: 0.40 },
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioCtx) return audioCtx
  try {
    const w = window as Window & { webkitAudioContext?: typeof AudioContext }
    const Ctx = window.AudioContext ?? w.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
    return audioCtx
  } catch {
    return null
  }
}

/** Must be called from a user-gesture handler to unlock audio on iOS. */
export function unlockAudio() {
  const ctx = getCtx()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* ignore */ })
  }
}

export function playBeep(kind: BeepKind) {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* ignore */ })
  }
  try {
    const { freq, dur, type, volume } = CONFIG[kind]
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur)
  } catch {
    /* ignore */
  }
}

/** Triple ascending beep for workout completion. */
export function playFanfare() {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* ignore */ })
  }
  try {
    const t = ctx.currentTime
    const notes = [660, 880, 1320] // C, A, E (ascending feel)
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = t + i * 0.18
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.35)
    })
  } catch {
    /* ignore */
  }
}
