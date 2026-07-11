# momenta

Every great date starts with one good moment. Momenta turns "asking someone out" into a personalized, shareable invitation card — pick a plush companion, write your message, send a link. No account required to respond.

## Status

Milestone 1 (Foundations & Auth) complete: scaffold, brand system, app shell, and Supabase Auth (signup, email verification, login, logout, password reset) are live. See [`docs/SRS.md`](docs/SRS.md) for the full specification, architecture, data model, and milestone plan.

### Local setup

```bash
npm install
vercel env pull        # if not already linked: vercel link
npm run db:migrate     # applies supabase/migrations/*.sql
npm run dev
```

One manual step remains outside the codebase: the Supabase project's email templates need updating so confirmation/reset links include `token_hash` — see the note at the end of Milestone 1 in `docs/SRS.md`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres, Auth, Realtime) · Vercel · Google Maps Platform · Open-Meteo

## Development

```bash
npm install
npm run dev
```

## Project structure

- `src/app` — routes (App Router)
- `src/components/brand` — logo, mascot system, app shell
- `src/components/ui` — shadcn/ui primitives
- `src/design` — brand tokens and the mascot registry
- `docs/` — SRS and project documentation
- `example/` — throwaway prototype used as design inspiration (not part of the app, gitignored)
