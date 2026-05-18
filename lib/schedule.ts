import {
  PHASES,
  WEEKLY_STRUCTURE,
  type Phase,
  type DaySchedule,
  type Workout,
} from './program'

export interface DayInfo {
  weekNumber: number
  phase: 1 | 2 | 3
  phaseData: Phase
  /** Position within the current phase: 1, 2, 3, or 4. Caps at 4 beyond week 12. */
  weekInPhase: number
  /** Actual calendar day of week (0=Sun … 6=Sat) — used for date display only */
  dayOfWeek: number
  /** True on day 0 of each 7-day program cycle (weigh-in + Strength A day) */
  isWeighInDay: boolean
  schedule: DaySchedule
  workout: Workout | null
  /** True when today is before the program start date */
  notStarted?: boolean
  /** How many days until the program starts (only set when notStarted = true) */
  daysUntilStart?: number
}

/**
 * Linear progressive overload within a 4-week phase.
 * - Rep exercises: +1 rep per week (e.g., 8 → 9 → 10 → 11)
 * - Timed (isometric) exercises: +5 seconds per week (e.g., 20 → 25 → 30 → 35)
 *
 * Beyond Phase 3 (week 12+), weekInPhase caps at 4 so the target plateaus
 * rather than resetting.
 */
export function progressedTarget(
  baseReps: number,
  weekInPhase: number,
  isTimed: boolean
): number {
  const delta = Math.max(0, weekInPhase - 1)
  return isTimed ? baseReps + delta * 5 : baseReps + delta
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDayInfo(startDate: Date, today: Date): DayInfo {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / MS_PER_DAY)

  // Program hasn't started yet
  if (daysDiff < 0) {
    return {
      weekNumber: 0,
      phase: 1,
      phaseData: PHASES[0],
      weekInPhase: 1,
      dayOfWeek: today.getDay(),
      isWeighInDay: false,
      schedule: WEEKLY_STRUCTURE[0],
      workout: null,
      notStarted: true,
      daysUntilStart: Math.abs(daysDiff),
    }
  }

  const weekNumber = Math.floor(daysDiff / 7) + 1
  const phase: 1 | 2 | 3 = weekNumber <= 4 ? 1 : weekNumber <= 8 ? 2 : 3
  const phaseData = PHASES[phase - 1]

  // Week position within current phase (1-4), capped at 4 beyond week 12.
  const weekInPhase =
    phase === 1 ? Math.min(4, weekNumber)
    : phase === 2 ? Math.min(4, weekNumber - 4)
    :               Math.min(4, weekNumber - 8)

  // Program-relative day within the current 7-day cycle (0 = Strength A + weigh-in)
  const programDay = daysDiff % 7
  const isWeighInDay = programDay === 0
  const schedule = WEEKLY_STRUCTURE[programDay]

  const workout: Workout | null =
    schedule.type === 'strength_a' ? phaseData.workouts.a
    : schedule.type === 'strength_b' ? phaseData.workouts.b
    : null

  return {
    weekNumber,
    phase,
    phaseData,
    weekInPhase,
    dayOfWeek: today.getDay(),
    isWeighInDay,
    schedule,
    workout,
  }
}

/*
// Sample output — run with: npx ts-node lib/schedule.ts

const start = new Date('2026-05-18') // A Monday start

console.log(getDayInfo(start, new Date('2026-05-18')))
// week 1, programDay 0 → Strength A + weigh-in

console.log(getDayInfo(start, new Date('2026-05-19')))
// week 1, programDay 1 → Cardio

console.log(getDayInfo(start, new Date('2026-05-20')))
// week 1, programDay 2 → Strength B

console.log(getDayInfo(start, new Date('2026-05-21')))
// week 1, programDay 3 → Rest
*/
