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
