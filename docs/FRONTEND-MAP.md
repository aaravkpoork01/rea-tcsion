# Frontend map

How the candidate pages in `public/` connect to their CSS, JavaScript and the
server. Generated from a static scan of the served tree (`public/`, the same
bytes as `raw/`) plus the REA JavaScript application analysis.

Scan totals after Phase C: **467 files** — 9 candidate HTML pages + admin SPA,
**211 JavaScript files** (121 MB), **64 CSS files** (2.2 MB). The REA baseline
below analysed 224 artefacts (213 JavaScript sources + 10 HTML pages + the
inventory manifest) before the Phase C edits and before four dead vendor files
were removed. `js/CKMathEditor/` and `js/MathJax-3.2.2/` account for most of
the file count and bytes; the engine code is a small fraction of that.

## Pages

| Page | Role | JS | CSS | Inline scripts | Bridge modules |
|---|---|---:|---:|---:|---|
| `index.html` | Candidate login / launcher | 11 | 3 | 4 | `ui-config`, `candidate-identity`, `inspector-unlock` |
| `instructions.html` | General + group/section instructions | 26 | 11 | 4 | `ui-config`, `candidate-identity`, `session-guard`, `inspector-unlock` |
| `quiz.html` | Exam engine (all question types) | 76 | 39 | 12 | `dom`, `api`, `store`, `sync`, `ui-config`, `candidate-identity`, `session-guard`, `scorecard`, `ion-bridge`, `inspector-unlock` |
| `FeedBack.html` | Post-exam feedback form | 22 | 3 | 2 | `dom`, `api`, `store`, `ui-config`, `candidate-identity`, `feedback-bridge`, `inspector-unlock` |
| `photoVerification.html` | Photo capture / verification | 15 | 6 | 2 | `ui-config`, `inspector-unlock` |
| `error.html` | Error page | 11 | 4 | 2 | `ui-config`, `inspector-unlock` |
| `close.html` | Exit / thank-you page | 13 | 4 | 4 | `ui-config`, `inspector-unlock` |
| `iframesInstruction.html` | Instruction fragment for iframes | 4 | 1 | 1 | `ui-config`, `inspector-unlock` |
| `Calculator.html` | Complex calculator popup | 2 | 1 | 1 | `ui-config`, `inspector-unlock` |

`admin/index.html` is separate: it loads only `admin.css` + `admin.js` and
talks to `/api/admin/*`.

## How assets load

The stock engine does **not** use plain `<script src>` everywhere. Most
vendor/engine files are written at parse time:

```js
var jsVersion = '17.05.03.77';
document.write('<script src="js/top.js?v=' + jsVersion + '"><\/script>');
document.write('<link rel="stylesheet" href="css/style.css?v=' + jsVersion + '"\/>');
```

Each block is duplicated behind `if (sessionStorage.cdnPath == "")` — the
local branch (`js/...`) or the CDN branch (`cdnPath + "/js/..."`). Only one
branch executes. The `?v=` suffix is the cache-buster and is also used by
`js/cacheFiles.js`.

Consequences for any edit:

- Changing a file name/order must be done in the `document.write` block, not
  by adding a tag elsewhere; later engine code assumes the order.
- Several scripts are **commented out with `//` or `/* */`** in the original;
  they appear in source but never execute (see "Dead-code candidates").
- `js/top.js` must stay byte-identical. It dynamically loads
  `js/sketch.js` (scratchpad) and `js/jquery.ui.touch-punch.min.js` with
  `$.getScript`, so those are not statically listed.
- Phase C removed the IE-only vendor (`raphael.js`, `excanvas.js`,
  `jQueryRotate.js`) and the commented `oscZenoedited.js` calculator include.
  The matching IE8 branches in `quiz.html` and `canvas.js` now use only the
  modern jQuery `.rotatable()` path.

## Per-page assets

### index.html (login)

JS: `jquery-3.6.0.min`, `keyboard`, `bean`, `variableinitialiserfortop`,
`cacheFiles`, `top`, `jquery.cookie`, `candidateconsolechanges`,
`commonThemes`; static: `exam/ui-config`, `exam/candidate-identity`,
`exam/inspector-unlock`.

CSS: `style-login`, `keyboard`, `number_style`.

Inline blocks set `jsVersion`/`cdnPath`, build the opener window, and the
legacy IE warning. The Google Analytics snippet was removed in Phase C; the
identity module now fills the name, candidate ID and default-avatar slots.

### instructions.html

JS: jQuery `1.8.0 → migrate 1.4.1 → 3.3.0 → migrate 3.3.0 → 3.6.0`,
`jquery.cookie`, `keyboard`, `jquery.actual`, `bean`,
`variableinitialiserfortop`, `cacheFiles`, `text-to-speech`,
`accessibilityQuiz`, `top`, `candidateconsolechanges`, `RightToLeft`,
`popupwindow`, `jquery.jcarousel`, `jcarousel.connected-carousels`, `swiper`,
`iba-skinning`, `commonThemes`, `thickbox-compressed`, `jquery-ui-1.10.4`;
static: `exam/ui-config`, `exam/candidate-identity`, `exam/session-guard`,
`exam/inspector-unlock`.

CSS: `mock_style`, `style`, `keyboard`, `number_style`, `aecInstructions`,
`font-awesome`, `jcarousel.connected-carousels`, `popupwindow`, `swiper`,
`iba-skinning`, `jquery-ui-1.10.4.custom`.

The 40 KB inline block drives instruction pagination, time-on-page tracking
and the "I have read" gate.

### quiz.html (exam engine)

Static scripts (after the markup, so the engine can find the DOM):

```
js/CKMathEditor/ckeditor.js
js/exam/dom.js  js/exam/api.js  js/exam/store.js  js/exam/sync.js
js/exam/ui-config.js  js/exam/candidate-identity.js  js/exam/session-guard.js
js/exam/scorecard.js
js/ion-bridge.js
js/exam/inspector-unlock.js
```

Dynamic scripts (before/around the markup): three jQuery generations
(`1.8.0`, `3.3.0`, `3.6.0`) + both migrates, `jquery.cookie`, `bean`,
`dummyjs`, `forge.min`, `keyboard-oxford`, `jquery.accent-keyboard`,
`chillout`, `Reliable`, `variableinitialiserfortop`, `liveStreamMonitor`,
`cacheFiles`, `RightToLeft`, `text-to-speech`, `calculatorcopyandpaste`,
`html-magnifier`, `mouseTrail`, `screenMagnifier-AccessibilityTools`,
`accessibilityQuiz`, `top`, `watermark`, `Adaptive`, `britishCouncil`,
`Popper.min`, `jquery-ui`, `jquery-resizable`, `jquery.ui.touch-punch`,
`jquery.nanoscroller`, `jquery.corner`, `jquery.caret`, `virtual_keyboard`,
`jquery.actual`, `typing`, `restrictedTyping`, `codemirror` + modes,
`thickbox-compressed`, `jquery.ui.rotatable`, `jquery.jqzoom-core`,
`popupwindow`, `jquery.jcarousel`, `jcarousel.connected-carousels`,
`MediaStreamRecorder`, `iBA`, `candidateconsolechanges`, `scorm`,
`jquery.qrcode`, `qrcode`, MathJax `mml-chtml`, `jquery.slimscroll`,
`fabric.min`, `eraser_brush.mixin`, `canvas`, `paperAudioPlayer`,
`perfect-scrollbar.jquery`, `paper`, `swiper`, `iba-skinning`,
`video.min`, `commonThemes`, `livefeed/livefeed`.

CSS: 39 files — engine (`mock_style`, `style`, `quizStyle`, `aecInstructions`,
`iBAInterviewerScreens`, `iba-skinning`, `livefeed`), editors
(`codemirror`, `cobalt`, `elegant`, `cmstyle`), jQuery UI/plugins
(`jquery-ui`, `rotatable`, `jqzoom`, `jcarousel`, `nanoscroller`,
`perfect-scrollbar`, `thickbox`, `alerts`, `popupwindow`, `freetrans`),
accessibility (`keyboard-oxford`, `accent-keyboard`, `RightToLeft`,
`magnifier-accessibility`), drawing/media (`canvas-style`,
`paperAudioPlayer`, `paperUI`, `scratchpad`, `scribblePad`, `blackboard`,
`video-js`, `jplayer`), math (`swiper`), and `font-awesome`.

Inline hotspots: 105 KB review/submit + audit block, 28 KB candidate-console
setup, 8 KB keyboard/audit hooks, 6 KB splitter/resizable, 4.6 KB scratchpad,
4 KB launcher keys, plus the ruler/protractor helper (modern jQuery
`.rotatable()`; the IE8/Raphael branch was removed in Phase C).

### FeedBack.html

Static bridge: `exam/dom`, `exam/api`, `exam/store`, `exam/ui-config`,
`exam/candidate-identity`, `feedback-bridge`, `exam/inspector-unlock`.

Dynamic: jQuery trio + migrates, `jquery.cookie`, `script`, `bean`,
`variableinitialiserfortop`, `accessibilityQuiz`, `cacheFiles`, `top`,
`Reliable`, `candidateconsolechanges`, `jquery-ui`, `livefeed`.

CSS: `mock_style`, `style`, `livefeed`. `keyboard.css` is commented out in
the source, so the keyboard scripts run without their stylesheet.

### photoVerification.html

Static: `mockPhotoVerification/js/bootstrap.bundle.min`, `iON_Mouse_Trial`,
`jquery.jscrollpane.min`, `header`, plus `exam/ui-config`,
`exam/inspector-unlock`.

Dynamic (engine shell): `jquery-3.6.0`, `keyboard`, `bean`,
`variableinitialiserfortop`, `cacheFiles`, `top`, `jquery.cookie`,
`candidateconsolechanges`, `commonThemes`; and
`mockPhotoVerification/js/photograph-verification-lba` via `document.write`.

CSS: Bootstrap, `system-prerequisite-check`, `theme`, `jquery.jscrollpane`,
`header`, `photograph-verification-lba`.

Note: `mockPhotoVerification/js/jquery-3.7.0.min.js` is present but its tag is
commented out — the page runs on `jquery-3.6.0`.

### error.html

Dynamic only: jQuery trio + migrates, `ReportMain`, `jquery-e`,
`bootstrapError`, `jquery.cookie`, `cacheFiles`, `candidateconsolechanges`.
Static: `exam/ui-config`, `exam/inspector-unlock`.
CSS: `main`, `style`, `bootstrapError`, `styleError`.

### close.html

Dynamic only: jQuery trio + migrates, `jquery.cookie`, `keyboard`, `bean`,
`variableinitialiserfortop`, `cacheFiles`, `top`, `Reliable`,
`candidateconsolechanges`. Static: `exam/ui-config`, `exam/inspector-unlock`.
CSS: `mock_style`, `style`, `keyboard`, `number_style`.

### iframesInstruction.html

Static: `jquery-3.6.0`, `cacheFiles`, `RightToLeft`,
`candidateconsolechanges`, `exam/ui-config`, `exam/inspector-unlock`.
CSS: `aecInstructions`. The older jQuery 1.8 /
3.3 / migrate block is commented out.

### Calculator.html

Static: `complexCalculator`, `mathJSNew14_5_2.min`, plus `exam/ui-config` and
`exam/inspector-unlock`. CSS: `calclayout`. jQuery 1.9.1 is commented out, so
the calculator is vanilla JS + math.js. The commented `oscZenoedited.js`
include was deleted with the file in Phase C.

## Bridge layer (`js/exam/`, `js/*-bridge.js`)

| Module | Global | Responsibility |
|---|---|---|
| `exam/dom.js` | `ExamDom` | `visible`, `click`, `fire`, `byId`, `firstVisible`, `text`. Loaded on quiz/feedback but currently no caller. |
| `exam/api.js` | `ExamApi` | All server calls: backup, finalize, state, feedback, ping. |
| `exam/store.js` | `ExamStore` | Single source of client state: identity, `mockVar` snapshot, dirty check, resume overlay, finalize payload. |
| `exam/sync.js` | `ExamSync` | 8 s autosave timer + lifecycle flush. Started by `ion-bridge`. |
| `exam/scorecard.js` | `ExamCompletion` | Wraps the score-card/feedback transition; `ion-bridge` installs the final flush. |
| `exam/ui-config.js` | `ExamUiConfig` | Fetches `GET /IBA/api/config` and applies admin branding (favicon + login logo icon), top-bar visibility/labels/order, tool visibility, language list, custom buttons. |
| `exam/candidate-identity.js` | `ExamIdentity` | Fetches `/IBA/api/session`; fills candidate id/name/avatar slots (`.candId`, `.candId1`, `.userId`, `#profileRollId`, `#mockSubName`, `#mockSysNum`); sets `sessionStorage.roll_number`; never writes `.mockCandId` (watermark). |
| `exam/session-guard.js` | — | Only on `instructions.html`/`quiz.html`: probes `/IBA/api/session` and redirects to the launcher (or `error.html?E103`) when the attempt session is gone. Never guards `FeedBack`/`close`, which run after finalisation expires the session. |
| `ion-bridge.js` | — | Composition root for quiz: `refreshIdentity → ExamSync.start(8000) → ExamCompletion.install(submitFinalState)`. |
| `feedback-bridge.js` | — | Wraps `submitFeedback()`; collects `input[name^=ques]` radios and posts to `savecandfeedback` when the stock path would not. |
| `exam/inspector-unlock.js` | — | Stops the engine's `contextmenu`/right-mouse handlers so DevTools → Inspect works; `top.js` untouched. |

### Endpoints used by the browser

| Endpoint | Method | Used by |
|---|---|---|
| `/IBA/api/login` | POST | `index.html` login form |
| `/IBA/api/logout` | GET | candidate session |
| `/IBA/api/session` | GET | `index.html`, `ExamIdentity`, `session-guard` |
| `/IBA/api/config` | GET | `ExamUiConfig` (index, instructions, quiz, FeedBack) |
| `/IBA/api/state` | GET | `ExamApi.fetchState` (resume) |
| `/IBA/api/ping` | GET | `ExamApi` keep-alive |
| `/IBA/api/finalize` | POST (beacon) | `ion-bridge.submitFinalState` |
| `/IBACC/MockCandResponseHandler` | POST | `ExamApi.saveState` (backup upsert) |
| `/IBACC/act?action=savecandfeedback` | POST form | `feedback-bridge`, `ExamApi.saveFeedback` |
| `/IBACC/:action`, `/IBA/:action` | GET/POST | stock engine action surface |
| `/api/admin/*` | various | `admin/admin.js` (see `docs/API.md`) |

## Vendor inventory

- **jQuery lineage** — `jquery-1.8.0.min` (legacy pages), `jquery-3.3.0.min`
  + migrate 3.3.0, `jquery-3.6.0.min` + migrate 1.4.1, `jquery.js` (full,
  commented out). Plugins: UI 1.10.4, cookie, actual, caret, corner,
  jcarousel + connected carousels, nanoscroller, slimscroll, touch-punch,
  rotatable, resizable, jqzoom, thickbox, accelerate, alerts.
- **Editors** — CKEditor 4 custom build `js/CKMathEditor/` (FMathEditor
  plugin, moono-lisa skin), CodeMirror + javascript/active-line/matchbrackets
  modes.
- **Math** — MathJax 3.2.2 (`mml-chtml`), MathJS 14.5.2 (calculator).
- **Media** — video.js (`video.min.js` only), fabric.js 5.1.0, paper.js,
  MediaStreamRecorder, forge (crypto), QRCode.
- **Accessibility** — Oxford keyboard, accent keyboard, virtual keyboard,
  text-to-speech, html-magnifier, screen magnifier, mouse trail, RightToLeft.
- **TCS engine** — `top.js` (immutable), `iBA.js`, `Adaptive.js`, `scorm.js`,
  `watermark.js`, `livefeed`, `candidateconsolechanges`, `iba-skinning`,
  `accessibilityQuiz`, `britishCouncil`, `Reliable`.

## Dead-code candidates

Nothing below is loaded by a modern page. Confirm before deleting; several
files are referenced from commented-out blocks and can be removed with the
comment.

| File | Size | Evidence |
|---|---:|---|
| `js/video.js` | 2.07 MB | Quiz loads `video.min.js`; original tag explicitly commented "when the minified version is available original file should not be included". |
| `js/jwplayer.js` + `js/jwplayer.html5.js` | 284 KB | Quiz tags commented out. |
| `mockPhotoVerification/js/jquery-3.7.0.min.js` | 162 KB | Photo-verification tag commented out; page uses 3.6.0. |
| `js/jquery.js` | 100 KB | Instructions tag commented out; the three `.min` builds load instead. |
| `js/streamsaver/StreamSaver.js` + `zip-stream.js` | 17 KB | Quiz tags commented out. |
| `js/KeyboardLock.js` | 3 KB | FeedBack tags commented out. |
| `js/sketch.js` | 6 KB | **Not dead** — `top.js` `$.getScript` loads it for the scratchpad. |
| `js/exam/dom.js` | 1.2 KB | **Loaded but unused** — exports `ExamDom`, no caller in `public/`. |

### Removed in Phase C

`js/raphael.js` (91 KB), `js/excanvas.js` (41 KB), `js/jQueryRotate.js`
(14 KB) and `js/oscZenoedited.js` (44 KB) were deleted from both `public/`
and `raw/`. Their last references — the IE-conditional tags and the IE8
`Raphael` branches in `quiz.html` and `canvas.js` — were removed or collapsed
to the modern jQuery `.rotatable()` path. `js/top.js` was not touched.

CKEditor's `core/`, `plugins/` and `skins/` files look unreferenced in a tag
scan because the editor's loader pulls them at runtime from `config.js`;
they are not dead.

## Admin-connection status

Closed in Phase C:

- `ui-config.js` and `inspector-unlock.js` are loaded by **every** candidate
  page (login, instructions, quiz, feedback, photo verification, error,
  close, iframe instructions, calculator).
- `candidate-identity.js` fills the remaining hard-coded slots from
  `/IBA/api/session`; `mockCandId` (server candidate id, e.g. `C11111`) is in
  the login and session payloads and is also a searchable admin column.
- `session-guard.js` protects only `instructions.html` and `quiz.html`;
  `FeedBack.html`/`close.html` deliberately stay unguarded because
  finalisation expires the candidate session.
- The Google Analytics snippet is gone. The login header reads the admin
  brand name/icon. `LangXML/English.xml` is untouched by design: the identity
  module overwrites `#mockSubName`/`#mockSysNum` at runtime with the live
  assessment.
- Custom top-bar buttons are not editable in admin and are preserved on save;
  the settings service merges the stored `topbar.custom` when a caller omits
  it.

Remaining gaps:

- The Postgres/Neon path is structurally verified only; no `DATABASE_URL` was
  available for a live test. On Vercel, SQLite persistence is ephemeral
  (`/tmp`) — durable deployments need `DATABASE_URL`.
- `js/exam/dom.js` is loaded on quiz/feedback but has no caller.
- The legacy vendor candidates in the table above were not deleted because
  their tags are only commented out, not removed from the source pages.

## REA static reconstruction

REA 6.8.0 (`rea analyze-javascript-application --detail summary`) analysed the
pre-Phase-C `public/` tree. Baseline artifact digest
`99527316e20f5e0f48efe41fb1e8321ee4a88ebac3b1519a3add36a417e6a82c`; the
retained evidence bundle is `rea-public.evidence.json` (105,952,842 bytes,
record `ev_3c9f7f27f06f5e3b24dbd639e9ad648cb05a1bc2b7b0ad2254737b0142dcd0b1`).

Coverage:

- **213 JavaScript sources** (210 parsed), **583 modules**, **8,669 findings**,
  2,270,564 AST nodes and 13,127,291 bytes of source text.
- Syntax: 205 complete / 5 recovered / 3 not examined (`js/CKMathEditor/core/editable.js`,
  `htmldataprocessor.js`, `tools.js` — invalid UTF-8). Zero parse failures.
- Application graph: 272 unknowns; semantic graph: 23,672 unknowns (partial).
  Sources: 168 complete / 42 limited / 3 not examined.
- Electron surfaces: all zero — this is a browser application, not Electron.
- Route inventory: **0 URL patterns / 0 occurrences / 22 gaps**. The engine's
  jQuery `$.ajax` URLs are assembled dynamically, so they fall outside static
  extraction; source status is 205 complete / 5 partial / 3 unavailable.
- `js/top.js` has complete static facts, but its semantic analysis was not
  started (parent result budget). The bridge files have complete static facts
  and partial semantic coverage.

Limitations: the evidence predates the Phase C edits and is a baseline map,
not a live check. Inline scripts in `Calculator.html` (line 12) and
`FeedBack.html` (lines 10, 65) were not analysed; alias-selection expansion
was bounded at 512 states. Treat unavailable facts as unknown, not absent. The
endpoint table above comes from the static tag/`document.write` scan, not from
REA route extraction.
