# Scopeout — Project Summary

## What We Built

**Scopeout** is an AI-powered research intelligence platform that prepares you for high-stakes human interactions. The core mechanic: input a name or list of people + your own profile/goal → AI scrapes relevant sources → returns ranked, structured, actionable briefs tailored to the interaction type.

---

## Three Verticals

| Vertical | Use Case |
|---|---|
| **PhD Supervisor Matching** | Paste a list of supervisors + research interests → ranked matches with compatibility scores, plain-English summaries, and personalised email openers |
| **Recruiter Intelligence** | Search any recruiter before an interview → discover what they value, their hiring patterns, how to position yourself |
| **Sales Cold Call Prep** | Enter a prospect's name → get role history, company news, pain points, and a conversation opener |

> **MVP focus:** Academic supervisor matching (fastest to ship, clearest value prop)

---

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Database + Auth:** Supabase
- **Animation:** Framer Motion
- **Deploy:** Vercel

---

## Pages

### `/` — Home
- Gradient bar hero with animated orange bars
- Search input that navigates to `/chat?q=` with query
- Field tag dropdown (broad → specific) on the search input
- Features section: animated stat cards + tabbed use-case switcher
- How It Works section: 3-step flow + CTA banner
- Footer

### `/chat` — AI Chat
- Full-page chat with orange radial gradient background
- Message thread (user bubbles white, AI bubbles dark glass)
- **Fields popover:** `Layers` button in the input area → two-tier chip selector (broad field → specialisation)
- **Source tags below input:** LinkedIn · Google Scholar · ResearchGate · All Web
- Selected fields prepend to every query sent to the AI
- Reads `?q=` param from hero search and auto-sends on load

---

## Key Components

| File | Description |
|---|---|
| `src/components/ui/gradient-bar-hero-section.tsx` | Hero section with animated gradient bars, search, field dropdown |
| `src/components/ui/navbar-1.tsx` | Floating pill navbar with framer-motion, links to Home + /chat |
| `src/components/ui/ai-prompt-box.tsx` | Chat input box with voice recording and send |
| `src/components/ui/selector-chips.tsx` | Animated toggle chip selector for field/source selection |
| `src/components/ui/glowing-ai-chat-assistant.tsx` | Floating orb (Siri-style) that navigates to /chat, hidden on chat page |
| `src/sections/Features.tsx` | Stat cards with count-up animation + use-case tabs |
| `src/sections/About.tsx` | How It Works 3-step section + CTA |
| `src/app/chat/page.tsx` | Full AI chat page |

---

## Design Decisions

- **Colour:** `gray-950` backgrounds, `orange-500` as primary accent throughout
- **Navbar:** Fixed floating pill, `bg-black/80 backdrop-blur`, appears on all pages
- **Hero border radius:** `rounded-bl-[4rem] rounded-br-[4rem]` — soft bottom edge
- **Orb:** Grey + orange colour scheme, hidden on `/chat`, navigates to `/chat` on click
- **Chat layout:** `fixed inset-0` with scrollable message area and pinned input — proper mobile chat behaviour
- **Source selection:** Solid `zinc-900/zinc-700` pill buttons, no emojis

---

## Repo

[github.com/Anisboudaren/webexpo_stalkili](https://github.com/Anisboudaren/webexpo_stalkili)
