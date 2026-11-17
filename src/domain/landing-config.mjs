// Editable public landing-page content. Admin Settings stores one JSON row and
// the public page merges it over these defaults, so partial/corrupt values never
// leave the page blank.

export const LANDING_DEFAULTS = Object.freeze({
  pageTitle: "TCS iON Assessment Platform",
  metaDescription: "Candidate portal for TCS iON style online assessments. Sign in or register for administrator-approved access.",
  brandName: "TCS iON",
  brandSubtitle: "Assessment Platform",
  navHow: "How it works",
  navBefore: "Before you begin",
  navLogin: "Login",
  orgId: "726",
  assessmentId: "",

  heroEyebrow: "Candidate portal",
  heroTitle: "Focus on the exam.",
  heroAccent: "We’ll handle the rest.",
  heroLead: "Sign in to continue your assessment, or register as a new candidate. Every new account is reviewed by an administrator before it becomes active.",
  heroPrimary: "Login to your assessment",
  heroSecondary: "Register as a candidate",
  heroPoint1: "Secure, admin-approved accounts",
  heroPoint2: "Resume saved attempts",
  heroPoint3: "Works on desktop and mobile",

  visualStatus: "Assessment ready",
  visualTime: "01:59:42",
  visualAvatar: "AS",
  visualCandidate: "Candidate",
  visualCandidateSub: "Assessment in progress",
  visualLive: "Live",
  visualProgress: "Progress",
  visualProgressCount: "12 / 50",
  visualApprovalValue: "24h",
  visualApprovalLabel: "Approval window",
  visualSavedLabel: "Answers saved",

  feature1Title: "Approved access",
  feature1Body: "Registrations are checked by an administrator before a candidate can sign in.",
  feature2Title: "Pick up where you left off",
  feature2Body: "Saved answers and the remaining time are restored when you sign in again.",
  feature3Title: "One candidate console",
  feature3Body: "A familiar, distraction-free exam interface on desktop, tablet and mobile.",

  howKicker: "How it works",
  howTitle: "From registration to your exam in three steps",
  howLead: "New candidates can register in a few minutes. Existing candidates can sign in straight away.",
  step1Title: "Register",
  step1Body: "Enter your name, contact details and a photo, then choose or generate your 10-digit Login ID and set a password.",
  step1Link: "Create an account",
  step2Title: "Wait for approval",
  step2Body: "The administrator reviews your details. Approval can take up to 24 hours; you can sign in as soon as your account is active.",
  step2Note: "Maximum 24-hour review window",
  step3Title: "Sign in and start",
  step3Body: "Use your Login ID and password on the candidate sign-in page. Your instructions and assessment will open from there.",
  step3Link: "Go to sign in",

  beforeKicker: "Before you begin",
  beforeTitle: "Keep these details ready",
  beforeLead: "A smooth start makes a real difference. Check the points below before you register or sign in.",
  check1Title: "Your own photo.",
  check1Body: "Use a clear, recent passport-style photograph. It is shown to the administrator during approval and on your candidate panel.",
  check2Title: "A working email or phone.",
  check2Body: "The administrator may use it to reach you about your registration.",
  check3Title: "A Login ID you will remember.",
  check3Body: "It must be exactly 10 digits. You can type your own or generate a fresh one.",
  check4Title: "A stable connection.",
  check4Body: "If your session closes, sign in again to resume from your last saved answer and remaining time.",
  noticeBadge: "Please note",
  noticeTitle: "Approval is required before your first sign-in",
  noticeBody: "After you submit the registration form, your account is marked pending. The administrator can approve or reject it after checking your details. Approval can take up to 24 hours.",
  noticeMeta1Label: "Registration",
  noticeMeta1Value: "Name, photo, contact, Login ID, password",
  noticeMeta2Label: "Decision",
  noticeMeta2Value: "Approve or reject from the admin console",
  noticeSmall: "Already registered and waiting? Try signing in with your Login ID to see the latest status.",

  ctaKicker: "Candidate sign-in",
  ctaTitle: "Ready when you are.",
  ctaLead: "Sign in to continue, or register if you are a new candidate.",
  ctaLogin: "Login",
  ctaRegister: "Register",

  footerBrand: "TCS iON Assessment Platform",
  footerTagline: "Online assessments, candidate console and admin back office.",
  footerLogin: "Candidate login",
  footerRegister: "Register",
  footerCopyright: "TCS iON Assessment Platform",
  footerNote: "Use of this site is subject to the assessment rules shared at sign-in.",
});

const FIELD_LIMITS = Object.freeze({
  pageTitle: 80,
  metaDescription: 200,
  brandName: 80,
  brandSubtitle: 60,
  navHow: 40,
  navBefore: 40,
  navLogin: 20,
  orgId: 20,
  assessmentId: 20,
  heroEyebrow: 40,
  heroTitle: 120,
  heroAccent: 120,
  heroLead: 400,
  heroPrimary: 60,
  heroSecondary: 60,
  heroPoint1: 100,
  heroPoint2: 100,
  heroPoint3: 100,
  visualStatus: 40,
  visualTime: 20,
  visualAvatar: 4,
  visualCandidate: 50,
  visualCandidateSub: 60,
  visualLive: 20,
  visualProgress: 40,
  visualProgressCount: 20,
  visualApprovalValue: 20,
  visualApprovalLabel: 40,
  visualSavedLabel: 40,
  feature1Title: 80,
  feature1Body: 240,
  feature2Title: 80,
  feature2Body: 240,
  feature3Title: 80,
  feature3Body: 240,
  howKicker: 40,
  howTitle: 120,
  howLead: 300,
  step1Title: 80,
  step1Body: 300,
  step1Link: 60,
  step2Title: 80,
  step2Body: 300,
  step2Note: 80,
  step3Title: 80,
  step3Body: 300,
  step3Link: 60,
  beforeKicker: 40,
  beforeTitle: 120,
  beforeLead: 300,
  check1Title: 80,
  check1Body: 300,
  check2Title: 80,
  check2Body: 300,
  check3Title: 80,
  check3Body: 300,
  check4Title: 80,
  check4Body: 300,
  noticeBadge: 40,
  noticeTitle: 120,
  noticeBody: 400,
  noticeMeta1Label: 40,
  noticeMeta1Value: 100,
  noticeMeta2Label: 40,
  noticeMeta2Value: 100,
  noticeSmall: 300,
  ctaKicker: 40,
  ctaTitle: 100,
  ctaLead: 300,
  ctaLogin: 40,
  ctaRegister: 40,
  footerBrand: 100,
  footerTagline: 200,
  footerLogin: 40,
  footerRegister: 40,
  footerCopyright: 160,
  footerNote: 200,
});

const DEFAULT_LOGO = "images/collegelogo.png";

function parseStored(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Merge stored text over defaults, trimming and capping every field. */
export function normaliseLandingConfig(value) {
  const source = parseStored(value);
  const out = {};
  for (const [key, limit] of Object.entries(FIELD_LIMITS)) {
    const raw = String(source[key] ?? "").trim();
    out[key] = raw ? raw.slice(0, limit) : LANDING_DEFAULTS[key];
  }
  out.orgId = out.orgId.replace(/[^A-Za-z0-9_-]/g, "") || LANDING_DEFAULTS.orgId;
  out.assessmentId = out.assessmentId.replace(/[^A-Za-z0-9_-]/g, "");
  return out;
}

/** Public landing config, including the logo. */
export function buildLandingConfig(settings = {}) {
  return {
    ...normaliseLandingConfig(settings.landing_config),
    logo: settings.landing_logo || DEFAULT_LOGO,
  };
}

export { DEFAULT_LOGO as LANDING_DEFAULT_LOGO };
