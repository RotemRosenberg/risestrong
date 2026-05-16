import type { DayInfo } from '@/lib/schedule'

interface Props {
  dayInfo: DayInfo
}

interface CardConfig {
  bg: string
  textColor: string
  subtitleColor: string
  icon: string
  title: string
  subtitle: string
}

function getCardConfig(dayInfo: DayInfo): CardConfig {
  const { schedule, workout } = dayInfo
  const exerciseCount = workout?.exercises.length ?? 0

  switch (schedule.type) {
    case 'strength_a':
      return {
        bg: 'bg-teal-500',
        textColor: 'text-white',
        subtitleColor: 'text-white/75',
        icon: '💪',
        title: 'Strength A · Push',
        subtitle: `Today: ${exerciseCount} exercises`,
      }
    case 'strength_b':
      return {
        bg: 'bg-blue-500',
        textColor: 'text-white',
        subtitleColor: 'text-white/75',
        icon: '💪',
        title: 'Strength B · Pull & Legs',
        subtitle: `Today: ${exerciseCount} exercises`,
      }
    case 'cardio':
      return {
        bg: 'bg-green-500',
        textColor: 'text-white',
        subtitleColor: 'text-white/75',
        icon: '🏃',
        title: 'Cardio Day',
        subtitle: '60 min elliptical',
      }
    case 'rest':
    default:
      return {
        bg: 'bg-gray-100',
        textColor: 'text-gray-800',
        subtitleColor: 'text-gray-500',
        icon: '🧘',
        title: 'Rest Day',
        subtitle: 'Active recovery — light walk or stretching',
      }
  }
}

export default function DayTypeCard({ dayInfo }: Props) {
  const cfg = getCardConfig(dayInfo)
  const isStrength =
    dayInfo.schedule.type === 'strength_a' || dayInfo.schedule.type === 'strength_b'

  return (
    <div>
      <div className={`${cfg.bg} ${cfg.textColor} rounded-2xl p-5 shadow-sm`}>
        <div className="text-4xl mb-3">{cfg.icon}</div>
        <h2 className="text-xl font-bold">{cfg.title}</h2>
        <p className={`text-sm mt-1 ${cfg.subtitleColor}`}>{cfg.subtitle}</p>
      </div>

      {isStrength && (
        <div className="mt-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          ⚠️ Do your 60 min elliptical{' '}
          <strong>BEFORE</strong> strength training
        </div>
      )}
    </div>
  )
}
