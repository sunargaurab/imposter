# 🎭 Imposter — Multiplayer Social Deduction Party Game

> **"Find the liar. Protect your secret. Outsmart everyone."**

**Imposter** is a production-ready, server-authoritative multiplayer web party game built with **Next.js 14/15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Web Audio API, and Supabase (PostgreSQL + Realtime + RLS)**. Designed with a mobile-first party-game aesthetic (dark theme, glassmorphism, 3D card flips, vibrant neon glows, and celebratory confetti).

---

## 🌟 Game Highlights

- **Instant Join with QR Code or 5-Char Room Code:** No login or account required.
- **3 to 20 Players:** Configurable imposter count (1 to max allowed), round count (3, 5, 7, 10), and discussion timer.
- **10 Rich Categories (300+ Words):** Celebrities, Leaders & History, Food & Cuisine, Movies & TV, Sports & Athletes, Animals & Wildlife, Countries & Wonders, Brands & Companies, Tech & Gaming, Places & Cities.
- **3D Secret Reveal Card:** Hold or tap to flip your secret card. Normal players receive the secret word; imposters receive `"YOU ARE THE IMPOSTER"`.
- **Server-Authoritative State Machine:** Sensitive roles and words are never transmitted to unauthorized client browsers before the reveal phase.
- **Interactive Multi-Player Simulator (`/demo`):** Test the complete 6-player scenario (Alex, Sam, Jordan, Maya, Chris, Taylor) across tabs with 1-click perspective switching.
- **Web Audio Sound Effects Synthesizer:** Smooth synthesized sounds for card flips, countdown urgency, vote locking, imposter reveal sting, and victory fanfare (with sound toggle).

---

## 🕹️ Game Rules & Scoring Engine

### 1. The Setup
- Players join the same room on their phones or browsers.
- The host selects the player count, imposter count, rounds, and category.
- The system secretly designates imposters and normal players.

### 2. Discussion (60s Default)
- Players speak aloud in real life.
- Normal players give subtle clues showing they know the secret word.
- Imposters attempt to blend in without knowing the word.

### 3. Secret Voting
- Each player casts a single secret vote for who they suspect is an imposter.
- Players cannot vote for themselves.
- Votes remain locked and encrypted on the server until all players submit.

### 4. Scoring Formula
- **Normal Player:**
  - Correct vote for an imposter: `+2 points`
  - Incorrect vote: `0 points`
- **Imposter:**
  - `Imposter Score = max(0, Total Players - Votes Received)`
  - *Example with 6 players:*
    - 0 votes: `+6 pts` (clean escape)
    - 1 vote: `+5 pts`
    - 2 votes: `+4 pts`
    - 3 votes: `+3 pts`
    - 6 votes: `+0 pts`

### 5. Final Podium & Awards
- 🥇 1st Place, 🥈 2nd Place, 🥉 3rd Place with animated 3D podium and confetti.
- Awards & Titles: *"Master Detective"*, *"Shadow Chameleon"*, *"Vote Magnet"*, *"Never Suspected"*, *"Tactical Champion"*.

---

## 🏗️ Architecture

```
imposter/
├── app/
│   ├── layout.tsx                     # Root layout with particles & SEO
│   ├── page.tsx                       # Landing home page
│   ├── create/page.tsx                # Game room creation screen
│   ├── join/page.tsx                  # Room join screen
│   ├── join/[roomCode]/page.tsx       # QR code direct scanner join
│   ├── game/[roomCode]/page.tsx       # Main multiplayer room shell
│   ├── demo/page.tsx                  # 6-Player Interactive Simulator
│   └── api/
│       └── game/
│           ├── create/route.ts        # POST: Create game room
│           ├── join/route.ts          # POST: Join game room
│           ├── [roomCode]/state/      # GET: Sanitized public state
│           ├── [roomCode]/secret/     # GET: Authenticated player secret
│           ├── [roomCode]/action/     # POST: State transitions & voting
│           └── [roomCode]/events/     # GET: Server-Sent Events stream
├── components/
│   ├── common/                        # Logo, Avatar, QR modal, Audio toggle, Header
│   ├── screens/                       # Lobby, SecretCard, Discussion, Voting, Results, Podium
│   └── game/                          # GameShell real-time sync container
├── data/
│   └── categories.ts                  # 10 categories with 30-50 words each
├── lib/
│   ├── audio/soundEffects.ts          # Web Audio API sound synthesizer
│   ├── services/
│   │   ├── scoringEngine.ts           # Pure tested scoring calculations
│   │   ├── stateMachine.ts            # State transition guards
│   │   └── gameService.ts             # Room code generation & validation
│   ├── store/
│   │   └── gameStore.ts               # Authoritative state store & engine
│   └── supabase/
│       └── client.ts                  # Supabase client helper
├── supabase/
│   ├── migrations/01_initial_schema.sql # PostgreSQL schema & RLS policies
│   └── seed.sql                       # 10 categories seed data
└── test/
    ├── scoring.test.ts                # Scoring formula unit tests
    ├── voting.test.ts                 # Vote validation rules tests
    ├── stateMachine.test.ts           # State machine transition tests
    ├── security.test.ts               # Secret isolation & RLS tests
    └── e2eIntegration.test.ts         # Full 5-round multiplayer integration test
```

---

## 🚀 Quick Start & Local Development

### 1. Clone and Install Dependencies

```bash
git clone <repo-url>
cd imposter
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

### 3. Run the 6-Player Interactive Sandbox Simulator

Visit [http://localhost:3000/demo](http://localhost:3000/demo) to test with 6 players (Alex, Sam, Jordan, Maya, Chris, Taylor) and 1-click test all voting & scoring mechanics.

---

## 🧪 Testing

Run the Vitest test suite covering scoring formulas, vote validation, state machine transitions, secret isolation, and full 5-round flow:

```bash
npm test
```

---

## 🗄️ Supabase PostgreSQL Setup (Optional for Production)

If you'd like to persist data to a remote Supabase Postgres database:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations in `supabase/migrations/01_initial_schema.sql` in the Supabase SQL Editor.
3. Run `supabase/seed.sql` to populate the 10 categories and words.
4. Copy `.env.example` to `.env.local` and add your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

*Note: If no Supabase credentials are provided, the app automatically runs in zero-config standalone mode using the high-performance built-in realtime state engine.*

---

## 🚢 Deploy to Vercel

1. Push code to your GitHub repository.
2. Import project into [Vercel](https://vercel.com).
3. (Optional) Add your Supabase environment variables in Vercel project settings.
4. Deploy! Next.js App Router and Edge/Serverless functions deploy automatically.

---

## 📄 License

MIT
