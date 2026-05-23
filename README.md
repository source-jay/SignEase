# SignEase

Progressive Web App that converts American Sign Language (ASL) into text and speech in real time.

**Tagline:** Turning Sign Language into Voice, Instantly

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (auth, database, storage, realtime)
- **AI (later phases):** MediaPipe, TensorFlow.js, OpenAI, Web Speech API

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- [Supabase](https://supabase.com) project

### Install and run

```bash
npm install
cp .env.example .env   # then add your Supabase URL and anon key
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Copy **Project URL** and **anon public** key into `.env`.
3. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor (or use Supabase CLI).

### Authentication (Phase 2)

In the Supabase dashboard for your project:

1. **Authentication → URL configuration** — add redirect URLs:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/profile-setup`
   - `http://localhost:5173/reset-password`
2. **Authentication → Providers → Google** — enable Google and add OAuth client credentials from [Google Cloud Console](https://console.cloud.google.com/).
3. **Authentication → Email** — confirm whether email confirmation is required for sign-up (if enabled, users must verify email before signing in).

## Auth flow

| Route | Screen |
|-------|--------|
| `/` | Splash (3s) → onboarding, login, or dashboard |
| `/onboarding` | 4-step intro + camera/mic permissions |
| `/login` | Email/password + Google |
| `/signup` | Registration + terms |
| `/reset-password` | Reset link + new password (recovery) |
| `/profile-setup` | Name + accessibility preferences (saved to `profiles`) |
| `/dashboard` | Protected home (after auth + profile setup) |

## Project structure

```
src/
  components/   # UI and layout components
  pages/        # Route-level screens
  hooks/        # Custom React hooks
  services/     # API clients (Supabase, etc.)
  utils/        # Constants and helpers
  types/        # TypeScript types
  assets/       # Static assets
  lib/          # shadcn utilities
```

## Git branching strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready releases |
| `develop` | Integration branch for completed phases |
| `feature/*` | Individual features (e.g. `feature/phase-2-auth`) |

Workflow: branch from `develop` → PR into `develop` → merge to `main` at milestones.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Development phases

1. **Project setup** — tooling, design system, Supabase client
2. **Authentication** — splash, onboarding, login, signup, OAuth, protected routes
3. **UI/UX foundation** (current) — app shell, navigation, theme, accessibility, PWA
4. Camera & hand tracking
5. Sign recognition AI
6. Text-to-speech
7. Translation pipeline
8. History & favorites
9. AI assistant
10. Accessibility & performance

## License

Private — all rights reserved.
