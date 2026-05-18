export interface Exercise {
  name: string
  muscles: string[]
  youtube_url: string
  technique: string
  timed: boolean
}

export interface WorkoutExercise {
  exerciseId: string
  sets: number
  reps: number
  eachSide?: boolean
}

export interface Workout {
  exercises: WorkoutExercise[]
}

export interface Phase {
  number: 1 | 2 | 3
  name: string
  weeks: string
  color: string
  workouts: {
    a: Workout
    b: Workout
  }
}

export interface WarmupItem {
  name: string
  duration: string
  description: string
}

export interface CooldownItem {
  name: string
  duration: string
  description: string
}

export type DayType = 'strength_a' | 'strength_b' | 'cardio' | 'rest'

export interface DaySchedule {
  type: DayType
  label: string
  weigh_in?: boolean
}

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

export const EXERCISES: Record<string, Exercise> = {
  knee_push_up: {
    name: 'Knee Push-Up',
    muscles: ['chest', 'triceps', 'shoulders'],
    youtube_url: 'https://www.youtube.com/watch?v=WcHtt6zT3Go',
    technique: 'Knees on floor, straight line from knees to shoulders. Lower chest to floor with elbows at 45°.',
    timed: false,
  },
  full_push_up: {
    name: 'Push-Up',
    muscles: ['chest', 'triceps', 'shoulders', 'core'],
    youtube_url: 'https://www.youtube.com/shorts/04FqT6lC0i4',
    technique: 'Full plank. Elbows 45° from body. Chest touches floor at bottom. Full lockout at top.',
    timed: false,
  },
  diamond_push_up: {
    name: 'Diamond Push-Up',
    muscles: ['triceps', 'chest', 'shoulders'],
    youtube_url: 'https://www.youtube.com/shorts/fFOH_RjxnHY',
    technique: 'Hands form a diamond shape under chest. Keep elbows tucked close to body throughout.',
    timed: false,
  },
  archer_push_up: {
    name: 'Archer Push-Up',
    muscles: ['chest', 'shoulders', 'triceps', 'core'],
    youtube_url: 'https://www.youtube.com/watch?v=25t7UBYCMbE',
    technique: 'Wide hand position. Lower to one side, keeping opposite arm straight. Alternate each rep.',
    timed: false,
  },
  negative_push_up: {
    name: 'Negative Push-Up',
    muscles: ['chest', 'triceps', 'shoulders'],
    youtube_url: 'https://www.youtube.com/shorts/Z4TE9039LsY',
    technique: 'Lower to floor over 5 seconds with control. Reset from knees or step up for next rep.',
    timed: false,
  },
  pause_push_up: {
    name: 'Pause Push-Up',
    muscles: ['chest', 'triceps', 'shoulders', 'core'],
    youtube_url: 'https://www.youtube.com/shorts/muypN4sVWrg',
    technique: 'Pause 2 seconds at the bottom of each rep before pressing back up. No bouncing.',
    timed: false,
  },
  plank: {
    name: 'Plank',
    muscles: ['core', 'shoulders', 'glutes'],
    youtube_url: 'https://www.youtube.com/shorts/xe2MXatLTUw',
    technique: 'Forearms on floor, body in straight line. Squeeze core and glutes. Neutral neck.',
    timed: true,
  },
  side_plank_left: {
    name: 'Side Plank (Left)',
    muscles: ['obliques', 'core', 'shoulders'],
    youtube_url: 'https://www.youtube.com/shorts/GoJkisGvErc',
    technique: 'Left forearm on floor, body stacked. Raise hips to form straight line head to feet.',
    timed: true,
  },
  side_plank_right: {
    name: 'Side Plank (Right)',
    muscles: ['obliques', 'core', 'shoulders'],
    youtube_url: 'https://www.youtube.com/shorts/BFOyHDlY2UE',
    technique: 'Right forearm on floor, body stacked. Raise hips to form straight line head to feet.',
    timed: true,
  },
  extended_plank: {
    name: 'Extended Plank',
    muscles: ['core', 'shoulders', 'chest'],
    youtube_url: 'https://www.youtube.com/shorts/PrSPKI42_Ao',
    technique: 'Arms fully extended, hands further forward than standard plank. Maximises core tension.',
    timed: true,
  },
  plank_shoulder_taps: {
    name: 'Plank Shoulder Taps',
    muscles: ['core', 'shoulders', 'chest'],
    youtube_url: 'https://www.youtube.com/shorts/eyeuugrpLYA',
    technique: 'High plank. Tap opposite shoulder with each hand while minimising hip rotation.',
    timed: false,
  },
  pike_hold: {
    name: 'Pike Hold',
    muscles: ['shoulders', 'core', 'upper back'],
    youtube_url: 'https://www.youtube.com/shorts/YDhh0OjbTsc',
    technique: 'Hips high in inverted V. Press shoulders toward ears and hold. Prep for handstand push-up.',
    timed: true,
  },
  pike_push_up: {
    name: 'Pike Push-Up',
    muscles: ['shoulders', 'triceps', 'upper back'],
    youtube_url: 'https://www.youtube.com/shorts/89-8waE2XKI',
    technique: 'Start in pike position. Bend elbows to lower head toward floor. Press back to start.',
    timed: false,
  },
  wall_pike_push_up: {
    name: 'Wall Pike Push-Up',
    muscles: ['shoulders', 'triceps', 'upper back'],
    youtube_url: 'https://www.youtube.com/watch?v=i33dCcHR__s',
    technique: 'Feet on wall, body near vertical. Push-up movement trains the handstand push-up pattern.',
    timed: false,
  },
  bench_dip: {
    name: 'Bench Dip (Feet Elevated)',
    muscles: ['triceps', 'chest', 'shoulders'],
    youtube_url: '',
    technique: 'Sit on edge of a sturdy chair, hands gripping the edge by your hips. Slide butt off the front. Place feet on another chair so legs are extended and elevated. Lower until elbows reach ~90°. Press back up. No dip bars needed.',
    timed: false,
  },
  dead_hang: {
    name: 'Dead Hang',
    muscles: ['back', 'biceps', 'forearms', 'shoulders'],
    youtube_url: 'https://www.youtube.com/shorts/XPcT3capkyk',
    technique: 'Hang from bar with full arm extension. Depress scapula slightly. Breathe steadily.',
    timed: true,
  },
  scapular_pull: {
    name: 'Scapular Pull',
    muscles: ['back', 'shoulders'],
    youtube_url: 'https://www.youtube.com/shorts/9M8ylnbriB0',
    technique: 'Dead hang. Without bending elbows, pull shoulder blades down and together, then release.',
    timed: false,
  },
  chin_up_negative: {
    name: 'Chin-Up Negative',
    muscles: ['biceps', 'back', 'core'],
    youtube_url: 'https://www.youtube.com/shorts/BsxiB8ia8ws',
    technique: 'Jump or step to top (chin above bar). Lower over 5 seconds. Full control throughout.',
    timed: false,
  },
  pull_up_full: {
    name: 'Pull-Up',
    muscles: ['back', 'biceps', 'core'],
    youtube_url: 'https://www.youtube.com/shorts/ym1V5H35IpA',
    technique: 'Overhand grip, shoulder-width. Pull from dead hang until chin clears bar. No kipping.',
    timed: false,
  },
  knee_raise_hang: {
    name: 'Hanging Knee Raise',
    muscles: ['core', 'hip flexors', 'forearms'],
    youtube_url: 'https://www.youtube.com/watch?v=GgiqZFtK6gw',
    technique: 'Dead hang. Raise knees to chest using core only — no momentum. Lower with control.',
    timed: false,
  },
  l_hang: {
    name: 'L-Hang',
    muscles: ['core', 'hip flexors', 'back', 'forearms'],
    youtube_url: 'https://www.youtube.com/shorts/s4UTOlK222U',
    technique: 'Dead hang, raise legs parallel to floor (L shape). Squeeze core throughout. Hold.',
    timed: true,
  },
  squat: {
    name: 'Squat',
    muscles: ['quads', 'glutes', 'hamstrings', 'core'],
    youtube_url: 'https://www.youtube.com/watch?v=xqvCmoLULNY',
    technique: 'Feet shoulder-width. Sit back and down, knees tracking toes. Thighs parallel at bottom.',
    timed: false,
  },
  hip_bridge: {
    name: 'Hip Bridge',
    muscles: ['glutes', 'hamstrings', 'core'],
    youtube_url: 'https://www.youtube.com/watch?v=bUjVlVtJOk0',
    technique: 'Lie on back, feet flat. Drive hips up, squeeze glutes at top. Hold 1 second. Lower slowly.',
    timed: false,
  },
  bulgarian_split_squat: {
    name: 'Bulgarian Split Squat',
    muscles: ['quads', 'glutes', 'hamstrings'],
    youtube_url: 'https://www.youtube.com/shorts/kexMyz2z6WU',
    technique: 'Rear foot elevated on bench. Lower front knee toward floor. Keep torso upright.',
    timed: false,
  },
  nordic_curl: {
    name: 'Nordic Curl (Eccentric)',
    muscles: ['hamstrings', 'glutes', 'core'],
    youtube_url: 'https://www.youtube.com/shorts/3I8Wg64YZUI',
    technique: 'Eccentric-only for most people. Kneel with feet anchored under a couch. Lower torso to floor over 3–5 sec with full control. Push up with arms to reset — these are negatives, not full reps.',
    timed: false,
  },
  pistol_squat: {
    name: 'Pistol Squat',
    muscles: ['quads', 'glutes', 'hamstrings', 'core'],
    youtube_url: 'https://www.youtube.com/shorts/bH3mRwnAN88',
    technique: 'One leg extended forward. Lower on one leg below parallel. Keep heel down. Fully stand up.',
    timed: false,
  },
  assisted_pistol_squat: {
    name: 'Assisted Pistol Squat',
    muscles: ['quads', 'glutes', 'hamstrings', 'core'],
    youtube_url: 'https://www.youtube.com/shorts/OK0h20sd5uo',
    technique: 'Hold a door frame, strap, or pole for support. One leg extended forward. Sit back on the supporting leg, using grip only as much as needed. Goal: less support each week.',
    timed: false,
  },
  hollow_body_hold: {
    name: 'Hollow Body Hold',
    muscles: ['core', 'hip flexors'],
    youtube_url: '',
    technique: 'Lie on back. Press lower back firmly into the floor. Extend arms overhead and legs straight. Lift everything ~10cm off the floor — arms, head, shoulders, legs. Body forms a shallow banana shape. Hold while breathing steadily.',
    timed: true,
  },
  doorway_row: {
    name: 'Doorway Row',
    muscles: ['back', 'biceps', 'core'],
    youtube_url: '',
    technique: 'Stand close to a sturdy door frame. Grip both edges at hip height with arms straight, feet close to frame. Lean back keeping body in a straight line. Pull yourself upright by squeezing shoulder blades. The further your feet from the frame, the harder.',
    timed: false,
  },
  towel_row_single: {
    name: 'Towel Row (Single Arm)',
    muscles: ['back', 'biceps', 'core', 'obliques'],
    youtube_url: '',
    technique: 'Loop a thick towel under a heavy table leg (or around a sturdy banister). Grip both ends with one hand. Lean back with body straight, arm extended. Pull chest toward the anchor by squeezing shoulder blade. Brace core hard to prevent rotation. Alternate arms.',
    timed: false,
  },
}

// ---------------------------------------------------------------------------
// Weekly structure  (0 = Sunday … 6 = Saturday)
// ---------------------------------------------------------------------------

export const WEEKLY_STRUCTURE: Record<number, DaySchedule> = {
  0: { type: 'strength_a', label: 'Strength A', weigh_in: true },
  1: { type: 'cardio',     label: 'Cardio' },
  2: { type: 'strength_b', label: 'Strength B' },
  3: { type: 'rest',       label: 'Rest' },
  4: { type: 'strength_a', label: 'Strength A' },
  5: { type: 'cardio',     label: 'Cardio' },
  6: { type: 'strength_b', label: 'Strength B' },
}

// ---------------------------------------------------------------------------
// Phases
// ---------------------------------------------------------------------------

export const PHASES: Phase[] = [
  {
    number: 1,
    name: 'Foundations',
    weeks: '1–4',
    color: 'teal-500',
    workouts: {
      a: {
        exercises: [
          { exerciseId: 'knee_push_up',    sets: 3, reps: 8  },
          { exerciseId: 'plank',           sets: 3, reps: 20 },
          { exerciseId: 'side_plank_left', sets: 2, reps: 15 },
          { exerciseId: 'side_plank_right',sets: 2, reps: 15 },
          { exerciseId: 'pike_hold',       sets: 2, reps: 10 },
        ],
      },
      b: {
        exercises: [
          { exerciseId: 'dead_hang',       sets: 3, reps: 15 },
          { exerciseId: 'scapular_pull',   sets: 3, reps: 8  },
          { exerciseId: 'doorway_row',     sets: 3, reps: 8  },
          { exerciseId: 'squat',           sets: 3, reps: 12 },
          { exerciseId: 'hip_bridge',      sets: 3, reps: 15 },
          { exerciseId: 'knee_raise_hang', sets: 2, reps: 8  },
        ],
      },
    },
  },
  {
    number: 2,
    name: 'Build',
    weeks: '5–8',
    color: 'blue-500',
    workouts: {
      a: {
        exercises: [
          { exerciseId: 'full_push_up',      sets: 4, reps: 8  },
          { exerciseId: 'diamond_push_up',   sets: 3, reps: 6  },
          { exerciseId: 'negative_push_up',  sets: 3, reps: 5  },
          { exerciseId: 'extended_plank',    sets: 3, reps: 35 },
          { exerciseId: 'pike_push_up',      sets: 3, reps: 6  },
        ],
      },
      b: {
        exercises: [
          { exerciseId: 'chin_up_negative',       sets: 4, reps: 4, },
          { exerciseId: 'doorway_row',            sets: 3, reps: 10, },
          { exerciseId: 'bulgarian_split_squat',  sets: 3, reps: 8, eachSide: true },
          { exerciseId: 'nordic_curl',            sets: 3, reps: 3, },
          { exerciseId: 'l_hang',                 sets: 3, reps: 8, },
        ],
      },
    },
  },
  {
    number: 3,
    name: 'Breakthrough',
    weeks: '9–12+',
    color: 'orange-500',
    workouts: {
      a: {
        exercises: [
          { exerciseId: 'archer_push_up',      sets: 4, reps: 5,  eachSide: true },
          { exerciseId: 'pause_push_up',       sets: 3, reps: 8  },
          { exerciseId: 'wall_pike_push_up',   sets: 3, reps: 6  },
          { exerciseId: 'plank_shoulder_taps', sets: 3, reps: 10, eachSide: true },
          { exerciseId: 'bench_dip',           sets: 3, reps: 8  },
        ],
      },
      b: {
        exercises: [
          { exerciseId: 'pull_up_full',           sets: 5, reps: 3,  },
          { exerciseId: 'towel_row_single',       sets: 3, reps: 6,  eachSide: true },
          { exerciseId: 'assisted_pistol_squat',  sets: 3, reps: 5,  eachSide: true },
          { exerciseId: 'nordic_curl',            sets: 3, reps: 5,  },
          { exerciseId: 'hollow_body_hold',       sets: 3, reps: 20, },
        ],
      },
    },
  },
]

// ---------------------------------------------------------------------------
// Warmup & Cooldown
// ---------------------------------------------------------------------------

export const WARMUP: WarmupItem[] = [
  {
    name: 'Jumping Jacks',
    duration: '30 sec',
    description: 'Raise heart rate. Arms and legs out to sides simultaneously.',
  },
  {
    name: 'Arm Circles',
    duration: '10 each direction',
    description: 'Small to large circles forward then backward.',
  },
  {
    name: 'Hip Circles',
    duration: '10 each direction',
    description: 'Hands on hips, rotate in large circles both ways.',
  },
  {
    name: 'Cat-Cow Stretch',
    duration: '10 reps',
    description: 'On hands and knees, alternate arching and rounding the back.',
  },
  {
    name: 'Leg Swings',
    duration: '10 each leg',
    description: 'Hold wall for balance. Swing each leg forward and back.',
  },
  {
    name: 'Wrist Rotations',
    duration: '10 each direction',
    description: 'Essential prep before push and pull exercises.',
  },
  {
    name: 'Band Pull-Aparts',
    duration: '15 reps',
    description: 'Hold a band or towel at chest height with straight arms. Pull apart, squeezing shoulder blades together. Critical for shoulder health in calisthenics.',
  },
  {
    name: 'Scapular Wall Slides',
    duration: '10 reps',
    description: 'Back against wall, arms in goal-post position. Slide arms up while keeping forearms in contact with wall. Builds overhead mobility for handstand/pike work.',
  },
]

export const COOLDOWN: CooldownItem[] = [
  {
    name: "Child's Pose",
    duration: '30 sec',
    description: 'Arms extended forward, hips back to heels. Deep back and shoulder stretch.',
  },
  {
    name: 'Chest Stretch',
    duration: '20 sec each side',
    description: 'One arm against wall, rotate body away to open chest.',
  },
  {
    name: 'Hip Flexor Stretch',
    duration: '20 sec each side',
    description: 'Low lunge position, push hips gently forward.',
  },
  {
    name: 'Hamstring Stretch',
    duration: '20 sec each side',
    description: 'Seated or standing, reach toward toes with a straight leg.',
  },
  {
    name: 'Lat Stretch',
    duration: '20 sec each side',
    description: 'Grab bar or door frame, lean away to stretch the sides of your back.',
  },
]
