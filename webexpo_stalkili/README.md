# Claude Code Workshop — Build, Ship, Pitch

Today your team will:
1. **Build a working MVP** of a product idea using Claude Code
2. **Create a pitch** — marketing, positioning, story
3. **Present it** — live demo + 3-minute pitch

You have 2 hours to build. Claude Code writes the code. You tell it what to build.

---

## Getting Started

### 1. Fork and clone this repo

One person on your team runs this:

```bash
gh repo fork Betterfit-ca/claude-code-workshop-starter --clone
cd claude-code-workshop-starter
```

> Don't have `gh`? Ask your technical assistant for help, or: go to the [repo page](https://github.com/Betterfit-ca/claude-code-workshop-starter), click **Fork**, then clone your fork.

### 2. Set up your credentials

Your organizer will give you three things: a Claude API key, a Supabase URL, and a Supabase key.

```bash
# Set your Claude API key
export ANTHROPIC_API_KEY='sk-ant-your-key-here'

# Create your env file
cp .env.example .env.local
```

Open `.env.local` and paste your Supabase URL and key. Ask your technical assistant if you need help.

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If you see the starter page, you're good.

### 4. Start Claude Code

Open a **second terminal tab**, navigate to the same folder, and run:

```bash
claude
```

You're in. Claude Code reads `CLAUDE.md` and `PROJECT.md` automatically — it already knows your stack.

---

## Plan Your Product

Before anyone touches code, your whole team should spend 5-10 minutes on this.

Open **`PROJECT.md`** in your editor. Fill it in together. This file is your team's shared brain:
- **Coders** use it: Claude Code reads it automatically, so it always knows what you're building
- **Marketers** use it: the Pitch Outline section at the bottom feeds directly into your pitch deck

**Scoping rules:**
- 3 pages max (login, main screen, maybe one more)
- 1-2 database tables
- If you can't explain the core feature in one sentence, simplify

---

## Divide and Conquer

You're a team of 4. Split up:

**Coders (1-2 people)** — Work with Claude Code to build the MVP. Follow the build guide below.

**Marketers (1-2 people)** — Build the pitch deck, define the brand, create any marketing assets. Use the Pitch Outline section in `PROJECT.md` as your starting point. You can also use Claude (at [claude.ai](https://claude.ai)) to help write copy, create a pitch structure, or brainstorm positioning.

Both workstreams come from the same `PROJECT.md`. Stay in sync.

---

## Building with Claude Code

### The one rule: build one feature, then `/clear`

Claude Code remembers everything in a conversation. After a few features, it's dragging thousands of lines of old context — slower, more expensive, more confused.

**`/clear` wipes the conversation.** But Claude Code re-reads `CLAUDE.md` and `PROJECT.md` automatically on the next prompt. It keeps the big picture, forgets the implementation details of the last feature. This is what you want.

**Workflow:**
1. Ask Claude to build one feature
2. Test it, make sure it works
3. Commit: `git add -A && git commit -m "added [feature]"`
4. Type `/clear`
5. Ask for the next feature

### Suggested build order

| Phase | What | Time |
|-------|------|------|
| 1 | **Auth** — signup + login pages with Supabase | ~15 min |
| 2 | **Core feature** — the main screen of your app | ~40 min |
| 3 | **Make it useful** — one more feature that completes the experience | ~25 min |
| 4 | **Make it pretty** — clean up the design with Tailwind | ~20 min |
| 5 | **Deploy** — ship it live | ~10 min |

Example prompts for each phase:

> "Add signup and login pages using Supabase Auth with email and password. After login, redirect to /dashboard."

> "Build the main dashboard page based on the project plan in PROJECT.md. Include [your core feature]."

> "Improve the design. Make it clean and modern. Add spacing, better typography, and hover effects."

### Prompting tips

**Be specific:**
- "Add a form to create new expenses with amount, category, and description" ← good
- "Add some features" ← too vague, you'll get garbage

**Paste errors directly:**
- "This error appeared: [paste error]. Fix it." ← Claude is great at fixing its own mistakes

**Don't over-explain:**
- Claude Code already read your PROJECT.md. You don't need to re-explain the whole app every time.

### Key commands

| Command | What it does |
|---------|-------------|
| `/clear` | Wipes conversation. Use after each feature. |
| `/cost` | Shows how much you've spent |
| `Ctrl+C` | Cancel current operation |
| `exit` | Leave Claude Code |

---

## Deploy

When you're ready to go live:

```bash
npm run build
```

If the build fails, paste the error into Claude Code: "Fix this build error: [paste]"

Once it builds clean:

```bash
npx vercel --prod
```

Follow the prompts. You'll get a live URL. That's your demo link.

---

## Prepare Your Pitch

Your pitch should be **3-5 minutes**. Structure:

1. **The problem** (30 sec) — What sucks about the status quo? Make the audience feel the pain.
2. **The solution** (30 sec) — What does your product do? Keep it simple.
3. **Live demo** (1-2 min) — Show the working app. Walk through the user flow.
4. **Why it's different** (30 sec) — What's your edge?
5. **The ask** (30 sec) — What do you need? Users, feedback, investment?

Use the Pitch Outline section in `PROJECT.md` — you already wrote this during planning.

---

## Git Saves You

Commit after every feature. If Claude breaks something, you can always go back.

```bash
git add -A && git commit -m "describe what you just built"
```

Something went wrong? See what changed:
```bash
git diff
```

Undo everything since last commit:
```bash
git checkout .
```

---

## Troubleshooting

**"npm install" fails**
→ Check your Node version: `node -v` (needs 18+)

**Page is blank / white screen**
→ Check your terminal for errors. Make sure `.env.local` has the right Supabase URL and key.

**Supabase returns empty data**
→ Did you create the table? Go to Supabase dashboard → SQL Editor → paste your SQL.
→ Did you enable RLS? Check that policies are set up (see `supabase/setup.sql` for the pattern).

**Claude Code is slow or errors**
→ Wait 30 seconds (rate limit). Then try again.
→ Use `/clear` to reduce context.

**Build fails before deploy**
→ Paste the error into Claude Code: "Fix this build error: [error]"

**Need help?**
→ Message your WhatsApp group. Your technical assistant is there.

---

Built with [Claude Code](https://claude.ai/download) at a [BetterFit](https://betterfit.tech) workshop.
