# SeatSync — Build Plan

A dark sci-fi cinema terminal for Bengaluru movie waitlists, powered by Supabase realtime.

## 1. Backend (Lovable Cloud / Supabase)

Enable Lovable Cloud, then create schema via migration:

**Table `seats`**
- `id` text PK (e.g. `A1`)
- `row_label` text, `seat_number` int
- `status` text default `'available'` (`available` | `locked`)
- `locked_by` text nullable
- `locked_at` timestamptz nullable
- `expires_at` timestamptz nullable

**Table `waitlist`**
- `id` uuid PK default `gen_random_uuid()`
- `seat_id` text FK → `seats.id`
- `phone` text
- `position` int
- `joined_at` timestamptz default `now()`
- `notified` bool default false

**Grants + RLS**: enable RLS, grant `SELECT/INSERT/UPDATE` to `anon` + `authenticated` (demo app, no auth). Enable realtime replication on both tables (`ALTER PUBLICATION supabase_realtime ADD TABLE seats, waitlist;` + `REPLICA IDENTITY FULL`).

**Seed**: insert 192 seats (rows A–L × 1–16) all `available`.

## 2. Design system (`src/styles.css`)

Replace token palette with neon terminal theme:
- `--background: #000000`, panels `#0d0d0d` / `#121212`
- `--primary` neon cyan `#00f0ff`, `--secondary` neon violet `#bf00ff`
- Seat state tokens: `--seat-available #00ff88`, `--seat-locked #ffcc00`, `--seat-selected #00f0ff`
- Utility classes: `.glow-cyan`, `.glow-green`, `.glow-amber` (text/box-shadow), `@keyframes pulse-amber` for locked seats
- Load **Orbitron** + **Space Mono** via `<link>` tags in `__root.tsx` head (not `@import` in CSS). Add `--font-display: "Orbitron"`, `--font-mono: "Space Mono"` in `@theme`.

## 3. Routes

- `/` → **Movie Browser** (replaces placeholder index)
- `/show/$showId` → **Seat Picker** for the selected showtime

Admin demo panel is a floating component rendered on the seat picker route (and optionally globally).

## 4. Data layer

Client-only Supabase usage (no auth). Use existing `@/integrations/supabase/client`.

Helpers in `src/lib/seats.ts`:
- `fetchSeats()` — list all 192
- `lockSeat(id)` — set status=locked, locked_at=now, expires_at=now+2min
- `releaseSeat(id)` — set status=available, clear lock fields; then read next waitlist entry, mark notified, return phone/position for toast
- `joinWaitlist(seatIds[], phone)` — for each seat compute next position (count existing rows) and insert; return positions
- `getWaitCountForShow()` — count waitlist rows (used for "X people waiting")

React Query keys: `['seats']`, `['waitlist', seatId]`.

## 5. Movie Browser view

Hardcoded array of 8 movies (Alpha, Toy Story 5, Minions & Monsters, Nagabandham, Kantara Chapter 2, Devara Part 2, Coolie, Bagheera) with genre, 2–3 Bengaluru theatres (PVR Orion, INOX Garuda, Cinepolis Nexus, PVR Forum), showtimes. Each showtime chip shows a live "N waiting" count derived from `waitlist` rows (query grouped by seat count total, split per showtime deterministically for demo). Click a showtime → navigate to `/show/{movieSlug}-{time}`.

Neon card grid, Orbitron titles, cyan glow on hover.

## 6. Seat Picker view

**Layout**
- Curved SCREEN bar at top with cyan underglow ("SCREEN THIS WAY")
- 12 rows (A–L), 16 seats each, split into 3 blocks: 5 / 6 / 5 with aisle gaps
- Perspective: each row further from screen scaled ~1% wider (transform: scaleX) to fan out
- Row label on both sides in Space Mono

**Seat rendering**
- Green glow if `available`
- Amber pulsing + countdown `MM:SS` above seat if `locked` (timer computed from `expires_at`, ticks with 1s interval; when it hits 0 the client that owns the tick calls `releaseSeat`)
- Cyan glow if in local `selected` set
- Click toggles selection (max 8; toast if exceeded)

**Right panel** (`#0d0d0d` card, cyan border)
- Selected seat chips (removable)
- Phone input (10-digit validation, `+91` prefix shown)
- "JOIN WAITLIST" button (disabled until ≥1 seat + valid phone)
- On submit → `joinWaitlist`, show cyan toast per seat: `You're #N in queue for A4`, clear selection

**Realtime**
- `supabase.channel('seats').on('postgres_changes', { event: '*', table: 'seats' }, ...)` invalidates `['seats']` and diffs old/new:
  - `available → locked` → amber toast "Seat X locked — releases in 2 min"
  - `locked → available` → green toast "Seat X is now FREE!"

## 7. Admin demo panel

Floating bottom-right card, amber border + glow, Orbitron header "ADMIN // DEMO":
- Seat dropdown (all 192)
- "LOCK SEAT (2 MIN)" → `lockSeat`
- "RELEASE SEAT NOW" → `releaseSeat`; if a waitlist entry exists, toast "Would notify {phone} (#1 in queue for {seat})"

## 8. Toasts

Use sonner (already in template). Custom styled variants via `toast.custom` or `toast.success/warning` with `style` overrides for cyan / green / amber neon.

## 9. Countdown auto-release

`useCountdown(expires_at)` hook returns `mm:ss`. A single `SeatGrid`-level effect watches locked seats; the first client to observe `expires_at <= now` calls `releaseSeat(id)` (idempotent — only updates if status still `locked`). Realtime propagates to everyone else.

## 10. SEO / head

Update `__root.tsx` head: title `SeatSync — Bengaluru Cinema Waitlist`, matching description, og/twitter. Add Orbitron + Space Mono `<link>` preconnects and stylesheet.

## Technical notes

- All Supabase calls are client-side (public demo, no auth) — RLS policies allow anon read/write on both tables for the demo.
- Realtime requires `REPLICA IDENTITY FULL` so we get `old` payloads for status diffing.
- Countdown uses `expires_at` from DB (server truth), not local timer, so all clients agree.
- Seat "fan-out" done with per-row `transform: scaleX(1 + rowIndex*0.012)`.
- Home route becomes the movie browser (replaces the blank-app placeholder per index-placeholder rule).

Ready to build on approval.