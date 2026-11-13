/* Assessment admin console — vanilla JS, no build step. */
"use strict";

const state = {
  admin: null,
  view: "dashboard",
  assessmentId: "",
  questionsPage: 1,
  questionsSection: 0,
  questionsLang: 0,
  questionsTerm: "",
  candidatesPage: 1,
  attemptsPage: 1,
  resultsStatus: "submitted",
  resultsSelection: new Set(),
  liveTimer: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dt = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return esc(v);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};
const ago = (v) => {
  if (!v) return "—";
  const ms = Date.now() - new Date(v).getTime();
  if (!Number.isFinite(ms)) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(Number(v).toFixed(d)) : "—");
const fullscreenTime = (v) => {
  const total = Math.max(0, Math.round(Number(v) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};
const fullscreenToggles = (v) => {
  const n = Math.max(0, Math.round(Number(v) || 0));
  return n ? `${n}` : "0";
};
const DEFAULT_CANDIDATE_PHOTO = "/images/NewCandidateImage.jpg";

async function api(path, options = {}) {
  const res = await fetch("/api/admin" + path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { ok: false, error: text }; }
  if (!res.ok || data.ok === false) {
    if (res.status === 401 && state.admin) { showLogin(); throw new Error("Session expired."); }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function toast(message, kind = "") {
  const node = document.createElement("div");
  node.className = "toast " + kind;
  node.textContent = message;
  $("#toastRoot").appendChild(node);
  setTimeout(() => node.remove(), 3600);
}

function modal({ title, body, footer, wide = false, onClose = null }) {
  const root = $("#modalRoot");
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal ${wide ? "wide" : ""}">
        <div class="modal-head"><h3>${esc(title)}</h3><button class="x" data-close>&times;</button></div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ""}
      </div>
    </div>`;
  const close = () => {
    root.innerHTML = "";
    if (onClose) onClose();
  };
  root.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  root.querySelector(".modal-backdrop").addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("modal-backdrop")) close();
  });
  return { root, close };
}

function confirmDialog(message, confirmLabel = "Confirm") {
  return new Promise((resolve) => {
    // Append instead of replacing #modalRoot so a confirm opened from inside
    // another modal (for example the paper-upload dialog) does not destroy it.
    const root = $("#modalRoot");
    const overlay = document.createElement("div");
    overlay.className = "modal-backdrop";
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-head"><h3>Please confirm</h3><button class="x" data-no>&times;</button></div>
        <div class="modal-body"><p>${esc(message)}</p></div>
        <div class="modal-foot"><button class="btn" data-no>Cancel</button><button class="btn danger" data-yes>${esc(confirmLabel)}</button></div>
      </div>`;
    root.appendChild(overlay);
    const done = (value) => { overlay.remove(); resolve(value); };
    overlay.querySelector("[data-yes]").addEventListener("click", () => done(true));
    overlay.querySelectorAll("[data-no]").forEach((button) => button.addEventListener("click", () => done(false)));
    overlay.addEventListener("mousedown", (event) => {
      if (event.target === overlay) done(false);
    });
  });
}

const badge = (status) => `<span class="badge ${esc(status)}">${esc(String(status || "").replace(/_/g, " "))}</span>`;

// ---------------------------------------------------------------------------
// shell
// ---------------------------------------------------------------------------

function showLogin() {
  state.admin = null;
  $("#app").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  $("#loginForm [name=password]").value = "";
  $("#loginForm [name=password]").focus();
}

function showApp() {
  $("#loginScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#whoami").textContent = `${state.admin.name || state.admin.username} · ${state.admin.role}`;
  setView(state.view);
}

function adminInitials(value) {
  return String(value || "A").trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0] || "").join("").toUpperCase() || "A";
}

async function openProfile() {
  const admin = state.admin || {};
  const m = modal({
    title: "Admin profile",
    wide: true,
    body: `
      <div class="profile-head">
        <span class="profile-avatar">${esc(adminInitials(admin.name || admin.username))}</span>
        <div>
          <strong>${esc(admin.name || admin.username || "Administrator")}</strong>
          <div class="muted small">@${esc(admin.username || "")} · ${esc(admin.role || "admin")}</div>
        </div>
      </div>
      <form id="profileForm" class="grid2">
        <label>Full name<input name="name" value="${esc(admin.name || "")}" maxlength="80" required /></label>
        <label>Username<input name="username" value="${esc(admin.username || "")}" maxlength="40" required /></label>
        <label>Role<input value="${esc(admin.role || "admin")}" disabled /></label>
        <label>New password<span class="muted small">Leave blank to keep the current password</span><input name="password" type="password" minlength="6" autocomplete="new-password" /></label>
        <label>Confirm new password<input name="confirm" type="password" minlength="6" autocomplete="new-password" /></label>
      </form>
      <div class="profile-divider"></div>
      <div>
        <div class="profile-section-head"><strong>Administrators</strong><span class="muted small">All accounts that can sign in here</span></div>
        <div id="adminAccountList" class="admin-account-list"><span class="muted small">Loading…</span></div>
      </div>
      <details class="profile-add">
        <summary>Add another administrator</summary>
        <form id="addAdminForm" class="grid2">
          <label>Full name<input name="name" maxlength="80" required /></label>
          <label>Username<input name="username" maxlength="40" required /></label>
          <label>Temporary password<input name="password" type="password" minlength="6" required autocomplete="new-password" /></label>
          <label>Role<select name="role"><option value="admin" selected>admin</option></select></label>
        </form>
        <div class="row" style="margin-top:12px">
          <button type="submit" class="btn primary small" form="addAdminForm">Add administrator</button>
        </div>
      </details>
    `,
    footer: `<button type="button" class="btn danger" id="profileLogout" style="margin-right:auto">Sign out</button>
      <button type="button" class="btn" data-close>Cancel</button>
      <button class="btn primary" type="submit" form="profileForm">Save changes</button>`,
  });

  const renderAdmins = async () => {
    const target = m.root.querySelector("#adminAccountList");
    try {
      const data = await api("/admins");
      const rows = data.admins || [];
      target.innerHTML = rows.length ? rows.map((row) => `
        <div class="admin-account ${Number(row.id) === Number(admin.id) ? "current" : ""}">
          <span>${esc(row.name || row.username)}</span>
          <span class="muted small">@${esc(row.username)} · ${esc(row.role)}${Number(row.id) === Number(admin.id) ? " · you" : ""}</span>
        </div>`).join("") : `<span class="muted small">No administrators found.</span>`;
    } catch (e) {
      target.innerHTML = `<span class="muted small">${esc(e.message)}</span>`;
    }
  };

  m.root.querySelector("#profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password !== confirm) { toast("Passwords do not match.", "error"); return; }
    try {
      const result = await api("/me", {
        method: "PUT",
        body: {
          name: data.get("name"),
          username: data.get("username"),
          ...(password ? { password } : {}),
        },
      });
      state.admin = result.admin;
      m.close();
      showApp();
      toast("Profile updated.", "success");
    } catch (e) { toast(e.message, "error"); }
  });

  m.root.querySelector("#addAdminForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await api("/admins", {
        method: "POST",
        body: {
          name: data.get("name"),
          username: data.get("username"),
          password: data.get("password"),
          role: data.get("role"),
        },
      });
      form.reset();
      toast("Administrator added.", "success");
      renderAdmins();
    } catch (e) { toast(e.message, "error"); }
  });

  m.root.querySelector("#profileLogout").addEventListener("click", async () => {
    await api("/logout", { method: "POST", body: {} }).catch(() => {});
    m.close();
    showLogin();
  });

  renderAdmins();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  if (state.liveTimer) { clearInterval(state.liveTimer); state.liveTimer = null; }
  $("#topbarActions").innerHTML = "";
  const titles = {
    dashboard: ["Dashboard", "Overview of the assessment platform"],
    assessments: ["Assessments", "Create, configure and import assessment papers"],
    questions: ["Question bank", "Browse and edit questions, marks and answer keys"],
    candidates: ["Candidates", "Accounts, credentials and attempt history"],
    attempts: ["Attempts", "Every candidate attempt with responses and audit trail"],
    live: ["Live monitor", "Candidates currently writing the exam"],
    results: ["Results", "Scores and completion across attempts"],
    feedback: ["Feedback", "Candidate feedback after submission"],
    audit: ["Audit log", "Proctoring and lifecycle events"],
    settings: ["Settings", "Platform configuration"],
  };
  const [title, sub] = titles[view] || ["", ""];
  $("#viewTitle").textContent = title;
  $("#viewSub").textContent = sub;
  const render = {
    dashboard: renderDashboard,
    assessments: renderAssessments,
    questions: renderQuestions,
    candidates: renderCandidates,
    attempts: renderAttempts,
    live: renderLive,
    results: renderResults,
    feedback: renderFeedback,
    audit: renderAudit,
    settings: renderSettings,
  }[view];
  if (render) render().catch((e) => { $("#view").innerHTML = `<div class="card"><div class="card-body">${esc(e.message)}</div></div>`; });
}

// ---------------------------------------------------------------------------
// dashboard
// ---------------------------------------------------------------------------

async function renderDashboard() {
  const { stats, recent, live } = await api("/overview");
  const cards = [
    ["Candidates", stats.candidates],
    ["Assessments", stats.assessments],
    ["Attempts", stats.attempts],
    ["In progress", stats.inProgress],
    ["Submitted", stats.submitted],
    ["Feedback", stats.feedback],
    ["Questions", stats.questions],
    ["Average score", stats.avgScore + "%"],
  ];
  $("#view").innerHTML = `
    <div class="stats">
      ${cards.map(([k, v]) => `<div class="stat"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join("")}
    </div>
    <div class="split">
      <div class="card">
        <div class="card-head"><h3>Recent attempts</h3><button class="btn small" data-go="attempts">View all</button></div>
        <div class="card-body tight">
          ${recent.length ? `<div class="table-wrap"><table>
            <thead><tr><th>Candidate</th><th>Assessment</th><th>Status</th><th>Score</th><th>Fullscreen</th><th>Toggles</th><th>Started</th></tr></thead>
            <tbody>${recent.map((r) => `<tr class="clickable" data-attempt="${r.id}">
              <td>${esc(r.candidate)}<div class="muted small">${esc(r.login)}</div></td>
              <td>${esc(r.assessment)}</td>
              <td>${badge(r.status)}</td>
              <td class="num">${r.status === "submitted" ? `${num(r.score, 2)} / ${num(r.max_score, 2)} <span class="muted">(${num(r.percentage, 1)}%)</span>` : "—"}</td>
              <td class="num muted small">${fullscreenTime(r.fullscreen_seconds)}</td>
              <td class="num muted small">${fullscreenToggles(r.fullscreen_toggle_count)}</td>
              <td class="muted">${dt(r.started_at)}</td>
            </tr>`).join("")}</tbody></table></div>` : `<div class="empty">No attempts yet.</div>`}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Live now</h3><button class="btn small" data-go="live">Monitor</button></div>
        <div class="card-body tight">
          ${live.length ? `<div class="table-wrap"><table>
            <thead><tr><th>Candidate</th><th>Progress</th><th>Seen</th></tr></thead>
            <tbody>${live.map((r) => `<tr class="clickable" data-attempt="${r.id}">
              <td>${esc(r.candidate)}<div class="muted small">${esc(r.assessment)}</div></td>
              <td><div class="progress"><i style="width:${r.total_questions ? Math.round((r.answered / r.total_questions) * 100) : 0}%"></i></div>
                <div class="muted small">${r.answered}/${r.total_questions}</div></td>
              <td class="muted small">${ago(r.last_seen_at)}</td>
            </tr>`).join("")}</tbody></table></div>` : `<div class="empty">Nobody is writing right now.</div>`}
        </div>
      </div>
    </div>`;
  $("#view").querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.go)));
  $("#view").querySelectorAll("[data-attempt]").forEach((tr) => tr.addEventListener("click", () => openAttempt(Number(tr.dataset.attempt))));
}

// ---------------------------------------------------------------------------
// assessments
// ---------------------------------------------------------------------------

const DEMO_PAPER = {
  label: "Demo paper",
  csv: "/admin/demo/demo-questions.csv",
  xml: "/admin/demo/demo-quiz.xml",
};

const demoLinks = () => `<span class="demo-links"><strong>${DEMO_PAPER.label}:</strong>
  <a href="${DEMO_PAPER.csv}" download="demo-questions.csv">Download CSV</a>
  <span aria-hidden="true">·</span>
  <a href="${DEMO_PAPER.xml}" download="demo-quiz.xml">Download quiz.xml</a></span>`;

function fileText(input, label) {
  return new Promise((resolve, reject) => {
    const file = input.files && input.files[0];
    if (!file) { reject(new Error(`Choose ${label}.`)); return; }
    if (file.size > 4 * 1024 * 1024) { reject(new Error(`${file.name} is larger than 4 MB.`)); return; }
    file.text().then(resolve).catch(reject);
  });
}

function autoBasePath(orgId, assessmentId) {
  const org = String(orgId || "726").trim().replace(/[^A-Za-z0-9_-]/g, "") || "726";
  const id = String(assessmentId || "").trim();
  return id && !/[\\/]/.test(id) ? `/per/g03/pub/${org}/ASM/OnlineAssessment/${id}/` : "";
}

function nextAssessmentId(assessments = []) {
  let highest = 62;
  for (const item of assessments) {
    const match = /^M(\d+)$/i.exec(String(item.id || ""));
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `M${highest + 1}`;
}

const xmlText = (value) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setConfTag(xml, tag, value) {
  const replacement = `<${tag}>${xmlText(value)}</${tag}>`;
  const re = new RegExp(`<${tag}\\s*/>|<${tag}>[\\s\\S]*?</${tag}>`);
  if (re.test(xml)) return xml.replace(re, () => replacement);
  return xml.replace(/<\/Details>/, () => `${replacement}</Details>`);
}

function buildConfXml(assessment) {
  const duration = Math.max(1, Number(assessment.duration_min) || 60);
  const attempts = Math.max(1, Number(assessment.max_attempts) || 1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Details>
<CandidateResponseHandlerURL>/IBA/MockCandResponseHandler</CandidateResponseHandlerURL>
<AssessmentName>${xmlText(assessment.name || assessment.id)}</AssessmentName>
<AssessmentDescription>${xmlText(assessment.description || "")}</AssessmentDescription>
<USELOGINID>NO</USELOGINID>
<LoginIDLabel>Welcome</LoginIDLabel>
<UseDefaultSystemInstruction>YES</UseDefaultSystemInstruction>
<UseBanner/>
<BannerPath> </BannerPath>
<BannerText>#2D70B6</BannerText>
<CandidateName>Your Name</CandidateName>
<AssessmentDuration>${duration}</AssessmentDuration>
<COMPULSORYTIME>0</COMPULSORYTIME>
<ConsiderMarkForReview>YES</ConsiderMarkForReview>
<ISOPTIONALSECTIONSAVAILABLE>YES</ISOPTIONALSECTIONSAVAILABLE>
<ShowFeedback>${assessment.show_feedback ? "YES" : "NO"}</ShowFeedback>
<UseDefaultFeedback>${assessment.use_default_feedback ? "YES" : "NO"}</UseDefaultFeedback>
<SHOWCONTACTNO>YES</SHOWCONTACTNO>
<SHOWEMAILID>YES</SHOWEMAILID>
<Version>17.03.00</Version>
<UseAssessmentForever>YES</UseAssessmentForever>
<AssessmentStartDate/>
<AssessmentEndDate/>
<USEDEFAULTCANDIDATEIMG>YES</USEDEFAULTCANDIDATEIMG>
<ShowViewQPButton>YES</ShowViewQPButton>
<OptionOrientation>Vertical</OptionOrientation>
<ShowScoreCard>YES</ShowScoreCard>
<ShowPercentageScore>YES</ShowPercentageScore>
<StoreCandResponse>${assessment.store_response ? "YES" : "NO"}</StoreCandResponse>
<RequireFullscreen>${assessment.require_fullscreen ? "YES" : "NO"}</RequireFullscreen>
<MaxNoOfAttempt>${attempts}</MaxNoOfAttempt>
<SoftwareLanguages>English</SoftwareLanguages>
<ReportPublishDate/>
<DefaultReportFormat>YES</DefaultReportFormat>
<UseDefaultExitPage>YES</UseDefaultExitPage>
<showOptionInViewQP>YES</showOptionInViewQP>
<TimeFormat>MM:SS</TimeFormat>
<UseDefaultDisclaimerInstruction>YES</UseDefaultDisclaimerInstruction>
<EXTRAPARAM1> </EXTRAPARAM1>
<EXTRAPARAM2> </EXTRAPARAM2>
</Details>
`;
}

function applyConfSettings(confXml, assessment) {
  let xml = confXml;
  const values = {
    AssessmentName: assessment.name || assessment.id,
    AssessmentDescription: assessment.description || "",
    AssessmentDuration: String(Math.max(1, Number(assessment.duration_min) || 60)),
    MaxNoOfAttempt: String(Math.max(1, Number(assessment.max_attempts) || 1)),
    ShowFeedback: assessment.show_feedback ? "YES" : "NO",
    UseDefaultFeedback: assessment.use_default_feedback ? "YES" : "NO",
    StoreCandResponse: assessment.store_response ? "YES" : "NO",
    RequireFullscreen: assessment.require_fullscreen ? "YES" : "NO",
  };
  for (const [tag, value] of Object.entries(values)) xml = setConfTag(xml, tag, value);
  return xml;
}

async function confXmlFor(assessment) {
  const basePath = assessment.base_path || autoBasePath(assessment.org_id, assessment.id);
  if (basePath) {
    try {
      const res = await fetch(`${basePath}confDetails.xml`, { credentials: "same-origin", cache: "no-store" });
      if (res.ok) {
        const existing = await res.text();
        if (/<Details[\s>]/.test(existing)) return applyConfSettings(existing, assessment);
      }
    } catch { /* use a generated conf below */ }
  }
  return applyConfSettings(buildConfXml(assessment), assessment);
}

async function renderAssessments() {
  const { assessments } = await api("/assessments");
  $("#topbarActions").innerHTML = `
    <button class="btn" id="importAssessments" title="Import an assessment list CSV">Import assessments</button>
    <a class="btn" href="/api/admin/export/assessments.csv">Export CSV</a>
    <button class="btn primary" id="newAssessment">New assessment</button>`;
  $("#newAssessment").addEventListener("click", () => assessmentForm(null, assessments));
  $("#importAssessments").addEventListener("click", importAssessmentsForm);
  $("#view").innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Assessments</h3><span class="sub">${assessments.length} total</span></div>
      <div class="card-body tight">
        ${assessments.length ? `<div class="table-wrap"><table>
          <thead><tr><th>ID</th><th>Name</th><th>Duration</th><th>Groups</th><th>Questions</th><th>Attempts</th><th>Feedback</th><th>Status</th><th></th></tr></thead>
          <tbody>${assessments.map((a) => `<tr>
            <td><code>${esc(a.id)}</code></td>
            <td>${esc(a.name)}
              <div class="muted small">${a.openToAll
                ? "Exam access: All candidates"
                : (a.candidateGroups && a.candidateGroups.length
                  ? `Exam access: ${esc(a.candidateGroups.map((group) => group.name).join(", "))}`
                  : "Exam access: no candidates")}</div>
            </td>
            <td class="num">${a.duration_min} min</td>
            <td class="num">${a.groups}</td>
            <td class="num">${a.questions}</td>
            <td class="num">${a.attempts}</td>
            <td>${a.show_feedback ? "on" : "off"}</td>
            <td>${badge(a.questions > 0 ? a.status : "draft")}</td>
            <td class="row actions">
              <button class="btn small${a.questions > 0 ? "" : " primary"}" data-papers="${esc(a.id)}" title="Upload the question paper CSV or quiz.xml for ${esc(a.id)}">Upload paper</button>
              <button class="btn small" data-edit="${esc(a.id)}">Edit</button>
              <button class="btn small" data-questions="${esc(a.id)}">Questions</button>
              <a class="btn small" href="/index.html?${encodeURIComponent(a.org_id || "")}@@${encodeURIComponent(a.id)}" target="_blank" rel="noopener" title="Open candidate console for ${esc(a.id)}">Entry Point</a>
              <button class="btn small danger" data-del="${esc(a.id)}">Delete</button>
            </td>
          </tr>`).join("")}</tbody></table></div>` : `<div class="empty">No assessments yet. Create one and upload a CSV question paper. In the upload dialog, click <strong>Use demo CSV</strong> to try a ready-made paper.
            <div style="margin-top:10px">${demoLinks()}</div></div>`}
      </div>
    </div>`;
  const v = $("#view");
  v.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", async () => {
    const { assessment, groups } = await api("/assessments/" + encodeURIComponent(b.dataset.edit));
    const hasQuestions = groups.some((group) => group.sections.some((section) => section.questions > 0));
    assessmentForm(assessment, assessments, { hasQuestions });
  }));
  v.querySelectorAll("[data-questions]").forEach((b) => b.addEventListener("click", () => {
    state.assessmentId = b.dataset.questions;
    setView("questions");
  }));
  v.querySelectorAll("[data-papers]").forEach((b) => b.addEventListener("click", async () => {
    const { assessment, softwareLanguages } = await api("/assessments/" + encodeURIComponent(b.dataset.papers));
    paperUploadForm(assessment, softwareLanguages);
  }));
  v.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
    if (!(await confirmDialog(`Delete assessment ${b.dataset.del}? All questions and attempts belonging to it will be removed.`, "Delete"))) return;
    await api("/assessments/" + encodeURIComponent(b.dataset.del), { method: "DELETE" });
    toast("Assessment deleted.", "success");
    renderAssessments();
  }));
}

function assessmentForm(assessment, assessments = [], options = {}) {
  const a = assessment || {};
  const isNew = !assessment;
  const draft = options.draft || {};
  const draftValue = (key, fallback) => (draft[key] === undefined ? fallback : draft[key]);
  const orgId = a.org_id || "726";
  const suggestedId = isNew ? nextAssessmentId(assessments) : a.id;
  const lockedDraft = isNew || options.hasQuestions === false;
  const m = modal({
    title: isNew ? "New assessment" : `Edit ${a.id}`,
    body: `
      <div class="grid2">
        <label>Assessment ID<input name="id" value="${esc(suggestedId)}" ${isNew ? "" : "disabled"} placeholder="M63" autocomplete="off" />
          ${isNew ? `<span class="field-note">Suggested automatically. You can change it.</span>` : ""}
        </label>
        <label>Organisation ID<input name="orgId" value="${esc(draftValue("orgId", orgId))}" autocomplete="off" /></label>
      </div>
      <label>Name<input name="name" value="${esc(draftValue("name", a.name || ""))}" placeholder="${isNew ? "Assessment name" : "TCS iON Mock Assessment"}" autocomplete="off" /></label>
      ${isNew ? "" : `<div class="row" style="justify-content:flex-end;margin-top:-6px">
        <button type="button" class="btn small" id="formGroups" title="Manage groups and sections">Groups &amp; sections</button>
        <button type="button" class="btn small" id="formExamAccess" title="Choose who may take this assessment">Exam access</button>
        <button type="button" class="btn small" id="formPresentation" title="Candidate top bar and exam tools for this assessment">Candidate UI</button>
        <button type="button" class="btn small" id="formInstructions" title="Edit candidate instructions">Instructions</button>
      </div>`}
      <label>Description<input name="description" value="${esc(draftValue("description", a.description || ""))}" placeholder="Optional description" /></label>
      <div class="grid3">
        <label>Duration (minutes)<input name="durationMin" type="number" min="1" value="${esc(draftValue("durationMin", a.duration_min || 60))}" /></label>
        <label>Max attempts<input name="maxAttempts" type="number" min="1" value="${esc(draftValue("maxAttempts", a.max_attempts || 1))}" /></label>
        ${lockedDraft ? `<label>Status<span class="draft-status"><span class="badge draft">draft</span><span class="field-note">Active after paper upload.</span></span></label>`
          : `<label>Status<select name="status">
          ${["active", "draft", "archived"].map((s) => `<option value="${s}" ${draftValue("status", a.status) === s ? "selected" : ""}>${s}</option>`).join("")}
        </select></label>`}
      </div>
      <div style="border: 1px solid var(--border, #374151); border-radius: 8px; padding: 12px; margin: 12px 0; background: rgba(255,255,255,0.02);">
        <label class="row" style="font-weight: 600; margin: 0; cursor: pointer;">
          <input type="checkbox" name="enableFullscreen" ${draftValue("enableFullscreen", (a.enable_fullscreen != null ? a.enable_fullscreen : (a.require_fullscreen || a.track_fullscreen))) ? "checked" : ""} style="width:auto" />
          Enable fullscreen mode
        </label>
        <div id="fullscreenSubOptions" style="margin-top: 10px; margin-left: 22px; display: flex; flex-direction: column; gap: 8px; border-left: 2px solid var(--border, #4b5563); padding-left: 12px;">
          <label class="row" style="cursor: pointer;">
            <input type="checkbox" name="requireFullscreen" ${draftValue("requireFullscreen", a.require_fullscreen) ? "checked" : ""} style="width:auto" />
            Require fullscreen to answer (cannot start until fullscreen is on)
          </label>
          <label class="row" style="cursor: pointer;">
            <input type="checkbox" name="trackFullscreen" ${draftValue("trackFullscreen", (a.track_fullscreen != null ? a.track_fullscreen : 1)) ? "checked" : ""} style="width:auto" />
            Count fullscreen time and on/off toggles in results
          </label>
        </div>
      </div>
      <div class="grid2">
        <label class="row"><input type="checkbox" name="showFeedback" ${draftValue("showFeedback", a.show_feedback) ? "checked" : ""} style="width:auto" /> Show feedback page</label>
        <label class="row"><input type="checkbox" name="useDefaultFeedback" ${draftValue("useDefaultFeedback", a.use_default_feedback) ? "checked" : ""} style="width:auto" /> Use default feedback form</label>
        <label class="row"><input type="checkbox" name="storeResponse" ${draftValue("storeResponse", a.store_response) ? "checked" : ""} style="width:auto" /> Server-side response store</label>
      </div>
      ${lockedDraft ? `<p class="field-note">This assessment is saved as <strong>draft</strong>. After saving, use <em>Upload paper</em> to add its question paper; the assessment becomes active automatically. The paper folder is managed for you.</p>` : ""}
    `,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>${isNew ? "Create" : "Save"}</button>`,
  });

  const idInput = m.root.querySelector("[name=id]");
  const orgInput = m.root.querySelector("[name=orgId]");
  const nameInput = m.root.querySelector("[name=name]");

  const masterFullscreen = m.root.querySelector("[name=enableFullscreen]");
  const subOptionsContainer = m.root.querySelector("#fullscreenSubOptions");
  const requireFullscreenInput = m.root.querySelector("[name=requireFullscreen]");
  const trackFullscreenInput = m.root.querySelector("[name=trackFullscreen]");

  const syncFullscreenSubOptions = () => {
    const isEnabled = masterFullscreen.checked;
    subOptionsContainer.style.display = isEnabled ? "flex" : "none";
    requireFullscreenInput.disabled = !isEnabled;
    trackFullscreenInput.disabled = !isEnabled;
    if (!isEnabled) {
      requireFullscreenInput.checked = false;
    }
  };
  masterFullscreen.addEventListener("change", syncFullscreenSubOptions);
  syncFullscreenSubOptions();

  const captureDraft = () => ({
    orgId: orgInput.value.trim(),
    name: nameInput.value,
    description: m.root.querySelector("[name=description]").value,
    durationMin: m.root.querySelector("[name=durationMin]").value,
    maxAttempts: m.root.querySelector("[name=maxAttempts]").value,
    status: m.root.querySelector("[name=status]")?.value,
    showFeedback: m.root.querySelector("[name=showFeedback]").checked,
    useDefaultFeedback: m.root.querySelector("[name=useDefaultFeedback]").checked,
    storeResponse: m.root.querySelector("[name=storeResponse]").checked,
    enableFullscreen: masterFullscreen.checked,
    requireFullscreen: masterFullscreen.checked && requireFullscreenInput.checked,
    trackFullscreen: masterFullscreen.checked && trackFullscreenInput.checked,
  });
  const reopenWithDraft = (callback) => {
    const draft = captureDraft();
    callback(() => assessmentForm(assessment, assessments, { ...options, draft }));
  };

  const groupsButton = m.root.querySelector("#formGroups");
  if (groupsButton) {
    groupsButton.addEventListener("click", () => {
      reopenWithDraft((onClose) => manageGroups(a.id, { onClose }));
    });
  }

  const presentationButton = m.root.querySelector("#formPresentation");
  if (presentationButton) {
    presentationButton.addEventListener("click", () => {
      reopenWithDraft((onClose) => presentationForm(a, { onClose }));
    });
  }

  const instructionsButton = m.root.querySelector("#formInstructions");
  if (instructionsButton) {
    instructionsButton.addEventListener("click", () => {
      reopenWithDraft((onClose) => instructionsForm(a, { onClose }));
    });
  }

  const examAccessButton = m.root.querySelector("#formExamAccess");
  if (examAccessButton) {
    examAccessButton.addEventListener("click", () => {
      reopenWithDraft((onClose) => examAccessForm(a, { onClose }));
    });
  }

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    const id = idInput.value.trim();
    const bodyOrg = orgInput.value.trim() || "726";
    if (!id) { toast("Assessment ID is required.", "error"); return; }
    if (isNew && !/^[A-Za-z0-9_-]+$/.test(id)) {
      toast("Use letters, numbers, hyphen or underscore in the Assessment ID.", "error");
      return;
    }

    let displayName = nameInput.value.trim();
    if (!displayName) displayName = isNew ? id : a.name;

    const statusField = m.root.querySelector("[name=status]");
    const body = {
      id,
      orgId: bodyOrg,
      name: displayName,
      description: m.root.querySelector("[name=description]").value.trim(),
      durationMin: Number(m.root.querySelector("[name=durationMin]").value),
      maxAttempts: Number(m.root.querySelector("[name=maxAttempts]").value),
      status: lockedDraft ? "draft" : statusField.value,
      showFeedback: m.root.querySelector("[name=showFeedback]").checked,
      useDefaultFeedback: m.root.querySelector("[name=useDefaultFeedback]").checked,
      storeResponse: m.root.querySelector("[name=storeResponse]").checked,
      enableFullscreen: masterFullscreen.checked,
      requireFullscreen: masterFullscreen.checked && requireFullscreenInput.checked,
      trackFullscreen: masterFullscreen.checked && trackFullscreenInput.checked,
    };
    if (isNew) body.basePath = autoBasePath(bodyOrg, id);

    button.disabled = true;
    try {
      if (isNew) {
        await api("/assessments", { method: "POST", body });
        toast("Assessment created as draft. Upload its CSV paper to activate it.", "success");
      } else {
        await api("/assessments/" + encodeURIComponent(a.id), { method: "PUT", body });
        toast(lockedDraft ? "Assessment saved as draft." : "Assessment saved.", "success");
      }
      m.close();
      renderAssessments();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Group list for one assessment, with Add/Edit/Delete for groups and sections. */
async function manageGroups(assessmentId, options = {}) {
  const { assessment, groups } = await api("/assessments/" + encodeURIComponent(assessmentId));
  const m = modal({
    title: `Groups & sections — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `
      ${groups.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Group ID</th><th>Name</th><th>Sections</th><th>Questions</th><th>Instructions</th><th>Max duration</th><th>Marks</th></tr></thead>
        <tbody>${groups.map((group) => `<tr>
          <td><code>${esc(group.ext_id || "—")}</code></td>
          <td><div class="row"><span>${esc(group.name)}</span>
            <button class="btn small" data-group-edit="${group.id}" title="Edit group name, instructions and timings">Edit</button>
            <button class="btn small danger" data-group-delete="${group.id}" title="Delete this group and its sections">Delete</button>
          </div></td>
          <td class="small">
            ${group.sections.length ? group.sections.map((section) => `<div class="row" style="margin:2px 0">
              <span>${esc(section.name)} <span class="muted">(${Number(section.questions || 0)} Q)</span></span>
              <button class="btn small" data-section-edit="${section.id}" title="Edit section name, instructions and type">Edit</button>
              <button class="btn small danger" data-section-delete="${section.id}" title="Delete this section">Delete</button>
            </div>`).join("") : `<div class="muted" style="margin:2px 0">No sections yet.</div>`}
            <button class="btn small" data-section-add="${group.id}" title="Add a section to this group">+ Section</button>
          </td>
          <td class="num">${group.sections.reduce((sum, section) => sum + Number(section.questions || 0), 0)}</td>
          <td class="small">${esc(group.instruction || "—")}</td>
          <td class="num">${Number(group.max_duration_sec) ? `${Math.round(Number(group.max_duration_sec) / 60)} min` : "—"}</td>
          <td class="num">${num(group.total_marks, 2)}</td>
        </tr>`).join("")}</tbody></table></div>`
        : `<div class="empty">No groups yet. Add one to organise this assessment's questions.</div>`}
      <p class="field-note">Groups and sections can be added or removed here. New rows stay admin-only until a paper upload includes them; deleting an imported group or section also removes it from the candidate paper.</p>
    `,
    footer: `<button class="btn" data-close>Close</button><button class="btn primary" data-group-add>Add group</button>`,
  });

  const refresh = async () => {
    await renderAssessments();
    manageGroups(assessment.id, options);
  };

  m.root.querySelector("[data-group-add]").addEventListener("click", () => groupEditForm(assessment, null, options));
  m.root.querySelectorAll("[data-group-edit]").forEach((b) => b.addEventListener("click", () => {
    const group = groups.find((row) => Number(row.id) === Number(b.dataset.groupEdit));
    if (group) groupEditForm(assessment, group, options);
  }));
  m.root.querySelectorAll("[data-section-add]").forEach((b) => b.addEventListener("click", () => {
    const group = groups.find((row) => Number(row.id) === Number(b.dataset.sectionAdd));
    if (group) sectionEditForm(assessment, group, null, options);
  }));
  m.root.querySelectorAll("[data-section-edit]").forEach((b) => b.addEventListener("click", () => {
    for (const group of groups) {
      const section = group.sections.find((row) => Number(row.id) === Number(b.dataset.sectionEdit));
      if (section) { sectionEditForm(assessment, group, section, options); return; }
    }
  }));
  m.root.querySelectorAll("[data-section-delete]").forEach((b) => b.addEventListener("click", async () => {
    for (const group of groups) {
      const section = group.sections.find((row) => Number(row.id) === Number(b.dataset.sectionDelete));
      if (!section) continue;
      const questions = Number(section.questions || 0);
      const warning = questions
        ? `\n\n${questions} question(s) will be deleted with it, along with any saved candidate responses.`
        : "";
      if (!confirm(`Delete section "${section.name}"?${warning}`)) return;
      try {
        await api(`/sections/${encodeURIComponent(section.id)}`, { method: "DELETE", body: { force: true } });
        toast("Section deleted.", "success");
        await refresh();
      } catch (e) {
        toast(e.message, "error");
      }
      return;
    }
  }));
  m.root.querySelectorAll("[data-group-delete]").forEach((b) => b.addEventListener("click", async () => {
    const group = groups.find((row) => Number(row.id) === Number(b.dataset.groupDelete));
    if (!group) return;
    const questions = group.sections.reduce((sum, section) => sum + Number(section.questions || 0), 0);
    const warning = questions
      ? `\n\n${questions} question(s) in its sections will be deleted, along with any saved candidate responses.`
      : "";
    if (!confirm(`Delete group "${group.name}"?${warning}`)) return;
    try {
      await api(`/groups/${encodeURIComponent(group.id)}`, { method: "DELETE", body: { force: true } });
      toast("Group deleted.", "success");
      await refresh();
    } catch (e) {
      toast(e.message, "error");
    }
  }));
}

/** Add or edit one section: name, candidate instructions, type and attempt limits. */
function sectionEditForm(assessment, group, section, options = {}) {
  const s = section || {};
  const isNew = !section;
  const m = modal({
    title: isNew ? `Add section — ${group.name}` : `Edit section — ${s.name || s.id}`,
    onClose: () => manageGroups(assessment.id, options),
    body: `
      <div class="grid2">
        <label>Section name<input name="name" value="${esc(s.name || "")}" placeholder="Sample Questions" autocomplete="off" /></label>
        <label>Section ID<input name="extId" value="${esc(s.ext_id || "")}" placeholder="${isNew ? "Generated automatically" : "Section ID"}" autocomplete="off" /></label>
      </div>
      <label>Section instructions<textarea name="instruction" style="min-height:120px" placeholder="Shown to the candidate above this section">${esc(s.instruction || "")}</textarea></label>
      <div class="grid3">
        <label>Section type<input name="sectionType" value="${esc(s.section_type || "ONLINE")}" placeholder="ONLINE" /></label>
        <label>Max questions to attempt<input name="maxQuestions" type="number" min="0" step="1" value="${Number(s.max_questions || 0)}" /></label>
        <label>Total marks<input name="totalMarks" type="number" min="0" step="0.01" value="${esc(s.total_marks || 0)}" /></label>
      </div>
      <p class="field-note">${isNew
        ? `This section will be added under group "${esc(group.name)}". It appears in the candidate paper after a paper upload includes it.`
        : `0 max questions means every question in the section is shown. ${Number(s.questions || 0)} question(s) currently linked.`}</p>
    `,
    footer: `<button class="btn" data-back>Back</button><button class="btn primary" data-save>${isNew ? "Add section" : "Save section"}</button>`,
  });

  m.root.querySelector("[data-back]").addEventListener("click", () => manageGroups(assessment.id, options));
  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    const name = m.root.querySelector("[name=name]").value.trim();
    if (!name) { toast("Section name is required.", "error"); return; }

    const body = {
      name,
      extId: m.root.querySelector("[name=extId]").value.trim(),
      instruction: m.root.querySelector("[name=instruction]").value,
      sectionType: m.root.querySelector("[name=sectionType]").value.trim() || "ONLINE",
      maxQuestions: Math.max(0, Number(m.root.querySelector("[name=maxQuestions]").value) || 0),
      totalMarks: Math.max(0, Number(m.root.querySelector("[name=totalMarks]").value) || 0),
    };

    button.disabled = true;
    try {
      if (isNew) {
        await api(`/assessments/${encodeURIComponent(assessment.id)}/sections`, {
          method: "POST",
          body: { ...body, groupId: group.id },
        });
        toast("Section added.", "success");
      } else {
        await api(`/sections/${encodeURIComponent(section.id)}`, { method: "PUT", body });
        toast("Section updated.", "success");
      }
      await renderAssessments();
      manageGroups(assessment.id, options);
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Add or edit one group. Times are edited in minutes and stored as seconds. */
function groupEditForm(assessment, group, options = {}) {
  const g = group || {};
  const isNew = !group;
  const m = modal({
    title: isNew ? `Add group — ${assessment.id}` : `Edit group — ${g.name}`,
    onClose: () => manageGroups(assessment.id, options),
    body: `
      <div class="grid2">
        <label>Group name<input name="name" value="${esc(g.name || "")}" placeholder="General Aptitude" autocomplete="off" /></label>
        <label>Group ID<input name="extId" value="${esc(g.ext_id || "")}" placeholder="${isNew ? "Generated automatically" : "Group ID"}" autocomplete="off" /></label>
      </div>
      <label>Instructions<textarea name="instruction" placeholder="Optional instructions for this group">${esc(g.instruction || "")}</textarea></label>
      <div class="grid3">
        <label>Instruction time (minutes)<input name="instructionTimeMin" type="number" min="0" step="1" value="${Math.round(Number(g.instruction_time_sec || 0) / 60)}" /></label>
        <label>Max duration (minutes)<input name="maxDurationMin" type="number" min="0" step="1" value="${Math.round(Number(g.max_duration_sec || 0) / 60)}" /></label>
        <label>Total marks<input name="totalMarks" type="number" min="0" step="0.01" value="${esc(g.total_marks || 0)}" /></label>
      </div>
      <p class="field-note">Use 0 minutes for no instruction time or no duration limit.</p>
    `,
    footer: `<button class="btn" data-back>Back</button><button class="btn primary" data-save>${isNew ? "Add group" : "Save"}</button>`,
  });

  m.root.querySelector("[data-back]").addEventListener("click", () => manageGroups(assessment.id, options));
  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    const name = m.root.querySelector("[name=name]").value.trim();
    if (!name) { toast("Group name is required.", "error"); return; }

    const body = {
      name,
      extId: m.root.querySelector("[name=extId]").value.trim(),
      instruction: m.root.querySelector("[name=instruction]").value.trim(),
      instructionTimeSec: Math.max(0, Number(m.root.querySelector("[name=instructionTimeMin]").value) || 0) * 60,
      maxDurationSec: Math.max(0, Number(m.root.querySelector("[name=maxDurationMin]").value) || 0) * 60,
      totalMarks: Math.max(0, Number(m.root.querySelector("[name=totalMarks]").value) || 0),
    };

    button.disabled = true;
    try {
      if (isNew) {
        await api(`/assessments/${encodeURIComponent(assessment.id)}/groups`, { method: "POST", body });
        toast("Group added.", "success");
      } else {
        await api(`/groups/${encodeURIComponent(group.id)}`, { method: "PUT", body });
        toast("Group updated.", "success");
      }
      await renderAssessments();
      manageGroups(assessment.id, options);
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Content editors reachable from each Candidate UI top-bar row. */
const TOPBAR_CONTENT = {
  useful_data: usefulDataForm,
  instructions: instructionsForm,
  group_instructions: (assessment, options) => structureInstructionsForm(assessment, "group", options),
  section_instructions: (assessment, options) => structureInstructionsForm(assessment, "section", options),
  question_instructions: questionInstructionsForm,
  question_paper: paperPreviewForm,
};

/** Per-assessment candidate top bar and exam tools. */
async function presentationForm(assessment, options = {}) {
  const data = await api(`/assessments/${encodeURIComponent(assessment.id)}/presentation`);
  const items = (data.topbar && data.topbar.items) || {};
  const tools = data.tools || {};
  const custom = Array.isArray(data.topbar?.custom) ? data.topbar.custom : [];
  const overridden = data.overridden || {};
  const draft = options.draft || null;

  const topbarRows = TOPBAR_META.map(([key, fallback]) => {
    const entry = items[key] || {};
    const drafted = draft?.items?.[key] || {};
    const label = drafted.label ?? entry.label ?? fallback;
    const mode = drafted.mode ?? entry.mode ?? "auto";
    const hasContent = Boolean(TOPBAR_CONTENT[key]);
    return `<tr>
      <td><input data-topbar-label="${key}" value="${esc(label)}" maxlength="60" aria-label="${esc(fallback)} button name" /></td>
      <td style="width:170px">${hasContent
        ? `<button class="btn small" data-content="${key}" title="View and edit what this button opens">View / edit</button>`
        : `<span class="muted small">—</span>`}</td>
      <td style="width:190px">${modeSelect("topbar-mode", key, mode)}</td>
    </tr>`;
  }).join("");

  const toolRows = TOOL_META.map(([key, toolLabel]) => `<tr>
    <td>${esc(toolLabel)}</td>
    <td style="width:190px">${modeSelect("tool-mode", key, draft?.tools?.[key] ?? tools[key] ?? "auto")}</td>
  </tr>`).join("");

  const m = modal({
    title: `Candidate UI — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `
      <p class="field-note" style="margin-top:0">${overridden.topbar || overridden.tools
        ? "This assessment overrides the global candidate presentation. Changes here apply only to this assessment."
        : "This assessment currently uses the global defaults. Saving here creates an override for this assessment only."}</p>
      <div class="card" style="margin-bottom:14px">
        <div class="card-head"><h3>Candidate top bar</h3><span class="sub">Rename each button and edit what it opens</span></div>
        <div class="card-body tight">
          <div class="table-wrap"><table>
            <thead><tr><th>Button name</th><th>Content</th><th>Visibility</th></tr></thead>
            <tbody>${topbarRows}</tbody>
          </table></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Exam tools</h3><span class="sub">Calculator, ruler, protractor, zoom, notepad, scratchpad, highlighter</span></div>
        <div class="card-body tight">
          <div class="table-wrap"><table>
            <thead><tr><th>Tool</th><th>Visibility</th></tr></thead>
            <tbody>${toolRows}</tbody>
          </table></div>
        </div>
      </div>
    `,
    footer: `<button class="btn" data-close>Cancel</button>
      <button class="btn" data-reset>Use global defaults</button>
      <button class="btn primary" data-save>Save for this assessment</button>`,
  });

  // Keep unsaved button names and visibility when a content editor is opened.
  const captureDraft = () => ({
    items: Object.fromEntries(TOPBAR_META.map(([key]) => [
      key,
      {
        label: m.root.querySelector(`[data-topbar-label="${key}"]`).value.trim(),
        mode: m.root.querySelector(`[data-topbar-mode="${key}"]`).value,
      },
    ])),
    tools: Object.fromEntries(
      TOOL_META.map(([key]) => [key, m.root.querySelector(`[data-tool-mode="${key}"]`).value]),
    ),
    custom,
  });

  m.root.querySelectorAll("[data-content]").forEach((button) => {
    button.addEventListener("click", () => {
      const openContent = TOPBAR_CONTENT[button.dataset.content];
      if (!openContent) return;
      const snapshot = captureDraft();
      openContent(assessment, {
        onClose: () => presentationForm(assessment, { ...options, draft: snapshot }),
      });
    });
  });

  m.root.querySelector("[data-reset]").addEventListener("click", async () => {
    if (!(await confirmDialog("Remove this assessment's top bar and exam tool overrides so it follows the global defaults?", "Use defaults"))) return;
    try {
      await api(`/assessments/${encodeURIComponent(assessment.id)}/presentation`, { method: "DELETE", body: {} });
      toast("This assessment now uses the global candidate defaults.", "success");
      m.close();
    } catch (e) { toast(e.message, "error"); }
  });

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    const nextItems = {};
    TOPBAR_META.forEach(([key]) => {
      nextItems[key] = {
        label: m.root.querySelector(`[data-topbar-label="${key}"]`).value.trim(),
        mode: m.root.querySelector(`[data-topbar-mode="${key}"]`).value,
      };
    });
    const nextTools = Object.fromEntries(
      TOOL_META.map(([key]) => [key, m.root.querySelector(`[data-tool-mode="${key}"]`).value]),
    );

    button.disabled = true;
    try {
      await api(`/assessments/${encodeURIComponent(assessment.id)}/presentation`, {
        method: "PUT",
        body: { topbar: { items: nextItems, custom }, tools: nextTools },
      });
      toast("Candidate UI saved for this assessment.", "success");
      m.close();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

function settingJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Settings → Candidate UI. Saves the global top bar and exam tools; the server
 * removes every per-assessment presentation override so all assessments switch
 * to the new values in one go.
 */
async function globalPresentationForm(options = {}) {
  const [{ settings }, { assessments }] = await Promise.all([
    api("/settings"),
    api("/assessments"),
  ]);
  const storedTopbar = settingJson(settings.exam_topbar, {});
  const items = storedTopbar.items || {};
  const custom = Array.isArray(storedTopbar.custom) ? storedTopbar.custom : [];
  const tools = settingJson(settings.exam_tools, {});
  const draft = options.draft || null;
  const assessmentIds = new Set(assessments.map((assessment) => assessment.id));
  const selectedId = assessmentIds.has(draft?.assessmentId)
    ? draft.assessmentId
    : assessments[0]?.id || "";

  const topbarRows = TOPBAR_META.map(([key, fallback]) => {
    const entry = items[key] || {};
    const drafted = draft?.items?.[key] || {};
    const label = drafted.label ?? entry.label ?? fallback;
    const mode = drafted.mode ?? entry.mode ?? "auto";
    const hasContent = Boolean(TOPBAR_CONTENT[key]);
    return `<tr>
      <td><input data-topbar-label="${key}" value="${esc(label)}" maxlength="60" aria-label="${esc(fallback)} button name" /></td>
      <td style="width:170px">${hasContent
        ? `<button class="btn small" data-content="${key}" title="View and edit what this button opens" ${assessments.length ? "" : "disabled"}>View / edit</button>`
        : `<span class="muted small">—</span>`}</td>
      <td style="width:190px">${modeSelect("topbar-mode", key, mode)}</td>
    </tr>`;
  }).join("");

  const toolRows = TOOL_META.map(([key, toolLabel]) => `<tr>
    <td>${esc(toolLabel)}</td>
    <td style="width:190px">${modeSelect("tool-mode", key, draft?.tools?.[key] ?? tools[key] ?? "auto")}</td>
  </tr>`).join("");

  const assessmentOptions = assessments.length
    ? assessments.map((assessment) => `<option value="${esc(assessment.id)}" ${assessment.id === selectedId ? "selected" : ""}>${esc(assessment.id)} — ${esc(assessment.name || "")}</option>`).join("")
    : `<option value="">No assessments yet</option>`;

  const m = modal({
    title: "Candidate UI — all assessments",
    wide: true,
    onClose: options.onClose,
    body: `
      <p class="field-note" style="margin-top:0">These top bar buttons and exam tools apply to <strong>every assessment</strong>. Saving here removes per-assessment candidate UI overrides, so all assessments switch to the values below. Button content is stored inside each assessment. To change one assessment only, use <strong>Assessments → Edit → Candidate UI</strong>.</p>
      <div class="card" style="margin-bottom:14px">
        <div class="card-head"><h3>Candidate top bar</h3><span class="sub">Button names, content and visibility for all assessments</span></div>
        <div class="card-body" style="padding-bottom:0">
          <div class="row" style="align-items:flex-end;gap:10px;margin-bottom:12px">
            <label style="margin:0;flex:0 1 340px">View / edit content for
              <select id="globalContentAssessment" ${assessments.length ? "" : "disabled"}>${assessmentOptions}</select>
            </label>
            <span class="field-note" style="margin:0 0 4px">Content is stored per assessment; names and visibility above still apply to all.</span>
          </div>
        </div>
        <div class="card-body tight">
          <div class="table-wrap"><table>
            <thead><tr><th>Button name</th><th>Content</th><th>Visibility</th></tr></thead>
            <tbody>${topbarRows}</tbody>
          </table></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Exam tools</h3><span class="sub">Calculator, ruler, protractor, zoom, notepad, scratchpad, highlighter</span></div>
        <div class="card-body tight">
          <div class="table-wrap"><table>
            <thead><tr><th>Tool</th><th>Visibility</th></tr></thead>
            <tbody>${toolRows}</tbody>
          </table></div>
        </div>
      </div>
    `,
    footer: `<button class="btn" data-close>Cancel</button>
      <button class="btn" data-defaults>Use built-in defaults</button>
      <button class="btn primary" data-save>Save for all assessments</button>`,
  });

  // Keep unsaved global values and the chosen assessment when a content editor is opened.
  const captureDraft = () => ({
    items: Object.fromEntries(TOPBAR_META.map(([key]) => [
      key,
      {
        label: m.root.querySelector(`[data-topbar-label="${key}"]`).value.trim(),
        mode: m.root.querySelector(`[data-topbar-mode="${key}"]`).value,
      },
    ])),
    tools: Object.fromEntries(
      TOOL_META.map(([key]) => [key, m.root.querySelector(`[data-tool-mode="${key}"]`).value]),
    ),
    custom,
    assessmentId: m.root.querySelector("#globalContentAssessment")?.value || selectedId,
    scrollTop: m.root.querySelector(".modal")?.scrollTop || 0,
  });

  const modalNode = m.root.querySelector(".modal");
  if (draft?.scrollTop && modalNode) {
    requestAnimationFrame(() => { modalNode.scrollTop = draft.scrollTop; });
  }

  const contentSelect = m.root.querySelector("#globalContentAssessment");
  const syncContentTitles = () => {
    const assessment = assessments.find((entry) => entry.id === contentSelect?.value);
    m.root.querySelectorAll("[data-content]").forEach((button) => {
      button.title = assessment
        ? `View and edit this content for ${assessment.id}`
        : "View and edit what this button opens";
    });
  };
  contentSelect?.addEventListener("change", syncContentTitles);
  syncContentTitles();

  m.root.querySelectorAll("[data-content]").forEach((button) => {
    button.addEventListener("click", () => {
      const openContent = TOPBAR_CONTENT[button.dataset.content];
      const assessment = assessments.find((entry) => entry.id === contentSelect?.value);
      if (!openContent || !assessment) return;
      const snapshot = captureDraft();
      openContent(assessment, {
        onClose: () => globalPresentationForm({ ...options, draft: snapshot }),
      });
    });
  });

  m.root.querySelector("[data-defaults]").addEventListener("click", () => {
    TOPBAR_META.forEach(([key, fallback]) => {
      m.root.querySelector(`[data-topbar-label="${key}"]`).value = fallback;
      m.root.querySelector(`[data-topbar-mode="${key}"]`).value = "auto";
    });
    TOOL_META.forEach(([key]) => {
      m.root.querySelector(`[data-tool-mode="${key}"]`).value = "auto";
    });
  });

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const nextItems = {};
    TOPBAR_META.forEach(([key]) => {
      nextItems[key] = {
        label: m.root.querySelector(`[data-topbar-label="${key}"]`).value.trim(),
        mode: m.root.querySelector(`[data-topbar-mode="${key}"]`).value,
      };
    });
    const nextTools = Object.fromEntries(
      TOOL_META.map(([key]) => [key, m.root.querySelector(`[data-tool-mode="${key}"]`).value]),
    );
    if (!(await confirmDialog(
      "Save this candidate UI for every assessment? Per-assessment top bar and exam tool overrides will be removed.",
      "Save for all assessments",
    ))) return;

    try {
      await api("/settings", {
        method: "PUT",
        body: { exam_topbar: { items: nextItems, custom }, exam_tools: nextTools },
      });
      toast("Candidate UI saved for all assessments.", "success");
      m.close();
    } catch (e) { toast(e.message, "error"); }
  });
}

/** Who may take this assessment. All candidates or at least one group must be selected. */
async function examAccessForm(assessment, options = {}) {
  const data = await api(`/assessments/${encodeURIComponent(assessment.id)}/candidate-groups`);
  const groups = data.groups || [];
  const openToAll = Boolean(data.openToAll);
  const allowed = new Set(data.allowed || []);
  const m = modal({
    title: `Exam access — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `
      <p class="field-note" style="margin-top:0">Choose who can take this assessment. Tick <strong>All candidates</strong> or at least one group; saving with nothing selected is not allowed.</p>
      <label class="row" style="gap:10px;margin:0 0 14px;padding:12px 14px;border:1px solid #d8dee8;border-radius:8px">
        <input type="checkbox" id="examAccessAll" ${openToAll ? "checked" : ""} style="width:auto" />
        <span><strong>All candidates</strong><span class="field-note" style="display:block;margin:0">Every candidate can sign in, including candidates with no group.</span></span>
      </label>
      ${groups.length ? `<div class="table-wrap"><table>
        <thead><tr><th style="width:64px">Allow</th><th>Candidate group</th><th>Candidates</th><th>Description</th></tr></thead>
        <tbody>${groups.map((group) => `<tr>
          <td><input type="checkbox" data-allow-group="${esc(group.id)}" ${!openToAll && allowed.has(group.id) ? "checked" : ""} ${openToAll ? "disabled" : ""} style="width:auto" aria-label="Allow ${esc(group.name)} to take ${esc(assessment.id)}" /></td>
          <td>${esc(group.name)}</td>
          <td class="num">${Number(group.candidates || 0)}</td>
          <td class="muted small">${esc(group.description || "—")}</td>
        </tr>`).join("")}</tbody></table></div>`
        : `<div class="empty">No candidate groups yet. Create groups in <strong>Candidates → Candidate groups</strong>, then choose them here.</div>`}
      <p class="field-note">Selecting <strong>All candidates</strong> ignores individual group ticks. Otherwise only candidates who belong to at least one ticked group can sign in.</p>
    `,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save access</button>`,
  });

  const allBox = m.root.querySelector("#examAccessAll");
  const groupBoxes = [...m.root.querySelectorAll("[data-allow-group]")];
  const syncAll = () => {
    const all = allBox.checked;
    for (const box of groupBoxes) {
      box.disabled = all;
      if (all) box.checked = false;
    }
  };
  allBox.addEventListener("change", syncAll);
  for (const box of groupBoxes) {
    box.addEventListener("change", () => {
      if (box.checked) allBox.checked = false;
    });
  }

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    const all = allBox.checked;
    const next = groupBoxes.filter((box) => box.checked).map((box) => box.dataset.allowGroup);
    if (!all && !next.length) {
      toast("Select All candidates or at least one candidate group.", "error");
      return;
    }
    button.disabled = true;
    try {
      await api(`/assessments/${encodeURIComponent(assessment.id)}/candidate-groups`, {
        method: "PUT",
        body: { openToAll: all, allowed: all ? [] : next },
      });
      toast(all
        ? "Assessment is open to all candidates."
        : `Assessment restricted to ${next.length} candidate group${next.length === 1 ? "" : "s"}.`, "success");
      m.close();
      renderAssessments();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Parse one iON localised instruction string into a map keyed by language id. */
function parseLocalisedInstruction(raw, languages) {
  const fallback = (languages.find((language) => language.primary) || languages[0] || { id: 1 });
  const text = String(raw || "").trim();
  const result = {};
  if (!text) return result;
  if (!text.includes("<instSep>")) {
    result[fallback.id] = text;
    return result;
  }
  text.split("<langSep>").forEach((segment) => {
    const at = segment.indexOf("<instSep>");
    if (at < 0) return;
    const langId = segment.slice(0, at).trim();
    const body = segment.slice(at + "<instSep>".length);
    if (langId) result[langId] = body;
  });
  return result;
}

/** Compose per-language values back into the iON instruction string format. */
function joinLocalisedInstruction(values, languages) {
  return languages
    .map((language) => {
      const text = String(values[language.id] || "").trim();
      return text ? `${language.id}<instSep>${text}` : "";
    })
    .filter(Boolean)
    .join("<langSep>");
}

const PAPER_LANGUAGE_MAX = 3;

/**
 * Shared language add/remove card. The primary language is display-only; every
 * editor that shows per-language content uses this so the same rules apply in
 * instructions, group/section instructions and question editors.
 */
function languageManagerHtml(note = "The primary language cannot be removed. Add or remove the other languages used by this assessment.") {
  return `<div class="card" data-lang-manager style="margin-bottom:12px;box-shadow:none">
    <div class="card-body">
      <div class="row" style="justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:8px">
        <div>
          <strong>Paper languages</strong>
          <div class="muted small">${esc(note)}</div>
        </div>
        <div class="row" style="align-items:flex-end;gap:6px">
          <label style="margin:0">Name<input data-lang-new-name maxlength="32" placeholder="Hindi" style="width:128px" /></label>
          <label style="margin:0">ID<input data-lang-new-id type="number" min="1" max="99" style="width:72px" /></label>
          <button type="button" class="btn small" data-lang-add>Add language</button>
        </div>
      </div>
      <div class="row" data-lang-chips style="margin-top:10px;flex-wrap:wrap"></div>
      <div class="muted small" data-lang-error style="color:#ff9ba0;margin-top:6px"></div>
    </div>
  </div>`;
}

/** Bind the language card above and return the current language list. */
function bindLanguageManager(root, initialLanguages, onChange) {
  const manager = root.querySelector("[data-lang-manager]");
  if (!manager) return { languages: () => [] };

  let languages = (initialLanguages || []).map((language) => ({
    id: Number(language.id),
    name: String(language.name || "").trim() || `Language ${language.id}`,
    primary: Boolean(language.primary),
  })).filter((language) => Number.isInteger(language.id));
  if (!languages.length) languages = [{ id: 1, name: "English", primary: true }];
  if (!languages.some((language) => language.primary)) languages[0].primary = true;

  const chips = manager.querySelector("[data-lang-chips]");
  const nameInput = manager.querySelector("[data-lang-new-name]");
  const idInput = manager.querySelector("[data-lang-new-id]");
  const addButton = manager.querySelector("[data-lang-add]");
  const error = manager.querySelector("[data-lang-error]");
  const snapshot = () => languages.map((language) => ({ ...language }));

  const nextId = () => {
    for (let id = 1; id <= 99; id += 1) {
      if (!languages.some((language) => language.id === id)) return id;
    }
    return "";
  };

  const render = () => {
    chips.innerHTML = languages.map((language) => (language.primary
      ? `<span class="pill" title="Primary language — cannot be removed">${esc(language.name)} · primary <span class="muted">(#${language.id})</span></span>`
      : `<span class="pill">${esc(language.name)} <span class="muted">(#${language.id})</span> <button type="button" class="btn small danger" data-lang-remove="${language.id}" title="Remove ${esc(language.name)}" style="padding:0 6px;margin-left:4px">&times;</button></span>`)).join("");
    chips.querySelectorAll("[data-lang-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        languages = languages.filter((language) => language.id !== Number(button.dataset.langRemove));
        error.textContent = "";
        render();
        if (onChange) onChange(snapshot());
      });
    });
    const full = languages.length >= PAPER_LANGUAGE_MAX;
    addButton.disabled = full;
    addButton.textContent = full ? `${PAPER_LANGUAGE_MAX} languages max` : "Add language";
    nameInput.disabled = full;
    idInput.disabled = full;
  };

  addButton.addEventListener("click", () => {
    error.textContent = "";
    const name = nameInput.value.trim().replace(/\s+/g, " ");
    const id = Number.parseInt(idInput.value, 10);
    if (!name) { error.textContent = "Enter the language name."; nameInput.focus(); return; }
    if (!Number.isInteger(id) || id < 1 || id > 99) { error.textContent = "Language ID must be between 1 and 99."; idInput.focus(); return; }
    if (languages.length >= PAPER_LANGUAGE_MAX) { error.textContent = `A maximum of ${PAPER_LANGUAGE_MAX} languages is supported.`; return; }
    if (languages.some((language) => language.id === id)) { error.textContent = `Language ID ${id} is already used.`; return; }
    if (languages.some((language) => language.name.toLowerCase() === name.toLowerCase())) { error.textContent = `Language "${name}" is already added.`; return; }
    languages.push({ id, name, primary: false });
    nameInput.value = "";
    idInput.value = String(nextId());
    render();
    if (onChange) onChange(snapshot());
  });

  idInput.value = String(nextId());
  render();

  return { languages: snapshot };
}

/** Persist the language list (quiz.xml + confDetails.xml + DB rows). */
async function saveLanguages(assessmentId, languages) {
  await api(`/assessments/${encodeURIComponent(assessmentId)}/languages`, {
    method: "PUT",
    body: { languages: languages.map((language) => ({ id: language.id, name: language.name })) },
  });
}

const sameLanguageList = (a, b) => a.length === b.length && a.every((language, index) =>
  Number(language.id) === Number(b[index].id) && String(language.name) === String(b[index].name));

/** Standalone language manager used from the question editor. */
async function languageManagerForm(assessmentId, options = {}) {
  const data = await api(`/assessments/${encodeURIComponent(assessmentId)}`);
  let saved = null;
  const m = modal({
    title: `Manage languages — ${assessmentId}`,
    wide: true,
    onClose: () => options.onClose?.(saved),
    body: `<p class="field-note" style="margin-top:0">Add or remove the languages used by this assessment. The primary language is permanent; other languages can be removed and added again later.</p>${languageManagerHtml()}`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save languages</button>`,
  });
  const manager = bindLanguageManager(m.root, data.languages || []);
  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    button.disabled = true;
    try {
      const languages = manager.languages();
      await saveLanguages(assessmentId, languages);
      saved = languages;
      toast("Languages saved.", "success");
      m.close();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Edit the files the Useful Data button opens (confDetails.xml). */
async function usefulDataForm(assessment, options = {}) {
  const data = await api(`/assessments/${encodeURIComponent(assessment.id)}/useful-data`);
  let rows = (data.files || []).map((row) => ({
    index: Number(row.index),
    path: String(row.path || ""),
    url: String(row.url || ""),
    name: String(row.name || ""),
  }));

  const m = modal({
    title: `Useful Data — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `
      <p class="field-note" style="margin-top:0">Upload the PDF files candidates open from the <strong>Useful Data</strong> button. Use <strong>View</strong> to open a file in a new tab; remove a row to hide it from candidates.</p>
      <div class="row" style="margin-bottom:10px; gap:8px;">
        <input type="file" id="usefulPdfInput" accept="application/pdf,.pdf" multiple hidden />
        <button type="button" class="btn" id="usefulUpload">Upload PDF</button>
        <span class="muted small">PDF only, up to 5 MB per file.</span>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th style="width:70px">File</th><th>Name</th><th style="width:150px"></th></tr></thead>
        <tbody id="usefulRows"></tbody>
      </table></div>`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save useful data</button>`,
  });

  const tbody = m.root.querySelector("#usefulRows");
  const uploadButton = m.root.querySelector("#usefulUpload");
  const uploadInput = m.root.querySelector("#usefulPdfInput");
  const nextIndex = () => {
    for (let index = 1; index <= 27; index += 1) {
      if (!rows.some((row) => row.index === index)) return index;
    }
    return 0;
  };
  const render = () => {
    tbody.innerHTML = rows.length
      ? rows.map((row) => `<tr>
          <td class="num">File ${row.index}</td>
          <td><span title="${esc(row.path)}">${esc(row.name || row.path)}</span></td>
          <td><div class="row" style="gap:6px;justify-content:flex-end">
            <button type="button" class="btn small" data-useful-view="${row.index}">View</button>
            <button type="button" class="btn small danger" data-useful-remove="${row.index}" title="Remove this file">&times;</button>
          </div></td>
        </tr>`).join("")
      : `<tr><td colspan="3" class="muted small">No useful-data files yet. Upload a PDF to add one; the button stays hidden for candidates until you save a file.</td></tr>`;
    tbody.querySelectorAll("[data-useful-view]").forEach((button) => {
      button.addEventListener("click", () => {
        const row = rows.find((entry) => entry.index === Number(button.dataset.usefulView));
        if (!row) return;
        if (!row.url) { toast("This file has no viewable URL.", "error"); return; }
        window.open(row.url, "_blank", "noopener");
      });
    });
    tbody.querySelectorAll("[data-useful-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        rows = rows.filter((row) => row.index !== Number(button.dataset.usefulRemove));
        render();
      });
    });
  };
  render();

  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that PDF."));
    reader.readAsDataURL(file);
  });

  uploadButton.addEventListener("click", () => uploadInput.click());
  uploadInput.addEventListener("change", async () => {
    const files = [...(uploadInput.files || [])];
    uploadInput.value = "";
    if (!files.length) return;
    const label = uploadButton.textContent;
    uploadButton.disabled = true;
    for (const file of files) {
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
        toast(`${file.name}: choose a PDF file.`, "error");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast(`${file.name}: keep each PDF under 5 MB.`, "error");
        continue;
      }
      const index = nextIndex();
      if (!index) { toast("All 27 useful-data slots are in use.", "error"); break; }
      uploadButton.textContent = "Uploading…";
      try {
        const uploaded = await api(`/assessments/${encodeURIComponent(assessment.id)}/useful-data/upload`, {
          method: "POST",
          body: { fileName: file.name, data: await readAsDataUrl(file) },
        });
        rows.push({
          index,
          path: String(uploaded.file?.path || ""),
          url: String(uploaded.file?.url || ""),
          name: String(uploaded.file?.name || file.name),
        });
        rows.sort((a, b) => a.index - b.index);
        render();
      } catch (e) {
        toast(e.message, "error");
      } finally {
        uploadButton.textContent = label;
      }
    }
    uploadButton.textContent = label;
    uploadButton.disabled = false;
  });

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    const files = rows
      .map((row) => ({ index: row.index, path: String(row.path || "").trim() }))
      .filter((row) => row.path);
    button.disabled = true;
    try {
      await api(`/assessments/${encodeURIComponent(assessment.id)}/useful-data`, {
        method: "PUT",
        body: { files },
      });
      toast("Useful Data files saved.", "success");
      m.close();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Edit group or section instruction text per language (quiz.xml). */
async function structureInstructionsForm(assessment, kind, options = {}) {
  const { groups, languages } = await api(`/assessments/${encodeURIComponent(assessment.id)}`);
  const initialLanguages = languages?.length ? languages : [{ id: 1, name: "English", primary: true }];
  const initialList = initialLanguages.map((language) => ({ id: Number(language.id), name: String(language.name) }));
  const isGroup = kind === "group";

  const rows = [];
  for (const group of groups || []) {
    if (isGroup) {
      rows.push({ id: group.id, extId: group.ext_id, name: group.name, parent: "", instruction: group.instruction });
    } else {
      for (const section of group.sections || []) {
        rows.push({
          id: section.id,
          extId: section.ext_id,
          name: section.name,
          parent: group.name,
          instruction: section.instruction,
        });
      }
    }
  }
  for (const row of rows) row.values = parseLocalisedInstruction(row.instruction, initialLanguages);

  const m = modal({
    title: `${isGroup ? "Group" : "Section"} instructions — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `${languageManagerHtml()}
      <p class="field-note" style="margin-top:0">HTML is allowed. Text is stored in <code>quiz.xml</code>; the candidate sees the same content when this button is opened.</p>
      <div data-inst-blocks></div>`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save ${rows.length ? "" : "disabled"}>Save instructions</button>`,
  });

  const blocksRoot = m.root.querySelector("[data-inst-blocks]");
  const collect = () => {
    m.root.querySelectorAll("[data-inst-id]").forEach((input) => {
      const row = rows.find((entry) => Number(entry.id) === Number(input.dataset.instId));
      if (row) row.values[input.dataset.instLang] = input.value;
    });
  };
  const render = (langs) => {
    if (!rows.length) {
      blocksRoot.innerHTML = `<div class="empty">This assessment has no ${isGroup ? "groups" : "sections"} yet.</div>`;
      return;
    }
    blocksRoot.innerHTML = rows.map((row) => `<details class="card" style="margin-bottom:10px">
      <summary style="cursor:pointer;padding:10px 14px;font-weight:600">
        ${esc(row.name)} <span class="muted small">${esc(row.extId || "")}${row.parent ? ` · ${esc(row.parent)}` : ""}</span>
      </summary>
      <div class="card-body">
        ${langs.map((language) => `<label style="margin-bottom:10px">${esc(language.name)}${language.primary ? " (primary)" : ""}
          <textarea data-inst-kind="${kind}" data-inst-id="${row.id}" data-inst-lang="${language.id}" style="min-height:110px">${esc(row.values[language.id] || "")}</textarea>
        </label>`).join("")}
      </div>
    </details>`).join("");
  };
  const manager = bindLanguageManager(m.root, initialLanguages, (langs) => {
    collect();
    render(langs);
  });
  render(manager.languages());

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    button.disabled = true;
    try {
      collect();
      const langs = manager.languages();
      if (!sameLanguageList(initialList, langs)) await saveLanguages(assessment.id, langs);
      const endpoint = isGroup ? "groups" : "sections";
      for (const row of rows) {
        const values = {};
        for (const language of langs) values[language.id] = row.values[language.id] || "";
        await api(`/${endpoint}/${row.id}`, {
          method: "PUT",
          body: { instruction: joinLocalisedInstruction(values, langs) },
        });
      }
      toast(`${isGroup ? "Group" : "Section"} instructions saved.`, "success");
      m.close();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Edit question-level instruction text shown by the Question Instructions button. */
async function questionInstructionsForm(assessment, options = {}) {
  const data = await api(`/assessments/${encodeURIComponent(assessment.id)}/question-instructions`);
  const groups = data.groups || [];
  const initialLanguages = data.languages?.length ? data.languages : [{ id: 1, name: "English", primary: true }];
  const initialList = initialLanguages.map((language) => ({ id: Number(language.id), name: String(language.name) }));
  const hasQuestions = groups.some((group) =>
    (group.sections || []).some((section) => (section.questions || []).length));
  const values = new Map();
  for (const group of groups) {
    for (const section of group.sections || []) {
      for (const question of section.questions || []) {
        values.set(Number(question.id), parseLocalisedInstruction(question.instruction, initialLanguages));
      }
    }
  }

  const m = modal({
    title: `Question instructions — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `${languageManagerHtml()}
      ${hasQuestions
        ? `<p class="field-note" style="margin-top:0">HTML is allowed. Leave every language box empty to show no question instruction. Text is stored in <code>quiz.xml</code> for the candidate.</p><div data-qi-blocks></div>`
        : `<div class="empty">This assessment has no questions yet. Upload its paper first.</div>`}`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save ${hasQuestions ? "" : "disabled"}>Save instructions</button>`,
  });

  const blocksRoot = m.root.querySelector("[data-qi-blocks]");
  const collect = () => {
    m.root.querySelectorAll("[data-qi]").forEach((input) => {
      const id = Number(input.dataset.qi);
      const entry = values.get(id) || {};
      entry[input.dataset.qiLang] = input.value;
      values.set(id, entry);
    });
  };
  const render = (langs) => {
    if (!blocksRoot) return;
    blocksRoot.innerHTML = groups.map((group) => {
      const sections = (group.sections || []).map((section) => {
        const questions = section.questions || [];
        return `<div style="margin:0 0 12px">
          <h4 style="margin:0 0 6px;font-size:13px">${esc(section.name)} <span class="muted small">${esc(section.extId || "")}</span></h4>
          ${questions.length ? questions.map((question) => {
            const entry = values.get(Number(question.id)) || {};
            return `<div style="margin-bottom:10px">
              <span class="muted small">${esc(question.extId)} · ${esc(question.type)} — ${esc(String(question.body || "").replace(/<[^>]*>/g, " ").slice(0, 110))}</span>
              ${langs.map((language) => `<label style="margin:4px 0 6px;display:block">${esc(language.name)}${language.primary ? " (primary)" : ""}
                <textarea data-qi="${question.id}" data-qi-lang="${language.id}" style="min-height:64px" placeholder="Instruction shown before this question (optional)">${esc(entry[language.id] || "")}</textarea>
              </label>`).join("")}
            </div>`;
          }).join("") : `<p class="muted small">No questions in this section.</p>`}
        </div>`;
      }).join("");
      return `<details class="card" style="margin-bottom:10px">
        <summary style="cursor:pointer;padding:10px 14px;font-weight:600">${esc(group.name)} <span class="muted small">${esc(group.extId || "")}</span></summary>
        <div class="card-body">${sections || `<p class="muted small">No sections.</p>`}</div>
      </details>`;
    }).join("");
  };
  const manager = bindLanguageManager(m.root, initialLanguages, (langs) => {
    collect();
    render(langs);
  });
  render(manager.languages());

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    button.disabled = true;
    try {
      collect();
      const langs = manager.languages();
      const items = [];
      for (const group of groups) {
        for (const section of group.sections || []) {
          for (const question of section.questions || []) {
            items.push({
              id: Number(question.id),
              instruction: joinLocalisedInstruction(values.get(Number(question.id)) || {}, langs),
            });
          }
        }
      }
      if (!items.length) return;
      if (!sameLanguageList(initialList, langs)) await saveLanguages(assessment.id, langs);
      await api(`/assessments/${encodeURIComponent(assessment.id)}/question-instructions`, {
        method: "PUT",
        body: { items },
      });
      toast("Question instructions saved.", "success");
      m.close();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/** Read-only paper preview; each question opens the normal question editor. */
async function paperPreviewForm(assessment, options = {}) {
  const data = await api(`/assessments/${encodeURIComponent(assessment.id)}/paper-preview`);
  const groups = data.groups || [];
  const totalQuestions = groups.reduce((total, group) => total +
    (group.sections || []).reduce((count, section) => count + (section.questions || []).length, 0), 0);

  const body = groups.length ? groups.map((group) => {
    const sections = (group.sections || []).map((section) => {
      const questions = section.questions || [];
      return `<div style="margin:0 0 16px">
        <h4 style="margin:0 0 6px;font-size:13px">${esc(section.name)} <span class="muted small">${esc(section.extId || "")} · ${questions.length} question(s)</span></h4>
        ${questions.length ? questions.map((question) => `<div class="card" style="margin:8px 0;box-shadow:none">
          <div class="card-head" style="padding:8px 12px">
            <h3 style="font-size:13px;margin:0">${esc(question.extId)} · ${esc(question.type)}</h3>
            <div class="row">
              <span class="muted small">${num(question.marks, 2)} mark(s)${Number(question.negativeMarks) ? ` · −${num(question.negativeMarks, 2)}` : ""}</span>
              <button class="btn small" data-paper-question="${question.id}">Edit</button>
            </div>
          </div>
          <div class="card-body" style="padding:8px 12px">
            <div class="small" style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(question.body)}</div>
            ${question.options?.length ? `<ol class="small" style="margin:8px 0 0;padding-left:22px">${question.options.map((option) => `<li style="${option.correct ? "font-weight:600" : ""}">${esc(option.body)}${option.correct ? " ✓" : ""}</li>`).join("")}</ol>` : ""}
          </div>
        </div>`).join("") : `<p class="muted small">No questions in this section.</p>`}
      </div>`;
    }).join("");
    return `<details class="card" style="margin-bottom:12px" open>
      <summary style="cursor:pointer;padding:10px 14px;font-weight:600">${esc(group.name)} <span class="muted small">${esc(group.extId || "")}</span></summary>
      <div class="card-body">${sections || `<p class="muted small">No sections.</p>`}</div>
    </details>`;
  }).join("") : `<div class="empty">No questions yet. Upload the assessment paper first.</div>`;

  const m = modal({
    title: `Question paper — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `${languageManagerHtml()}
      <p class="field-note" style="margin-top:0">${totalQuestions} question(s) in ${groups.length} group(s). This is the paper content the candidate sees. Use <strong>Edit</strong> on a question to change its text, answer key or marks in any language.</p>${body}`,
    footer: `<button class="btn" data-close>Back to Candidate UI</button><button class="btn primary" data-save>Save languages</button>`,
  });

  const manager = bindLanguageManager(m.root, data.languages || []);
  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    button.disabled = true;
    try {
      await saveLanguages(assessment.id, manager.languages());
      toast("Languages saved.", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  m.root.querySelectorAll("[data-paper-question]").forEach((button) => {
    button.addEventListener("click", () => {
      openQuestion(Number(button.dataset.paperQuestion), 0, {
        onClose: () => paperPreviewForm(assessment, options),
      });
    });
  });
}

/** Edit system instructions, custom instructions and disclaimer per language. */
async function instructionsForm(assessment, options = {}) {
  const data = await api(`/assessments/${encodeURIComponent(assessment.id)}/instructions`);
  const initialLanguages = data.languages || [];
  const initialList = initialLanguages.map((language) => ({ id: Number(language.id), name: String(language.name) }));
  const values = new Map(initialLanguages.map((language) => [Number(language.id), {
    systemInstruction: language.systemInstruction || "",
    customInstruction: language.customInstruction || "",
    disclaimer: language.disclaimer || "",
  }]));

  const m = modal({
    title: `Candidate instructions — ${assessment.id}`,
    wide: true,
    onClose: options.onClose,
    body: `${languageManagerHtml()}
      <p class="field-note" style="margin-top:0">HTML is allowed. Text is stored in the same <code>sysInstructions.xml</code> and <code>custInstructions.xml</code> files the candidate console reads.</p>
      <div data-lang-blocks></div>`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save instructions</button>`,
  });

  const blocksRoot = m.root.querySelector("[data-lang-blocks]");
  const collect = () => {
    m.root.querySelectorAll("[data-lang]").forEach((input) => {
      const id = Number(input.dataset.lang);
      const entry = values.get(id) || { systemInstruction: "", customInstruction: "", disclaimer: "" };
      entry[input.dataset.field] = input.value;
      values.set(id, entry);
    });
  };
  const render = (languages) => {
    blocksRoot.innerHTML = languages.map((language, index) => `<details class="card" ${index === 0 ? "open" : ""} style="margin-bottom:12px">
      <summary style="cursor:pointer;padding:10px 14px;font-weight:600">
        ${esc(language.name)}${language.primary ? " (primary)" : ""}
      </summary>
      <div class="card-body">
        <label>System instructions (shown on the instructions page)
          <textarea data-lang="${language.id}" data-field="systemInstruction" style="min-height:180px"></textarea>
        </label>
        <label style="margin-top:12px">Custom instructions (paper-specific additions)
          <textarea data-lang="${language.id}" data-field="customInstruction" style="min-height:120px"></textarea>
        </label>
        <label style="margin-top:12px">Disclaimer
          <textarea data-lang="${language.id}" data-field="disclaimer" style="min-height:90px"></textarea>
        </label>
      </div>
    </details>`).join("");
    for (const language of languages) {
      const entry = values.get(Number(language.id)) || {};
      for (const field of ["systemInstruction", "customInstruction", "disclaimer"]) {
        const input = blocksRoot.querySelector(`[data-lang="${language.id}"][data-field="${field}"]`);
        if (input) input.value = entry[field] || "";
      }
    }
  };
  const manager = bindLanguageManager(m.root, initialLanguages, (languages) => {
    collect();
    render(languages);
  });
  render(manager.languages());

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    button.disabled = true;
    try {
      collect();
      const languages = manager.languages();
      if (!sameLanguageList(initialList, languages)) await saveLanguages(assessment.id, languages);
      const rows = languages.map((language) => ({
        id: language.id,
        systemInstruction: values.get(Number(language.id))?.systemInstruction || "",
        customInstruction: values.get(Number(language.id))?.customInstruction || "",
        disclaimer: values.get(Number(language.id))?.disclaimer || "",
      }));
      await api(`/assessments/${encodeURIComponent(assessment.id)}/instructions`, {
        method: "PUT",
        body: { languages: rows },
      });
      toast("Candidate instructions saved.", "success");
      m.close();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/**
 * Settings → Instructions. One editor for every assessment; saving writes the
 * same values into each assessment that uses the language. Per-assessment
 * instruction edits continue to touch only that paper.
 */
async function globalInstructionsForm() {
  const data = await api("/settings/instructions");
  const initialLanguages = (data.languages || [])
    .map((language) => ({
      id: Number(language.id),
      name: String(language.name || ""),
      primary: Boolean(language.primary),
    }))
    .filter((language) => Number.isInteger(language.id));
  const initialList = initialLanguages.map((language) => ({ id: Number(language.id), name: String(language.name) }));
  if (!initialLanguages.length) {
    toast("No assessment languages found yet.", "error");
    return;
  }
  const values = new Map((data.languages || []).map((language) => [Number(language.id), {
    systemInstruction: language.systemInstruction || "",
    customInstruction: language.customInstruction || "",
    disclaimer: language.disclaimer || "",
  }]));

  const m = modal({
    title: "Candidate instructions — all assessments",
    wide: true,
    body: `${languageManagerHtml("The primary language cannot be removed. Added or removed languages are applied to every assessment.")}
      <p class="field-note" style="margin-top:0">These instructions are written to <strong>every assessment</strong> that uses the language. Saving here updates all of them at once. Paper language changes here are applied to every assessment. To change one assessment only, use <strong>Assessments → Edit → Instructions</strong>.</p>
      <p class="field-note" style="margin-top:0">${data.stored
        ? "The fields below show the current global template."
        : "No global template is stored yet; the fields below show the values from the existing assessments. Saving creates the global template."}</p>
      <div data-lang-blocks></div>`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save for all assessments</button>`,
  });

  const blocksRoot = m.root.querySelector("[data-lang-blocks]");
  const collect = () => {
    blocksRoot.querySelectorAll("[data-lang]").forEach((input) => {
      const id = Number(input.dataset.lang);
      const entry = values.get(id) || { systemInstruction: "", customInstruction: "", disclaimer: "" };
      entry[input.dataset.field] = input.value;
      values.set(id, entry);
    });
  };
  const render = (languages) => {
    blocksRoot.innerHTML = languages.map((language, index) => `<details class="card" ${index === 0 ? "open" : ""} style="margin-bottom:12px">
      <summary style="cursor:pointer;padding:10px 14px;font-weight:600">
        ${esc(language.name)}${language.primary ? " (primary)" : ""}
      </summary>
      <div class="card-body">
        <label>System instructions (shown on the instructions page)
          <textarea data-lang="${language.id}" data-field="systemInstruction" style="min-height:180px"></textarea>
        </label>
        <label style="margin-top:12px">Custom instructions (paper-specific additions)
          <textarea data-lang="${language.id}" data-field="customInstruction" style="min-height:120px"></textarea>
        </label>
        <label style="margin-top:12px">Disclaimer
          <textarea data-lang="${language.id}" data-field="disclaimer" style="min-height:90px"></textarea>
        </label>
      </div>
    </details>`).join("");
    for (const language of languages) {
      const entry = values.get(Number(language.id)) || {};
      for (const field of ["systemInstruction", "customInstruction", "disclaimer"]) {
        const input = blocksRoot.querySelector(`[data-lang="${language.id}"][data-field="${field}"]`);
        if (input) input.value = entry[field] || "";
      }
    }
  };
  const manager = bindLanguageManager(m.root, initialLanguages, (languages) => {
    collect();
    render(languages);
  });
  render(manager.languages());

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    collect();
    const languages = manager.languages();
    const before = new Map(initialList.map((language) => [language.id, language]));
    const after = new Map(languages.map((language) => [language.id, language]));
    const added = languages
      .filter((language) => !before.has(language.id))
      .map((language) => ({ id: language.id, name: language.name }));
    const removed = initialList
      .filter((language) => !after.has(language.id))
      .map((language) => language.id);
    const changed = added.length > 0 || removed.length > 0;
    const rows = languages.map((language) => ({
      id: language.id,
      name: language.name,
      systemInstruction: values.get(Number(language.id))?.systemInstruction || "",
      customInstruction: values.get(Number(language.id))?.customInstruction || "",
      disclaimer: values.get(Number(language.id))?.disclaimer || "",
    }));

    if (changed) {
      const parts = [];
      if (added.length) {
        parts.push(`add ${added.map((language) => `${language.name} (#${language.id})`).join(", ")}`);
      }
      if (removed.length) {
        const names = removed.map((id) => {
          const language = initialList.find((entry) => entry.id === id);
          return `${language?.name || "language"} (#${id})`;
        });
        parts.push(`remove ${names.join(", ")} and delete ${removed.length === 1 ? "its" : "their"} translations`);
      }
      if (!(await confirmDialog(
        `Save these instructions and update paper languages on every assessment? This will ${parts.join("; ")}.`,
        "Save for all assessments",
      ))) return;
    } else if (!(await confirmDialog(
      `Save these instructions for every assessment? ${data.assessmentCount || 0} assessment(s) that use these languages will be updated.`,
      "Save for all assessments",
    ))) return;

    const button = m.root.querySelector("[data-save]");
    if (button) button.disabled = true;
    try {
      const saved = await api("/settings/instructions", {
        method: "PUT",
        body: { languages: rows, ...(changed ? { languageChanges: { added, removed } } : {}) },
      });
      toast(changed
        ? `Instructions and paper languages saved; ${saved.updated ?? 0} assessment(s) updated.`
        : `Instructions saved for ${saved.updated ?? 0} assessment(s).`, "success");
      m.close();
    } catch (e) {
      if (button) button.disabled = false;
      toast(e.message, "error");
    }
  });
}

/**
 * Question paper upload from CSV. Each language row accepts a question-bank CSV;
 * the server converts it to quiz.xml, merges the languages and imports the paper.
 * confDetails.xml is taken from the existing paper or generated automatically.
 */
function paperUploadForm(assessment, softwareLanguages = []) {
  const basePath = assessment.base_path || autoBasePath(assessment.org_id, assessment.id);
  const existingLanguages = (softwareLanguages || []).filter(Boolean).slice(0, 3);
  const initialLanguages = existingLanguages.length ? existingLanguages : ["English"];

  let demoCsv = "";

  function row(language, index, primary = false) {
    return `<tr class="paper-row${primary ? " paper-primary" : ""}">
      <td><input class="paper-name" value="${esc(language)}" maxlength="32" placeholder="Language" /></td>
      <td style="width:74px"><input class="paper-code" type="number" min="1" max="99" value="${index + 1}" /></td>
      <td><input class="paper-file" type="file" accept=".csv,.xml,text/csv,application/xml,text/xml" /></td>
      <td style="width:38px"><button type="button" class="btn small danger paper-remove" title="Remove language">&times;</button></td>
    </tr>`;
  }

  const m = modal({
    title: `Upload question paper - ${assessment.id}`,
    wide: true,
    body: `
      <p class="paper-path" style="margin:0">Paper folder: <code>${esc(basePath || "not set")}</code> <span class="muted">(managed automatically)</span></p>
      <div class="row" style="justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        ${demoLinks()}
        <button type="button" class="btn small" id="paperDemo">Use demo CSV</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Language</th><th>ID</th><th>CSV / quiz.xml</th><th></th></tr></thead>
        <tbody id="paperRows">${initialLanguages.map((language, index) => row(language, index, index === 0)).join("")}</tbody>
      </table></div>
      ${existingLanguages.length > 1 ? `<p class="muted small" style="margin:10px 0 0">This paper already has ${existingLanguages.length} languages. They are pre-filled below; remove a secondary row if the new paper has fewer languages.</p>` : ""}
      <p class="muted small" style="margin:10px 0 0">Use the same Question ID (or Question No) in each language CSV so their translations stay on one question number.</p>
      <p class="muted small" style="margin:6px 0 0">One CSV can also carry <code>Group Instruction</code>, <code>Group Instruction Time</code>, <code>Group Max Duration</code>, <code>Section Instruction</code>, <code>Section Type</code>, <code>Section Max Questions</code> and paper settings such as <code>Assessment Duration</code>, <code>Max Attempts</code>, <code>Show Feedback</code>, <code>Store Response</code> and <code>Show View QP Button</code>. See the demo CSV for the full header.</p>
      <p class="muted small" style="margin:6px 0 0">New here? Click <strong>Use demo CSV</strong> to try the complete demo paper without downloading a file. The first language row is the primary language and cannot be removed.</p>
      <div class="row" style="margin-top:12px">
        <button type="button" class="btn small" id="paperAdd">Add language</button>
        <span class="muted small" id="paperStatus">The assessment becomes active after import.</span>
      </div>`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-upload>Upload &amp; import</button>`,
  });

  const rowsBody = m.root.querySelector("#paperRows");
  const addButton = m.root.querySelector("#paperAdd");
  const demoButton = m.root.querySelector("#paperDemo");
  const status = m.root.querySelector("#paperStatus");

  const syncRows = () => {
    const count = rowsBody.querySelectorAll(".paper-row").length;
    const primaryRow = rowsBody.querySelector(".paper-row");
    rowsBody.querySelectorAll(".paper-remove").forEach((button) => {
      const isPrimary = button.closest(".paper-row") === primaryRow;
      button.style.visibility = count > 1 && !isPrimary ? "visible" : "hidden";
      button.title = isPrimary ? "Primary language cannot be removed" : "Remove language";
    });
    addButton.disabled = count >= 3;
    addButton.textContent = count >= 3 ? "3 languages max" : "Add language";
  };
  syncRows();

  addButton.addEventListener("click", () => {
    const count = rowsBody.querySelectorAll(".paper-row").length;
    if (count >= 3) return;
    rowsBody.insertAdjacentHTML("beforeend", row("", count));
    syncRows();
    rowsBody.querySelector(".paper-row:last-child .paper-name").focus();
  });

  rowsBody.addEventListener("click", (event) => {
    const button = event.target.closest(".paper-remove");
    if (!button) return;
    if (button.closest(".paper-row").classList.contains("paper-primary")) return;
    if (rowsBody.querySelectorAll(".paper-row").length <= 1) return;
    button.closest(".paper-row").remove();
    syncRows();
  });

  demoButton.addEventListener("click", async () => {
    demoButton.disabled = true;
    status.textContent = "Loading demo CSV...";
    try {
      const res = await fetch(DEMO_PAPER.csv, { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) throw new Error("Could not load the demo CSV.");
      demoCsv = await res.text();
      rowsBody.querySelectorAll(".paper-row").forEach((rowElement, index) => {
        if (index > 0) rowElement.remove();
      });
      const first = rowsBody.querySelector(".paper-row");
      const nameInput = first.querySelector(".paper-name");
      const codeInput = first.querySelector(".paper-code");
      if (!nameInput.value.trim()) nameInput.value = "English";
      if (!Number(codeInput.value)) codeInput.value = "1";
      first.querySelector(".paper-file").value = "";
      syncRows();
      status.textContent = "Demo CSV loaded (single language). Click Upload & import to try it.";
      demoButton.textContent = "Demo CSV loaded";
    } catch (e) {
      status.textContent = "";
      toast(e.message, "error");
    } finally {
      demoButton.disabled = false;
    }
  });

  m.root.querySelector("[data-upload]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-upload]");
    const tableRows = Array.from(rowsBody.querySelectorAll(".paper-row"));
    if (!tableRows.length) { toast("Add one language paper.", "error"); return; }

    button.disabled = true;
    status.textContent = "Reading CSV...";
    try {
      const confXml = await confXmlFor(assessment);
      const languages = [];
      const usedNames = new Set();
      const usedCodes = new Set();
      for (const [index, tableRow] of tableRows.entries()) {
        const name = tableRow.querySelector(".paper-name").value.trim();
        const code = Number(tableRow.querySelector(".paper-code").value);
        if (!name) throw new Error(`Language ${index + 1}: name is required.`);
        if (!Number.isInteger(code) || code < 1 || code > 99) {
          throw new Error(`Language "${name}": ID must be between 1 and 99.`);
        }
        if (usedNames.has(name.toLowerCase())) throw new Error(`Language "${name}" is used twice.`);
        if (usedCodes.has(code)) throw new Error(`Language ID ${code} is used twice.`);
        usedNames.add(name.toLowerCase());
        usedCodes.add(code);
        const fileInput = tableRow.querySelector(".paper-file");
        const content = fileInput.files && fileInput.files[0]
          ? await fileText(fileInput, `${name} CSV`)
          : (index === 0 && demoCsv ? demoCsv : "");
        if (!content) throw new Error(`Choose ${name} CSV, or use the demo CSV.`);
        if (/<questionPaperXML\b/.test(content)) {
          languages.push({ name, code, quizXml: content, confXml });
        } else {
          languages.push({ name, code, csv: content, confXml });
        }
      }
      if (Number(assessment.total_marks) > 0) {
        const replace = await confirmDialog(
          `Replace the existing paper for ${assessment.id}? Questions, groups and sections will be replaced; attempts and responses are preserved.`,
          "Replace paper",
        );
        if (!replace) {
          button.disabled = false;
          status.textContent = "";
          return;
        }
      }
      status.textContent = "Uploading and importing...";
      const data = await api(`/assessments/${encodeURIComponent(assessment.id)}/papers`, {
        method: "POST",
        body: { basePath, languages },
      });

      let active = true;
      try {
        await api(`/assessments/${encodeURIComponent(assessment.id)}`, {
          method: "PUT",
          body: { status: "active" },
        });
      } catch { active = false; }

      m.close();
      const count = data.imported?.questions ?? 0;
      const languageCount = (data.languages || []).length;
      toast(
        `Paper imported: ${count} questions${languageCount > 1 ? `, ${languageCount} languages` : ""}. ${active ? "Assessment is now active." : "Set the status to active from Edit."}`,
        active ? "success" : "error",
      );
      renderAssessments();
    } catch (e) {
      status.textContent = "";
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

// ---------------------------------------------------------------------------
// questions
// ---------------------------------------------------------------------------
async function renderQuestions() {
  const { assessments } = await api("/assessments");
  if (!state.assessmentId && assessments.length) state.assessmentId = assessments[0].id;
  const selected = assessments.find((a) => a.id === state.assessmentId) || assessments[0];
  const structure = selected ? await api("/assessments/" + encodeURIComponent(selected.id)) : { groups: [], languages: [] };
  const languages = structure.languages || [];
  const selectedLanguage = languages.find((language) => Number(language.id) === Number(state.questionsLang))
    || languages.find((language) => language.primary)
    || languages[0];
  const langId = selectedLanguage ? Number(selectedLanguage.id) : 0;
  state.questionsLang = langId;
  $("#topbarActions").innerHTML = selected
    ? `<button class="btn" id="importQuestions">Import CSV</button>
       <a class="btn" href="/api/admin/export/questions.csv?assessment=${encodeURIComponent(selected.id)}">Export CSV</a>`
    : "";
  if (selected) $("#importQuestions").addEventListener("click", () => importQuestionsForm(selected));
  const params = new URLSearchParams({ assessment: state.assessmentId, page: state.questionsPage, pageSize: 25 });
  if (state.questionsSection) params.set("section", state.questionsSection);
  if (state.questionsTerm) params.set("q", state.questionsTerm);
  if (langId) params.set("lang", langId);
  const { questions, total, pageSize } = await api("/questions?" + params);

  const row = (q) => `<tr class="clickable" draggable="true" data-q="${q.id}">
    <td class="drag-cell"><span class="drag-handle" title="Drag to reorder">&#8942;&#8942;</span></td>
    <td class="num">${q.seq}</td>
    <td class="small">${esc(q.ext_id || "—")}</td>
    <td><span class="pill">${esc(q.type)}</span></td>
    <td class="small">${esc(q.group_name || "—")}</td>
    <td class="small">${esc(q.section_name || "—")}</td>
    <td>${esc((q.body || "").replace(/<[^>]+>/g, " ").trim().slice(0, 140) || `(question ${q.ext_id})`)}</td>
    <td class="num">${num(q.marks, 2)}</td>
    <td class="num">${num(q.negative_marks, 2)}</td>
    <td class="row"><label class="q-mandatory" title="Mandatory question"><input type="checkbox" data-qmand="${q.id}" ${q.mandatory ? "checked" : ""} /> Mandatory</label><button class="btn small danger" data-qdel="${q.id}">Delete</button></td>
  </tr>`;

  $("#view").innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="toolbar">
          <label>Assessment<select id="qAssessment">
            ${assessments.map((a) => `<option value="${esc(a.id)}" ${a.id === state.assessmentId ? "selected" : ""}>${esc(a.id)} — ${esc(a.name)}</option>`).join("")}
          </select></label>
          <label class="grow">Search<input id="qSearch" value="${esc(state.questionsTerm)}" placeholder="Question text or ID" /></label>
          <label>Section<select id="qSection">
            <option value="0">All sections</option>
            ${structure.groups.map((g) => `<optgroup label="${esc(g.name)}">${g.sections.map((s) => `<option value="${s.id}" ${Number(state.questionsSection) === s.id ? "selected" : ""}>${esc(s.name)} (${s.questions})</option>`).join("")}</optgroup>`).join("")}
          </select></label>
          ${languages.length ? `<label>Language<select id="qLanguage">
            ${languages.map((language) => `<option value="${language.id}" ${Number(langId) === Number(language.id) ? "selected" : ""}>${esc(language.name)}${language.primary ? " · primary" : ""}</option>`).join("")}
          </select></label>` : ""}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Questions</h3><span class="sub">${total}${state.questionsTerm ? " matching" : ""} · drag rows to reorder</span></div>
      <div class="card-body tight">
        ${questions.length ? `<div class="table-wrap"><table>
          <thead><tr><th class="drag-col"></th><th>#</th><th>ID</th><th>Type</th><th>Group</th><th>Section</th><th>Question</th><th>Marks</th><th>Negative</th><th></th></tr></thead>
          <tbody>${questions.map(row).join("")}</tbody></table></div>` : `<div class="empty">${state.questionsSection || state.questionsTerm ? "No questions match the filters." : "No questions. Import a paper first."}</div>`}
      </div>
      <div class="pagination">
        <button class="btn small" id="qPrev" ${state.questionsPage <= 1 ? "disabled" : ""}>Previous</button>
        <span class="info">Page ${state.questionsPage} · ${total} questions</span>
        <button class="btn small" id="qNext" ${state.questionsPage * pageSize >= total ? "disabled" : ""}>Next</button>
      </div>
    </div>`;

  $("#qAssessment").addEventListener("change", (e) => {
    state.assessmentId = e.target.value;
    state.questionsPage = 1;
    state.questionsSection = 0;
    state.questionsLang = 0;
    state.questionsTerm = "";
    renderQuestions();
  });
  $("#qSection").addEventListener("change", (e) => {
    state.questionsSection = Number(e.target.value) || 0;
    state.questionsPage = 1;
    renderQuestions();
  });
  const languageSelect = $("#qLanguage");
  if (languageSelect) languageSelect.addEventListener("change", (e) => {
    state.questionsLang = Number(e.target.value) || 0;
    state.questionsPage = 1;
    renderQuestions();
  });
  $("#qSearch").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    state.questionsTerm = e.target.value.trim();
    state.questionsPage = 1;
    renderQuestions();
  });
  $("#qPrev").addEventListener("click", () => { state.questionsPage = Math.max(1, state.questionsPage - 1); renderQuestions(); });
  $("#qNext").addEventListener("click", () => { state.questionsPage += 1; renderQuestions(); });
  bindRows();
  enableDrag();

  function bindRows() {
    const body = $("#view").querySelector("table tbody");
    if (!body) return;
    body.querySelectorAll("[data-q]").forEach((tr) => tr.addEventListener("click", (event) => {
      if (event.target.closest("[data-qdel]") || event.target.closest(".q-mandatory") || event.target.closest(".drag-cell")) return;
      openQuestion(Number(tr.dataset.q), langId);
    }));
    body.querySelectorAll("[data-qdel]").forEach((button) => button.addEventListener("click", async (event) => {
      event.stopPropagation();
      await deleteQuestion(Number(button.dataset.qdel));
    }));
    body.querySelectorAll("[data-qmand]").forEach((input) => input.addEventListener("change", async () => {
      input.disabled = true;
      try {
        await api("/questions/" + Number(input.dataset.qmand), { method: "PUT", body: { mandatory: input.checked } });
        toast(input.checked ? "Question marked mandatory." : "Question marked optional.", "success");
      } catch (e) {
        input.checked = !input.checked;
        toast(e.message, "error");
      } finally {
        input.disabled = false;
      }
    }));
  }

  function enableDrag() {
    const body = $("#view").querySelector("table tbody");
    if (!body) return;
    let dragged = null;
    const clearMarks = () => body.querySelectorAll(".drop-before, .drop-after").forEach((el) => el.classList.remove("drop-before", "drop-after"));

    body.addEventListener("dragstart", (event) => {
      const tr = event.target.closest("[data-q]");
      if (!tr) { event.preventDefault(); return; }
      dragged = tr;
      tr.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      try { event.dataTransfer.setData("text/plain", tr.dataset.q); } catch { /* ignore */ }
    });

    body.addEventListener("dragover", (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      clearMarks();
      const tr = event.target.closest("[data-q]");
      if (!tr || tr === dragged) return;
      const rect = tr.getBoundingClientRect();
      tr.classList.add(event.clientY > rect.top + rect.height / 2 ? "drop-after" : "drop-before");
    });

    body.addEventListener("dragleave", (event) => {
      if (!body.contains(event.relatedTarget)) clearMarks();
    });

    body.addEventListener("drop", async (event) => {
      if (!dragged) return;
      event.preventDefault();
      const target = event.target.closest("[data-q]");
      if (!target || target === dragged) { cleanup(); return; }
      const rect = target.getBoundingClientRect();
      if (event.clientY > rect.top + rect.height / 2) target.after(dragged);
      else target.before(dragged);
      const ids = [...body.querySelectorAll("[data-q]")].map((tr) => Number(tr.dataset.q));
      cleanup();
      try {
        await api("/questions/reorder", {
          method: "POST",
          body: { assessmentId: state.assessmentId, ids },
        });
        toast("Question order updated.", "success");
        renderQuestions();
      } catch (e) {
        toast(e.message, "error");
        renderQuestions();
      }
    });

    body.addEventListener("dragend", cleanup);

    function cleanup() {
      if (dragged) dragged.classList.remove("dragging");
      dragged = null;
      clearMarks();
    }
  }
}

async function deleteQuestion(id) {
  if (!(await confirmDialog("Delete this question? Linked candidate responses will also be removed.", "Delete"))) return;
  try {
    await api("/questions/" + id, { method: "DELETE" });
    toast("Question deleted.", "success");
    renderQuestions();
  } catch (e) {
    toast(e.message, "error");
  }
}

async function openQuestion(id, langId = 0, options = {}) {
  const query = langId ? `?lang=${encodeURIComponent(langId)}` : "";
  const { question, options: optionRows, languages, langId: currentLangId } = await api("/questions/" + id + query);
  const languageEntries = languages || [];
  const language = languageEntries.find((entry) => Number(entry.id) === Number(currentLangId));
  const draft = options.draft && Number(options.draft.langId) === Number(currentLangId) ? options.draft : null;
  const initialBody = draft ? draft.body : question.body;
  const initialMarks = draft ? draft.marks : question.marks;
  const initialNegative = draft ? draft.negativeMarks : question.negative_marks;
  const optionValue = (option) => draft?.options?.[option.id] || option;

  const m = modal({
    title: `Question ${question.seq} · ${question.type}${language ? ` · ${language.name}` : ""}`,
    wide: true,
    onClose: options.onClose,
    body: `
      ${languageEntries.length ? `<div class="row" style="justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <label style="max-width:280px;margin:0">Language<select id="qEditLanguage">
          ${languageEntries.map((entry) => `<option value="${entry.id}" ${Number(entry.id) === Number(currentLangId) ? "selected" : ""}>${esc(entry.name)}${entry.primary ? " · primary" : ""}</option>`).join("")}
        </select></label>
        <button type="button" class="btn small" data-manage-languages>Manage languages</button>
      </div>` : ""}
      <label>Question body (HTML / media tags preserved)
        <textarea name="body" style="min-height:160px">${esc(initialBody)}</textarea>
      </label>
      <div class="grid2">
        <label>Marks<input name="marks" type="number" step="0.25" value="${esc(initialMarks)}" /></label>
        <label>Negative marks<input name="negativeMarks" type="number" step="0.25" value="${esc(initialNegative)}" /></label>
      </div>
      ${optionRows.length ? `<div>
        <div class="card-head" style="padding:0 0 8px"><h3>Options — tick the correct answer key</h3></div>
        <div class="table-wrap"><table>
          <thead><tr><th style="width:60px">Correct</th><th style="width:60px">#</th><th>Option text</th></tr></thead>
          <tbody>${optionRows.map((o) => {
            const value = optionValue(o);
            return `<tr>
              <td><input type="checkbox" data-opt="${o.id}" ${value.correct ? "checked" : ""} style="width:auto" /></td>
              <td class="num">${esc(o.ext_id)}</td>
              <td><input data-opt-body="${o.id}" value="${esc(value.body)}" /></td>
            </tr>`;
          }).join("")}</tbody></table></div>
      </div>` : `<p class="muted small">This question type has no options (subjective / typing / file response).</p>`}
      <p class="muted small">Question ID ${esc(question.ext_id || "—")} · ${esc(language?.name || "language")} · database row ${question.id} · section ${question.section_id}</p>
    `,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save question</button>`,
  });

  const captureDraft = () => {
    const optionValues = {};
    optionRows.forEach((option) => {
      optionValues[option.id] = {
        correct: m.root.querySelector(`[data-opt="${option.id}"]`).checked,
        body: m.root.querySelector(`[data-opt-body="${option.id}"]`).value,
      };
    });
    return {
      langId: currentLangId,
      body: m.root.querySelector("[name=body]").value,
      marks: m.root.querySelector("[name=marks]").value,
      negativeMarks: m.root.querySelector("[name=negativeMarks]").value,
      options: optionValues,
    };
  };

  const languageSelect = m.root.querySelector("#qEditLanguage");
  if (languageSelect) languageSelect.addEventListener("change", async () => {
    const dirty = (() => {
      const current = captureDraft();
      if (current.body !== String(initialBody ?? "")) return true;
      if (Number(current.marks) !== Number(initialMarks)) return true;
      if (Number(current.negativeMarks) !== Number(initialNegative)) return true;
      return optionRows.some((option) => {
        const before = optionValue(option);
        const after = current.options[option.id];
        return Boolean(before.correct) !== Boolean(after.correct)
          || String(before.body ?? "") !== String(after.body ?? "");
      });
    })();
    if (dirty && !(await confirmDialog("Switch language and discard the unsaved changes to this question?", "Switch"))) {
      languageSelect.value = String(currentLangId);
      return;
    }
    openQuestion(id, Number(languageSelect.value), { ...options, draft: null });
  });

  m.root.querySelector("[data-manage-languages]")?.addEventListener("click", () => {
    const questionDraft = captureDraft();
    languageManagerForm(question.assessment_id, {
      onClose: (saved) => {
        const nextId = !saved || saved.some((entry) => Number(entry.id) === Number(currentLangId))
          ? currentLangId
          : (saved.find((entry) => entry.primary)?.id || 1);
        openQuestion(id, nextId, {
          ...options,
          draft: Number(nextId) === Number(currentLangId) ? questionDraft : null,
        });
      },
    });
  });

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const body = {
      langId: currentLangId,
      body: m.root.querySelector("[name=body]").value,
      marks: Number(m.root.querySelector("[name=marks]").value),
      negativeMarks: Number(m.root.querySelector("[name=negativeMarks]").value),
      options: optionRows.map((o) => ({
        id: o.id,
        correct: m.root.querySelector(`[data-opt="${o.id}"]`).checked,
        body: m.root.querySelector(`[data-opt-body="${o.id}"]`).value,
      })),
    };
    try {
      await api("/questions/" + id, { method: "PUT", body });
      m.close();
      toast("Question saved.", "success");
      if (options.refresh !== false) renderQuestions();
    } catch (e) { toast(e.message, "error"); }
  });
}

// ---------------------------------------------------------------------------
// candidates
// ---------------------------------------------------------------------------

async function renderCandidates() {
  const search = state.candidateSearch || "";
  const { candidates, total, pageSize } = await api(`/candidates?page=${state.candidatesPage}&pageSize=25&q=${encodeURIComponent(search)}`);
  $("#topbarActions").innerHTML = `
    <button class="btn" id="candidateGroups">Candidate groups</button>
    <button class="btn" id="importCandidates">Import CSV</button>
    <a class="btn" href="/api/admin/export/candidates.csv">Export CSV</a>
    <button class="btn primary" id="newCandidate">New candidate</button>`;
  $("#newCandidate").addEventListener("click", () => candidateForm(null));
  $("#candidateGroups").addEventListener("click", () => candidateGroupsForm());
  $("#importCandidates").addEventListener("click", importCandidatesForm);
  $("#view").innerHTML = `
    <div class="card"><div class="card-body">
      <div class="toolbar">
        <label class="grow">Search<input id="cSearch" value="${esc(search)}" placeholder="Name, Candidate ID, Login ID, group, email or phone" /></label>
      </div>
    </div></div>
    <div class="card">
      <div class="card-head"><h3>Candidates</h3><span class="sub">${total} total</span></div>
      <div class="card-body tight">
        ${candidates.length ? `<div class="table-wrap"><table>
          <thead><tr><th>Name / Candidate ID</th><th>System name</th><th>Groups</th><th>Login ID</th><th>Email / Phone</th><th>Attempts</th><th>Best score</th><th>Status</th><th>Last login</th><th></th></tr></thead>
          <tbody>${candidates.map((c) => `<tr>
            <td>${esc(c.name)} <span class="muted small">${esc(c.id)}</span></td>
            <td>${esc(c.system_name || "—")}</td>
            <td>${esc(c.group_names || "—")}</td>
            <td><code>${esc(c.login)}</code></td>
            <td class="muted small">${esc(c.email || c.phone || "—")}</td>
            <td class="num">${c.attempts}</td>
            <td class="num">${c.best_score == null ? "—" : num(c.best_score, 1) + "%"}</td>
            <td>${badge(c.status)}</td>
            <td class="muted small">${dt(c.last_login_at)}</td>
            <td class="row">
              <button class="btn small" data-cedit="${esc(c.id)}">Edit</button>
              <button class="btn small" data-creset="${esc(c.id)}">Password</button>
              <button class="btn small" data-cview="${esc(c.id)}">Attempts</button>
              <button class="btn small danger" data-cdel="${esc(c.id)}">Delete</button>
            </td>
          </tr>`).join("")}</tbody></table></div>` : `<div class="empty">No candidates.</div>`}
      </div>
      <div class="pagination">
        <button class="btn small" id="cPrev" ${state.candidatesPage <= 1 ? "disabled" : ""}>Previous</button>
        <span class="info">Page ${state.candidatesPage} · ${total} candidates</span>
        <button class="btn small" id="cNext" ${state.candidatesPage * pageSize >= total ? "disabled" : ""}>Next</button>
      </div>
    </div>`;
  $("#cSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { state.candidateSearch = e.target.value.trim(); state.candidatesPage = 1; renderCandidates(); }
  });
  $("#cPrev").addEventListener("click", () => { state.candidatesPage = Math.max(1, state.candidatesPage - 1); renderCandidates(); });
  $("#cNext").addEventListener("click", () => { state.candidatesPage += 1; renderCandidates(); });
  const v = $("#view");
  v.querySelectorAll("[data-cedit]").forEach((b) => b.addEventListener("click", async () => {
    const { candidate } = await api("/candidates/" + encodeURIComponent(b.dataset.cedit));
    candidateForm(candidate);
  }));
  v.querySelectorAll("[data-creset]").forEach((b) => b.addEventListener("click", () => resetPassword(b.dataset.creset)));
  v.querySelectorAll("[data-cview]").forEach((b) => b.addEventListener("click", async () => {
    const { candidate, attempts } = await api("/candidates/" + encodeURIComponent(b.dataset.cview));
    modal({
      title: `${candidate.name} — attempts`,
      body: attempts.length ? `<div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Assessment</th><th>Status</th><th>Score</th><th>Started</th><th>Submitted</th></tr></thead>
        <tbody>${attempts.map((a) => `<tr><td class="num">${a.id}</td><td>${esc(a.assessment)}</td>
          <td>${badge(a.status)}</td><td class="num">${a.status === "submitted" ? `${num(a.score, 2)} / ${num(a.max_score, 2)}` : "—"}</td>
          <td>${dt(a.started_at)}</td><td>${dt(a.submitted_at)}</td></tr>`).join("")}</tbody></table></div>`
        : `<div class="empty">No attempts.</div>`,
    });
  }));
  v.querySelectorAll("[data-cdel]").forEach((b) => b.addEventListener("click", async () => {
    if (!(await confirmDialog("Delete this candidate and all of their attempts?", "Delete"))) return;
    await api("/candidates/" + encodeURIComponent(b.dataset.cdel), { method: "DELETE" });
    toast("Candidate deleted.", "success");
    renderCandidates();
  }));
}

async function candidateForm(candidate) {
  const c = candidate || {};
  const isNew = !candidate;
  let photo = String(c.photo || "");
  let groups = [];
  try { groups = (await api("/candidate-groups")).groups || []; } catch { groups = []; }
  const selectedGroups = new Set(
    (Array.isArray(c.groupIds) && c.groupIds.length ? c.groupIds : (c.group_id ? [c.group_id] : []))
      .map((id) => String(id)),
  );
  const m = modal({
    title: isNew ? "New candidate" : `Edit ${c.name}`,
    body: `
      <div class="photo-field">
        <span class="photo-field-title">Candidate photo</span>
        <div class="photo-upload${photo ? " has-photo" : ""}" id="candPhotoBox" role="button" tabindex="0" aria-label="Upload or remove candidate photo">
          <img id="candPhotoPreview" src="${esc(photo || DEFAULT_CANDIDATE_PHOTO)}" alt="Candidate photo" />
          <span class="photo-upload-hint">Click to upload</span>
          <button type="button" id="candPhotoRemove" class="photo-remove" title="Remove photo" aria-label="Remove photo">&times;</button>
          <input type="file" id="candPhotoFile" accept="image/png,image/jpeg,image/webp" aria-label="Upload candidate photo" />
        </div>
        <span id="candPhotoNote" class="photo-upload-note">${photo ? "Uploaded photo" : "Default photo"}</span>
      </div>
      <div class="grid2">
        <label>Candidate ID *
          <span class="input-with-action">
            <input name="candidateId" value="${esc(isNew ? "" : c.id)}" readonly autocomplete="off" spellcheck="false" placeholder="Auto-generated" aria-readonly="true" />
            ${isNew ? `<button type="button" class="btn" data-refresh-candidate title="Generate a new 10-character Candidate ID" aria-label="Generate a new 10-character Candidate ID">&#x21bb;</button>` : ""}
          </span>
          <span class="field-note" data-candidate-note>${isNew ? "Auto-generated 10 letters/numbers. Cannot be changed after creation." : "Candidate ID is permanent and cannot be changed."}</span>
        </label>
        <label>Login ID *
          <span class="input-with-action">
            <input name="login" value="${esc(c.login || "")}" autocomplete="off" spellcheck="false" maxlength="10" inputmode="numeric" pattern="[0-9]{10}" placeholder="10-digit number" />
            <button type="button" class="btn" data-refresh-login title="Generate a new 10-digit Login ID" aria-label="Generate a new 10-digit Login ID">&#x21bb;</button>
          </span>
          <span class="field-note" data-login-note>${isNew ? "10 digits (numbers only). Used to sign in and open the result; auto-generated, or type your own." : "Current Login ID. Used to sign in and open the result."}</span>
        </label>
      </div>
      <div class="grid2">
        ${isNew
          ? `<label>Password *<input name="password" type="password" value="" required autocomplete="new-password" /></label>`
          : `<label>Status<select name="status">${["active", "inactive"].map((s) => `<option ${c.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>`}
        <label>Candidate name<input name="name" value="${esc(c.name || (isNew ? "Your Name" : ""))}" placeholder="Your Name" /></label>
      </div>
      <div class="grid2">
        <label>System name<input name="systemName" value="${esc(c.system_name || "")}" placeholder="e.g. C001" /></label>
        <label>Email / Phone (optional)<input name="contact" value="${esc(c.email || c.phone || "")}" /></label>
      </div>
      <div>
        <div class="photo-field-title" style="margin-bottom:6px">Candidate groups</div>
        ${groups.length
          ? `<div style="display:flex;flex-wrap:wrap;gap:6px 18px">
              ${groups.map((group) => `<label class="row" style="gap:8px;width:auto;font-weight:400">
                <input type="checkbox" data-candidate-group="${esc(group.id)}" ${selectedGroups.has(String(group.id)) ? "checked" : ""} style="width:auto" />
                <span>${esc(group.name)}</span>
              </label>`).join("")}
            </div>`
          : `<div class="muted small">No candidate groups yet. Create them from <strong>Candidate groups</strong>.</div>`}
        <span class="field-note">A candidate can belong to more than one group.</span>
      </div>
      ${isNew ? `<div class="grid2">
        <label>Status<select name="status">${["active", "inactive"].map((s) => `<option ${c.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>
        <div></div>
      </div>` : ""}
    `,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>${isNew ? "Create" : "Save"}</button>`,
  });

  const candidateIdInput = m.root.querySelector("[name=candidateId]");
  const candidateIdNote = m.root.querySelector("[data-candidate-note]");
  const refreshCandidateId = m.root.querySelector("[data-refresh-candidate]");
  const loginInput = m.root.querySelector("[name=login]");
  const loginNote = m.root.querySelector("[data-login-note]");
  const refreshLogin = m.root.querySelector("[data-refresh-login]");
  const originalLogin = String(c.login || "");
  const defaultLoginNote = isNew
    ? "10 digits (numbers only). Used to sign in and open the result; auto-generated, or type your own."
    : "Current Login ID. Used to sign in and open the result.";
  const defaultCandidateNote = isNew
    ? "Auto-generated 10 letters/numbers. Cannot be changed after creation."
    : "Candidate ID is permanent and cannot be changed.";
  let loginCheckSeq = 0;
  let loginCheckTimer = null;
  let candidateCheckSeq = 0;

  const ALPHANUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomCode = (length = 10) => {
    const values = new Uint32Array(length);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(values);
    else for (let i = 0; i < values.length; i += 1) values[i] = Math.floor(Math.random() * 0xffffffff);
    let out = "";
    for (let i = 0; i < length; i += 1) out += ALPHANUM[values[i] % ALPHANUM.length];
    return out;
  };
  const randomDigits = (length = 10) => {
    const values = new Uint32Array(length);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(values);
    else for (let i = 0; i < values.length; i += 1) values[i] = Math.floor(Math.random() * 0xffffffff);
    let out = String(1 + (values[0] % 9));
    for (let i = 1; i < length; i += 1) out += String(values[i] % 10);
    return out;
  };
  const isLoginCode = (value) => /^[0-9]{10}$/.test(value);
  const isCandidateCode = (value) => /^[A-Za-z0-9]{10}$/.test(value);

  const setCandidateState = (state, message) => {
    candidateIdInput.classList.toggle("invalid", state === "invalid");
    candidateIdInput.classList.toggle("valid", state === "valid");
    candidateIdInput.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");
    if (!candidateIdNote) return;
    candidateIdNote.textContent = message || defaultCandidateNote;
    candidateIdNote.classList.toggle("field-error", state === "invalid");
  };

  const checkCandidateId = async () => {
    const value = candidateIdInput.value.trim();
    const seq = ++candidateCheckSeq;
    if (!isCandidateCode(value)) {
      setCandidateState("invalid", "Candidate ID must be exactly 10 letters or numbers.");
      return false;
    }
    try {
      const data = await api(`/candidates/check-id?id=${encodeURIComponent(value)}`);
      if (seq !== candidateCheckSeq) return false;
      if (!data.available) {
        setCandidateState("invalid", "This Candidate ID is already taken. Refresh to generate another.");
        return false;
      }
      setCandidateState("valid", "Candidate ID is available.");
      return true;
    } catch {
      if (seq !== candidateCheckSeq) return false;
      setCandidateState("", "Could not check this Candidate ID right now.");
      return false;
    }
  };

  const generateCandidateId = async () => {
    for (let i = 0; i < 5; i += 1) {
      candidateIdInput.value = randomCode(10);
      if (await checkCandidateId()) return;
    }
  };

  const setLoginState = (state, message) => {
    loginInput.classList.toggle("invalid", state === "invalid");
    loginInput.classList.toggle("valid", state === "valid");
    loginInput.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");
    if (!loginNote) return;
    loginNote.textContent = message || defaultLoginNote;
    loginNote.classList.toggle("field-error", state === "invalid");
  };

  const checkLogin = async ({ strict = false } = {}) => {
    const value = loginInput.value.trim();
    const seq = ++loginCheckSeq;
    // Editing an existing candidate: leaving a legacy Login ID untouched is
    // allowed, but any new value must be a 10-digit number.
    if (!isNew && value === originalLogin && value) {
      setLoginState("", defaultLoginNote);
      return true;
    }
    if (!isLoginCode(value)) {
      setLoginState(strict ? "invalid" : "", strict ? "Login ID must be exactly 10 digits (numbers only)." : "");
      return false;
    }
    setLoginState("", "Checking availability…");
    try {
      const exclude = isNew ? "" : `&exclude=${encodeURIComponent(c.id)}`;
      const data = await api(`/candidates/check-login?login=${encodeURIComponent(value)}${exclude}`);
      if (seq !== loginCheckSeq) return false;
      if (!data.available) {
        setLoginState("invalid", "This Login ID is already taken.");
        return false;
      }
      setLoginState("valid", "Login ID is available.");
      return true;
    } catch {
      if (seq !== loginCheckSeq) return false;
      setLoginState("", "Could not check this Login ID right now.");
      return false;
    }
  };

  const generateLogin = async () => {
    for (let i = 0; i < 5; i += 1) {
      loginInput.value = randomDigits(10);
      if (await checkLogin()) return;
    }
  };

  if (isNew) {
    generateCandidateId();
    generateLogin();
  } else {
    setLoginState("", defaultLoginNote);
  }

  candidateIdInput.addEventListener("input", () => {
    candidateCheckSeq += 1;
    setCandidateState("", "");
  });
  refreshCandidateId?.addEventListener("click", () => {
    if (!isNew) return;
    candidateCheckSeq += 1;
    setCandidateState("", "Generating a new Candidate ID…");
    generateCandidateId();
  });
  loginInput.addEventListener("input", () => {
    const clean = loginInput.value.replace(/\D+/g, "").slice(0, 10);
    if (clean !== loginInput.value) loginInput.value = clean;
    loginCheckSeq += 1;
    setLoginState("", "");
    clearTimeout(loginCheckTimer);
    loginCheckTimer = setTimeout(checkLogin, 350);
  });
  loginInput.addEventListener("blur", () => checkLogin({ strict: true }));
  refreshLogin?.addEventListener("click", () => {
    loginCheckSeq += 1;
    setLoginState("", "Generating a new Login ID…");
    generateLogin().then(() => loginInput.focus());
  });

  const photoInput = $("#candPhotoFile", m.root);
  const photoPreview = $("#candPhotoPreview", m.root);
  const photoNote = $("#candPhotoNote", m.root);
  const photoBox = $("#candPhotoBox", m.root);
  const photoRemove = $("#candPhotoRemove", m.root);
  const setPhotoActive = (active) => photoBox.classList.toggle("active", active);
  const refreshPhoto = () => {
    photoPreview.src = photo || DEFAULT_CANDIDATE_PHOTO;
    if (photoNote) photoNote.textContent = photo ? "Uploaded photo" : "Default photo";
    photoBox.classList.toggle("has-photo", Boolean(photo));
  };
  photoBox.addEventListener("click", (event) => {
    if (event.target === photoInput || event.target.closest("#candPhotoRemove")) return;
    if (!photo) { setPhotoActive(true); photoInput.click(); return; }
    if (!photoBox.classList.contains("active")) { setPhotoActive(true); return; }
    photoInput.click();
  });
  photoBox.addEventListener("keydown", (event) => {
    if (event.target !== photoBox) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    photoBox.click();
  });
  photoRemove.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    photo = "";
    photoInput.value = "";
    setPhotoActive(false);
    refreshPhoto();
  });
  m.root.addEventListener("click", (event) => {
    if (!photoBox.contains(event.target)) setPhotoActive(false);
  });
  photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast("Please choose an image file.", "error");
      photoInput.value = "";
      return;
    }
    if (file.size > 300 * 1024) {
      toast("Photo must be under 300 KB.", "error");
      photoInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      photo = String(reader.result || "");
      refreshPhoto();
      setPhotoActive(true);
    };
    reader.onerror = () => toast("Could not read that image.", "error");
    reader.readAsDataURL(file);
  });

  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const candidateId = candidateIdInput.value.trim();
    const login = loginInput.value.trim();
    const loginChanged = isNew || login !== originalLogin;
    const passwordInput = m.root.querySelector("[name=password]");
    const password = passwordInput ? passwordInput.value : "";
    if (isNew) {
      if (!isCandidateCode(candidateId)) {
        setCandidateState("invalid", "Candidate ID must be exactly 10 letters or numbers.");
        toast("Candidate ID must be exactly 10 letters or numbers.", "error");
        candidateIdInput.focus();
        return;
      }
      if (!(await checkCandidateId())) {
        toast(candidateIdNote?.textContent || "This Candidate ID is already taken. Refresh to generate another.", "error");
        candidateIdInput.focus();
        return;
      }
    }
    if (loginChanged) {
      if (!login) { toast("Login ID is required.", "error"); loginInput.focus(); return; }
      if (!isLoginCode(login)) {
        setLoginState("invalid", "Login ID must be exactly 10 digits (numbers only).");
        toast("Login ID must be exactly 10 digits (numbers only).", "error");
        loginInput.focus();
        return;
      }
      if (!(await checkLogin({ strict: true }))) {
        toast(loginInput.classList.contains("invalid")
          ? (loginNote?.textContent || "This Login ID is already taken.")
          : "Could not check this Login ID. Try again.", "error");
        loginInput.focus();
        return;
      }
    }
    if (isNew && !password.trim()) { toast("Password is required.", "error"); return; }
    const contact = m.root.querySelector("[name=contact]").value.trim();
    if (contact) {
      const looksLikeEmail = contact.indexOf("@") !== -1 || /\.com$/i.test(contact);
      const valid = looksLikeEmail
        ? /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(contact)
        : /^\d{10}$/.test(contact);
      if (!valid) { toast("Enter a 10-digit phone number or a valid email address.", "error"); return; }
    }
    const body = {
      name: m.root.querySelector("[name=name]").value.trim() || "Your Name",
      systemName: m.root.querySelector("[name=systemName]").value.trim(),
      groupIds: [...m.root.querySelectorAll("[data-candidate-group]:checked")].map((input) => input.dataset.candidateGroup),
      contact,
      status: m.root.querySelector("[name=status]").value,
      photo,
    };
    try {
      if (isNew) {
        body.id = candidateId;
        body.login = login;
        body.password = password;
        await api("/candidates", { method: "POST", body });
      } else {
        if (loginChanged) body.login = login;
        await api("/candidates/" + encodeURIComponent(c.id), { method: "PUT", body });
      }
      m.close();
      toast(isNew ? "Candidate created." : "Candidate saved.", "success");
      renderCandidates();
    } catch (e) { toast(e.message, "error"); }
  });
}

function resetPassword(id) {
  const m = modal({
    title: "Reset password",
    body: `<label>New password<input name="password" value="Guest" /></label>`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Set password</button>`,
  });
  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    try {
      await api(`/candidates/${encodeURIComponent(id)}/reset-password`, { method: "POST", body: { password: m.root.querySelector("[name=password]").value } });
      m.close();
      toast("Password updated.", "success");
    } catch (e) { toast(e.message, "error"); }
  });
}

/** Manage candidate groups ("batches") from the Candidates page. */
async function candidateGroupsForm(options = {}) {
  const { groups } = await api("/candidate-groups");
  const m = modal({
    title: "Candidate groups",
    wide: true,
    onClose: options.onClose,
    body: `
      <p class="field-note" style="margin-top:0">Group candidates into batches, then choose which groups may take each assessment from the assessment's <strong>Exam access</strong> button.</p>
      ${groups.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Group</th><th>Candidates</th><th>Description</th><th></th></tr></thead>
        <tbody>${groups.map((group) => `<tr>
          <td>${esc(group.name)}</td>
          <td class="num">${Number(group.candidates || 0)}</td>
          <td class="muted small">${esc(group.description || "—")}</td>
          <td class="row">
            <button class="btn small" data-group-edit="${esc(group.id)}">Edit</button>
            <button class="btn small danger" data-group-del="${esc(group.id)}">Delete</button>
          </td>
        </tr>`).join("")}</tbody></table></div>`
        : `<div class="empty">No candidate groups yet. Add one to start assigning candidates.</div>`}
      <p class="field-note">Deleting a group removes it from every assessment's exam access; its candidates remain and keep any other groups.</p>
    `,
    footer: `<button class="btn" data-close>Close</button><button class="btn primary" data-group-add>Add group</button>`,
  });

  const refresh = () => { m.close(); candidateGroupsForm(options); };
  m.root.querySelector("[data-group-add]").addEventListener("click", () => candidateGroupEditForm(null, options));
  m.root.querySelectorAll("[data-group-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = groups.find((row) => row.id === button.dataset.groupEdit);
      if (group) candidateGroupEditForm(group, options);
    });
  });
  m.root.querySelectorAll("[data-group-del]").forEach((button) => {
    button.addEventListener("click", async () => {
      const group = groups.find((row) => row.id === button.dataset.groupDel);
      if (!group) return;
      if (!(await confirmDialog(`Delete candidate group "${group.name}"? Candidates in it keep their accounts and any other groups.`, "Delete"))) return;
      try {
        await api(`/candidate-groups/${encodeURIComponent(group.id)}`, { method: "DELETE", body: {} });
        toast("Candidate group deleted.", "success");
        refresh();
      } catch (e) { toast(e.message, "error"); }
    });
  });
}

function candidateGroupEditForm(group, options = {}) {
  const g = group || {};
  const isNew = !group;
  let memberStateLoaded = isNew;
  let members = [];
  let memberIds = new Set();
  let searchResults = [];
  let searchSeq = 0;
  let searchTimer = null;

  const m = modal({
    title: isNew ? "Add candidate group" : `Edit ${g.name}`,
    body: `
      <label>Group name<input name="name" value="${esc(g.name || "")}" placeholder="Batch A / Shift 1" maxlength="80" autocomplete="off" /></label>
      <label>Description<input name="description" value="${esc(g.description || "")}" placeholder="Optional note" maxlength="200" /></label>
      <div class="member-section">
        <div class="member-section-head">
          <strong>Candidates</strong>
          <span class="muted small" data-member-count>0 selected</span>
        </div>
        <div class="member-chips" data-member-chips></div>
        <label>Search candidates<input data-member-search placeholder="Name, login or candidate ID" autocomplete="off" /></label>
        <div class="member-results" data-member-results><div class="muted small">Loading candidates…</div></div>
        <p class="field-note">Add or remove candidates here. A candidate can belong to more than one group.</p>
      </div>
    `,
    footer: `<button class="btn" data-back>Back</button><button class="btn primary" data-save>${isNew ? "Add group" : "Save"}</button>`,
  });

  const chips = m.root.querySelector("[data-member-chips]");
  const results = m.root.querySelector("[data-member-results]");
  const count = m.root.querySelector("[data-member-count]");
  const searchInput = m.root.querySelector("[data-member-search]");
  const memberById = new Map();

  const isClosed = () => !m.root.querySelector("[data-member-chips]");

  const renderMembers = () => {
    if (!count) return;
    count.textContent = `${memberIds.size} selected`;
    if (!memberIds.size) {
      chips.innerHTML = isNew
        ? `<span class="muted small">Search below and add candidates to this new group.</span>`
        : `<span class="muted small">No candidates in this group yet.</span>`;
      return;
    }
    chips.innerHTML = [...memberIds].map((id) => {
      const candidate = memberById.get(id) || { id, name: id, login: "" };
      const login = candidate.login ? ` <span class="muted">${esc(candidate.login)}</span>` : "";
      return `<span class="member-chip">${esc(candidate.name || id)}${login}
        <button type="button" data-remove-member="${esc(id)}" title="Remove from group" aria-label="Remove ${esc(candidate.name || id)}">&times;</button>
      </span>`;
    }).join("");
  };

  const renderResults = () => {
    if (!results) return;
    const available = searchResults.filter((row) => !memberIds.has(String(row.id)));
    if (!available.length) {
      const empty = searchResults.length
        ? "All matching candidates are already selected."
        : (searchInput.value.trim() ? "No candidates found." : "No candidates to show.");
      results.innerHTML = `<div class="muted small">${empty}</div>`;
      return;
    }
    results.innerHTML = available.map((candidate) => `<div class="member-result">
      <div>
        <div>${esc(candidate.name || candidate.id)} <span class="muted small">${esc(candidate.login || "")}</span></div>
        <div class="muted small">${esc([candidate.id, candidate.system_name, candidate.group_names].filter(Boolean).join(" · "))}</div>
      </div>
      <button type="button" class="btn small" data-add-member="${esc(candidate.id)}">Add</button>
    </div>`).join("");
  };

  const loadResults = async (term) => {
    const seq = ++searchSeq;
    if (results) results.innerHTML = `<div class="muted small">Searching…</div>`;
    try {
      const { candidates } = await api(`/candidates?page=1&pageSize=20&q=${encodeURIComponent(term || "")}`);
      if (seq !== searchSeq || isClosed()) return;
      searchResults = candidates || [];
      renderResults();
    } catch (e) {
      if (seq !== searchSeq || isClosed()) return;
      results.innerHTML = `<div class="muted small">${esc(e.message)}</div>`;
    }
  };

  chips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-member]");
    if (!button) return;
    memberIds.delete(String(button.dataset.removeMember));
    renderMembers();
    renderResults();
  });
  results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-member]");
    if (!button) return;
    const candidate = searchResults.find((row) => String(row.id) === button.dataset.addMember);
    if (!candidate) return;
    memberById.set(String(candidate.id), candidate);
    memberIds.add(String(candidate.id));
    renderMembers();
    renderResults();
  });
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadResults(searchInput.value.trim()), 250);
  });

  const loadMembership = async () => {
    if (isNew) {
      memberStateLoaded = true;
      renderMembers();
      loadResults("");
      return;
    }
    chips.innerHTML = `<span class="muted small">Loading candidates…</span>`;
    try {
      const data = await api(`/candidate-groups/${encodeURIComponent(g.id)}`);
      if (isClosed()) return;
      members = Array.isArray(data.members) ? data.members : [];
      memberIds = new Set((data.candidateIds || members.map((row) => row.id)).map(String));
      memberById.clear();
      members.forEach((candidate) => memberById.set(String(candidate.id), candidate));
      memberStateLoaded = true;
      renderMembers();
      loadResults(searchInput.value.trim());
    } catch (e) {
      if (isClosed()) return;
      memberStateLoaded = false;
      chips.innerHTML = `<span class="muted small">Could not load candidates. Reopen this group to try again.</span>`;
      results.innerHTML = "";
      searchInput.disabled = true;
      toast(e.message, "error");
    }
  };

  renderMembers();
  loadMembership();

  m.root.querySelector("[data-back]").addEventListener("click", () => {
    m.close();
    candidateGroupsForm(options);
  });
  m.root.querySelector("[data-save]").addEventListener("click", async () => {
    const button = m.root.querySelector("[data-save]");
    const name = m.root.querySelector("[name=name]").value.trim();
    if (!name) { toast("Group name is required.", "error"); return; }
    const body = {
      name,
      description: m.root.querySelector("[name=description]").value.trim(),
    };
    if (memberStateLoaded) body.candidateIds = [...memberIds];
    button.disabled = true;
    try {
      if (isNew) await api("/candidate-groups", { method: "POST", body });
      else await api(`/candidate-groups/${encodeURIComponent(g.id)}`, { method: "PUT", body });
      toast(isNew ? "Candidate group created." : "Candidate group saved.", "success");
      m.close();
      candidateGroupsForm(options);
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

function importCandidatesForm() {
  csvImportForm({
    title: "Import candidates from CSV",
    hint: `Columns: <code>login,password,name,contact,system_name,group</code>. <code>login</code> is a 10-digit number. <code>contact</code> is a 10-digit phone number or an email address. <code>group</code> is one or more candidate group names separated by <code>;</code> (for example <code>Batch A;Batch B</code>); new names are created automatically. Missing passwords default to <code>Guest</code>, missing names to <code>Your Name</code>. Quoted fields, commas and line breaks inside quotes are supported.`,
    endpoint: "/candidates/import",
    placeholder: "login,password,name,contact,system_name,group\n1234567890,Welcome1,Asha Rao,asha@example.com,C001,Batch A;Batch B",
    toastMessage: (result) => `Imported ${result.created}, skipped ${result.skipped}.`,
    onDone: renderCandidates,
  });
}

/**
 * Shared CSV import dialog: pick a file or paste the data, POST it, refresh the
 * page. Every import endpoint accepts `{ csv }` and returns created/skipped.
 */
function csvImportForm({ title, hint, endpoint, placeholder = "", extraBody = {}, toastMessage, onDone }) {
  const m = modal({
    title,
    wide: true,
    body: `
      <p class="muted small">${hint}</p>
      <label>CSV file (optional)<input type="file" id="csvFile" accept=".csv,text/csv" /></label>
      <label>CSV data<textarea name="csv" style="min-height:220px" placeholder="${esc(placeholder)}"></textarea></label>
      <p class="muted small" id="csvFileNote"></p>
    `,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-import>Import</button>`,
  });

  const fileInput = m.root.querySelector("#csvFile");
  const textarea = m.root.querySelector("[name=csv]");
  const note = m.root.querySelector("#csvFileNote");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) { note.textContent = ""; return; }
    file.text().then((text) => {
      textarea.value = text.replace(/^\uFEFF/, "");
      note.textContent = `Loaded ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`;
    }).catch(() => toast("Could not read that file.", "error"));
  });

  const button = m.root.querySelector("[data-import]");
  button.addEventListener("click", async () => {
    const csv = textarea.value.trim();
    if (!csv) { toast("Choose a CSV file or paste CSV data.", "error"); return; }
    button.disabled = true;
    try {
      const result = await api(endpoint, { method: "POST", body: { ...extraBody, csv } });
      m.close();
      toast(toastMessage ? toastMessage(result) : `Imported ${result.created || 0}, skipped ${result.skipped || 0}.`, "success");
      if (onDone) onDone();
    } catch (e) {
      button.disabled = false;
      toast(e.message, "error");
    }
  });
}

function importAssessmentsForm() {
  csvImportForm({
    title: "Import assessments from CSV",
    hint: `Columns: <code>ID, Name, Organisation ID, Description, Type, Base path, Duration (minutes), Max attempts, Show feedback</code>. Imported assessments are created as <strong>draft</strong>; use Upload paper to attach the paper. Existing IDs are skipped.`,
    endpoint: "/assessments/import",
    placeholder: "ID,Name,Organisation ID,Duration (minutes),Max attempts\nM101,Practice Set 1,726,60,1",
    toastMessage: (result) => `Assessments imported: ${result.created}, skipped ${result.skipped}.`,
    onDone: renderAssessments,
  });
}

function importQuestionsForm(assessment) {
  csvImportForm({
    title: `Import questions into ${assessment.id}`,
    hint: `Columns: <code>Question ID, Group, Section, Question, Body HTML, Marks, Negative marks, Mandatory, Options, Correct options</code>. Put one option per line in the Options cell; Correct options uses 1-based numbers (for example <code>2</code> or <code>1,3</code>). Missing Group/Section rows are created. Duplicate Question IDs are skipped.`,
    endpoint: `/assessments/${encodeURIComponent(assessment.id)}/questions/import`,
    placeholder: "Question ID,Group,Section,Question,Body HTML,Options,Correct options\nQ1,General Aptitude,Sample Questions,What is 2 + 2?,What is 2 + 2?,2\n4\n6\n8,1",
    toastMessage: (result) => `Questions imported: ${result.created}, skipped ${result.skipped}.`,
    onDone: renderQuestions,
  });
}

// ---------------------------------------------------------------------------
// attempts
// ---------------------------------------------------------------------------

async function renderAttempts() {
  const status = state.attemptStatus || "";
  const search = state.attemptSearch || "";
  const { assessments } = await api("/assessments");
  const params = new URLSearchParams({ page: state.attemptsPage, pageSize: 25 });
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  if (state.assessmentId) params.set("assessment", state.assessmentId);
  const { attempts, total, pageSize } = await api("/attempts?" + params);
  $("#topbarActions").innerHTML = `<a class="btn" href="/api/admin/export/attempts.csv?${params}">Export CSV</a>`;
  $("#view").innerHTML = `
    <div class="card"><div class="card-body">
      <div class="toolbar">
        <label>Status<select id="aStatus">
          ${["", "in_progress", "submitted", "expired", "locked", "invalidated"].map((s) => `<option value="${s}" ${s === status ? "selected" : ""}>${s ? s.replace(/_/g, " ") : "All statuses"}</option>`).join("")}
        </select></label>
        <label>Assessment<select id="aAssessment">
          <option value="">All assessments</option>
          ${assessments.map((a) => `<option value="${esc(a.id)}" ${a.id === state.assessmentId ? "selected" : ""}>${esc(a.id)} — ${esc(a.name)}</option>`).join("")}
        </select></label>
        <label class="grow">Search<input id="aSearch" value="${esc(search)}" placeholder="Candidate name or login" /></label>
      </div>
    </div></div>
    <div class="card">
      <div class="card-head"><h3>Attempts</h3><span class="sub">${total} total</span></div>
      <div class="card-body tight">
        ${attempts.length ? `<div class="table-wrap"><table>
          <thead><tr><th>ID</th><th>Candidate</th><th>Assessment</th><th>Status</th><th>Score</th><th>Fullscreen</th><th>Toggles</th><th>Answered</th><th>Started</th><th></th></tr></thead>
          <tbody>${attempts.map((a) => `<tr>
            <td class="num">${a.id}</td>
            <td>${esc(a.candidate)}<div class="muted small">${esc(a.login)}</div></td>
            <td>${esc(a.assessment)}</td>
            <td>${badge(a.status)}</td>
            <td class="num">${a.status === "submitted" ? `${num(a.score, 2)} / ${num(a.max_score, 2)}<div class="muted small">${num(a.percentage, 1)}%</div>` : "—"}</td>
            <td class="num">${fullscreenTime(a.fullscreen_seconds)}</td>
            <td class="num">${fullscreenToggles(a.fullscreen_toggle_count)}</td>
            <td class="num">${a.answered}/${a.total_questions}</td>
            <td class="muted small">${dt(a.started_at)}</td>
            <td><button class="btn small" data-open="${a.id}">Open</button></td>
          </tr>`).join("")}</tbody></table></div>` : `<div class="empty">No attempts match the filter.</div>`}
      </div>
      <div class="pagination">
        <button class="btn small" id="aPrev" ${state.attemptsPage <= 1 ? "disabled" : ""}>Previous</button>
        <span class="info">Page ${state.attemptsPage} · ${total} attempts</span>
        <button class="btn small" id="aNext" ${state.attemptsPage * pageSize >= total ? "disabled" : ""}>Next</button>
      </div>
    </div>`;
  $("#aStatus").addEventListener("change", (e) => { state.attemptStatus = e.target.value; state.attemptsPage = 1; renderAttempts(); });
  $("#aAssessment").addEventListener("change", (e) => { state.assessmentId = e.target.value; state.attemptsPage = 1; renderAttempts(); });
  $("#aSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { state.attemptSearch = e.target.value.trim(); state.attemptsPage = 1; renderAttempts(); }
  });
  $("#aPrev").addEventListener("click", () => { state.attemptsPage = Math.max(1, state.attemptsPage - 1); renderAttempts(); });
  $("#aNext").addEventListener("click", () => { state.attemptsPage += 1; renderAttempts(); });
  $("#view").querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openAttempt(Number(b.dataset.open))));
}

async function openAttempt(id) {
  const data = await api("/attempts/" + id);
  const { attempt, candidate, assessment, responses, options, audit, feedback } = data;
  const answered = responses.filter((r) => r.status === "answered" || r.status === "markedAndAnswered").length;
  const m = modal({
    title: `Attempt ${attempt.id} — ${candidate?.name || attempt.candidate_id}`,
    wide: true,
    body: `
      <div class="stats" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">
        <div class="stat"><div class="k">Status</div><div class="v" style="font-size:15px">${badge(attempt.status)}</div></div>
        <div class="stat"><div class="k">Score</div><div class="v" style="font-size:20px">${num(attempt.score, 2)} / ${num(attempt.max_score, 2)}</div></div>
        <div class="stat"><div class="k">Percentage</div><div class="v" style="font-size:20px">${num(attempt.percentage, 1)}%</div></div>
        <div class="stat"><div class="k">Answered</div><div class="v" style="font-size:20px">${answered}/${responses.length}</div></div>
        <div class="stat"><div class="k">Fullscreen time</div><div class="v" style="font-size:15px">${fullscreenTime(attempt.fullscreen_seconds)}</div></div>
        <div class="stat"><div class="k">Fullscreen toggles</div><div class="v" style="font-size:15px">${fullscreenToggles(attempt.fullscreen_toggle_count)}</div></div>
        <div class="stat"><div class="k">Started</div><div class="v" style="font-size:13px">${dt(attempt.started_at)}</div></div>
        <div class="stat"><div class="k">Submitted</div><div class="v" style="font-size:13px">${dt(attempt.submitted_at)}</div></div>
      </div>
      <p class="muted small">${esc(candidate?.login || "")} · ${esc(assessment?.name || attempt.assessment_id)} · attempt #${attempt.attempt_no}</p>

      <div class="card">
        <div class="card-head"><h3>Responses</h3><span class="sub">${responses.length} recorded</span></div>
        <div class="card-body tight">
          ${responses.length ? `<div class="table-wrap"><table>
            <thead><tr><th>#</th><th>Question</th><th>Status</th><th>Given answer</th><th>Key</th></tr></thead>
            <tbody>${responses.map((r) => {
              const opts = options[r.question_id] || [];
              const key = opts.filter((o) => o.correct).map((o) => o.ext_id).join(", ");
              const selected = String(r.selected || "").split(",").filter(Boolean);
              const given = selected.length
                ? selected.map((id) => opts.find((o) => String(o.ext_id) === id)?.body || `#${id}`).join(" · ")
                : (r.answer || "").replace(/<[^>]+>/g, " ").trim().slice(0, 120) || "—";
              return `<tr><td class="num">${r.ext_id}</td>
                <td class="small">${esc((r.question || "").replace(/<[^>]+>/g, " ").trim().slice(0, 110))}</td>
                <td><span class="pill">${esc(r.status)}</span></td>
                <td class="small">${esc(given)}</td>
                <td class="small muted">${esc(key || "—")}</td></tr>`;
            }).join("")}</tbody></table></div>` : `<div class="empty">No responses recorded.</div>`}
        </div>
      </div>

      <div class="split">
        <div class="card">
          <div class="card-head"><h3>Audit trail</h3></div>
          <div class="card-body tight">
            ${audit.length ? `<div class="table-wrap"><table><thead><tr><th>When</th><th>Event</th><th>Detail</th></tr></thead>
              <tbody>${audit.map((a) => `<tr><td class="muted small">${dt(a.at)}</td><td>${esc(a.event)}</td>
                <td class="small muted">${esc((a.detail || "").slice(0, 120))}</td></tr>`).join("")}</tbody></table></div>`
              : `<div class="empty">No audit entries.</div>`}
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Feedback</h3></div>
          <div class="card-body">
            ${feedback.length ? feedback.map((f) => `<div style="margin-bottom:10px">
                <div>Rating <strong>${f.rating == null ? "—" : num(f.rating, 2)}</strong> <span class="muted small">${dt(f.submitted_at)}</span></div>
                <pre class="small muted" style="white-space:pre-wrap;word-break:break-word;max-height:160px;overflow:auto">${esc(f.payload)}</pre>
              </div>`).join("") : `<p class="muted small">No feedback submitted.</p>`}
          </div>
        </div>
      </div>
    `,
    footer: `
      <button class="btn" data-close>Close</button>
      ${attempt.status === "in_progress" ? `<button class="btn warn" data-act="force-submit">Force submit</button>` : ""}
      ${attempt.status !== "invalidated" ? `<button class="btn danger" data-act="invalidate">Invalidate</button>` : ""}
      ${attempt.status === "in_progress" ? `<button class="btn" data-act="lock">Lock</button>` : ""}
      ${attempt.status !== "in_progress" ? `<button class="btn" data-act="reopen">Reopen</button>` : ""}
    `,
  });
  m.root.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", async () => {
    const action = b.dataset.act;
    if (action === "invalidate" && !(await confirmDialog("Invalidate this attempt? The candidate will be blocked on next load.", "Invalidate"))) return;
    try {
      await api(`/attempts/${id}/${action}`, { method: "POST", body: {} });
      m.close();
      toast("Attempt updated.", "success");
      if (state.view === "attempts") renderAttempts();
      else if (state.view === "live") renderLive();
      else if (state.view === "dashboard") renderDashboard();
    } catch (e) { toast(e.message, "error"); }
  }));
}

// ---------------------------------------------------------------------------
// live
// ---------------------------------------------------------------------------

async function renderLive() {
  const { live, serverTime } = await api("/live");
  $("#topbarActions").innerHTML = `<button class="btn" id="liveRefresh">Refresh now</button>`;
  $("#liveRefresh").addEventListener("click", () => renderLive());
  $("#view").innerHTML = `
    <div class="card">
      <div class="card-head"><h3>In progress</h3><span class="sub">${live.length} candidate(s) · ${dt(serverTime)}</span></div>
      <div class="card-body tight">
        ${live.length ? `<div class="table-wrap"><table>
          <thead><tr><th>Candidate</th><th>Assessment</th><th>Group / Section</th><th>Progress</th><th>Last heartbeat</th><th></th></tr></thead>
          <tbody>${live.map((r) => `<tr>
            <td>${esc(r.candidate)}<div class="muted small">${esc(r.login)}</div></td>
            <td>${esc(r.assessment)}</td>
            <td class="small">Group ${r.current_group + 1} · Section ${r.current_section + 1}<div class="muted">Q ${r.current_question + 1}</div></td>
            <td style="min-width:140px"><div class="progress"><i style="width:${r.total_questions ? Math.round((r.answered / r.total_questions) * 100) : 0}%"></i></div>
              <div class="muted small">${r.answered}/${r.total_questions} answered</div></td>
            <td class="muted small">${ago(r.last_seen_at)}</td>
            <td><button class="btn small" data-open="${r.id}">Open</button></td>
          </tr>`).join("")}</tbody></table></div>` : `<div class="empty">Nobody is writing right now.</div>`}
      </div>
    </div>`;
  $("#view").querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openAttempt(Number(b.dataset.open))));
  state.liveTimer = setInterval(() => {
    if (state.view === "live") renderLive().catch(() => {});
  }, 15000);
}

// ---------------------------------------------------------------------------
// results
// ---------------------------------------------------------------------------

function updateResultsSelectionUi() {
  const selection = state.resultsSelection;
  const count = selection.size;
  const boxes = [...document.querySelectorAll("#view [data-select]")];
  const all = $("#selectAllResults");
  if (all) {
    all.checked = boxes.length > 0 && boxes.every((box) => box.checked);
    all.indeterminate = boxes.some((box) => box.checked) && !all.checked;
  }
  const button = $("#generateResultLinks");
  if (button) {
    button.disabled = !state.assessmentId || count === 0;
    button.textContent = count ? `Generate result links (${count})` : "Generate result links";
  }
  const hint = $("#selectionHint");
  if (hint) {
    hint.textContent = !state.assessmentId
      ? "Link generation needs one selected assessment. CSV export still follows the filters."
      : count
        ? `${count} candidate${count === 1 ? "" : "s"} selected. Each result opens with the Login ID only.`
        : "Select candidates below to generate their result links.";
  }
}

async function renderResults() {
  const { assessments } = await api("/assessments");
  const status = state.resultsStatus || "submitted";
  const params = new URLSearchParams();
  if (state.assessmentId) params.set("assessment", state.assessmentId);
  params.set("status", status);
  const { results } = await api("/results?" + params);

  const selection = state.resultsSelection;
  const visibleIds = new Set(results.map((row) => String(row.id)));
  for (const id of [...selection]) if (!visibleIds.has(id)) selection.delete(id);
  state.resultsRows = results;

  const submitted = results.filter((r) => r.status === "submitted");
  const inProgress = results.filter((r) => r.status === "in_progress");
  const scored = submitted;
  const avg = scored.length ? scored.reduce((sum, r) => sum + Number(r.percentage || 0), 0) / scored.length : 0;
  const best = scored.length ? Math.max(...scored.map((r) => Number(r.percentage || 0))) : 0;
  const answeredTotal = results.reduce((sum, r) => sum + Number(r.answered || 0), 0);
  const candidates = new Set(results.map((r) => r.login || r.candidate)).size;

  const exportParams = new URLSearchParams();
  if (state.assessmentId) exportParams.set("assessment", state.assessmentId);
  exportParams.set("status", status);
  $("#topbarActions").innerHTML = "";

  const stats = status === "in_progress"
    ? `<div class="stat"><div class="k">In progress</div><div class="v">${results.length}</div></div>
       <div class="stat"><div class="k">Candidates</div><div class="v">${candidates}</div></div>
       <div class="stat"><div class="k">Answered</div><div class="v">${answeredTotal}</div></div>`
    : status === "all"
      ? `<div class="stat"><div class="k">Submitted</div><div class="v">${submitted.length}</div></div>
         <div class="stat"><div class="k">In progress</div><div class="v">${inProgress.length}</div></div>
         <div class="stat"><div class="k">Average</div><div class="v">${num(avg, 1)}%</div></div>
         <div class="stat"><div class="k">Best</div><div class="v">${num(best, 1)}%</div></div>`
      : `<div class="stat"><div class="k">Submitted</div><div class="v">${results.length}</div></div>
         <div class="stat"><div class="k">Average</div><div class="v">${num(avg, 1)}%</div></div>
         <div class="stat"><div class="k">Best</div><div class="v">${num(best, 1)}%</div></div>`;

  const empty = status === "in_progress"
    ? "No attempts are in progress."
    : status === "all" ? "No attempts yet." : "No submitted attempts yet.";

  $("#view").innerHTML = `
    <div class="stats" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${stats}</div>
    <div class="card"><div class="card-body">
      <div class="toolbar">
        <label>Assessment<select id="rAssessment">
          <option value="">All assessments</option>
          ${assessments.map((a) => `<option value="${esc(a.id)}" ${a.id === state.assessmentId ? "selected" : ""}>${esc(a.id)} — ${esc(a.name)}</option>`).join("")}
        </select></label>
        <label>Show<select id="rStatus">
          <option value="submitted" ${status === "submitted" ? "selected" : ""}>Submitted results</option>
          <option value="in_progress" ${status === "in_progress" ? "selected" : ""}>In progress</option>
          <option value="all" ${status === "all" ? "selected" : ""}>All attempts</option>
        </select></label>
        <div class="toolbar-actions">
          <span class="muted small">${results.length} row(s)</span>
          <a class="btn" title="CSV export follows the assessment and status filters" href="/api/admin/export/results.csv?${exportParams}">Export CSV</a>
          <button class="btn primary" type="button" id="generateResultLinks" disabled>Generate result links</button>
        </div>
      </div>
      <div class="toolbar-note muted small" id="selectionHint"></div>
    </div></div>
    <div class="card">
      <div class="card-head"><h3>Results</h3><span class="sub">${status === "in_progress" ? "live progress" : status === "all" ? "submitted + in progress" : "sorted by percentage"}</span></div>
      <div class="card-body tight">
        ${results.length ? `<div class="table-wrap"><table>
          <thead><tr><th class="select-col"><input type="checkbox" id="selectAllResults" aria-label="Select all attempts" /></th><th>#</th><th>Candidate</th><th>Assessment</th><th>Attempt</th><th>Status</th><th>Score</th><th>Percentage</th><th>Progress</th><th>Fullscreen</th><th>Toggles</th><th>Started</th><th>${status === "in_progress" ? "Last seen" : "Submitted"}</th><th></th></tr></thead>
          <tbody>${results.map((r, i) => {
            const isSubmitted = r.status === "submitted";
            const total = Number(r.total_questions) || 0;
            const answered = Number(r.answered) || 0;
            const progress = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
            return `<tr>
              <td class="select-col"><input type="checkbox" class="results-select" data-select="${esc(r.id)}" ${selection.has(String(r.id)) ? "checked" : ""} aria-label="Select ${esc(r.candidate)}" /></td>
              <td class="num">${i + 1}</td>
              <td>${esc(r.candidate)}<div class="muted small">${esc(r.login)}</div></td>
              <td>${esc(r.assessment)}</td>
              <td class="num">#${r.attempt_no}</td>
              <td>${badge(r.status)}</td>
              <td class="num">${isSubmitted ? `${num(r.score, 2)} / ${num(r.max_score, 2)}` : "—"}</td>
              <td class="num">${isSubmitted ? `${num(r.percentage, 1)}%` : "—"}</td>
              <td style="min-width:120px"><div class="progress"><i style="width:${progress}%"></i></div>
                <div class="muted small">${answered}/${total} answered</div></td>
              <td class="num">${fullscreenTime(r.fullscreen_seconds)}</td>
              <td class="num">${fullscreenToggles(r.fullscreen_toggle_count)}</td>
              <td class="muted small">${dt(r.started_at)}</td>
              <td class="muted small">${dt(isSubmitted ? r.submitted_at : r.last_seen_at)}</td>
              <td><button class="btn small" data-open="${r.id}">View</button></td>
            </tr>`;
          }).join("")}</tbody></table></div>` : `<div class="empty">${empty}</div>`}
      </div>
    </div>`;
  $("#rAssessment").addEventListener("change", (e) => { state.assessmentId = e.target.value; renderResults(); });
  $("#rStatus").addEventListener("change", (e) => { state.resultsStatus = e.target.value; renderResults(); });
  $("#selectAllResults")?.addEventListener("change", (e) => {
    document.querySelectorAll("#view [data-select]").forEach((box) => {
      box.checked = e.target.checked;
      if (box.checked) selection.add(box.dataset.select);
      else selection.delete(box.dataset.select);
    });
    updateResultsSelectionUi();
  });
  $("#view").querySelectorAll("[data-select]").forEach((box) => box.addEventListener("change", () => {
    if (box.checked) selection.add(box.dataset.select);
    else selection.delete(box.dataset.select);
    updateResultsSelectionUi();
  }));
  $("#generateResultLinks")?.addEventListener("click", openBulkResultLinks);
  $("#view").querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openAttempt(Number(b.dataset.open))));
  updateResultsSelectionUi();
}

async function copyText(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Clipboard API can be blocked on plain HTTP; fall back below.
  }
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  area.remove();
  return ok;
}

const resultLinkFor = (row, assessmentId) => {
  const login = row.login || "";
  return `${location.origin}/result.html?candidate=${encodeURIComponent(login)}&assessment=${encodeURIComponent(assessmentId)}`;
};

const resultLinkText = (row) =>
  `${row.candidate}${row.login ? ` (${row.login})` : ""}\nLogin ID: ${row.login}\nLink: ${row.link}`;

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function openBulkResultLinks() {
  if (!state.assessmentId) { toast("Choose one assessment to generate result links.", "error"); return; }
  const selected = (state.resultsRows || []).filter((row) => state.resultsSelection.has(String(row.id)));
  if (!selected.length) { toast("Select at least one candidate.", "error"); return; }
  const assessmentLabel = $("#rAssessment")?.selectedOptions?.[0]?.textContent?.trim() || state.assessmentId;

  const byCandidate = new Map();
  for (const row of selected) {
    const login = row.login || "";
    if (!byCandidate.has(login)) {
      byCandidate.set(login, {
        candidate: row.candidate,
        login,
        link: resultLinkFor(row, state.assessmentId),
      });
    }
  }
  const linkRows = [...byCandidate.values()];
  const countLabel = `${linkRows.length} candidate${linkRows.length === 1 ? "" : "s"}`;

  const m = modal({
    wide: true,
    title: `Result links — ${countLabel}`,
    body: `
      <p class="field-note" style="margin-top:0">Candidates open these links with their <strong>Login ID only</strong> for <strong>${esc(assessmentLabel)}</strong>. Candidate IDs and passwords are not used.</p>
      <div class="share-panel">
        <div class="table-wrap"><table>
          <thead><tr><th>Candidate</th><th>Login ID</th><th>Link</th><th></th></tr></thead>
          <tbody>${linkRows.map((row, index) => `<tr>
            <td>${esc(row.candidate)}</td>
            <td><code>${esc(row.login)}</code></td>
            <td class="small" style="word-break:break-all">${esc(row.link)}</td>
            <td><button class="btn small" data-copy-row="${index}">Copy link</button></td>
          </tr>`).join("")}</tbody>
        </table></div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <button class="btn small" data-copy-all>Copy all</button>
          <button class="btn small" data-download-links>Download CSV</button>
        </div>
        <div class="muted small">Anyone who knows a candidate's Login ID can open that result. Share each link only with its candidate.</div>
      </div>`,
    footer: `<button class="btn" data-close>Close</button>`,
  });

  m.root.querySelectorAll("[data-copy-row]").forEach((copyButton) => copyButton.addEventListener("click", async () => {
    const row = linkRows[Number(copyButton.dataset.copyRow)];
    const ok = await copyText(resultLinkText(row));
    toast(ok ? "Result link copied." : "Could not copy to the clipboard.", ok ? "success" : "error");
  }));
  m.root.querySelector("[data-copy-all]")?.addEventListener("click", async () => {
    const ok = await copyText(linkRows.map(resultLinkText).join("\n\n"));
    toast(ok ? `${linkRows.length} result link(s) copied.` : "Could not copy to the clipboard.", ok ? "success" : "error");
  });
  m.root.querySelector("[data-download-links]")?.addEventListener("click", () => {
    const header = ["Candidate", "Login ID", "Assessment", "Link"];
    const lines = linkRows.map((row) => [
      row.candidate, row.login, assessmentLabel, row.link,
    ].map(csvCell).join(","));
    const blob = new Blob(["\uFEFF" + [header.map(csvCell).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `result-links-${state.assessmentId}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Result links CSV downloaded.", "success");
  });
}

// ---------------------------------------------------------------------------
// feedback
// ---------------------------------------------------------------------------

async function renderFeedback() {
  const { feedback, summary } = await api("/feedback");
  $("#topbarActions").innerHTML = `<a class="btn" href="/api/admin/export/feedback.csv">Export CSV</a>`;
  $("#view").innerHTML = `
    <div class="stats" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
      ${summary.length ? summary.map((s) => `<div class="stat"><div class="k">${esc(s.assessment)}</div>
        <div class="v">${num(s.avg_rating, 2)}<span class="muted" style="font-size:13px"> / 5</span></div>
        <div class="muted small">${s.n} response(s)</div></div>`).join("")
        : `<div class="stat"><div class="k">Feedback</div><div class="v">0</div></div>`}
    </div>
    <div class="card">
      <div class="card-head"><h3>Responses</h3><span class="sub">latest 200</span></div>
      <div class="card-body tight">
        ${feedback.length ? `<div class="table-wrap"><table>
          <thead><tr><th>When</th><th>Candidate</th><th>Assessment</th><th>Rating</th><th>Payload</th></tr></thead>
          <tbody>${feedback.map((f) => `<tr>
            <td class="muted small">${dt(f.submitted_at)}</td>
            <td>${esc(f.candidate || "—")}<div class="muted small">${esc(f.login || "")}</div></td>
            <td>${esc(f.assessment || "—")}</td>
            <td class="num">${f.rating == null ? "—" : num(f.rating, 2)}</td>
            <td class="small muted" style="max-width:420px">${esc(String(f.payload || "").slice(0, 220))}</td>
          </tr>`).join("")}</tbody></table></div>` : `<div class="empty">No feedback yet.</div>`}
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// audit
// ---------------------------------------------------------------------------

async function renderAudit() {
  const { audit } = await api("/audit?pageSize=200");
  $("#topbarActions").innerHTML = `<a class="btn" href="/api/admin/export/audit.csv">Export CSV</a>`;
  $("#view").innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Audit log</h3><span class="sub">latest 200 events</span></div>
      <div class="card-body tight">
        ${audit.length ? `<div class="table-wrap"><table>
          <thead><tr><th>When</th><th>Attempt</th><th>Candidate</th><th>Event</th><th>Detail</th></tr></thead>
          <tbody>${audit.map((a) => `<tr>
            <td class="muted small">${dt(a.at)}</td>
            <td class="num">${a.attempt_id ?? "—"}</td>
            <td>${esc(a.candidate || a.candidate_id || "—")}</td>
            <td><span class="pill">${esc(a.event)}</span></td>
            <td class="small muted" style="max-width:480px">${esc((a.detail || "").slice(0, 240))}</td>
          </tr>`).join("")}</tbody></table></div>` : `<div class="empty">No audit entries.</div>`}
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// settings
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// branding
// ---------------------------------------------------------------------------

const TOPBAR_META = [
  ["useful_data", "Useful Data"],
  ["instructions", "View Instructions"],
  ["group_instructions", "Group Instructions"],
  ["section_instructions", "Section Instructions"],
  ["question_instructions", "Question Instructions"],
  ["question_paper", "Question Paper"],
];

const TOOL_META = [
  ["calculator", "Calculator"],
  ["ruler", "Ruler"],
  ["protractor", "Protractor"],
  ["zoom_in", "Zoom in"],
  ["zoom_out", "Zoom out"],
  ["notepad", "Notepad"],
  ["scratchpad", "Scratchpad"],
  ["highlighter", "Text highlighter"],
];

const MODE_OPTIONS = [
  ["auto", "Engine default"],
  ["show", "Always show"],
  ["hide", "Hide"],
];

function paintBrandMark(el, brand) {
  if (!el) return;
  if (brand.icon) {
    el.classList.add("has-image");
    el.innerHTML = `<img src="${esc(brand.icon)}" alt="" />`;
  } else {
    el.classList.remove("has-image");
    el.textContent = brand.mark || "iON";
  }
}

function applyBranding(brand) {
  if (!brand) return;
  document.title = brand.adminTitle || "Assessment Admin";
  $("#loginTitle").textContent = brand.adminTitle || "Assessment Admin";
  $("#sidebarLabel").textContent = brand.adminSidebar || "Admin Console";
  paintBrandMark($("#loginMark"), brand);
  paintBrandMark($("#sidebarMark"), brand);

  if (brand.icon) {
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = brand.icon;
  }
}

async function loadBranding() {
  try {
    const res = await fetch("/IBA/api/config", { credentials: "same-origin" });
    if (!res.ok) return null;
    const data = await res.json();
    applyBranding(data.brand);
    return data.brand;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// settings
// ---------------------------------------------------------------------------

function modeSelect(scope, key, value) {
  return `<select data-${scope}="${key}">${MODE_OPTIONS.map(([mode, optionLabel]) =>
    `<option value="${mode}" ${value === mode ? "selected" : ""}>${optionLabel}</option>`).join("")}</select>`;
}

async function renderSettings() {
  const { settings } = await api("/settings");
  const brand = {
    mark: settings.brand_mark || "iON",
    icon: settings.brand_icon || "",
    adminTitle: settings.brand_admin_title || "Assessment Admin",
    adminSidebar: settings.brand_admin_sidebar || "Admin Console",
    version: settings.brand_version || "17.07.00",
  };

  let pendingIcon; // undefined = untouched, "" = cleared, data URL = new icon

  $("#view").innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Branding</h3><span class="sub">Admin panel and browser tab</span></div>
      <div class="card-body">
        <div class="brand-preview">
          <span class="brand-mark ${brand.icon ? "has-image" : ""}" id="settingsMark">${brand.icon ? `<img src="${esc(brand.icon)}" alt="" />` : esc(brand.mark)}</span>
          <div class="grow">
            <label>Brand icon (PNG, JPG, SVG, WEBP or ICO — max 300 KB)
              <input type="file" id="brandIconFile" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon" />
            </label>
          </div>
          <button type="button" class="btn small" id="brandIconClear">Remove icon</button>
        </div>
        <div class="grid2" style="margin-top:14px">
          <label>Site name<input name="brand_name" value="${esc(settings.brand_name || "")}" /></label>
          <label>Organisation<input name="org_name" value="${esc(settings.org_name || "")}" /></label>
          <label>Logo mark (text, when no icon)<input name="brand_mark" value="${esc(brand.mark)}" maxlength="16" /></label>
          <label>Admin panel title<input name="brand_admin_title" value="${esc(brand.adminTitle)}" maxlength="80" /></label>
          <label>Sidebar label<input name="brand_admin_sidebar" value="${esc(brand.adminSidebar)}" maxlength="40" /></label>
          <label>Console version (exam footer)<input name="brand_version" value="${esc(brand.version)}" maxlength="40" placeholder="e.g. 17.07.00" /></label>
        </div>
        <div class="row" style="margin-top:16px">
          <button class="btn primary" id="saveSettings">Save branding</button>
          <button class="btn" id="reloadConfig">Reset branding</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:14px">
      <div class="card-head"><h3>Candidate UI</h3><span class="sub">All assessments</span></div>
      <div class="card-body">
        <p class="field-note" style="margin:0 0 12px">Top bar buttons and exam tools used by every assessment. Saving here applies the same UI to all assessments and removes per-assessment candidate UI overrides. For one assessment only, open <strong>Assessments → Edit → Candidate UI</strong>.</p>
        <button class="btn" id="editGlobalUi">Edit candidate UI</button>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Candidate instructions</h3><span class="sub">All assessments</span></div>
      <div class="card-body">
        <p class="field-note" style="margin:0 0 12px">Instructions saved here are written to every assessment that uses the language. Editing instructions from an assessment changes only that assessment.</p>
        <button class="btn" id="editGlobalInstructions">Edit instructions</button>
      </div>
    </div>`;

  const mark = $("#settingsMark");
  const fileInput = $("#brandIconFile");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (file.size > 300 * 1024) { toast("Icon must be under 300 KB.", "error"); fileInput.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      pendingIcon = String(reader.result || "");
      paintBrandMark(mark, { ...brand, icon: pendingIcon });
      applyBranding({ ...brand, icon: pendingIcon });
    };
    reader.onerror = () => toast("Could not read that file.", "error");
    reader.readAsDataURL(file);
  });

  $("#brandIconClear").addEventListener("click", () => {
    pendingIcon = "";
    fileInput.value = "";
    paintBrandMark(mark, { ...brand, icon: "" });
    applyBranding({ ...brand, icon: "" });
  });

  $("#saveSettings").addEventListener("click", async () => {
    const body = {
      brand_name: $("#view [name=brand_name]").value.trim(),
      org_name: $("#view [name=org_name]").value.trim(),
      brand_mark: $("#view [name=brand_mark]").value.trim(),
      brand_admin_title: $("#view [name=brand_admin_title]").value.trim(),
      brand_admin_sidebar: $("#view [name=brand_admin_sidebar]").value.trim(),
      brand_version: $("#view [name=brand_version]").value.trim(),
    };
    if (pendingIcon !== undefined) body.brand_icon = pendingIcon;
    try {
      const data = await api("/settings", { method: "PUT", body });
      applyBranding({
        mark: data.settings.brand_mark,
        icon: data.settings.brand_icon,
        adminTitle: data.settings.brand_admin_title,
        adminSidebar: data.settings.brand_admin_sidebar,
      });
      toast("Branding saved.", "success");
      renderSettings();
    } catch (e) { toast(e.message, "error"); }
  });

  $("#reloadConfig").addEventListener("click", async () => {
    if (!(await confirmDialog("Reset branding to the built-in defaults?", "Reset branding"))) return;
    try {
      await api("/settings", { method: "PUT", body: {
        brand_name: "TCS iON",
        brand_mark: "iON",
        brand_icon: "",
        brand_admin_title: "Assessment Admin",
        brand_admin_sidebar: "Admin Console",
        brand_version: "17.07.00",
      } });
      toast("Branding reset.", "success");
      await loadBranding();
      renderSettings();
    } catch (e) { toast(e.message, "error"); }
  });

  $("#editGlobalUi").addEventListener("click", () => {
    globalPresentationForm().catch((e) => toast(e.message, "error"));
  });
  $("#editGlobalInstructions").addEventListener("click", () => {
    globalInstructionsForm().catch((e) => toast(e.message, "error"));
  });

}

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  $("#loginError").textContent = "";
  try {
    const data = await api("/login", { method: "POST", body: { username: form.get("username"), password: form.get("password") } });
    state.admin = data.admin;
    showApp();
  } catch (err) {
    $("#loginError").textContent = err.message;
  }
});

document.querySelectorAll(".nav-item").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
$("#whoami").addEventListener("click", openProfile);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $("#modalRoot").innerHTML = "";
});

(async function boot() {
  loadBranding();
  try {
    const me = await api("/me");
    state.admin = me.admin;
    showApp();
  } catch {
    showLogin();
  }
})();
