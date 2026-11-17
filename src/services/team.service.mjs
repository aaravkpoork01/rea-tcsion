// Team and access management. Every write is super-admin only; an admin may
// create *staff only* while the super admin has switched that policy on.
import { badRequest, conflict, forbidden, notFound } from "../core/errors.mjs";
import { hashPassword } from "../core/crypto.mjs";
import { nowIso } from "../core/time.mjs";
import { adminName, adminUsername, clean } from "../domain/admin-account.mjs";
import { requireAdminPassword } from "../domain/admin-password.mjs";
import {
  ROLE_KEYS,
  effectivePermissions,
  isKnownRole,
  isSuperAdmin,
  normalizePermissions,
  permissionGroups,
  permissionsForRole,
  roleCatalog,
  roleLabel,
} from "../domain/rbac.mjs";
import * as adminsRepo from "../db/repositories/admins.repo.mjs";
import * as auditRepo from "../db/repositories/audit.repo.mjs";
import * as sessionsRepo from "../db/repositories/sessions.repo.mjs";
import * as settingsRepo from "../db/repositories/settings.repo.mjs";

export const STAFF_CREATION_KEY = "rbac_admin_can_create_staff";

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const adminPolicyEnabled = async () =>
  String(await settingsRepo.getSetting(STAFF_CREATION_KEY, "0")) === "1";

/** True for super admins, and for `admin` accounts while the policy is on. */
export async function canCreateStaff(actor) {
  if (isSuperAdmin(actor)) return true;
  if (String(actor?.role || "") !== "admin") return false;
  return adminPolicyEnabled();
}

function requireSuperAdmin(actor) {
  if (!isSuperAdmin(actor)) {
    throw forbidden("Only the super administrator can manage team accounts.");
  }
}

function publicMember(row) {
  const permissions = effectivePermissions(row);
  const defaults = new Set(permissionsForRole(row.role));
  const personalized = !isSuperAdmin(row)
    && (permissions.length !== defaults.size || permissions.some((key) => !defaults.has(key)));
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    roleLabel: roleLabel(row.role),
    status: row.status || "active",
    superAdmin: isSuperAdmin(row),
    permissions,
    personalized,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at || "",
    lastLoginAt: row.last_login_at || "",
    updatedAt: row.updated_at || "",
  };
}

async function record(actor, event, detail, ip = "") {
  try {
    await auditRepo.insert({ event, detail, ip, at: nowIso() });
  } catch {
    // An audit write must never roll back an otherwise valid security action.
  }
}

const roleOrder = (role) => {
  const index = ROLE_KEYS.indexOf(role);
  return index === -1 ? ROLE_KEYS.length : index;
};

/** Everything the Team & access screen needs for the signed-in actor. */
export async function context(actor) {
  const superAdmin = isSuperAdmin(actor);
  const allowCreate = await canCreateStaff(actor);
  if (!superAdmin && !allowCreate) {
    throw forbidden("Team management is restricted to the super administrator.");
  }

  const policy = await adminPolicyEnabled();
  let rows = await adminsRepo.allRows();
  if (!superAdmin) rows = rows.filter((row) => row.role === "staff");
  rows.sort((left, right) => {
    const roleDiff = roleOrder(left.role) - roleOrder(right.role);
    if (roleDiff) return roleDiff;
    return String(left.name || left.username).localeCompare(String(right.name || right.username));
  });

  return {
    team: rows.map(publicMember),
    catalog: {
      roles: roleCatalog(),
      permissionGroups: permissionGroups(),
      currentRoleKeys: superAdmin ? [...ROLE_KEYS] : ["staff"],
    },
    settings: { adminCanCreateStaff: policy },
    canManage: superAdmin,
    canCreateStaff: allowCreate,
    self: {
      id: actor.id,
      username: actor.username,
      name: actor.name,
      role: actor.role,
      roleLabel: roleLabel(actor.role),
      superAdmin,
      permissions: effectivePermissions(actor),
      canCreateStaff: allowCreate,
    },
  };
}

export async function createMember(actor, input = {}, meta = {}) {
  const actorIsSuper = isSuperAdmin(actor);
  if (!actorIsSuper && !(await canCreateStaff(actor))) {
    throw forbidden("Only the super administrator can add team accounts.");
  }

  const role = clean(input.role).toLowerCase() || "staff";
  if (!isKnownRole(role)) throw badRequest("Select a valid role.");
  if (!actorIsSuper && role !== "staff") {
    throw forbidden("Admins can only create staff accounts.");
  }

  const name = adminName(input.name);
  const username = adminUsername(input.username);
  const password = requireAdminPassword(input.password);
  if (await adminsRepo.findByUsername(username)) {
    throw conflict("That username is already in use.");
  }

  const at = nowIso();
  const permissions = role === "super_admin"
    ? null
    : JSON.stringify(actorIsSuper ? normalizePermissions(input.permissions, role) : permissionsForRole("staff"));

  const result = await adminsRepo.create({
    username,
    passwordHash: hashPassword(password),
    name,
    role,
    status: "active",
    permissions,
    createdBy: actor.id,
    lastLoginAt: "",
    updatedAt: at,
    createdAt: at,
  });

  const created = await adminsRepo.findByUsername(username);
  await record(
    actor,
    "admin.team.create",
    `Created ${role} account @${username}${result.lastInsertRowid ? ` (#${result.lastInsertRowid})` : ""}.`,
    meta.ip,
  );
  return publicMember(created);
}

export async function updateMember(actor, id, input = {}, meta = {}) {
  requireSuperAdmin(actor);
  const target = await adminsRepo.findById(Number(id));
  if (!target) throw notFound("Team member not found.");
  const targetId = Number(target.id);

  const role = hasOwn(input, "role") ? clean(input.role).toLowerCase() : String(target.role || "");
  if (!isKnownRole(role)) throw badRequest("Select a valid role.");

  const status = hasOwn(input, "status") ? clean(input.status).toLowerCase() : String(target.status || "active");
  if (!["active", "disabled"].includes(status)) throw badRequest("Status must be active or disabled.");

  if (targetId === Number(actor.id)) {
    if (role !== String(target.role || "")) throw badRequest("You cannot change your own role.");
    if (status !== String(target.status || "active")) throw badRequest("You cannot disable your own account.");
  }

  const remainsActiveSuper = role === "super_admin" && status === "active";
  if (target.role === "super_admin" && target.status === "active" && !remainsActiveSuper) {
    const activeSupers = await adminsRepo.countActiveSuperAdmins();
    if (activeSupers <= 1) {
      throw badRequest("At least one active super administrator is required.");
    }
  }

  const name = hasOwn(input, "name") ? adminName(input.name) : target.name;
  const username = hasOwn(input, "username") ? clean(input.username) : String(target.username || "");
  if (!username) throw badRequest("Username is required.");
  if (username !== String(target.username || "")) {
    adminUsername(username);
    const existing = await adminsRepo.findByUsername(username);
    if (existing && Number(existing.id) !== targetId) {
      throw conflict("That username is already in use.");
    }
  }

  let permissions = target.permissions;
  if (role === "super_admin") {
    permissions = null;
  } else if (hasOwn(input, "permissions")) {
    if (input.permissions === null) permissions = null;
    else if (!Array.isArray(input.permissions)) throw badRequest("Permissions must be a list.");
    else permissions = JSON.stringify(normalizePermissions(input.permissions, role));
  } else if (role !== String(target.role || "")) {
    permissions = JSON.stringify(permissionsForRole(role));
  }

  await adminsRepo.update(targetId, {
    name,
    username,
    role,
    status,
    permissions,
    updatedAt: nowIso(),
  });

  if (status === "disabled") {
    await sessionsRepo.expireFor("admin", String(targetId), nowIso());
  }

  const updated = await adminsRepo.findById(targetId);
  await record(
    actor,
    "admin.team.update",
    `Updated @${target.username}: role ${target.role}→${role}, status ${target.status || "active"}→${status}, permissions ${effectivePermissions(updated).length}.`,
    meta.ip,
  );
  return publicMember(updated);
}

export async function resetMemberPassword(actor, id, password, meta = {}) {
  requireSuperAdmin(actor);
  const target = await adminsRepo.findById(Number(id));
  if (!target) throw notFound("Team member not found.");
  if (Number(target.id) === Number(actor.id)) {
    throw badRequest("Use your own profile to change your password.");
  }
  const next = requireAdminPassword(password);
  await adminsRepo.update(target.id, {
    passwordHash: hashPassword(next),
    updatedAt: nowIso(),
  });
  await sessionsRepo.expireFor("admin", String(target.id), nowIso());
  await record(actor, "admin.team.password", `Reset the password for @${target.username} (#${target.id}).`, meta.ip);
  return { id: target.id };
}

export async function updatePolicy(actor, input = {}, meta = {}) {
  requireSuperAdmin(actor);
  const enabled = input.adminCanCreateStaff === true
    || input.adminCanCreateStaff === "true"
    || input.adminCanCreateStaff === 1;
  await settingsRepo.setSetting(STAFF_CREATION_KEY, enabled ? "1" : "0");
  await record(
    actor,
    "admin.team.policy",
    enabled ? "Allowed admin accounts to create staff." : "Stopped admin accounts from creating staff.",
    meta.ip,
  );
  return { adminCanCreateStaff: enabled };
}
