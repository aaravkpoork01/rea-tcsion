// Role-based access control: permission catalog, role presets and helpers.
//
// The server is the source of truth. The admin UI receives this catalog from
// `GET /api/admin/team`, but every sensitive route re-checks the signed-in
// administrator's current row from the database, so changing a role or
// disabling an account takes effect on the very next request.
//
// Team management is deliberately *not* a grantable permission: only a
// `super_admin` can manage accounts, and this code never allows that check to
// be overridden by a stored permission list.

export const PERMISSIONS = Object.freeze([
  { key: "dashboard.view", label: "View dashboard", group: "Workspace" },

  { key: "assessments.view", label: "View assessments", group: "Assessments" },
  { key: "assessments.manage", label: "Create and edit assessments", group: "Assessments" },
  { key: "questions.view", label: "View question bank", group: "Assessments" },
  { key: "questions.manage", label: "Edit questions and answer keys", group: "Assessments" },

  { key: "candidates.view", label: "View candidates", group: "Candidates" },
  { key: "candidates.manage", label: "Add and edit candidates", group: "Candidates" },
  { key: "candidates.reset_password", label: "Reset candidate passwords", group: "Candidates" },
  { key: "candidates.delete", label: "Delete candidates", group: "Candidates" },
  { key: "approvals.review", label: "Review registration approvals", group: "Candidates" },
  { key: "groups.manage", label: "Manage candidate groups", group: "Candidates" },

  { key: "attempts.view", label: "View attempts", group: "Exams" },
  { key: "attempts.manage", label: "Control attempts (extend, lock, submit, delete)", group: "Exams" },
  { key: "live.view", label: "Live exam monitor", group: "Exams" },
  { key: "results.view", label: "View results", group: "Exams" },
  { key: "results.export", label: "Export results and attempts", group: "Exams" },
  { key: "feedback.view", label: "View candidate feedback", group: "Exams" },

  { key: "audit.view", label: "View audit log", group: "Security" },
  { key: "settings.manage", label: "Manage platform settings", group: "Security" },
]);

export const ALL_PERMISSIONS = Object.freeze(PERMISSIONS.map((permission) => permission.key));
const PERMISSION_SET = new Set(ALL_PERMISSIONS);

const defaults = (...keys) => Object.freeze(keys.filter((key) => PERMISSION_SET.has(key)));

/**
 * Role presets. `super_admin` always receives every permission at request
 * time, even if an older row has a stale permission list.
 */
export const ROLES = Object.freeze({
  super_admin: {
    label: "Super Admin",
    description: "Full control, including team, roles, permissions and platform settings.",
    permissions: ALL_PERMISSIONS,
  },
  admin: {
    label: "Admin",
    description: "Runs assessments, candidates, exams and settings. Cannot manage the team unless the super admin allows staff creation.",
    permissions: defaults(
      "dashboard.view",
      "assessments.view", "assessments.manage", "questions.view", "questions.manage",
      "candidates.view", "candidates.manage", "candidates.reset_password", "candidates.delete",
      "approvals.review", "groups.manage",
      "attempts.view", "attempts.manage", "live.view",
      "results.view", "results.export", "feedback.view",
      "audit.view", "settings.manage",
    ),
  },
  staff: {
    label: "Staff",
    description: "Front-desk and exam-day support: candidates, approvals and live monitoring.",
    permissions: defaults(
      "dashboard.view",
      "candidates.view", "candidates.manage", "candidates.reset_password",
      "approvals.review", "attempts.view", "live.view",
    ),
  },
  exam_manager: {
    label: "Exam Manager",
    description: "Builds assessments and question papers, assigns groups and exports results.",
    permissions: defaults(
      "dashboard.view",
      "assessments.view", "assessments.manage", "questions.view", "questions.manage",
      "candidates.view", "groups.manage",
      "attempts.view", "live.view", "results.view", "results.export",
    ),
  },
  invigilator: {
    label: "Invigilator",
    description: "Watches live exams and controls attempts without seeing papers, settings or scores.",
    permissions: defaults(
      "dashboard.view",
      "candidates.view", "attempts.view", "attempts.manage", "live.view", "audit.view",
    ),
  },
  registration_officer: {
    label: "Registration Officer",
    description: "Verifies self-registrations, manages candidate accounts and candidate groups.",
    permissions: defaults(
      "dashboard.view",
      "candidates.view", "candidates.manage", "candidates.reset_password",
      "approvals.review", "groups.manage", "attempts.view",
    ),
  },
  evaluator: {
    label: "Evaluator",
    description: "Reviews results and feedback and exports result sheets. Read-only elsewhere.",
    permissions: defaults(
      "dashboard.view",
      "candidates.view", "attempts.view",
      "results.view", "results.export", "feedback.view",
    ),
  },
  viewer: {
    label: "Viewer",
    description: "Read-only monitoring across assessments, candidates, live exams and results.",
    permissions: defaults(
      "dashboard.view",
      "assessments.view", "questions.view",
      "candidates.view", "attempts.view", "live.view",
      "results.view", "feedback.view",
    ),
  },
});

export const ROLE_KEYS = Object.freeze(Object.keys(ROLES));
const ROLE_SET = new Set(ROLE_KEYS);

export const isKnownRole = (role) => ROLE_SET.has(String(role || "").trim().toLowerCase());

export const isSuperAdmin = (admin) => String(admin?.role || "") === "super_admin";

export const roleLabel = (role) => ROLES[role]?.label || String(role || "").replace(/_/g, " ");

/** Copy of a role's default permission list. */
export const permissionsForRole = (role) => {
  const preset = ROLES[role];
  if (!preset) return [];
  return [...preset.permissions];
};

export const roleCatalog = () => ROLE_KEYS.map((key) => ({
  key,
  label: ROLES[key].label,
  description: ROLES[key].description,
  permissions: permissionsForRole(key),
}));

export const permissionGroups = () => {
  const groups = [];
  for (const permission of PERMISSIONS) {
    let group = groups.find((item) => item.group === permission.group);
    if (!group) {
      group = { group: permission.group, permissions: [] };
      groups.push(group);
    }
    group.permissions.push({ key: permission.key, label: permission.label });
  }
  return groups;
};

/**
 * Parse a stored/permission request value.
 * `null` means "no explicit list, use the role default"; `[]` means no access.
 */
function parsePermissionList(value) {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
}

/** Keep only known keys, in catalog order. */
export const normalizePermissions = (value, fallbackRole = "staff") => {
  if (fallbackRole === "super_admin") return [...ALL_PERMISSIONS];
  const parsed = parsePermissionList(value);
  if (parsed === null) return permissionsForRole(fallbackRole);
  const selected = new Set(parsed);
  return ALL_PERMISSIONS.filter((key) => selected.has(key));
};

/** Effective permissions for a database row. Never trust a client copy. */
export const effectivePermissions = (admin) => {
  if (!admin) return [];
  if (isSuperAdmin(admin)) return [...ALL_PERMISSIONS];
  const parsed = parsePermissionList(admin.permissions);
  if (parsed === null) return permissionsForRole(admin.role);
  const selected = new Set(parsed);
  return ALL_PERMISSIONS.filter((key) => selected.has(key));
};

export const hasPermission = (admin, permission) => {
  if (!permission) return true;
  if (!admin) return false;
  if (isSuperAdmin(admin)) return true;
  return effectivePermissions(admin).includes(permission);
};

export const hasAnyPermission = (admin, permissions = []) =>
  permissions.some((permission) => hasPermission(admin, permission));

/** Roles that an actor is allowed to assign when creating/editing an account. */
export const assignableRoles = (actor) => {
  if (isSuperAdmin(actor)) return [...ROLE_KEYS];
  return [];
};
