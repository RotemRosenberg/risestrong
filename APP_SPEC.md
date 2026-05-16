# RiseStrong App — Full Product Spec

> **This spec is the single source of truth for Claude Code.**
> Build order and first message are in §13.

---

## 1. Overview

A **personal daily workout tracker web app** for a 12-week calisthenics program.

- **Private app** — only one user (Rotem). No public signup. Login via email/password.
- Every day the app shows exactly what to do — no decisions required.
- Each exercise has a YouTube demo embedded inside the app.
- All data is stored in **Supabase** (Postgres) — accessible from any device.
- Deployed on **Vercel** — free, automatic deploy on every GitHub push.

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Best Vercel integration, server components |
| Styling | Tailwind CSS | Fast, mobile-first |
| Database | Supabase (Postgres) | Free tier, Auth built-in, real-time |
| Auth | Supabase Auth | Email/password login, single user |
| Hosting | Vercel | Free hobby tier, auto-deploy from GitHub |
| Version control | GitHub | Connected to Vercel from day 1 |
| PWA | next-pwa | Installable on phone home screen, behaves like native app |
| Charts | recharts | Lightweight, React-native bar/line charts |

### Key Product Decisions

| Decision | Choice | Notes |
|---|---|---|
| Offline support | ❌ Not supported | Requires internet. No service worker caching of data. |
| After week 12 | Continue with Phase 3 | weekNumber 13+ uses Phase 3 workouts indefinitely |
| Completion animation | Confetti (short) → return to same screen | Use `canvas-confetti` library, 2-second burst |
| Loading states | Skeleton loaders + Toast for errors | Uniform across all screens |
| DB writes | Always `upsert` (never plain `insert`) | Idempotent — safe to re-tap anything |
| Rest timer persistence | `sessionStorage` (survives navigation within session) | Cleared on browser close |
| Supabase project | New project: `risestrong` | Do not reuse existing projects |

---

## 2. Project Setup (Before Writing Any Code)

> Claude Code must complete this sequence **first**, before scaffolding the app.

### Step 1 — GitHub repo
```bash
# Claude Code should instruct the user to:
# 1. Create a new repo on github.com named "risestrong"
# 2. Clone it locally
# 3. Then scaffold the Next.js app inside it
git clone https://github.com/YOURUSERNAME/risestrong.git
cd risestrong
```

### Step 2 — Scaffold Next.js
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

### Step 3 — Install dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr recharts lucide-react canvas-confetti next-pwa
npm install -D @types/canvas-confetti
```

### Step 4 — Environment variables
Create `.env.local` (never commit this file):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add to `.gitignore`:
```
.env.local
.env*.local
```

### Step 5 — CLAUDE.md
Create `CLAUDE.md` in the project root:
```markdown
# RiseStrong — Codebase Guide

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase for auth and database
- Vercel for hosting (auto-deploy from GitHub main branch)

## Key files
- `lib/supabase/` — Supabase client helpers (server + browser)
- `lib/program.ts` — All exercise and phase data (static, no DB)
- `lib/schedule.ts` — getDayInfo() — given a date, returns week/phase/workout
- `app/` — Next.js App Router pages

## Auth
Single user app. Auth via Supabase email/password.
Protected routes use middleware.ts to redirect unauthenticated users to /login.

## Database
See APP_SPEC.md §6 for full schema.
Run migrations via Supabase dashboard or supabase CLI.

## Deploy
Push to GitHub main → Vercel auto-deploys.
Environment variables set in Vercel dashboard (same as .env.local).
```

### Step 5b — PWA configuration
Add to `next.config.js`:
```js
const withPWA = require("next-pwa")({ dest: "public", disable: process.env.NODE_ENV === "development" });
module.exports = withPWA({ /* your existing next config */ });
```

Create `public/manifest.json`:
```json
{
  "name": "RiseStrong",
  "short_name": "Cali",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f5f5f5",
  "theme_color": "#4CAF50",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
Add `<link rel="manifest" href="/manifest.json">` to the root layout `<head>`.

### Step 6 — Push to GitHub and connect Vercel
```bash
git add .
git commit -m "Initial scaffold"
git push origin main
# Then: go to vercel.com → Import from GitHub → set env vars → Deploy
```

---

## 3. Core User Flow

```
User visits app
    │
    ▼
Not logged in → redirect to /login
Logged in → redirect to /  (Today screen)
    │
    ▼
Today screen
    │
    ├─ Sunday → show "Weekly Weigh-in" mandatory task card FIRST
    ├─ Strength day → show warm-up + exercises + cool-down
    ├─ Cardio day → show cardio reminder card
    └─ Rest day → show rest / recovery card
    │
    ▼
User taps [▶ Watch Demo] on any exercise
    → YouTube iframe opens as full-screen overlay inside the app
    → Tap ✕ closes it and stops the video (src cleared)
    │
    ▼
User checks off sets → rest timer starts automatically (90 sec)
    │
    ▼
All exercises done → "Day Complete! 🎉" — saves to Supabase
```

---

## 4. Screens & Routes

| Route | Screen | Notes |
|---|---|---|
| `/login` | Login | Email + password form. Supabase Auth. |
| `/` | Today | Default screen after login |
| `/progress` | Progress | Charts, calendar, weekly log |
| `/weight` | Weight Log | Weight history, chart, entry |
| `/settings` | Settings | User preferences, goal weight |

Bottom nav: 🏠 Today · 📊 Progress · 🏋️ Weight · ⚙️ Settings

---

## 5. Screen Specifications

### 5.1 Login Screen (`/login`)

- Simple centered card, white background
- App logo / title at top
- Email input + Password input
- [Sign In] button → calls `supabase.auth.signInWithPassword()`
- No "Sign Up" link (private app — account created manually in Supabase dashboard)
- On success → redirect to `/`
- Show error message if credentials wrong

### 5.2 Today Screen (`/`)

**Header:** App name · today's date · "Week 3 · Phase 1" badge

**Sunday Weigh-in Card** (only on Sundays, shown FIRST):
- Green border, "Required" badge
- Title: "Weekly Weigh-in 🏋️"
- Subtitle: "Before eating, after waking up"
- Large number input (kg, one decimal place)
- [Save Weight] button → upserts to `weight_log` table
- If already saved today: shows "✓ 84.5 kg logged" with edit option

**Day card** (colored by type):
- 💪 Strength A / B → teal/blue
- 🏃 Cardio → green
- 🧘 Rest → gray

**Cardio reminder strip** (on strength days): "Don't forget: 60 min elliptical BEFORE strength"

**Warm-up** (collapsible, strength days): 6 items with checkboxes

**Exercise list**: each exercise renders as an ExerciseCard (see §5.2.1)

**Cool-down** (collapsible, strength days)

**Completion bar**: X/Y exercises done

**On completion (all exercises done):**
- Trigger `canvas-confetti` burst for ~2 seconds
- Show a small "🎉 יום אימון הושלם!" banner overlay that dismisses automatically after 2 sec
- Stay on the same screen (do NOT navigate away)
- Cards remain green/checked — user can review what they did
- Mark `strength_done = true` in Supabase `daily_progress` table

### 5.2.1 Exercise Card

```
┌─────────────────────────────────────────────┐
│ Knee Push-up                  Target: 3 × 8 │
│ Chest · Triceps · Shoulders                 │
│                                             │
│ [▶ Watch Demo]                              │
│                                             │
│ Technique: Body straight, elbows at 45°     │
│                                             │
│ [✓ Set 1] [✓ Set 2] [ Set 3]               │
│ Reps: 8 / 8 / _                            │
└─────────────────────────────────────────────┘
```

- [▶ Watch Demo] → opens YoutubeModal
- Tapping a set button → toggles ✓, starts 90-sec rest timer
- Optional: tap set to log actual reps (numeric input)
- Card turns green when all sets done
- State persists to Supabase on every change (upsert)

### 5.2.2 YouTube Modal

- Full-screen overlay (`position: fixed`, `z-50`, dark background)
- `<iframe>` with YouTube embed URL + `?autoplay=1&rel=0&modestbranding=1`
- **Critical:** on close, set iframe `src=""` to stop audio
- Technique tip shown below the iframe
- [✕ Back to workout] button at top

```tsx
// Pattern to follow:
const [iframeSrc, setIframeSrc] = useState("");
// on open: setIframeSrc(exercise.youtube_url + "?autoplay=1&rel=0&modestbranding=1")
// on close: setIframeSrc("")
```

### 5.3 Progress Screen (`/progress`)

**4 stat cards (top row):**
- 📉 Weight change (start → latest)
- 💪 Max push-ups (latest week)
- 🔝 Max pull-ups (latest week)
- ⏱ Dead hang (seconds, latest week)

**Tabbed metric chart** (recharts BarChart):
- Tabs: [Weight] [Push-ups] [Pull-ups] [Dead Hang]
- Weight tab: bars per week + up/down arrows between bars (green ↓ if lost, red ↑ if gained)
- Other tabs: bars per week, latest highlighted

**Streak counter**: consecutive days completed

**12-week calendar grid**:
- 🟢 = fully completed · 🟡 = partial · ⚪ = missed/future

**[Log This Week's Numbers] button** → modal:
- Inputs: push-ups max, pull-ups max, dead hang (sec), plank (sec)
- Saves to `weekly_metrics` table

### 5.4 Weight Screen (`/weight`)

- Explanation card: "Weigh yourself every Sunday morning, before eating."
- Quick entry: large input + [Save] (any day)
- Bar chart: weight per week with directional arrows
- Summary row: Total change · Last week Δ · Goal remaining
- History list: all entries, reverse chronological (date + weight + Δ)

### 5.5 Settings Screen (`/settings`)

- User name (display only)
- Program start date (drives all week calculations)
- Starting weight (kg)
- Goal weight (kg)
- Notification time (Web Notifications API)
- [Reset all progress] with confirmation dialog

---

## 6. Supabase Database Schema

Run these migrations in Supabase SQL editor (or via `supabase db push`):

```sql
-- Enable RLS on all tables
-- All tables are locked to the single authenticated user

-- Daily workout progress
CREATE TABLE daily_progress (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users NOT NULL,
  date        DATE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('strength', 'cardio', 'rest')),
  workout     TEXT CHECK (workout IN ('A', 'B')),
  cardio_done BOOLEAN DEFAULT FALSE,
  strength_done BOOLEAN DEFAULT FALSE,
  weigh_in_done BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Per-exercise set completion (child of daily_progress)
CREATE TABLE exercise_sets (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users NOT NULL,
  date             DATE NOT NULL,
  exercise_id      TEXT NOT NULL,      -- slug e.g. "knee_push_up"
  set_index        INTEGER NOT NULL,   -- 0-based
  completed        BOOLEAN DEFAULT FALSE,
  actual_reps      INTEGER,            -- optional
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, exercise_id, set_index)
);

-- Weekly strength metrics (push-ups max, pull-ups max, etc.)
CREATE TABLE weekly_metrics (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users NOT NULL,
  week_number   INTEGER NOT NULL,   -- 1–12
  push_ups_max  INTEGER,
  pull_ups_max  INTEGER,
  dead_hang_sec INTEGER,
  plank_sec     INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Weight log (one entry per weigh-in session)
CREATE TABLE weight_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users NOT NULL,
  date       DATE NOT NULL,
  weight_kg  NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- User config / settings
CREATE TABLE user_config (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users NOT NULL UNIQUE,
  user_name       TEXT DEFAULT 'Rotem',
  start_date      DATE NOT NULL,
  starting_weight NUMERIC(5,2),
  goal_weight     NUMERIC(5,2),
  reminder_time   TIME,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: each user sees only their own data
ALTER TABLE daily_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_config     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own data only" ON daily_progress  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data only" ON exercise_sets   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data only" ON weekly_metrics  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data only" ON weight_log      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data only" ON user_config     FOR ALL USING (auth.uid() = user_id);
```

---

## 7. Supabase Client Setup

```ts
// lib/supabase/client.ts  — use in Client Components
import { createBrowserClient } from "@supabase/ssr";
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// lib/supabase/server.ts  — use in Server Components / API Routes
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const createClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookies().getAll(), setAll: () => {} } }
  );

// middleware.ts  — protect all routes, redirect to /login if not authed
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  // ... standard Supabase auth middleware pattern
  // redirect to /login if no session, except for /login itself
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
```

---

## 8. Exercise Data (Static — no DB needed)

All exercise data lives in `lib/program.ts`. It never changes. No need to store in Supabase.

```ts
export const exercises: Record<string, Exercise> = {
  knee_push_up: {
    name: "Knee Push-up",
    muscles: ["Chest", "Triceps", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/jWxvty2KROs",
    technique: "Body straight as a board, elbows at 45°, lower chest to floor.",
    timed: false,
  },
  full_push_up: {
    name: "Full Push-up",
    muscles: ["Chest", "Triceps", "Shoulders", "Core"],
    youtube_url: "https://www.youtube.com/embed/IODxDxX7oi4",
    technique: "Legs fully straight, body rigid like a plank, elbows 45° from torso.",
    timed: false,
  },
  diamond_push_up: {
    name: "Diamond Push-up",
    muscles: ["Triceps", "Chest"],
    youtube_url: "https://www.youtube.com/embed/J0DnG1_S92I",
    technique: "Hands form a diamond shape under your chest, elbows track back.",
    timed: false,
  },
  archer_push_up: {
    name: "Archer Push-up",
    muscles: ["Chest", "Triceps", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/oQQb5_MrBIQ",
    technique: "Shift weight to one arm while the other arm extends to the side.",
    timed: false,
  },
  negative_push_up: {
    name: "Negative Push-up (4 sec down)",
    muscles: ["Chest", "Triceps"],
    youtube_url: "https://www.youtube.com/embed/IODxDxX7oi4",
    technique: "Lower yourself for exactly 4 seconds, then push up at normal speed.",
    timed: false,
  },
  pause_push_up: {
    name: "Pause Push-up",
    muscles: ["Chest", "Triceps"],
    youtube_url: "https://www.youtube.com/embed/IODxDxX7oi4",
    technique: "Pause 2 seconds at the bottom before exploding up.",
    timed: false,
  },
  plank: {
    name: "Plank",
    muscles: ["Core", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/ASdvN_XEl_c",
    technique: "Belly tight, don't raise hips, look down at the floor, breathe.",
    timed: true,
  },
  side_plank_left: {
    name: "Side Plank (Left)",
    muscles: ["Obliques", "Core"],
    youtube_url: "https://www.youtube.com/embed/K2KACpntsMc",
    technique: "Stack feet or stagger them, keep body in a straight line.",
    timed: true,
  },
  side_plank_right: {
    name: "Side Plank (Right)",
    muscles: ["Obliques", "Core"],
    youtube_url: "https://www.youtube.com/embed/K2KACpntsMc",
    technique: "Stack feet or stagger them, keep body in a straight line.",
    timed: true,
  },
  extended_plank: {
    name: "Extended Plank",
    muscles: ["Core", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/ASdvN_XEl_c",
    technique: "Hands placed further forward than shoulders — significantly harder.",
    timed: true,
  },
  plank_shoulder_taps: {
    name: "Plank Shoulder Taps",
    muscles: ["Core", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/LEZq7QGpNos",
    technique: "Minimize hip rotation — the goal is total stillness except your arm.",
    timed: false,
  },
  pike_hold: {
    name: "Pike Hold",
    muscles: ["Shoulders", "Core"],
    youtube_url: "https://www.youtube.com/embed/PKH_oGjR0T8",
    technique: "Hips high in an inverted V, head between arms, straight arms.",
    timed: true,
  },
  pike_push_up: {
    name: "Pike Push-up",
    muscles: ["Shoulders", "Triceps"],
    youtube_url: "https://www.youtube.com/embed/sposDXWEB0A",
    technique: "Head nearly touches the floor, hips stay high throughout.",
    timed: false,
  },
  wall_pike_push_up: {
    name: "Wall Pike Push-up",
    muscles: ["Shoulders", "Triceps"],
    youtube_url: "https://www.youtube.com/embed/a6YHBHbXRSQ",
    technique: "Feet on wall, body at ~45°, lower head toward floor.",
    timed: false,
  },
  dip_negative: {
    name: "Dip Negative (4 sec)",
    muscles: ["Triceps", "Chest", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/2z8JmcrW-As",
    technique: "Between two chairs, lower in 4 full seconds. Jump up to reset.",
    timed: false,
  },
  dead_hang: {
    name: "Dead Hang",
    muscles: ["Back", "Grip", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/hBrEfRuDPBY",
    technique: "Arms fully straight, shoulder blades actively pulled DOWN.",
    timed: true,
  },
  scapular_pull: {
    name: "Scapular Pull",
    muscles: ["Back", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/hBrEfRuDPBY",
    technique: "NO elbow bend! Only move the shoulder blades — up and down.",
    timed: false,
  },
  chin_up_negative: {
    name: "Chin-up Negative (4 sec)",
    muscles: ["Back", "Biceps"],
    youtube_url: "https://www.youtube.com/embed/HBolMqVIXyM",
    technique: "Jump or step up to top position, lower yourself for 4 full seconds.",
    timed: false,
  },
  pull_up_full: {
    name: "Full Pull-up",
    muscles: ["Back", "Biceps", "Core"],
    youtube_url: "https://www.youtube.com/embed/eGo4IYlbE5g",
    technique: "Dead hang start, pull until chin clears bar, lower with control.",
    timed: false,
  },
  knee_raise_hang: {
    name: "Hanging Knee Raise",
    muscles: ["Core", "Hip Flexors"],
    youtube_url: "https://www.youtube.com/embed/A8sMLGeDXts",
    technique: "If you can't hang, sit on a chair and lift knees to chest instead.",
    timed: false,
  },
  l_hang: {
    name: "L-Hang",
    muscles: ["Core", "Hip Flexors"],
    youtube_url: "https://www.youtube.com/embed/sUPMKxQhBZI",
    technique: "Legs fully straight, parallel to floor, hold the L-shape.",
    timed: false,
  },
  tuck_back_lever: {
    name: "Tuck Back Lever",
    muscles: ["Back", "Core", "Shoulders"],
    youtube_url: "https://www.youtube.com/embed/UNQNF_vFjXA",
    technique: "From bar, lean back with knees tucked, body facing up.",
    timed: true,
  },
  squat: {
    name: "Bodyweight Squat",
    muscles: ["Quads", "Glutes", "Hamstrings"],
    youtube_url: "https://www.youtube.com/embed/aclHkVaku9U",
    technique: "Knees track over toes, full depth, heels flat, chest tall.",
    timed: false,
  },
  hip_bridge: {
    name: "Hip Bridge",
    muscles: ["Glutes", "Hamstrings"],
    youtube_url: "https://www.youtube.com/embed/8bbE64NuDTU",
    technique: "Squeeze glutes hard at the top, hold 1 second before lowering.",
    timed: false,
  },
  bulgarian_split_squat: {
    name: "Bulgarian Split Squat",
    muscles: ["Quads", "Glutes"],
    youtube_url: "https://www.youtube.com/embed/2C-uNgKwPLE",
    technique: "Rear foot on chair, front knee tracks over toes, torso upright.",
    timed: false,
  },
  nordic_curl: {
    name: "Nordic Curl",
    muscles: ["Hamstrings"],
    youtube_url: "https://www.youtube.com/embed/d8-oNFUuFtQ",
    technique: "Anchor feet under sofa. Lower VERY slowly (3 sec). Hardest leg move!",
    timed: false,
  },
  pistol_squat: {
    name: "Assisted Pistol Squat",
    muscles: ["Quads", "Glutes", "Core"],
 