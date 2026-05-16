# RiseStrong — Project Guide for Claude Code

## What We're Building

A personal daily workout tracker web app for a 12-week calisthenics program.
The user (Rotem) opens the app every day and sees exactly what to do — no decisions needed.
Each exercise has a YouTube demo that plays inside the app. All progress is saved to Supabase.

This is a **private app for one person**. There is no public signup. One user account, created manually in the Supabase dashboard.

The full product spec is in **APP_SPEC.md**. The step-by-step build order is in **TASKS.md**.
Read both files before starting any task.

---

## Final Result (What Done Looks Like)

When the project is complete, the user will have:
- A live web app at a Vercel URL (e.g. `risestrong.vercel.app`)
- The app installed on their phone home screen as a PWA (no browser bar, looks native)
- 4 screens: Today / Progress / Weight / Settings
- Every workout day: a list of exercises with YouTube demos, set checkboxes, and a rest timer
- Every Sunday: a mandatory weigh-in card that appears before the workout
- All data (exercise progress, weight, weekly metrics) saved to Supabase and accessible from any device
- Auto-deploy: every push to GitHub main branch → Vercel deploys automatically

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (Postgres + Supabase Auth) |
| Hosting | Vercel (free hobby tier) |
| Version control | GitHub (connected to Vercel from day 1) |
| PWA | next-pwa + manifest.json |
| Charts | recharts |
| Completion animation | canvas-confetti |
| Icons | lucide-react |

---

## Project Structure

```
risestrong/
├── app/
│   ├── layout.tsx          ← Root layout: BottomNav + PWA head tags
│   ├── page.tsx            ← Today screen (main screen)
│   ├── login/page.tsx      ← Login (public, no auth required)
│   ├── progress/page.tsx   ← Progress charts + calendar
│   ├── weight/page.tsx     ← Weight log + chart
│   └── settings/page.tsx   ← User config + sign out
├── components/
│   ├── BottomNav.tsx
│   ├── TodayHeader.tsx
│   ├── WeighInCard.tsx
│   ├── DayTypeCard.tsx
│   ├── ExerciseCard.tsx
│   ├── YoutubeModal.tsx
│   ├── RestTimer.tsx
│   ├── WeeklyCalendar.tsx
│   ├── MetricChart.tsx
│   └── WeightChart.tsx
├── lib/
│   ├── program.ts          ← All static exercise + phase data (never in DB)
│   ├── schedule.ts         ← getDayInfo(startDate, today) → week/phase/workout
│   └── supabase/
│       ├── client.ts       ← Browser Supabase client (@supabase/ssr)
│       └── server.ts       ← Server Supabase client (@supabase/ssr)
├── middleware.ts            ← Protects all routes, redirects to /login if no session
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── .env.local              ← NEVER commit this file
├── CLAUDE.md               ← This file
├── APP_SPEC.md             ← Full product spec
└── TASKS.md                ← Step-by-step build tasks
```

---

## Supabase Database (5 Tables)

All tables have Row Level Security. Every query must use `upsert`, never plain `insert`.

| Table | Purpose |
|---|---|
| `user_config` | Program start date, name, goal weight — one row per user |
| `daily_progress` | One row per day: type, cardio_done, strength_done, weigh_in_done |
| `exercise_sets` | One row per set per exercise per day: completed, actual_reps |
| `weekly_metrics` | Push-ups max, pull-ups max, dead hang per week |
| `weight_log` | One row per weigh-in: date + weight_kg |

---

## Key Rules — Never Violate These

1. **YouTube videos play inside the app** — full-screen iframe modal overlay. Never open YouTube externally. When modal closes, set iframe `src=""` to stop audio.

2. **Sunday weigh-in is a mandatory task** — the WeighInCard appears first on Sundays, above the workout. It saves to `weight_log` AND sets `weigh_in_done = true` in `daily_progress`.

3. **All DB writes are upserts** — every write to Supabase uses `upsert` (with `onConflict`). Safe to re-tap anything without creating duplicates.

4. **`.env.local` is never committed** — Supabase keys stay local only. Vercel gets them via environment variable settings in the dashboard.

5. **After week 12, the app continues with Phase 3** — `getDayInfo()` returns Phase 3 for week 13, 14, etc. There is no "program complete" wall.

6. **Completion = confetti + stay on screen** — when all sets are done, fire `canvas-confetti` for 2 seconds, show a brief "🎉 יום אימון הושלם!" banner, then stay on the Today screen. Do not navigate away.

7. **Rest timer uses sessionStorage** — saves the start timestamp so the countdown survives navigation within the same browser session.

8. **App requires internet** — no offline support needed. No service worker data caching.

9. **GitHub + Vercel from day 1** — every task ends with `git add . && git commit && git push`. Vercel is connected to the repo so every push auto-deploys.

---

## Design System

- **Background:** `#f5f5f5` (gray-100)
- **Cards:** white, `rounded-2xl`, `shadow-sm`, padding `p-4`
- **Primary accent:** `#4CAF50` (green) — used for completion, positive changes, primary buttons
- **Phase colors:** Phase 1 = teal-500 · Phase 2 = blue-500 · Phase 3 = orange-500
- **Typography:** system font stack, minimum 16px body text
- **Mobile-first:** base design for 375px width
- **Loading:** gray animated skeleton placeholders
- **Errors:** red Toast notification, top of screen, auto-dismiss after 3 seconds
- **Success:** green Toast notification, auto-dismiss after 3 seconds

---

## Auth Flow

- All routes protected by `middleware.ts` — unauthenticated users go to `/login`
- `/login`, `/_next/*`, `/favicon.ico`, `/manifest.json`, `/icon-*.png` are public
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Sign out: `supabase.auth.signOut()` → redirect to `/login`
- No public signup — account created manually in Supabase dashboard

---

## Schedule Logic

```ts
getDayInfo(startDate, today) → {
  weekNumber,   // 1, 2, 3 ... continues past 12 forever
  phase,        // 1 | 2 | 3  (phase 3 stays forever after week 12)
  phaseData,    // the PHASES array entry
  dayOfWeek,    // 0=Sun, 1=Mon ... 6=Sat
  isSunday,     // boolean — drives weigh-in card
  schedule,     // from WEEKLY_STRUCTURE
  workout       // the actual workout object (A or B) or null
}
```

Weekly structure: Sun=Strength A (+ weigh-in), Mon=Cardio, Tue=Strength B, Wed=Rest, Thu=Strength A, Fri=Cardio, Sat=Strength B

---

## How to Work on This Project

Each task in TASKS.md is a self-contained unit of work. Tasks build on each other — complete them in order.

After each task:
1. Verify the checklist at the bottom of the task
2. Confirm `git push` succeeded
3. Move to the next task

If something is unclear, refer to APP_SPEC.md for the full specification.
