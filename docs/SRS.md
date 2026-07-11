# Momenta — Software Requirements Specification

Status: Draft v1.0 — awaiting approval before Milestone 1 begins
Owner: Product/Eng (you) + AI technical lead (this document)
Related: [Brand system artifact](https://claude.ai/code/artifact/c23374c7-ba52-4470-b26c-042a45ef1701) — logo, palette, type, 8-animal plush companion family

---

## 1. Product Vision

Momenta turns "asking someone out" into a small, shareable moment instead of a text message. A sender builds a personalized invitation card (mascot companion, message, theme), sends a link, and the recipient responds through a playful, low-stakes interaction (including a funny decline loop) that — if accepted — collects a date, time, and activity, finds a venue, checks the weather, and drops it on a calendar. No app install required for the recipient.

Design principle carried through every decision below: **the sender needs an account; the recipient never does.** That asymmetry is the hardest constraint in the system and shapes auth, security, and data model choices throughout.

---

## 2. Scope

### 2.1 In scope for MVP (from brief, confirmed)
Auth (Supabase), profiles, invitation builder, shareable public invitations, decline-loop, accept flow (date/time/activity), sender notifications, invitation history, Find a Spot (OpenStreetMap — see D5), calendar export (.ics), weather.

### 2.2 Recommended additions
These aren't in the original brief but are cheap now and expensive to retrofit later. Flagged individually so you can accept/reject each:

| Addition | Why | Cost to add now |
|---|---|---|
| Public share token distinct from row ID | Prevents guessing/enumerating other people's invitations (IDOR) | Trivial — one column |
| Plain-text + emoji/sticker messages only, no rich HTML | The personal message is user content rendered to a stranger with no auth wall — the single biggest XSS surface in the app. Removing HTML removes the risk class entirely | Trivial — it's the natural builder UX anyway |
| Response idempotency + status-transition guard | Recipient can open the link twice (two tabs, link preview bots) — without this, "declined" can silently flip back to "pending" | Small — one server-side check |
| Supabase Realtime on notifications | "Sender sees it immediately" is in the spec; polling can't do that cheaply, Realtime can | Small, same DB table either way |
| Venue result caching | Nominatim/Overpass (OSM, see D5) are free but rate-limited fair-use public services; caching identical searches keeps us comfortably inside their limits and makes repeat searches fast | Small — one table |
| Basic rate limiting on the public respond endpoint | Public, unauthenticated, mutating endpoint — an obvious spam/abuse target | Small |
| Error tracking (Sentry or Vercel Observability) | You will not find out about production bugs from users of a dating-adjacent app — they'll just leave | Small, one integration |

### 2.3 Explicitly deferred (confirm you agree)
- Animations/music on invitations (already marked future in brief)
- Email/push notifications (in-app only for MVP, per brief)
- Google/Apple Calendar live sync (`.ics` only for MVP, per brief)
- Admin-managed mascot/activity catalog (both ship as versioned code config, not DB tables, for MVP — see §6.4)
- Recipient identity verification ("prove you're actually the person invited") — see Risk R1

---

## 3. Personas

**Sender** — has an account, initiates. Wants the ask to feel thoughtful without much effort, wants to know the moment it's answered.

**Recipient** — no account, arrives via link (usually from a messaging app). Wants the card to load fast, feel obviously personal (not spam), and be trivially easy to respond to on a phone.

---

## 4. Functional Requirements

### 4.1 Authentication
- Email + password signup via Supabase Auth; verification email required before an account can send invitations (read-only/builder-draft access is fine pre-verification).
- Login, logout, password reset (Supabase-hosted flows, styled to match brand).
- No credential storage of our own — Supabase Auth owns hashing, tokens, sessions.

### 4.2 Profiles
- `display_name`, `email` (from auth), avatar (future — placeholder mascot avatar in MVP, see §6.4), account settings page (change display name, password reset trigger, delete account).

### 4.3 Invitation Builder
- Fields: title, personal message (plain text + emoji, length-capped), recipient name *(optional pre-fill only — see §4.4)*, mascot companion (one of 8, expandable), mood, background/palette theme, sticker decorations (fixed catalog).
- Draft autosave (row created on first edit with `status = draft`, not yet a live link).
- "Send" action: generates the public share token, flips status to `pending`, becomes read-only to the sender except for resending the link.

### 4.4 Sending / Public Access
- Public URL: `momenta-web.vercel.app/i/{share_token}` — token is a random ~24-char nanoid, not the row's primary key, not sequential.
- No auth required to view or respond.
- Page must be safe to prefetch: link-preview bots (iMessage, WhatsApp, Slack) will `GET` the URL to generate a preview — rendering must have zero side effects. All state changes are explicit `POST`s from a user click, never encoded in the URL itself.
- **Recipient name capture**: the first screen the recipient sees asks their name before showing the ask ("What should we call you?"). If the sender already pre-filled a guess, it's offered as a one-tap confirm, editable. The recipient-entered name is the value of record from that point forward — used in the greeting ("Hey {name} 👋"), the decline-loop copy, and the sender's notification/history views. This is what lets Momenta address the recipient correctly even when the sender only knew a nickname or got it wrong.

### 4.5 Decline Flow
- First "Decline" press → intercepted client-side, shows one of several playful reconsideration lines (not a real decline yet), mascot mood switches to `smirk`.
- Second press on the (re-labeled) decline → recorded as a real decline, status → `declined`, sender notified.
- Reject copy list is data-driven (array), easy to extend; no repeat line twice in a row (already prototyped in the brand artifact).

### 4.6 Accept Flow
- On accept: recipient picks activity (from expandable catalog), date, time.
- Writes an `invitation_responses` row; invitation status → `accepted`.
- Leads into Find a Spot (optional, can be skipped) and calendar export.

### 4.7 Sender Notifications
- In-app notification the moment a recipient responds (Realtime push, not polled), surfaced as a badge + notification list.
- Notification includes: recipient name, outcome, activity, date, time, and links to the full invitation.

### 4.8 Invitation History
- List of all invitations the sender created: recipient, created date, status (pending/accepted/declined — visually distinct, not color-only, for accessibility), and — once answered — activity/date/time.
- Click through to reopen full detail.

### 4.9 Find a Spot
- Filters: city, radius, price range, category, minimum rating, open-now.
- Results: name, rating, review count, price level, address, distance, hours, photos, directions link.
- All pricing shown in **South African Rand (R)** — Google's `priceLevel` (an 0–4 enum, not a currency amount) is mapped to an R-denominated band label (e.g. "R · Budget" … "R R R R · Splurge") rather than displayed as raw `$` symbols.
- Built behind a `VenueSearchProvider` interface (see §6.3) — OpenStreetMap (Nominatim geocoding + Overpass venue search, see D5) is the implementation, not a hard dependency baked through the UI layer.

### 4.10 Calendar
- `.ics` generation and download for the confirmed plan (venue, date, time) — same approach already proven in the example project's `downloadICS()`, generalized.

### 4.11 Weather
- Forecast, temperature, rain probability, icon for the confirmed venue + date.
- Provider: **Open-Meteo** — no API key, no billing, generous rate limits, sufficient accuracy for a "should I bring a jacket" widget. Revisit only if a future feature needs alerting or minutely data OpenWeatherMap/Tomorrow.io would justify a paid key for.

### 4.12 Navigation
Three tabs: **Create Invitation**, **Invitations**, **Find a Spot** — persistent app shell, mobile-first (most recipients and a fair share of senders will be on phones).

---

## 5. Non-Functional Requirements

- **Security**: RLS on every table; public data exposed only through narrow, purpose-built read paths (never a raw table select to `anon`); no HTML rendering of user content; rate-limited public mutation endpoints.
- **Performance**: public invitation page should be fast on mobile networks — mascots are SVG (already true in the brand system), no heavy client bundles gating first paint.
- **Accessibility**: WCAG AA contrast, status conveyed by icon+text not color alone, keyboard-operable builder and picker components (already true in the brand artifact's mascot picker).
- **Cost control**: this project runs on **0 capital** — every service must have a genuinely free tier the MVP can live on indefinitely, not just a trial. Confirmed free, no card required anywhere: Supabase (free project tier), Vercel (Hobby), Open-Meteo (no key, no billing), OpenStreetMap/Nominatim/Overpass (no key, no billing), GitHub.
- **Portability**: venue search and weather both sit behind interfaces so a provider swap is a new adapter, not a rewrite.

---

## 6. System Architecture

### 6.1 Stack (confirmed from brief)
Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Supabase (Postgres, Auth, Storage, Realtime) · Vercel hosting · OpenStreetMap (Nominatim + Overpass) · Open-Meteo.

### 6.2 Layering (clean architecture)

```
src/
  domain/            # entities, types, pure business rules — no framework imports
    invitation.ts
    response.ts
    mascot.ts
  application/        # use-cases: orchestrate domain + ports, framework-agnostic
    create-invitation.ts
    respond-to-invitation.ts
    search-venues.ts
  infrastructure/      # adapters implementing application ports
    supabase/          # repositories: InvitationRepository, ProfileRepository...
    openstreetmap/       # VenueSearchProvider implementation (Nominatim + Overpass)
    open-meteo/          # WeatherProvider implementation
    ics/                  # calendar file generator
  app/                    # Next.js routes — thin, call application layer only
    (marketing)/
    (app)/create/  invitations/  find-a-spot/
    i/[token]/               # public recipient experience
    api/                     # route handlers for public/webhook-style endpoints
  components/                # presentational, brand-system components (mascots, cards, buttons)
  design/                     # tokens ported from the brand artifact (palette, type, mascot registry)
```

Rule: `app/` and `components/` depend on `application/`; `application/` depends on `domain/` and *interfaces* defined in `domain/` or `application`, never directly on `infrastructure/` — infrastructure is injected. This is what makes "swap the venue search provider later" or "swap Supabase" a contained change instead of a rewrite.

### 6.3 Provider abstractions (why)
`VenueSearchProvider` and `WeatherProvider` are interfaces with one method each (`search(...)`, `getForecast(...)`). OpenStreetMap (Nominatim + Overpass) and Open-Meteo are the only implementations today, but nothing above the `infrastructure/` layer imports their client code directly. This directly satisfies the brief's "design so [the venue] API can later be replaced" — originally written with Google Places in mind, now paying off in the other direction (free provider now, paid/richer provider later is equally contained if ever wanted).

### 6.4 Mascots & activities: code config, not database, for MVP
Both are small, curated, change rarely, and ship with the app. Modeling them as a typed registry (exactly the `SPECIES` array pattern already built in the brand artifact) gets 90% of "modular/expandable" for near-zero complexity. Moving either to an admin-editable DB table is a clean, isolated future milestone if you later want non-engineers adding animals or activities without a deploy — not needed for MVP.

### 6.5 Data model

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id (fk auth.users)`, `display_name`, `avatar_mascot_id`, `created_at` | 1:1 with Supabase Auth user |
| `invitations` | `id`, `owner_id`, `share_token (unique)`, `recipient_name`, `title`, `message`, `design (jsonb)`, `status`, `created_at`, `expires_at` | `design` holds `{mascotId, mood, palette, background, stickers[]}` — versioned JSON so the theme engine can evolve without migrations |
| `invitation_responses` | `id`, `invitation_id (fk)`, `recipient_name`, `activity`, `response_date`, `response_time`, `decline_count`, `responded_at` | One row per invitation, written server-side only. `recipient_name` is captured from the recipient directly (§4.4) and is the name of record for notifications/history, overriding the sender's guess on `invitations.recipient_name` |
| `notifications` | `id`, `user_id (fk)`, `invitation_id (fk)`, `type`, `read_at`, `created_at` | Realtime-subscribed by the app shell |
| `venue_cache` | `id`, `cache_key`, `payload (jsonb)`, `fetched_at`, `expires_at` | TTL cache in front of Nominatim/Overpass to respect their fair-use rate limits and speed up repeat searches |

### 6.6 Row Level Security posture
- `profiles`, `invitations`, `notifications`: owner-only `select`/`update` (`auth.uid() = owner_id`). No `anon` access to these tables at all.
- Public invitation reads happen through a dedicated server-side read (Route Handler or RPC) that looks up by `share_token` and returns only the fields the recipient screen needs — never a client-side `select *` against `invitations`.
- `invitation_responses` inserts happen only through a server-side function that also (a) checks the invitation is still `pending`, (b) is idempotent per invitation, (c) is rate-limited. Never a direct client insert.

### 6.7 Branding wired at the architecture level
Palette, type stack, and the mascot SVG generator from the brand artifact become `design/tokens.ts` and `design/mascots.ts` in Milestone 1 — every screen after that consumes them rather than hardcoding colors, so the whole site stays visually consistent by construction, not by convention.

---

## 7. Risks & Edge Cases

| ID | Risk | Mitigation |
|---|---|---|
| R1 | Anyone with the link can respond — not verified as the actual invitee (link forwarded/screenshotted) | Accepted for MVP given the product's informal, low-friction nature; flag as a conscious trade-off, revisit only if abuse shows up |
| R2 | Link-preview bots (iMessage/WhatsApp) prefetching the URL could trigger state changes if not careful | All mutations are explicit POST from user interaction; `GET` is side-effect-free (§4.4) |
| R3 | Double-response race (two tabs, slow network double-tap) | Idempotent, status-guarded response write (§6.6) |
| R4 | Reopening an already-answered link should show the final state, not replay the interactive flow | Server checks `status` before rendering the ask/decline screens |
| R5 | Nominatim/Overpass are free public fair-use services (not paid, no SLA) — could rate-limit or degrade under real traffic | `venue_cache` TTL cache keeps repeat-query volume low; a proper identifying User-Agent header is sent per both services' usage policies; revisit a paid/self-hosted alternative only if usage genuinely outgrows fair-use |
| R6 | Stored XSS via the personal message field, shown to an unauthenticated stranger | Plain text + emoji + fixed sticker catalog only — no HTML ever rendered from user input |
| R7 | Spam account creation used to blast invitations | Email verification gate before send is enabled |
| R8 | Unbounded invitation lifetime (a link is valid forever) | Recommend `expires_at` (e.g. 30 days unanswered) — **open question, needs your call**, see §9 |
| R9 | Accessibility: playful palette (pink/gold) failing contrast on status indicators | Status shown with icon + text, not color alone; contrast-check gold-on-light combos specifically |
| R10 | ~~Google Maps Platform requires a billing-enabled Google Cloud account (card on file) even to use its free monthly credit~~ — **resolved via D5**: switched to OpenStreetMap, genuinely free, no card anywhere | Closed. Traded away ratings/review counts/price level/photos (OSM doesn't have this data) — recovered partially via an outbound "view on map" link per result to Google/Apple Maps for full details, at zero API cost |
| R11 | OSM data completeness (opening hours, address detail) varies significantly by region — generally solid for Johannesburg/major-city areas, patchier elsewhere | Missing/unparseable `opening_hours` shown as "hours unknown" rather than guessed; no silent wrong answers |

---

## 8. Milestones

Each milestone is independently demoable, endable in its own commit(s), and pushed before the next begins — per the workflow in your brief (explain → design → build → test → commit → push → then move on).

| # | Milestone | Delivers | Exit criteria |
|---|---|---|---|
| 1 | **Foundations & Auth** | Repo scaffold (Next.js/TS/Tailwind/shadcn), brand tokens + mascot registry ported from the artifact, Supabase project + schema + RLS, signup/login/logout/verify/reset, app shell with the 3 nav tabs stubbed | New user can sign up, verify, log in, see empty app shell, log out |
| 2 | **Invitation Builder & History** | `invitations` table, builder UI (mascot/theme/message), draft save, send → generates share token, Invitations list page | Sender builds and sends a real invitation, sees it in history as pending |
| 3 | **Public Invitation & Response Flow** | `/i/[token]` public page, decline loop, accept flow (activity/date/time), `invitation_responses` writes | A logged-out browser can open the link and accept or decline; status updates correctly |
| 4 | **Sender Notifications** | `notifications` table + Realtime, in-app badge/list, invitation detail view | Sender sees a live notification the moment the recipient responds, no refresh needed |
| 5 | **Find a Spot** | `VenueSearchProvider` + OpenStreetMap adapter (Nominatim geocoding, Overpass search), filters UI, results list (no embedded map — see D6), `venue_cache` | Sender can search, filter, and view real venues near a city, each linking out to Google/Apple Maps |
| 6 | **Calendar & Weather** | `.ics` export, Open-Meteo `WeatherProvider`, wired into the accept/celebration screen | Confirmed plan shows live weather and downloads a valid calendar file |
| 7 | **Hardening & Launch Readiness** | Rate limiting, RLS audit, accessibility pass, OG tags for share links, error tracking, empty/error states | App is safe to share publicly at small scale |

### Milestone 1 — status: done

Built: Next.js/TS/Tailwind/shadcn scaffold, the full brand system (logo, 8-species mascot registry, palette, self-hosted Baloo 2, system-aware dark mode) ported into the app, the 3-tab app shell, and Supabase Auth end-to-end (signup, login, logout, password reset) with a `profiles` table provisioned automatically via a DB trigger. Verified live: signup → profile-row creation → login → protected shell → logout → protected-route redirect.

Infrastructure: Supabase provisioned free-tier via the Vercel Marketplace integration (`vercel install supabase`), project linked to GitHub, Vercel project renamed to `momenta-web` to secure the stable `momenta-web.vercel.app` domain before any Supabase redirect URLs were configured against it.

**Two manual dashboard steps remain before the email-driven flows work with real inbox clicks** (can't be done via the CLI/API access this project has):
1. **Auth → Email Templates**: paste `docs/email-templates/confirm-signup.html` into "Confirm signup" and `docs/email-templates/reset-password.html` into "Reset Password". Both are already decorated (logo, brand gradient, on-brand copy) and already use the `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=...` link format the app's `/auth/confirm` route expects — the default templates use a different, incompatible link format.
2. **Auth → URL Configuration**: set Site URL to `https://momenta-web.vercel.app` and add both `https://momenta-web.vercel.app/**` and `http://localhost:3000/**` to Redirect URLs — otherwise Supabase rejects the redirect after verification (the exact gotcha this project has hit before with the wrong domain).

**Decision: kept link-click email confirmation instead of a "send a welcome email and let them straight in" flow.** The alternative was evaluated (send a branded welcome email via Resend, treat send-success as proof of a valid address, sign the user straight in with no click required) but every transactional email provider — Resend included — only allows sending to the account owner's own address until a domain you own is verified. `momenta-web.vercel.app` can't be verified since its DNS isn't ours to control, and buying a domain costs money, which conflicts with the 0-capital rule (§5, §9 D3). Given the choice between paying for a domain or keeping the free link-click flow, the free flow was kept — just decorated properly. `RESEND_API_KEY` is still provisioned in Vercel's env (free tier, unused for now) in case a future milestone (e.g. Milestone 4's deferred email notifications) wants it once/if a real domain exists.

Everything else — the account/session mechanics, RLS, the trigger, the protected routing — was verified directly against the real Supabase project (via the Admin API and a temporary confirmed test user, cleaned up after).

### Milestone 2 — status: done

Built: `invitations` table (owner-only RLS), the background/sticker registries (same parametric pattern as mascots), a shared `InvitationCard` component, and the builder itself — `/create` finds-or-creates one active draft per user, autosaves on a debounce, and shows a live preview next to the form. Sending validates the message, flips status to `pending`, stamps `sent_at`, generates the share link, and shows a "create another" path back into a fresh draft. `/invitations` lists everything (draft and sent) with an icon+text status badge and links through to a read-only detail view with the share link.

One deliberate simplification vs. a literal reading of the SRS: **one active draft per user**, not many concurrent drafts — landing on `/create` always resumes the same in-progress invitation rather than requiring a draft picker. Verified end-to-end against the live database (autosave persists, send transitions the row, history and detail pages reflect it immediately, a fresh draft appears on the next visit).

The share link shown after sending (`/i/{share_token}`) doesn't resolve yet — the public recipient page is Milestone 3 — the UI says so explicitly rather than implying it's live.

### Milestone 3 — status: done

Built: `invitation_responses` table (RLS: owner-readable via join, no anon/authenticated write policy at all — every write goes through `src/lib/supabase/admin.ts`, a service-role client used exclusively by this route), the activities registry (full list from the brief), and `/i/[token]` itself — name capture, the ask, the two-step decline (playful pushback, confirm), and accept (activity → date → time → confetti celebration). A "how many times they said no" counter carries from a decline-then-change-of-heart into the eventual accept.

Both `declineInvitation` and `acceptInvitation` do a single atomic `UPDATE invitations SET status=... WHERE share_token=... AND status='pending' RETURNING id` — this is the entire idempotency/race guard (R3), and it doubles as the "already answered" check with no separate read-then-write race window. Revisiting an answered link renders a read-only summary instead of replaying the interactive flow (R4); GET never mutates, so link-preview bots are inert (R2).

Verified end-to-end against the live database: full decline path, full accept path (including a decline → change-of-heart → accept that correctly carried the decline count), revisiting an already-answered link, an invalid token, and the sender's `/invitations` list/detail correctly showing the recipient's own name and the real activity/date/time once answered. No mobile layout issues found.

Rate limiting on these public write endpoints is intentionally still deferred to Milestone 7, as originally scoped — not forgotten.

### Milestone 4 — status: done

Built: `notifications` table (owner-only RLS, added to the `supabase_realtime` publication via migration SQL — no dashboard toggle needed), a notification created on both accept *and* decline (the brief only names accept, but the sender benefits either way and it's the same write path — flagged as a deliberate small addition), and a live `NotificationBell` in the header — Realtime subscription, toast on arrival, unread badge that clears on open.

Reads and the mark-as-read write go straight from the browser client, no server action needed — the existing owner-only RLS policies on `notifications` and `invitation_responses` (from Milestones 3) already permit exactly this from an authenticated session.

**Real bug found and fixed during testing**: `@supabase/ssr`'s cookie-based browser client does not automatically forward the session JWT to the Realtime client the way the plain localStorage-based `@supabase/supabase-js` client does. Without an explicit `supabase.realtime.setAuth(session.access_token)` call, `postgres_changes` silently evaluates RLS as unauthenticated and delivers nothing — no error on either side, which made it genuinely hard to spot (the channel subscribes successfully, the row inserts successfully, nothing looks wrong until you watch the actual WebSocket frames). Fixed by calling `setAuth` on session load and on every `onAuthStateChange` event. Verified with a real two-browser-context test: recipient responds in one context, the sender's already-open tab updates live with no reload.

### Milestone 5 — status: done

Built per D5/D6: a `VenueSearchProvider` backed by Nominatim (geocoding) and Overpass (venue search), both free and keyless, cache-backed via `venue_cache` (30d geocode / 24h search TTLs) to respect both services' fair-use limits. Activity categories reuse the same `ACTIVITIES` registry from Milestone 3 rather than a second taxonomy, each with an OSM tag mapping (a few are best-effort proxies — noted in-code, e.g. Hiking → `leisure=nature_reserve` since OSM has no clean "hiking POI" tag). "Open now" uses `opening_hours.js` rather than a hand-rolled parser for what is genuinely a small DSL. The Find a Spot page itself: city/activity/radius/open-now filters, a results list (no embedded map, per D6) with distance and hours, each result linking out to Google Maps.

Two real bugs found and fixed during testing, both before shipping:
1. `isOpenNow` was being computed once at fetch time and cached for up to 24h alongside the venue data — a place correctly "open" when cached would keep showing as open for the rest of the cache's life even after closing. Fixed by always recomputing from the cached `opening_hours` string at read time.
2. A live Nominatim connection timeout during testing produced an unhandled 500 instead of a graceful message — network failures now raise a distinct `VenueProviderUnavailableError`, caught and shown as a friendly "temporarily unavailable, try again" rather than crashing the page.

Also caught mid-testing: the placeholder text's own suggested query format ("Sandton, Johannesburg") resolves far less precisely in Nominatim than the plain suburb name — fixed the copy after confirming with real geocode calls.

Verified end-to-end against the live public services near Sandton, Johannesburg: real venue names/addresses, correct distance sorting, the open-now filter genuinely excluding closed places, a cached repeat search dropping from ~4s to ~130ms, and graceful handling of both a not-found place and a simulated outage.

---

## 9. Decisions Log

| # | Decision | Resolution |
|---|---|---|
| D1 | Source of truth repo | `https://github.com/ElijahBopape/momenta.git` |
| D2 | Currency | All prices shown in ZAR (R), never $ |
| D3 | Budget | 0 capital — free-tier-only services everywhere, no card on file anywhere |
| D4 | Recipient naming | Recipient supplies/confirms their own name at the start of the public flow (§4.4); it becomes the name of record |
| D5 | Venue search provider | OpenStreetMap (Nominatim + Overpass), not Google Places — resolves R10, keeps D3 intact. Traded away ratings/reviews/price level/photos (OSM has none of this); recovered partially via an outbound "view on map" link per result |
| D6 | Find a Spot map display | Results list only, no embedded interactive map — each result links out to Google/Apple Maps instead. Avoids adding Leaflet + a map-tile provider signup for a v1 |

## 10. Open Questions (need your decision as they come up)

1. Should invitations expire if unanswered (R8)? If yes, what's the default — 30 days?
2. Any real venue/city constraint for MVP (brief's example project was Johannesburg-specific) — worldwide from day one, or launch scoped to one city/region?
