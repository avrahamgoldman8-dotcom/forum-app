# The Commons — a forums site with main forums & subforums

A community forum site inspired by the ivelt.com forum layout: **main forums**
containing **subforums**, each kept fully separate (their own thread lists,
their own URLs), plus an **All Activity** page that gathers every thread from
every forum into one feed — each entry still tagged with exactly which forum
it came from (brass tab = main forum, teal tab = subforum).

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Prisma +
PostgreSQL, and NextAuth (email/password).

## Features

- Main forums and subforums (unlimited subforums per main forum)
- Threads and replies, with pinned/locked support in the schema
- "All Activity" combined feed across every forum, tagged by source
- Email/password accounts (NextAuth, credentials provider)
- Admin role: the **first account ever registered becomes admin**
  automatically; admins get a "Manage" page to create/delete forums
- Server-rendered, no client-side API layer to maintain

## 1. Local setup

You'll need Node.js 20+ and a PostgreSQL database (local, Docker, or a free
hosted one like [Neon](https://neon.tech) or [Supabase](https://supabase.com)
— using the same hosted database for local dev is the simplest option).

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL and AUTH_SECRET
npx prisma migrate dev --name init
npm run db:seed      # optional: creates example forums + an admin login
npm run dev
```

Open http://localhost:3000.

If you ran `npm run db:seed`, sign in with:
- **Email:** admin@example.com
- **Password:** changeme123

Change that password (or delete the seed user and register your own — the
first real account you create is also auto-promoted to admin) before going
live.

If you skip seeding, register your own account from `/register` — since
it's the first account, it becomes admin automatically — then go to
`/admin/forums` to create your first main forum and its subforums.

## 2. How the forum structure works

- A **Forum** row with no parent is a **main forum**.
- A **Forum** row with a `parentId` pointing at a main forum is a
  **subforum**.
- Threads belong to exactly one forum (main or sub) — nothing is duplicated.
- `/` shows main forums as sections with their subforums nested underneath.
- `/forum/[slug]` shows one forum's own thread list (main forums also show
  links to their subforums).
- `/all` queries across every forum and lists the most recent threads
  site-wide, with a colored tab on each row identifying its forum — this is
  the "everything in one place, still separated" view you asked for.

Only admins can create or delete forums (`/admin/forums`), which keeps the
category structure from being reorganized by anyone else.

## 3. Deploying for real

The easiest path is **Vercel + Neon (or Supabase) Postgres** — both have
generous free tiers and this app needs nothing else.

1. Push this project to a GitHub repo.
2. Create a free Postgres database at neon.tech or supabase.com and copy its
   connection string.
3. Import the repo into [vercel.com](https://vercel.com/new).
4. In the Vercel project's Environment Variables, add:
   - `DATABASE_URL` — your Postgres connection string
   - `AUTH_SECRET` — a random string (`openssl rand -base64 32`)
5. Deploy. Then run the migration against your production database once,
   from your own machine:
   ```bash
   DATABASE_URL="<your production connection string>" npx prisma migrate deploy
   ```
6. Visit your live URL and register the first account — it becomes admin —
   then add your forums from `/admin/forums`.

Any host that runs Node.js works too (Railway, Render, Fly.io, your own
server) — the steps are the same: set `DATABASE_URL` and `AUTH_SECRET`, run
`npx prisma migrate deploy`, then `npm run build && npm start`.

## 4. Extending it

Natural next additions, roughly in order of usefulness:
- Edit/delete for your own posts and threads
- Email verification and password reset (NextAuth supports both)
- Moderator role with pin/lock/move-thread controls in the UI (the schema
  already has `pinned` and `locked` fields)
- Search across threads
- Pagination on `/all` and long forums (currently capped at the most recent
  75/threads per forum — fine for a new site, worth revisiting once it grows)
- Rich text or Markdown formatting for posts (currently plain text)

## Notes on this build

This was scaffolded and code-reviewed in a sandboxed environment without
access to Prisma's binary CDN, so the Prisma client couldn't be generated or
the database migration test-run here — that step is untested end-to-end.
Everything else (ESLint, and TypeScript across the whole app except the
Prisma-generated types themselves) checks out clean. `npx prisma migrate dev`
in step 1 above is a completely standard, well-trodden command — if anything
looks off when you run it, paste the error back and it's quick to fix.
