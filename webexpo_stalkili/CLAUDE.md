# Workshop MVP Starter

## What We're Building
Read PROJECT.md for the full project plan. Always check it before starting a new feature.

## Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database + Auth**: Supabase (client in `src/lib/supabase.ts`)
- **Deploy**: Vercel (free tier)

## Important: Next.js 16
This version has breaking changes from older Next.js. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands
- `npm run dev` — start dev server on localhost:3000
- `npm run build` — production build
- `npx vercel --prod` — deploy to production

## Project Structure
```
src/
  app/          — pages and layouts (App Router)
  lib/          — utilities (supabase client is here)
  components/   — reusable UI components (create as needed)
```

## Rules
- Use the Supabase client from `src/lib/supabase.ts` for all database and auth operations
- Use server components by default. Only add `'use client'` when you need interactivity
- Use Tailwind CSS utility classes for all styling. No CSS modules or inline styles
- Keep components small and focused. One component per file
- Put new pages in `src/app/` following Next.js App Router conventions
- Put reusable components in `src/components/`
- Environment variables are already configured — don't modify `.env.local`
- When creating Supabase tables, generate full SQL (CREATE TABLE + RLS policies) and tell the user to run it in the Supabase SQL Editor. See `supabase/setup.sql` for the pattern
- When setting up auth, use Supabase Auth with email/password
- After completing a feature, suggest the user commit with git

## Supabase Quick Reference
```typescript
import { supabase } from '@/lib/supabase'

// Read
const { data, error } = await supabase.from('table_name').select('*')

// Insert
const { data, error } = await supabase.from('table_name').insert({ column: 'value' })

// Update
const { data, error } = await supabase.from('table_name').update({ column: 'new_value' }).eq('id', id)

// Delete
const { data, error } = await supabase.from('table_name').delete().eq('id', id)

// Auth - sign up
const { data, error } = await supabase.auth.signUp({ email, password })

// Auth - sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Auth - get current user
const { data: { user } } = await supabase.auth.getUser()

// Auth - sign out
await supabase.auth.signOut()
```
