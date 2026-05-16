# RiseStrong — Build Tasks for Claude Code

> **How to use this file:**
> Send one task at a time to Claude Code. Wait for it to finish and verify before moving on.
> Tasks marked 🧑 require YOU to do something manually (not Claude Code).
> Tasks marked 🤖 are sent directly to Claude Code.

---

## ⚠️ BEFORE YOU START — Do These Manually

These steps must be completed by you before opening Claude Code at all.

---

### 🧑 PRE-1 — Create a GitHub repository

1. Go to [github.com](https://github.com) → click **New repository**
2. Name: `risestrong`
3. Visibility: **Private**
4. ✅ Add a README
5. Click **Create repository**
6. Click the green **Code** button → copy the HTTPS URL
7. Open Terminal and run:
   ```bash
   git clone https://github.com/RotemRosenberg/risestrong.git
   cd risestrong
   ```

✅ **You're done when:** the folder `risestrong` exists on your computer.

---

### 🧑 PRE-2 — Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign in
2. Click **New project**
3. Name: `risestrong`
4. Choose a strong database password — **save it somewhere safe**
5. Region: `eu-central-1` (Frankfurt) or closest to you
6. Click **Create new project** — wait ~2 minutes for it to spin up

✅ **You're done when:** the Supabase dashboard shows your project is active (green dot).

---

### 🧑 PRE-3 — Get your Supabase keys

1. In the Supabase dashboard → **Project Settings** (gear icon) → **API**
2. Copy these two values and save them:
   - **Project URL** (looks like: `https://xxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

✅ **You're done when:** you have both values saved somewhere (Notes, text file, etc.)

---

### 🧑 PRE-4 — Create your Supabase user account

This creates the one login you'll use to enter the app.

1. In Supabase dashboard → **Authentication** → **Users** tab
2. Click **Add user** → **Create new user**
3. Enter your email (`rotemsp9@gmail.com`) and choose a password
4. Click **Create user**

✅ **You're done when:** you see your email listed under Users.

---

### 🧑 PRE-5 — Run the database schema

1. In Supabase dashboard → **SQL Editor** → click **New query**
2. Paste the entire SQL block below and click **Run**:

```sql
-- Daily workout progress
CREATE TABLE daily_progress (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users NOT NULL,
  date          DATE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('strength', 'cardio', 'rest')),
  workout       TEXT CHECK (workout IN ('A', 'B')),
  cardio_done   BOOLEAN DEFAULT FALSE,
  strength_done BOOLEAN DEFAULT FALSE,
  weigh_in_done BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Per-exercise set completion
CREATE TABLE exercise_sets (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users NOT NULL,
  date         DATE NOT NULL,
  exercise_id  TEXT NOT NULL,
  set_index    INTEGER NOT NULL,
  completed    BOOLEAN DEFAULT FALSE,
  actual_reps  INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, exercise_id, set_index)
);

-- Weekly strength metrics
CREATE TABLE weekly_metrics (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users NOT NULL,
  week_number   INTEGER NOT NULL,
  push_ups_max  INTEGER,
  pull_ups_max  INTEGER,
  dead_hang_sec INTEGER,
  plank_sec     INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Weight log
CREATE TABLE weight_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users NOT NULL,
  date       DATE NOT NULL,
  weight_kg  NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- User config
CREATE TABLE user_config (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users NOT NULL UNIQUE,
  user_name        TEXT DEFAULT 'Rotem',
  start_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  starting_weight  NUMERIC(5,2),
  goal_weight      NUMERIC(5,2),
  reminder_time    TIME,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
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

✅ **You're done when:** you see "Success. No rows returned" and no errors.

---

### 🧑 PRE-6 — Create a Vercel account

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Authorize Vercel to access your GitHub account

✅ **You're done when:** you're logged into Vercel and see your dashboard.

---

## ✅ NOW YOU'RE READY — Open Claude Code

Open your terminal, navigate to the `risestrong` folder, and run:
```bash
claude
```

Then send tasks one by one as described below.

---

---

## TASK 1 🤖 — Scaffold the project and set up GitHub

**Paste this into Claude Code:**

```
I'm building a calisthenics tracker web app. The folder already exists and is connected to GitHub.
Let's start by scaffolding the project.

1. Scaffold Next.js 14 inside the current directory:
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
   (answer "yes" to all prompts)

2. Install dependencies:
   npm install @supabase/supabase-js @supabase/ssr recharts lucide-react canvas-confetti next-pwa
   npm install -D @types/canvas-confetti

3. Create .env.local with this content (I will fill in the values):
   NEXT_PUBLIC_SUPABASE_URL=PASTE_YOUR_URL_HERE
   NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_YOUR_KEY_HERE

4. Make sure .env*.local is in .gitignore (add it if not already there)

5. Create CLAUDE.md in the project root with this content:
   # RiseStrong — Codebase Guide

   ## Stack
   - Next.js 14 App Router + TypeScript + Tailwind CSS
   - Supabase for auth and database (project: risestrong)
   - Vercel for hosting (auto-deploy from GitHub main branch)
   - PWA via next-pwa (installable on phone home screen)

   ## Key files
   - lib/program.ts — All static exercise + phase data (never stored in DB)
   - lib/schedule.ts — getDayInfo() — given a date, returns week/phase/workout
   - lib/supabase/client.ts — Browser Supabase client
   - lib/supabase/server.ts — Server Supabase client
   - middleware.ts — Protects all routes, redirects to /login if not authenticated

   ## Auth
   Single-user app. Email/password via Supabase Auth.
   Protected routes redirect unauthenticated users to /login.

   ## DB writes
   Always use upsert (never plain insert). All tables have Row Level Security.

   ## Design
   - Mobile-first, 375px base
   - Background: #f5f5f5
   - Cards: white, rounded-2xl, shadow-sm
   - Primary accent: #4CAF50 (green)

6. Make an initial git commit and push:
   git add .
   git commit -m "Initial scaffold: Next.js 14 + Tailwind + Supabase + PWA deps"
   git push origin main

Show me the final folder structure when done.
```

**✅ What to verify before moving on:**
- The project runs: `npm run dev` → opens at localhost:3000
- No TypeScript errors
- `.env.local` exists but is NOT listed in `git status` (it's gitignored)
- `CLAUDE.md` exists in root
- GitHub shows the commit

**🧑 After Task 1 — fill in your Supabase keys:**
Open `.env.local` and replace `PASTE_YOUR_URL_HERE` and `PASTE_YOUR_KEY_HERE` with the real values from PRE-3.

---

## TASK 2 🤖 — Supabase clients + Auth middleware

**Paste this into Claude Code:**

```
Now let's set up the Supabase connection layer and auth protection.

1. Create lib/supabase/client.ts:
   Browser-side Supabase client using createBrowserClient from @supabase/ssr.

2. Create lib/supabase/server.ts:
   Server-side Supabase client using createServerClient from @supabase/ssr, reading cookies with next/headers.

3. Create middleware.ts in the project root:
   - Use @supabase/ssr to check for a valid session on every request
   - If no session: redirect to /login
   - Exception: /login itself is always accessible (no redirect loop)
   - Also allow /_next/static, /_next/image, /favicon.ico, /manifest.json, /icon-*.png to pass through

4. Create app/login/page.tsx:
   - Simple centered card (white, rounded-2xl, shadow) on gray-50 background
   - App title "RiseStrong 💪" at top
   - Email input + Password input
   - [Sign In] button → calls supabase.auth.signInWithPassword()
   - On success: redirect to /
   - On error: show red error message below the button ("Invalid email or password")
   - No "Sign Up" link (private app)

5. Commit:
   git add .
   git commit -m "feat: Supabase auth layer + login page + middleware protection"
   git push origin main
```

**✅ What to verify before moving on:**
- Go to `localhost:3000` → you get redirected to `/login`
- Enter your email + password (the ones you created in PRE-4) → you get redirected to `/` (which shows a blank page for now — that's fine)
- Wrong password → shows error message
- Check GitHub: commit is there

---

## TASK 3 🤖 — Static data layer (exercises + schedule)

**Paste this into Claude Code:**

```
Now let's create all the static program data. None of this is stored in the database — it's all hardcoded TypeScript.

1. Create lib/program.ts with:
   a) TypeScript types: Exercise, WorkoutExercise, Workout, Phase, WarmupItem, CooldownItem
   b) The full exercises object with all 29 exercises (knee_push_up, full_push_up, diamond_push_up, archer_push_up, negative_push_up, pause_push_up, plank, side_plank_left, side_plank_right, extended_plank, plank_shoulder_taps, pike_hold, pike_push_up, wall_pike_push_up, dip_negative, dead_hang, scapular_pull, chin_up_negative, pull_up_full, knee_raise_hang, l_hang, tuck_back_lever, squat, hip_bridge, bulgarian_split_squat, nordic_curl, pistol_squat, australian_row, australian_row_single)
   Each exercise has: name, muscles (array), youtube_url, technique, timed (boolean)
   
   Use these exact YouTube embed URLs:
   knee_push_up: https://www.youtube.com/embed/jWxvty2KROs
   full_push_up: https://www.youtube.com/embed/IODxDxX7oi4
   diamond_push_up: https://www.youtube.com/embed/J0DnG1_S92I
   archer_push_up: https://www.youtube.com/embed/oQQb5_MrBIQ
   negative_push_up: https://www.youtube.com/embed/IODxDxX7oi4
   pause_push_up: https://www.youtube.com/embed/IODxDxX7oi4
   plank: https://www.youtube.com/embed/ASdvN_XEl_c
   side_plank_left: https://www.youtube.com/embed/K2KACpntsMc
   side_plank_right: https://www.youtube.com/embed/K2KACpntsMc
   extended_plank: https://www.youtube.com/embed/ASdvN_XEl_c
   plank_shoulder_taps: https://www.youtube.com/embed/LEZq7QGpNos
   pike_hold: https://www.youtube.com/embed/PKH_oGjR0T8
   pike_push_up: https://www.youtube.com/embed/sposDXWEB0A
   wall_pike_push_up: https://www.youtube.com/embed/a6YHBHbXRSQ
   dip_negative: https://www.youtube.com/embed/2z8JmcrW-As
   dead_hang: https://www.youtube.com/embed/hBrEfRuDPBY
   scapular_pull: https://www.youtube.com/embed/hBrEfRuDPBY
   chin_up_negative: https://www.youtube.com/embed/HBolMqVIXyM
   pull_up_full: https://www.youtube.com/embed/eGo4IYlbE5g
   knee_raise_hang: https://www.youtube.com/embed/A8sMLGeDXts
   l_hang: https://www.youtube.com/embed/sUPMKxQhBZI
   tuck_back_lever: https://www.youtube.com/embed/UNQNF_vFjXA
   squat: https://www.youtube.com/embed/aclHkVaku9U
   hip_bridge: https://www.youtube.com/embed/8bbE64NuDTU
   bulgarian_split_squat: https://www.youtube.com/embed/2C-uNgKwPLE
   nordic_curl: https://www.youtube.com/embed/d8-oNFUuFtQ
   pistol_squat: https://www.youtube.com/embed/vq5-vdgJc0I
   australian_row: https://www.youtube.com/embed/dvkIaarnf0g
   australian_row_single: https://www.youtube.com/embed/dvkIaarnf0g

   c) WEEKLY_STRUCTURE object (0=Sun through 6=Sat), Sunday has weigh_in: true
   d) PHASES array — 3 phases, each with workouts A and B, with exercises per phase:
      Phase 1 (weeks 1-4, "Foundations", color teal):
        A: knee_push_up 3×8, plank 3×20s, side_plank_left 2×15s, side_plank_right 2×15s, pike_hold 2×10s
        B: dead_hang 3×15s, scapular_pull 3×8, squat 3×12, hip_bridge 3×15, knee_raise_hang 2×8
      Phase 2 (weeks 5-8, "Build", color blue):
        A: full_push_up 4×8, diamond_push_up 3×6, negative_push_up 3×5, extended_plank 3×35s, pike_push_up 3×6
        B: chin_up_negative 4×4, australian_row 3×8, bulgarian_split_squat 3×8 each_side, nordic_curl 3×5, l_hang 3×8
      Phase 3 (weeks 9-12+, "Breakthrough", color orange):
        A: archer_push_up 4×5 each_side, pause_push_up 3×8, wall_pike_push_up 3×6, plank_shoulder_taps 3×10 each_side, dip_negative 4×5
        B: pull_up_full 5×3, australian_row_single 3×6 each_side, pistol_squat 3×5 each_side, nordic_curl 3×5, tuck_back_lever 3×12s
   e) WARMUP array (6 items) and COOLDOWN array (5 items)

2. Create lib/schedule.ts with getDayInfo(startDate, today):
   - Calculates weekNumber (starts at 1, continues past 12 indefinitely)
   - phase = weekNumber <= 4 → 1, <= 8 → 2, else → 3 (Phase 3 continues forever after week 12)
   - Returns: weekNumber, phase, phaseData, dayOfWeek, isSunday, schedule, workout
   - Also export: toISODate(date: Date): string

3. Write a simple test at the bottom of schedule.ts (commented out) showing getDayInfo for a few sample dates.

4. Commit:
   git add .
   git commit -m "feat: static program data (29 exercises, 3 phases, schedule logic)"
   git push origin main
```

**✅ What to verify before moving on:**
- No TypeScript errors: `npx tsc --noEmit`
- `lib/program.ts` and `lib/schedule.ts` exist
- All 29 exercise IDs are present

---

## TASK 4 🤖 — Bottom navigation + app shell

**Paste this into Claude Code:**

```
Let's build the app shell — layout with bottom navigation.

1. Create components/BottomNav.tsx:
   - Fixed bottom nav bar, white background, subtle top border
   - 4 tabs with lucide-react icons:
     * 🏠 Today (Home icon) → href="/"
     * 📊 Progress (BarChart2 icon) → href="/progress"
     * ⚖️ Weight (Scale icon — use Activity if Scale not available) → href="/weight"
     * ⚙️ Settings (Settings icon) → href="/settings"
   - Active tab: green (#4CAF50) icon + label, inactive: gray
   - Detect active route with usePathname()
   - Height: 64px with safe area padding for mobile

2. Update app/layout.tsx:
   - Import and render BottomNav below the main content
   - Do NOT show BottomNav on /login route
   - Root layout: gray-50 background (#f5f5f5), add pb-16 (padding for bottom nav)
   - Add <link rel="manifest" href="/manifest.json"> in <head>
   - Add <meta name="theme-color" content="#4CAF50"> in <head>

3. Create placeholder pages (just "Coming soon" text for now):
   - app/progress/page.tsx
   - app/weight/page.tsx
   - app/settings/page.tsx
   Keep app/page.tsx as whatever Next.js generated (we'll replace it next task)

4. Create public/manifest.json:
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

5. Configure next-pwa in next.config.js:
   const withPWA = require("next-pwa")({ dest: "public", disable: process.env.NODE_ENV === "development" });
   module.exports = withPWA({ /* existing config */ });

6. Create simple green placeholder icons (just solid green squares) at:
   public/icon-192.png and public/icon-512.png
   (We can replace with a real icon later)

7. Commit:
   git add .
   git commit -m "feat: app shell — BottomNav + PWA manifest + placeholder pages"
   git push origin main
```

**✅ What to verify before moving on:**
- Login → see the 4-tab bottom nav
- Click each tab → navigates correctly
- No bottom nav on /login
- On mobile (Chrome DevTools → device mode): nav looks correct, tabs are tappable

---

## TASK 5 🤖 — Today Screen: day card + weigh-in card

**Paste this into Claude Code:**

```
Now let's build the Today screen — the main screen users see every day.
Build it step by step, we'll add exercises in the next task.

Replace app/page.tsx with a full Today screen that:

1. Gets today's date and reads user config from Supabase (user_config table)
   - If no config row exists yet: create one with defaults (start_date = today, user_name = 'Rotem')

2. Calls getDayInfo(config.start_date, today) to know what kind of day it is

3. Renders components/TodayHeader.tsx:
   - Left: "Good morning, Rotem" (or afternoon/evening based on hour)
   - Right: "Week 3 · Phase 1" badge (phase color: teal/blue/orange)
   - Below: today's date in friendly format ("Saturday, 16 May")

4. If today is Sunday — renders components/WeighInCard.tsx FIRST (above everything else):
   - White card, rounded-2xl, green left border (border-l-4 border-green-400)
   - Top right: "Required" badge (green pill)
   - Title: "Weekly Weigh-in 🏋️"
   - Subtitle: "Before eating, after waking up — most accurate reading"
   - Large centered number input (kg, one decimal place, e.g. 84.5)
   - [Save Weight] button (green) → upserts to weight_log table
   - If weight already saved for today: show "✓ 84.5 kg logged today" with small [Edit] link
   - Saving sets weigh_in_done = true in daily_progress for today

5. Renders components/DayTypeCard.tsx:
   - Strength A/B: large teal/blue card, 💪 icon, "Strength A — Push" title, "Today: 5 exercises" subtitle
   - Cardio: green card, 🏃 icon, "Cardio Day", "60 min elliptical" subtitle
   - Rest: gray card, 🧘 icon, "Rest Day", "Active recovery — light walk or stretching" subtitle
   - On strength days: yellow strip below the card: "⚠️ Do your 60 min elliptical BEFORE strength training"

6. Skeleton loading state: while fetching from Supabase, show gray animated skeleton placeholders for the header and cards

7. Error state: if Supabase fetch fails, show a red Toast notification at the top: "Failed to load today's data — check your connection"

8. Commit:
   git add .
   git commit -m "feat: Today screen — header, weigh-in card, day type card"
   git push origin main
```

**✅ What to verify before moving on:**
- Log in → see the Today screen with your name + week/phase badge
- Change your computer date to a Sunday → weigh-in card appears first, above the day card
- Enter a weight → see the ✓ confirmation
- Day card shows the correct type for today
- Skeleton shows briefly on load, then real data appears

---

## TASK 6 🤖 — Exercise cards + YouTube modal

**Paste this into Claude Code:**

```
Now let's add the exercise list to the Today screen. This is the core of the app.

1. Create components/YoutubeModal.tsx:
   - Full-screen fixed overlay (position: fixed, inset-0, z-50, bg-black/90)
   - Top bar: "✕ Back to workout" button (white text, left-aligned)
   - Middle: <iframe> filling remaining height, allowFullScreen, no border
   - Bottom: white text showing the exercise technique tip
   - CRITICAL: use useState for iframeSrc. Set src when opening, set src="" when closing.
     This stops the video + audio when modal closes.
   - Opening: src = youtube_url + "?autoplay=1&rel=0&modestbranding=1"
   - Closing: src = "" (clears immediately)

2. Create components/ExerciseCard.tsx:
   Props: exercise (from lib/program.ts), workoutExercise (sets/reps), 
          savedSets (boolean[]), savedReps (number[]), onSetToggle, onRepsChange
   
   Layout:
   - White card, rounded-2xl, shadow-sm, p-4
   - Header row: exercise name (bold) + "Target: 3 × 8" (gray, right-aligned)
   - Muscle tags: small gray pills (Chest · Triceps · Shoulders)
   - [▶ Watch Demo] button: gray outlined button, opens YoutubeModal
   - Technique tip: italic gray text
   - Sets row: one button per set ["Set 1"] ["Set 2"] ["Set 3"]
     * Unchecked: white bg, gray border
     * Checked: green bg (#4CAF50), white text, ✓ prefix
     * On tap: call onSetToggle(setIndex)
   - Reps row (below sets): small inputs for logging actual reps (optional, placeholder = target reps)
   - If each_side: show "(each side)" next to target reps
   - Card border: default = gray, partial = blue-300, all done = green-400
   - Card background: default = white, all done = green-50

3. Create components/RestTimer.tsx:
   - Shown below the set buttons immediately after a set is ticked
   - Reads/writes start timestamp to sessionStorage key "rest_timer_start"
   - Shows countdown: "Rest — 1:30" counting down to "0:00"
   - At 0: shows "✅ Ready!" and a small bell emoji
   - User can dismiss early with an [X] button
   - After 0: auto-hides after 3 seconds

4. Update app/page.tsx to show the exercise list on strength days:
   - After DayTypeCard: collapsible "Warm-up" section (6 items with checkboxes)
   - Then: the list of ExerciseCards for today's workout
   - Then: collapsible "Cool-down" section (5 items)
   - Progress bar at top of exercise section: "3 / 5 exercises done" (green fill)
   - Load existing set data from Supabase exercise_sets table for today
   - On set toggle: upsert to exercise_sets table (user_id, date, exercise_id, set_index, completed)
   - On reps change: upsert actual_reps to exercise_sets table

5. Completion logic:
   - When ALL sets across ALL exercises are checked:
     * Trigger canvas-confetti burst (2 seconds, green + white colors)
     * Show a small overlay banner "🎉 יום אימון הושלם!" for 2 seconds then hide
     * Upsert strength_done = true to daily_progress table
     * Stay on the same screen — do NOT navigate away

6. Commit:
   git add .
   git commit -m "feat: exercise cards, YouTube modal, rest timer, completion confetti"
   git push origin main
```

**✅ What to verify before moving on:**
- Today (a strength day): see the exercise list
- Tap [▶ Watch Demo] → YouTube opens full-screen inside the app, video plays
- Tap "✕ Back to workout" → video stops (no audio continues)
- Tap a set button → turns green, rest timer appears (counts down from 90s)
- Navigate to Progress tab and back → rest timer still counting
- Tick all sets → confetti, "יום אימון הושלם!" banner, then back to normal
- Refresh page → checked sets are still checked (loaded from Supabase)

---

## TASK 7 🤖 — Settings screen

**Paste this into Claude Code:**

```
Build the Settings screen (app/settings/page.tsx).

Replace the placeholder with a full settings page:

1. Load current config from Supabase user_config table

2. Form fields (all in white cards, rounded-2xl):
   Card 1 — "Profile":
   - Display name (text input, default: "Rotem")
   - Program start date (date picker — this drives all week calculations, so warn the user: "Changing this will recalculate your current week")

   Card 2 — "Weight Goals":
   - Starting weight (kg, number input with one decimal)
   - Goal weight (kg, number input with one decimal)

   Card 3 — "Notifications":
   - Daily reminder time (time input)
   - [Enable Notifications] button → requests browser notification permission
   - Show current permission status (Granted / Denied / Not set)

3. [Save Settings] button (green, full-width):
   - Upserts all fields to user_config table
   - Shows success Toast: "✅ Settings saved"

4. Card 4 — "Danger Zone" (red border):
   - [Reset All Progress] button (red outlined)
   - On tap: show confirmation dialog "This will delete all your workout progress and weight logs. Are you sure?"
   - On confirm: DELETE from daily_progress, exercise_sets, weight_log (keep user_config)
   - Show success Toast: "Progress reset"

5. At bottom: small gray text "Logged in as rotemsp9@gmail.com" + [Sign Out] button
   - Sign out: supabase.auth.signOut() → redirect to /login

6. Commit:
   git add .
   git commit -m "feat: Settings screen — config, goals, notifications, reset, sign out"
   git push origin main
```

**✅ What to verify before moving on:**
- Settings screen loads with your current values
- Change start date → save → go to Today screen → week badge updates
- Sign Out → redirected to /login
- Login again → back to Today

---

## TASK 8 🤖 — Weight screen

**Paste this into Claude Code:**

```
Build the Weight screen (app/weight/page.tsx).

1. Load all entries from Supabase weight_log table, ordered by date ascending
   Also load user_config (for goal_weight)

2. Top section — explanation card (white, rounded-2xl):
   "📋 Weigh yourself every Sunday morning before eating and after waking up.
   This gives the most accurate and consistent readings over time."

3. Quick entry section (white card):
   - Large centered number input for weight in kg (one decimal)
   - Today's date shown below
   - [Save Today's Weight] button (green) → upserts to weight_log
   - If today already has an entry: pre-fill input with existing value, button says [Update]

4. Summary cards row (3 small cards):
   - Total change: first entry → latest entry (e.g. "−1.5 kg" in green, or "+0.5 kg" in red)
   - Last week Δ: second-to-last entry → last entry
   - Goal remaining: latest weight − goal_weight (from user_config)

5. Weight chart (recharts BarChart):
   - X axis: week numbers (Week 1, Week 2, etc.)
   - Y axis: weight in kg (domain: [minWeight - 2, maxWeight + 2])
   - Each bar colored: green if weight decreased from previous, orange if increased, gray for first entry
   - Between each pair of bars: show a small ↓ (green) or ↑ (red) arrow
   - Bar labels: show the kg value on top of each bar

6. History list (below chart):
   - Each entry: date (formatted nicely) · weight · Δ from previous (green/red)
   - Most recent first
   - Empty state: "No weight entries yet. Start by logging your weight above."

7. Skeleton loading state while fetching

8. Commit:
   git add .
   git commit -m "feat: Weight screen — chart, history, quick entry, summary cards"
   git push origin main
```

**✅ What to verify before moving on:**
- Enter a weight → appears in history list
- Enter a second weight → chart shows two bars with an arrow between them
- Summary cards show correct values
- The weight you entered on Sunday (from the Today screen) appears here too (same table)

---

## TASK 9 🤖 — Progress screen

**Paste this into Claude Code:**

```
Build the Progress screen (app/progress/page.tsx).

1. Load from Supabase:
   - weight_log (for weight stats)
   - weekly_metrics (for push-ups, pull-ups, dead hang)
   - daily_progress (for calendar and streak)
   Also load user_config (for start_date)

2. Top: 4 stat cards in a 2×2 grid (white, rounded-2xl):
   - 📉 Weight change: (latest weight − first weight), green if negative, red if positive
   - 💪 Push-ups: latest week's push_ups_max from weekly_metrics
   - 🔝 Pull-ups: latest week's pull_ups_max
   - ⏱ Dead hang: latest week's dead_hang_sec + "sec"
   - If no data yet: show "—" and gray text "Not logged yet"

3. Tabbed chart section (white card):
   - 4 tab buttons: [Weight] [Push-ups] [Pull-ups] [Dead Hang]
   - Weight tab: BarChart of weight_log per week (same style as weight screen)
   - Push-ups tab: BarChart of weekly_metrics.push_ups_max per week_number
   - Pull-ups tab: BarChart of weekly_metrics.pull_ups_max per week_number
   - Dead Hang tab: BarChart of weekly_metrics.dead_hang_sec per week_number
   - All charts: green bars, show value on top of each bar
   - Empty state per tab: "Log your first [metric] to see progress here"

4. Streak counter (white card):
   - Calculate consecutive days where daily_progress has strength_done=true or cardio_done=true
   - Show "🔥 7-day streak!" (or "No active streak — start today!")

5. 12-week calendar grid (white card, title "12-Week Overview"):
   - 12 rows (one per week), 7 columns (Sun–Sat)
   - Each cell: small circle
     * Green filled = strength_done or cardio_done = true
     * Yellow filled = partial (some sets done but not all)
     * Gray = rest day or future
     * Empty outline = missed (past day, no progress saved)
   - Show week numbers on the left

6. [Log This Week's Numbers] button (green outlined, below calendar):
   Opens a modal with:
   - Week number (auto-detected from today's date)
   - 4 inputs: Push-ups max, Pull-ups max, Dead hang (sec), Plank (sec)
   - [Save] → upserts to weekly_metrics table
   - Show success Toast

7. Skeleton loading state

8. Commit:
   git add .
   git commit -m "feat: Progress screen — stats, tabbed charts, streak, 12-week calendar"
   git push origin main
```

**✅ What to verify before moving on:**
- Stat cards show correct data (or "—" if nothing logged yet)
- Click all 4 chart tabs → each shows its chart (or empty state)
- Log weekly numbers → they appear in the chart
- Calendar shows green dots for completed days

---

## TASK 10 🤖 — Connect Vercel + final polish

**Paste this into Claude Code:**

```
Let's do the final deployment and polish pass.

1. Connect Vercel:
   (I will do this manually in the browser — see instructions below)
   
   In next.config.js — make sure the PWA config is correct and no build errors.
   Run: npm run build
   Fix any build errors before we deploy.

2. Polish pass — fix these common issues:
   a) Make sure all pages have proper <title> tags via Next.js metadata API
      - Today: "RiseStrong"
      - Progress: "Progress — RiseStrong"
      - Weight: "Weight Log — RiseStrong"
      - Settings: "Settings — RiseStrong"
   
   b) Add a global Toast component (if not already added):
      - Fixed top-right position
      - Green for success, red for errors
      - Auto-dismiss after 3 seconds
      - Used consistently across all screens
   
   c) Mobile viewport: make sure <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> is in the root layout
   
   d) Add safe-area-inset padding to BottomNav for iPhone notch:
      className="pb-[env(safe-area-inset-bottom)]"
   
   e) Make sure all Supabase queries handle the loading and error states uniformly

3. Final git commit:
   git add .
   git commit -m "chore: build fixes + polish + metadata + safe-area"
   git push origin main

Show me the result of npm run build — confirm 0 errors.
```

**🧑 After Claude Code finishes Task 10 — connect Vercel manually:**
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import** next to your `risestrong` GitHub repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Deploy**
5. Wait ~2 minutes → get your live URL (e.g. `risestrong.vercel.app`)

**✅ What to verify before moving on:**
- `npm run build` → 0 errors
- Vercel deploy succeeds
- Open the live URL on your phone → login works
- App installs to home screen (Safari → Share → Add to Home Screen)

---

## TASK 11 🤖 — PWA icons + final touches (optional but nice)

**Paste this into Claude Code:**

```
Let's replace the placeholder green icons with proper app icons.

1. Create a simple SVG icon for the app:
   - Dark green background (#2E7D32)
   - White dumbbell or pull-up bar symbol in the center
   - Save as public/icon.svg

2. Use the svg to generate PNG icons:
   - Use sharp or a simple canvas script to generate icon-192.png and icon-512.png from the SVG
   - Save to public/

3. Add to the root layout <head>:
   <link rel="apple-touch-icon" href="/icon-192.png">

4. Verify PWA works end-to-end:
   - On iPhone: open Safari → go to the live URL → Share → Add to Home Screen
   - The app should appear with the green icon
   - Tapping the icon should open the app in standalone mode (no browser bar)

5. Commit:
   git add .
   git commit -m "feat: PWA icons + apple-touch-icon"
   git push origin main
```

**✅ Final verification — the full app works:**
- [ ] Login with email/password ✅
- [ ] Today screen shows correct day type ✅
- [ ] Sunday: weigh-in card appears first ✅
- [ ] Tap [▶ Watch Demo] → YouTube opens inside app, no external navigation ✅
- [ ] Tap ✕ → video stops completely ✅
- [ ] Check sets → rest timer counts down from 90 sec ✅
- [ ] Navigate away and back → rest timer still running ✅
- [ ] Complete all exercises → confetti + "יום אימון הושלם!" banner ✅
- [ ] Refresh → checked sets still checked ✅
- [ ] Weight screen: log weight → appears in chart and history ✅
- [ ] Progress screen: charts and calendar work ✅
- [ ] Settings: change start date → week badge updates ✅
- [ ] Sign out → redirected to login ✅
- [ ] On phone: add to home screen → opens in standalone mode ✅
- [ ] GitHub: all commits are there ✅
- [ ] Vercel: every push to main auto-deploys ✅

---

## Summary — Build Order

| # | Task | Who | Output |
|---|---|---|---|
| PRE-1 | Create GitHub repo + clone | 🧑 You | `risestrong/` folder |
| PRE-2 | Create Supabase project | 🧑 You | Active Supabase project |
| PRE-3 | Get Supabase keys | 🧑 You | URL + anon key saved |
| PRE-4 | Create your user account | 🧑 You | Login credentials |
| PRE-5 | Run DB schema SQL | 🧑 You | 5 tables + RLS policies |
| PRE-6 | Create Vercel account | 🧑 You | Vercel account connected to GitHub |
| 1 | Scaffold + CLAUDE.md + env | 🤖 Claude Code | Working Next.js app on GitHub |
| 2 | Auth middleware + login page | 🤖 Claude Code | Login works, routes protected |
| 3 | Static program data | 🤖 Claude Code | All exercises + schedule logic |
| 4 | App shell + bottom nav + PWA | 🤖 Claude Code | 4-tab navigation + installable |
| 5 | Today screen (header + cards) | 🤖 Claude Code | Day card + weigh-in card |
| 6 | Exercise cards + YouTube modal | 🤖 Claude Code | Core workout flow works end-to-end |
| 7 | Settings screen | 🤖 Claude Code | Config, goals, sign out |
| 8 | Weight screen | 🤖 Claude Code | Weight chart + history |
| 9 | Progress screen | 🤖 Claude Code | Charts, streak, calendar |
| 10 | Build + Vercel deploy | 🤖 Claude Code + 🧑 You | Live URL on the internet |
| 11 | PWA icons | 🤖 Claude Code | Real icon on home screen |
