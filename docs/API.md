# API reference

Conventions: JSON in/out. Success → `{ ok: true, … }`. Errors →
`{ ok: false, error: "<message>", code: "<code>" }` with a matching HTTP
status. List endpoints accept `?page=1&pageSize=25&q=term` and return
`{ total, page, pageSize, items }`.

## Candidate surface (mirrors the iON engine contract)

These endpoints exist because the stock engine (`raw/js/top.js`) already calls
them. Request/response shapes match what the engine expects.

### `POST /IBA/api/login`

Form-encoded `orgId`, `mockId`, `login`, `password`. Opens or resumes the
candidate's attempt, sets session cookies (`ion_cand`, `cand_master_id`,
`attemptId`, …).

```json
{
  "ok": true,
  "mockCandId": "C11111",
  "candidate": { "id": "C11111", "mockCandId": "C11111", "name": "Ravi Sharma", "login": "11111", "email": "…" },
  "attempt":   { "id": 3, "attemptNo": 3, "status": "in_progress", "resumed": false, "score": 0 },
  "assessment":{ "id": "M62", "orgId": "726", "name": "TCS iON Mock Assessment",
                 "basePath": "/per/g03/pub/726/ASM/OnlineAssessment/M62/",
                 "durationMin": 60, "showFeedback": 1, "questions": 47 }
}
```

### `GET /IBA/api/register/login-id`, `GET /IBA/api/register/check-login`

Public helpers for self-registration. `login-id` returns a fresh, unused
10-digit Login ID; `check-login?login=` validates one:

```json
{ "ok": true, "login": "9871737949", "valid": true, "available": true }
```

### `POST /IBA/api/register`

Public self-registration. JSON body:

```json
{
  "name": "Ravi Sharma",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "password": "…",
  "login": "9871737949",
  "photo": "data:image/jpeg;base64,…",
  "orgId": "726"
}
```

At least one of `email`/`phone` is required, `photo` is a required data-URL
image, and `login` may be omitted to have a 10-digit ID generated server-side.
The account is created with status `pending` and
`registration_source: "self"`; it cannot sign in until an administrator
approves it.

```json
{
  "ok": true,
  "candidate": {
    "id": "xRgiTm51zr", "login": "9871737949", "name": "Ravi Sharma",
    "status": "pending", "submittedAt": "…", "approvalDeadline": "…"
  },
  "message": "Your registration is awaiting administrator approval…"
}
```

Registrations are throttled to 5 submissions per IP per 10 minutes. An email or
phone already used by an active or pending account is rejected as a duplicate.

`POST /IBA/api/login` and `/IBA/api/login/verify` check the password first, then
refuse `pending` accounts with a message saying approval can take up to 24 hours,
and `rejected` accounts with the administrator's reason, before any attempt is
opened. `active` accounts behave as before; `inactive` accounts stay blocked.

### `GET /IBA/api/session`, `GET /IBA/api/logout`, `GET /IBA/api/ping`

Session probe, cookie clear + session destroy, and `{ ok:true, now }`.

`/IBA/api/session` returns `{ authenticated: false }` without a live attempt,
otherwise:

```json
{ "authenticated": true, "mockCandId": "C11111", "candidateId": "C11111", "attemptId": 3 }
```

`mockCandId` is the server candidate id (`candidates.id`), the same value the
admin console shows and searches. `exam/candidate-identity.js` and
`exam/session-guard.js` read it; the exam engine's `.mockCandId` watermark is a
separate random value and is never overwritten.

### `GET /IBA/api/state`

The signed-in attempt's persisted snapshot, for the client resume overlay.

```json
{ "ok": true, "resumed": true, "attemptId": 3, "status": "in_progress",
  "answered": 12, "updatedAt": "…", "snapshot": { "groups": [ … ] } }
```

### `GET /IBA/api/config`

Public presentation settings consumed by `raw/js/exam/ui-config.js`. No session
required.

```json
{
  "ok": true,
  "brand": { "name": "TCS iON", "mark": "iON", "icon": "", "adminTitle": "…", "adminSidebar": "…" },
  "topbar": {
    "items": { "useful_data": { "label": "Useful Data", "mode": "auto" }, "…": {} },
    "custom": [{ "id": "help", "label": "Help Desk", "href": "https://…", "mode": "show" }]
  },
  "tools": { "calculator": "auto", "highlighter": "hide", "…": "auto" },
  "languages": ["English", "Hindi", "Gujarati"]
}
```

`mode` is `auto`, `show` or `hide`. Unknown/corrupt stored values fall back to
the defaults in `src/domain/ui-config.mjs`.

### `GET /IBA/api/landing`

Public landing-page copy, logo and link targets. No session required.

```json
{
  "ok": true,
  "landing": {
    "pageTitle": "TCS iON Assessment Platform",
    "brandName": "TCS iON",
    "orgId": "726",
    "assessmentId": "M65",
    "heroTitle": "Focus on the exam.",
    "logo": "images/collegelogo.png",
    "…": "every text field shown on the landing page"
  }
}
```

Missing or invalid stored fields fall back to the defaults in
`src/domain/landing-config.mjs`. `orgId` and `assessmentId` are combined into
`index.html?<orgId>@@<assessmentId>` for the Login and Register links. `logo` is
either a site-relative path or an uploaded `data:` URL.

### `GET /IBA/api/assessments`

Public picker list for the sign-in page: active assessments only, in creation
order.

```json
{ "ok": true, "assessments": [{ "id": "M65", "orgId": "726", "name": "Exam Intelligence Mock Assement" }] }
```

The sign-in page requires one of these to be selected before Verify. Opening
`index.html?726@@M65` preselects that assessment; a bare `index.html?726` shows
an empty "Select assessment (mock)" option.

### `POST /IBA/api/finalize`

Closes the attempt: persists the final snapshot, scores it, expires the
candidate session. Body is `{ attemptId, candMasterId, orgId, mockId, score,
totalScore, mockScore, percentage }` (a full `mockVar` snapshot also works).
Idempotent — a second call returns the attempt unchanged.

### `POST /IBACC/MockCandResponseHandler` (also `/IBA/…`)

Autosave + final hand-off. Body: `{ AuditJSON, BackUp: <mockVar snapshot>,
BackUpParameters }`. When `BackUpParameters` contains `@@true@@` the attempt
is finalised. Returns `{ BackUpStatus: "success", attemptConfigFileDate,
quizPageLaunchTime, … }`. Non-final writes to closed attempts are ignored.

### `POST|GET /IBACC/:action` (also `/IBA/:action`)

Engine action dispatcher. Supported actions:

| Action | Notes |
| --- | --- |
| `getXMLPath?orgId&mockId` | Paper path descriptor incl. `validity: "Live"`, `xmlPath`, `quizPath`, `confPath`; `lastModified` is the newest paper-file mtime (client cache revision) |
| `getCandidateData?orgId&mockId&candMasterId&attemptNo` | Resume payload: `{ ResponseType: "CANDBACKUP", Response: <state_json>, quesPaper: <quiz.xml> }`, or `{ Error }` for closed attempts |
| `CandidateSubmit?attemptNo` | Finalises; returns the confirmation text |
| `updateInterruptions?attemptNo&noOfInterruptions&status` | Audit event |
| `saveAuditLog`, `saveScanAudit` | Body is a JSON audit payload (array or single entry) |
| `savecandfeedback?attemptNo&candMasterId…` | Form-encoded `candFeedback`; returns the average rating or `success` |

Unknown actions return `{}` so the engine can proceed.

### `GET /tools/:file`

Dev-only harness. `runner.js` maps to `tools/runner.inject.js` (headless exam
runner). Not used by the product UI.

## Admin surface (`/api/admin`, cookie session)

Auth: `POST /api/admin/login` `{ username, password }` → sets `ion_admin`
cookie; `POST /api/admin/logout`; `GET /api/admin/me`.
`GET /api/admin/health` needs no session.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/admin/overview` | Dashboard stats (incl. `stats.pendingApprovals`), recent attempts, live attempts |
| GET | `/api/admin/assessments` | Assessments with question/attempt/group counts |
| POST | `/api/admin/assessments` | Create an assessment (optionally imports its paper) |
| GET / PUT / DELETE | `/api/admin/assessments/:id` | Read, update, delete |
| POST | `/api/admin/assessments/:id/import` | Re-import paper XML from a base path |
| POST | `/api/admin/assessments/:id/papers` | Upload 1–3 language XML pairs: `{ papers: [{ code, quizXml, confXml }] }` (a single pair at top level also works); merges, archives and re-imports |
| GET | `/api/admin/questions?assessment=&q=&page=&pageSize=` | Search the question bank |
| GET / PUT | `/api/admin/questions/:id` | Read/update a question and its options |
| GET | `/api/admin/candidates?q=&page=&pageSize=` | List candidates (with attempt counts, best score); `q` matches name, login, email and candidate ID |
| POST | `/api/admin/candidates` | Create a candidate |
| POST | `/api/admin/candidates/import` | Bulk import from CSV (`login` column required) |
| GET / PUT / DELETE | `/api/admin/candidates/:id` | Read, update, delete |
| GET | `/api/admin/approvals?status=pending&q=` | Self-registration review queue (`pending` or `rejected`) with `counts` |
| GET | `/api/admin/approvals/count` | `{ counts: { pending, rejected } }` for the nav badge and dashboard |
| POST | `/api/admin/candidates/:id/approve` | Activate a `pending` or `rejected` registration |
| POST | `/api/admin/candidates/:id/reject` | Reject a `pending` registration; optional `{ reason }` (≤300 chars) shown to the candidate |
| POST | `/api/admin/candidates/:id/reset-password` | Set a new password |
| GET | `/api/admin/attempts?status=&assessment=&q=&page=` | List attempts |
| GET | `/api/admin/attempts/:id` | Attempt detail: candidate, responses, options, audit, feedback |
| DELETE | `/api/admin/attempts/:id` | Delete an attempt |
| POST | `/api/admin/attempts/:id/:action` | `force-submit`, `invalidate`, `lock`, `unlock`/`reopen`, `extend` (`{ minutes }`) |
| GET | `/api/admin/live` | Live in-progress attempts |
| GET | `/api/admin/results?assessment=` | Submitted results, ranked |
| GET | `/api/admin/feedback` | Recent feedback + per-assessment averages |
| GET | `/api/admin/audit?attempt=&pageSize=` | Audit trail (filtered or recent) |
| GET | `/api/admin/orgs` | Organisations |
| GET / PUT | `/api/admin/settings` | Key/value settings |
| GET | `/api/admin/export/results.csv` | CSV download |
| GET | `/api/admin/export/feedback.csv` | CSV download |
| GET | `/api/admin/export/candidates.csv` | CSV download |
| GET | `/api/admin/export/audit.csv` | Recent audit entries as CSV (1000 rows) |

`PUT /api/admin/settings` accepts `landing_config` (an object keyed by the fields
returned from `GET /IBA/api/landing`; blank values fall back to the built-in
defaults) and `landing_logo` (a PNG/JPEG/WEBP/SVG/ICO `data:` URL under 300 KB,
or `""` to restore the bundled logo). Both are edited under Settings → Landing
page and take effect on the public page immediately.

Candidate `status` is `active` (can sit exams), `inactive` (blocked),
`pending` (self-registered, awaiting approval) or `rejected`. Self-registered
candidates record `registration_source: "self"`, their submission time
(`submittedAt` in the registration response, `created_at` in queue rows),
`reviewed_at`, `reviewed_by` and `rejection_reason`; admin-created candidates
default to `registration_source: "admin"`. Only `pending`/`rejected`
registrations can be approved, and only `pending` ones rejected. Review actions
write `registration_approved` / `registration_rejected` audit events.

## Client modules (`raw/js/exam/`)

| Module | Global | Responsibility |
| --- | --- | --- |
| `dom.js` | `window.ExamDom` | visibility, click, by-id, text helpers |
| `api.js` | `window.ExamApi` | every endpoint + `postJson`/`postForm`/`beacon` |
| `store.js` | `window.ExamStore` | `mockVar` access, identity, dirty tracking, resume overlay |
| `sync.js` | `window.ExamSync` | 8 s autosave, hidden/pagehide flush, hydrate-on-load |
| `scorecard.js` | `window.ExamCompletion` | wraps `moveToScoreCardDisplay`/`moveToFeedback`, bypasses the score-validation popup |
| `ui-config.js` | `window.ExamUiConfig` | fetches `/IBA/api/config` and applies branding (favicon + login logo icon), top-bar labels/visibility/order, tool visibility, language labels; exposes `apply()`/`reload()` |
| `candidate-identity.js` | `window.ExamIdentity` | reads `/IBA/api/session`; fills candidate id/name/avatar slots, sets `sessionStorage.roll_number`; never writes the `.mockCandId` watermark |
| `session-guard.js` | — | instructions/quiz only: redirects to the launcher (or `error.html?E103`) when `/IBA/api/session` reports no live attempt |
| `ion-bridge.js` | — | composes the above; finalises once on completion |

Large state posts never use `keepalive`/`sendBeacon` (64 KiB quota) — only
the small finalize payload does. The runner in `tools/runner.inject.js`
exposes `window.__ktRun()` to answer one question per tick in a headless
browser run.
