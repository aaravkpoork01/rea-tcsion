# Architecture

## Overview

One process, no dependencies. The server dispatches in this order inside
`src/app.mjs`:

1. `/admin*` → static admin SPA from `src/ui/admin/`
2. a route-table match (`src/http/router.mjs`) → handler
3. otherwise → the static mirror in `raw/` (with `/OnlineAssessment/*`
   rewritten to `/` so absolute paths inside the mirror resolve)

```
raw/  (mirror, web root)
  index.html, instructions.html, quiz.html, FeedBack.html, close.html, …
  js/exam/      client state modules (dom, api, store, sync, scorecard)
  js/ion-bridge.js      composition entry
  js/feedback-bridge.js feedback persistence

src/
  server.mjs    process entry: config → seed → http → graceful shutdown
  app.mjs       dispatcher (routes, admin UI, mirror fallback)
  core/         cross-cutting primitives
  db/           schema, connection helpers, seed, repositories/
  domain/       pure business rules (no HTTP shapes)
  services/     orchestrates repos + domain, owns rules
  http/         request plumbing (router, body, cookies, static, respond)
  http/routes/  endpoint tables per surface
  ui/admin/     admin SPA (static HTML/JS/CSS, calls /api/admin)
```

## Layer rules

- **Repositories** (`src/db/repositories/*.mjs`) contain raw SQL only. They
  never throw application errors and never read HTTP input.
- **Domain** (`src/domain/*.mjs`) holds pure rules: answer normalisation,
  scoring, attempt state transitions, paper import. It returns plain values
  and throws `AppError` for rule violations.
- **Services** (`src/services/*.mjs`) compose repos + domain into use cases
  (sign-in, backup, finalise, admin actions). They throw `AppError` and never
  touch `req`/`res`.
- **HTTP** (`src/http/`) parses requests, calls a service, and renders the
  response. Errors become `{ ok:false, error, code }` via `respond.mjs`.
- **Client** (`raw/js/exam/`): `store.js` owns all `mockVar` access and
  dirty tracking; `api.js` owns every endpoint; `sync.js` owns the autosave
  timer and lifecycle flushes; `scorecard.js` owns completion wrapping;
  `dom.js` is tiny DOM helpers. `ion-bridge.js` only wires them together.

## Error handling

Services throw `AppError(message, status, code)` from `src/core/errors.mjs`.
`sendFromError` in `respond.mjs` maps them to status codes and logs 5xx at
`error` level, everything else at `debug`. The route handler therefore never
contains try/catch plumbing.

## State management

Server-side, the attempt row is the source of truth: `state_json` holds the
client snapshot, `answered`/`current_group`/… are derived columns kept in
sync by `persistSnapshot`. Client-side, `ExamStore` is the single reader of
`mockVar` for persistence purposes and decides when a snapshot is dirty, so
the autosave timer only posts real changes.

`MockCandResponseHandler` writes are skipped for closed attempts
(`submitted`/`invalidated`/`locked`/`expired`) except the final write;
`finaliseAttempt` is idempotent and freezes the candidate session.

## Configuration

`config/index.mjs` loads `.env` once and exports a frozen config object.
Every other module imports config; nothing else reads `process.env`. Paths in
`.env` are resolved relative to the project root.

## Presentation settings

Admin-editable branding, top-bar and tool settings live in the key/value
`settings` table. `src/domain/ui-config.mjs` owns the defaults and validation
(`MODES = auto | show | hide`); `settings.service.mjs` merges the stored rows
over those defaults and exposes `candidateConfig()` for the public
`GET /IBA/api/config`. Stored JSON blobs are parsed defensively — corrupt data
falls back to defaults instead of breaking the candidate surface. The display
language list is stored but no longer exposed in the admin panel; it is applied
only to the in-exam selectors (the login page picker and the candidate-profile
language rows are hidden). Custom top-bar
buttons follow the same rule: the client still renders any stored `custom`
entries, and a settings save passes them through untouched, but there is no
panel control for them.

On the client, `raw/js/exam/ui-config.js` is the only module that applies those
settings. It never edits `top.js`; it wraps the stock nodes:

- **Labels** — caption spans are rewritten only when the admin label differs
  from the stock default, so engine localisation stays intact.
- **Visibility** — `hide` sets `data-ion-hide-<key>="1"` on `<html>` and the
  injected stylesheet pins matching selectors with `display:none !important`.
  This survives nodes the engine re-creates or re-shows with an inline
  `display` (highlighter icons are the known case).
- **Order** — the stock toolbar sequence is re-imposed after every pass;
  fullscreen and custom buttons are inserted at the left edge so the
  right-aligned stock cluster never shifts.
- **Languages** — only labels are rewritten (QP language options keep their
  numeric values), so relabelling Tamil → Gujarati does not change indexing.

A known engine crash is guarded here too: `.auditlogButton` nodes with an empty
`id` make the stock click handler throw `jQuery("#")`, which breaks the
typing-test submit. `ui-config.js` backfills ids during `apply()` and from a
capture-phase click listener (runs before the engine's own handler), assigning
`finalTypingSub` when that id is free and `ionAuditBtn<n>` otherwise.

Multi-language paper uploads go through
`src/domain/paper-languages.mjs`: it rewrites `<languages>` /
`<SoftwareLanguages>`, merges `<lang>` blocks into the primary `quiz.xml`,
archives the originals under `languages/`, then re-imports the paper.

The engine caches paper XML in IndexedDB (`raw/js/cacheFiles.js`) keyed by file
name. The server's `getXMLPath` reply now reports the newest paper-file mtime as
`lastModified`, and `cacheFiles.js` appends that revision to the assessment
database name, so an edited or re-uploaded paper is re-fetched instead of being
served from a previous session's copy.

## Naming

- Files: kebab-case, suffixed by layer (`.repo.mjs`, `.service.mjs`,
  `.routes.mjs`).
- Modules export named functions; services expose one function per use case.
- Client globals are namespaced under `window.Exam*` to avoid colliding with
  the engine's globals.
- SQL identifiers are snake_case to match the schema.

## Database

Two backends, chosen at startup by `DATABASE_URL`:

| `DATABASE_URL` | Backend | Schema |
| --- | --- | --- |
| unset | SQLite via `node:sqlite`, WAL, `PRAGMA foreign_keys = ON`, file `data/ion.db` | `src/db/schema.sqlite.mjs` |
| set | Postgres/Neon via `@neondatabase/serverless` | `src/db/schema.mjs` (`PG_SCHEMA_SQL`) |

`src/db/dialect.mjs` is the single switch. `src/db/connection.mjs` exposes the
same async `run`/`one`/`all`/`transaction` surface to every repository, rewrites
`?` placeholders to `$1..$n` for Postgres, appends `RETURNING id` to inserts,
and strips Postgres casts such as `::numeric` for SQLite. Schema creation is
idempotent (`CREATE TABLE IF NOT EXISTS`) and runs once from `seed.mjs`. The
seed is idempotent too: it ensures the org, admin, assessment `M62` (imported
from the mirror paper XML) and demo candidate.

## What is intentionally untouched

`raw/js/top.js` is byte-identical to production. All engine integration
happens by wrapping globals from the bridge scripts, never by editing it.
