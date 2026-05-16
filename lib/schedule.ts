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
  dayOfWeek: number
  isSunday: boolean
  schedule: DaySchedule
  workout: Workout | null
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

  // Week 1 on day 0; clamp to 1 in case today is somehow before startDate
  const weekNumber = Math.max(1, Math.floor(daysDiff / 7) + 1)

  // Phase 3 continues indefinitely past week 12
  const phase: 1 | 2 | 3 = weekNumber <= 4 ? 1 : weekNumber <= 8 ? 2 : 3

  const phaseData = PHASES[phase - 1]
  const dayOfWeek = today.getDay() // 0 = Sunday
  const isSunday = dayOfWeek === 0
  const schedule = WEEKLY_STRUCTURE[dayOfWeek]

  const workout: Workout | null =
    schedule.type === 'strength_a' ? phaseData.workouts.a
    : schedule.type === 'strength_b' ? phaseData.workouts.b
    : null

  return { weekNumber, phase, phaseData, dayOfWeek, isSunday, schedule, workout }
}

/*
// Sample output — run with: npx ts-node lib/schedule.ts

const start = new Date('2025-01-05') // A Sunday

console.log(getDayInfo(start, new Date('2025-01-05')))
// week 1, Sun, phase 1, Strength A + weigh_in, workout = phase1.a

console.log(getDayInfo(start, new Date('2025-01-06')))
// week 1, Mon, phase 1, Cardio, workout = null

console.log(getDayInfo(start, new Date('2025-02-09')))
// week 6, Sun, phase 2, Strength A + weigh_in, workout = phase2.a

console.log(getDayInfo(start, new Date('2025-04-06')))
// week 14, Sun, phase 3 (forever), Strength A + weigh_in, workout = phase3.a
*/
