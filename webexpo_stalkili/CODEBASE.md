# Scopeout — Codebase Handoff

## What This App Is
**Scopeout** is an AI-powered research intelligence platform. You type a name or topic, the AI scrapes public sources, and returns ranked, structured briefs about people — tailored to high-stakes interactions like PhD applications, job interviews, or cold outreach.

**Live MVP focus:** Academic supervisor matching.

---

## Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database/Auth | Supabase (client at `src/lib/supabase.ts`) — not yet wired to UI |
| Deploy | Vercel |

---

## File Map

### Pages
| File | Role |
|---|---|
| `src/app/page.tsx` | Root route — renders `<Home />` |
| `src/app/layout.tsx` | Global layout — mounts `<Navbar1>` and `<FloatingAiAssistant>` on every page |
| `src/app/chat/page.tsx` | Full-page AI chat UI |
| `src/app/api/chat/route.ts` | API route for chat (not yet connected to real AI) |
| `src/app/api/models/route.ts` | API route placeholder for model listing |

### Pages (assembled from sections)
| File | Role |
|---|---|
| `src/pages/Home.tsx` | Assembles `HeroSection + Features + About + Footer` |

### Sections (used in Home)
| File | Role |
|---|---|
| `src/sections/Features.tsx` | Animated stat counter bar (3 verticals / 10x faster / 95% match / 2.4K users) + tabbed use-case switcher (PhD / Recruiter / Sales) |
| `src/sections/About.tsx` | "How It Works" 3-step section + orange CTA banner ("Get Early Access") |
| `src/sections/Footer.tsx` | Minimal dark footer — placeholder copy, needs updating |

### UI Components
| File | Role |
|---|---|
| `src/components/ui/gradient-bar-hero-section.tsx` | Hero section — animated orange gradient bars, headline, search input with field dropdown, trust avatars. Search navigates to `/chat?q=` |
| `src/components/ui/navbar-1.tsx` | Floating pill navbar — `bg-black/80 backdrop-blur`, links to Home + /chat |
| `src/components/ui/glowing-ai-chat-assistant.tsx` | Floating orange orb (bottom-right) — hidden on `/chat`, navigates to `/chat` on click |
| `src/components/ui/ai-prompt-box.tsx` | Chat input box — auto-resizing textarea, voice recording, send/stop button, drag-and-drop image support |
| `src/components/ui/selector-chips.tsx` | Animated toggle chip selector — used in both the field pickers (hero + chat) |
| `src/components/ui/researcher-card.tsx` | Researcher result cards — circular avatar, name, title, summary, topics, match level (High / Average / Low) |

### Lib
| File | Role |
|---|---|
| `src/lib/supabase.ts` | Supabase client (browser) — ready to use, env vars already set |
| `src/lib/utils.ts` | `cn()` helper — merges Tailwind class names |

---

## Chat Page — Key Details (`src/app/chat/page.tsx`)

### Layout
- `fixed inset-0` with `flex flex-col` — proper mobile chat behaviour
- Radial orange gradient from the bottom (wider/lower on mobile via responsive divs)
- Messages area: `relative z-10 flex-1 overflow-y-auto`
- Input area: `relative z-10 shrink-0` — pinned to bottom

### Message Flow
```
user types → handleSend() →
  1. appends user bubble (white, right-aligned)
  2. 1.2s fake loading spinner
  3. appends AI response → renders <ResearcherResults query="..." />
```
- `Message` type: `{ role: 'user' | 'ai'; text: string; query?: string }`
- Currently shows **mock researcher cards** for every query — needs real API wired in

### Input Box Features
- **Fields button** (bottom-left of box) — opens `<FieldPicker>` popover above box
  - Two-tier selection: Broad Field → Specialisation chips
  - Selected fields prepend to the query as `Fields: X, Y`
  - Tags shown as removable orange pills above the input
- **Sources button** (next to Fields) — opens sources popover above box
  - Options: LinkedIn · Google Scholar · ResearchGate · All Web
  - Selected sources append to query as `Sources: X, Y`
- Both popovers close when clicking outside the input area
- Field picker closes automatically on send

### Field Taxonomy (hardcoded in chat page)
8 broad fields (Technology, Medicine & Health, Engineering, etc.) each with 5–8 specialisations.

---

## Researcher Cards (`src/components/ui/researcher-card.tsx`)

### Data Shape
```ts
interface Researcher {
  name: string;
  title: string;
  university: string;
  location: string;
  image: string;        // Unsplash URL
  topics: string[];
  matchScore: number;   // 0–100, used to derive label
  publications: number;
  summary: string;
}
```

### Match Level Logic
```ts
score >= 80  → "High"    (green)
score >= 50  → "Average" (orange)
score < 50   → "Low"     (red)
```

### Current State
- 3 hardcoded mock researchers (Sarah Chen / MIT, James Okafor / Stanford, Priya Nair / Cambridge)
- Cards scroll horizontally (`overflow-x-auto scrollbar-hide`)
- Staggered fade-in via Framer Motion
- **TODO:** Replace mock data with real API results

---

## Hero Section Search (`src/components/ui/gradient-bar-hero-section.tsx`)
- Same field taxonomy as chat (8 broad + specialisations)
- On submit: navigates to `/chat?q=<encoded query + tags>`
- Chat page reads `?q=` param and auto-fires the first message
- Dropdown uses `bg-black/90 backdrop-blur-2xl border-white/10` (matches chat popovers)

---

## Design System

| Token | Value |
|---|---|
| Primary accent | `orange-500` (#f97316) |
| Background (pages) | `black` / `gray-950` |
| Card background | `white/5` (semi-transparent) |
| Popover background | `black/90 backdrop-blur-2xl` |
| Border default | `white/10` |
| Border active | `orange-500/50` |
| Text primary | `white` |
| Text muted | `gray-400` / `gray-500` |
| Border radius (cards) | `rounded-2xl` |
| Border radius (pills) | `rounded-full` |

---

## What's Not Done Yet
- **Real AI integration** — `src/app/api/chat/route.ts` needs to call an LLM (e.g. Claude API) and return real researcher data
- **Supabase** — auth and database tables not wired to any UI yet
- **Footer** — placeholder text, no real links
- **"Get Early Access"** CTA — `href="#"`, needs a real destination
- **"View profile" button** on researcher cards — no action wired
- **Voice recording** in prompt box — captures audio but doesn't transcribe
