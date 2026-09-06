import type { UserRole } from "./session";

export type Permission =
  | "VIEW_OWN_DASHBOARD"
  | "VIEW_OWN_TIME_TRACKING"
  | "VIEW_OWN_ATTENDANCE"
  | "VIEW_OWN_WORK_LOGS"
  | "VIEW_OWN_LEAVE"
  | "VIEW_OWN_PROFILE"
  | "VIEW_TEAM_WORK_LOGS"
  | "MANAGE_EMPLOYEES"
  | "CHANGE_EMPLOYEE_PASSWORD"
  | "MANAGE_MANAGERS"
  | "CHANGE_MANAGER_PASSWORD";

const rolePermissions: Record<UserRole, Permission[]> = {
  EMPLOYEE: [
    "VIEW_OWN_DASHBOARD",
    "VIEW_OWN_TIME_TRACKING",
    "VIEW_OWN_ATTENDANCE",
    "VIEW_OWN_WORK_LOGS",
    "VIEW_OWN_LEAVE",
    "VIEW_OWN_PROFILE",
  ],

  MANAGER: [
    "VIEW_OWN_DASHBOARD",
    "VIEW_OWN_TIME_TRACKING",
    "VIEW_OWN_ATTENDANCE",
    "VIEW_OWN_WORK_LOGS",
    "VIEW_OWN_LEAVE",
    "VIEW_OWN_PROFILE",
    "VIEW_TEAM_WORK_LOGS",
    "MANAGE_EMPLOYEES",
    "CHANGE_EMPLOYEE_PASSWORD",
  ],

  ADMIN: [
    "VIEW_OWN_DASHBOARD",
    "VIEW_OWN_TIME_TRACKING",
    "VIEW_OWN_ATTENDANCE",
    "VIEW_OWN_WORK_LOGS",
    "VIEW_OWN_LEAVE",
    "VIEW_OWN_PROFILE",
    "VIEW_TEAM_WORK_LOGS",
    "MANAGE_EMPLOYEES",
    "CHANGE_EMPLOYEE_PASSWORD",
    "MANAGE_MANAGERS",
    "CHANGE_MANAGER_PASSWORD",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return rolePermissions[role].includes(permission);
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function isManagerOrAdmin(role: UserRole): boolean {
  return role === "MANAGER" || role === "ADMIN";
}

export function canManageEmployees(role: UserRole): boolean {
  return hasPermission(role, "MANAGE_EMPLOYEES");
}

export function canChangeEmployeePassword(role: UserRole): boolean {
  return hasPermission(role, "CHANGE_EMPLOYEE_PASSWORD");
}

export function canManageManagers(role: UserRole): boolean {
  return hasPermission(role, "MANAGE_MANAGERS");
}

export function canChangeManagerPassword(role: UserRole): boolean {
  return hasPermission(role, "CHANGE_MANAGER_PASSWORD");
}

export function canViewTeamWorkLogs(role: UserRole): boolean {
  return hasPermission(role, "VIEW_TEAM_WORK_LOGS");
}