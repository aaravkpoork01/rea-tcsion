# TCS iON Mock Assessment — Vercel & Self-Hosted Platform

A re-implementation of the TCS iON mock assessment experience ready for **Vercel** serverless deployment and local execution.
The candidate console is the offline mirror of the live site (`public/` / `raw/`), backed by Neon PostgreSQL persistence and a full admin back-office.

> `raw/js/top.js` and `public/js/top.js` are **byte-identical to production** (2,230,464 bytes, MD5 `590C529CDCBFD5B0899399BC15E8A58E`).
> All candidate UI, styling, and behavior remain 100% identical. Nothing in the candidate or admin UI visuals has changed.

---

## Deploy to Vercel

1. **Push this repository to GitHub / GitLab / Bitbucket**.
2. **Import into Vercel**:
   - Framework Preset: **Other**
   - Root Directory: `./`
3. **Add Environment Variable** in Vercel Project Settings:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g. from [Neon](https://neon.tech), Supabase, or any Postgres provider).
     ```
     DATABASE_URL=postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
4. **Deploy!**
   - Vercel automatically creates tables and runs seed data on first initialization.
   - Access candidate console: `https://your-vercel-domain.vercel.app/index.html?726@@M62`
   - Access admin panel: `https://your-vercel-domain.vercel.app/admin/`

---

## Local Run

Requirements: Node ≥ 22 (Node 22.5+ for `node:sqlite`).

```powershell
npm start
```

No environment variables are required. With `DATABASE_URL` unset the app uses a
local SQLite file (`data/ion.db`) created and seeded on first start.

To use Postgres instead, copy `.env.example` to `.env` and set:

```
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

The same code path then talks to Postgres/Neon; nothing else changes.

Default credentials:

| Role | Login | Password |
| --- | --- | --- |
| Candidate | `11111` | `Guest` |
| Admin | `admin` | `admin123` |

---

## Architecture & Vercel Structure

- `vercel.json` configures routing rewrites:
  - `/OnlineAssessment/(.*)` → `/$1`
  - Dynamic API routes (`/IBA/*`, `/IBACC/*`, `/api/admin/*`) → `api/index.mjs`
  - Static candidate pages and assets served from `public/` at CDN edge
- `api/index.mjs` — Vercel Serverless Function entrypoint dispatching requests through `src/app.mjs`.
- `public/` — Static mirror containing every HTML, CSS, JS, font, audio, video, and paper XML file intact.
- `public/admin/` — Admin single-page application.
- `src/db/connection.mjs` — dual-mode storage: `@neondatabase/serverless` when `DATABASE_URL` is set, `node:sqlite` (WAL) otherwise. Same async `run`/`one`/`all`/`transaction` surface for both.
- `src/db/schema.mjs` — Postgres DDL; `src/db/schema.sqlite.mjs` — SQLite DDL. `SCHEMA_SQL` resolves to the active dialect.
- `src/db/seed.mjs` — Auto-seeds organization `726`, admin `admin`, assessment `M62` from paper XML, and candidate `11111`.

---

## Candidate Flow

Login → Instructions → Group instructions → Quiz (8 groups, 47 questions) → Submit → Score card → Candidate Feedback → exit.
Exam state survives page refreshes and tab closures via periodic snapshots to `MockCandResponseHandler`.
