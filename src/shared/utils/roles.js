export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  HR_ADMIN: "HR_ADMIN",
  PAYROLL_ADMIN: "PAYROLL_ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
};

const roleScopes = Object.freeze({
  [ROLES.SUPER_ADMIN]: [
    // Full system access
    "company:manage",
    "employee:create",
    "employee:read",
    "employees:read",
    "employee:update",
    "employee:delete",

    "attendance:manage",
    "leave:manage",
    "payroll:manage",
    "role:manage",
    "permission:manage",
    "audit:read",
  ],

  [ROLES.COMPANY_ADMIN]: [
    "employee:create",
    "employee:read",
    "employees:read",
    "employee:update",
    "employee:delete",

    "department:create",
    "department:read",
    "departments:read",
    "department:update",
    "department:delete",

    "designation:create",
    "designation:read",
    "designations:read",
    "designation:update",
    "designation:delete",

    "attendance:create",
    "attendance:read",
    "attendance:update",

    "leave:policy:create",
    "leave:policy:update",
    "leave:policy:delete",
    "leave:policy:read",
    "leave:approve",
    "leave:read",

    "payroll:configure",
    "payroll:run",
    "payroll:approve",
    "payroll:view",
    "payroll:export",

    "role:create",
    "role:update",
    "role:assign",

    "audit:read",
  ],

  [ROLES.HR_ADMIN]: [
    "employee:create",
    "employee:read",
    "employees:read",
    "employee:update",

    "attendance:read",
    "attendance:update",

    "leave:policy:create",
    "leave:policy:update",
    "leave:approve",
    "leave:read",

    "payroll:view",

    "document:upload",
  ],

  [ROLES.PAYROLL_ADMIN]: [
    "employee:read",
    "employees:read",
    "payroll:configure",
    "payroll:run",
    "payroll:approve",
    "payroll:view",
    "payroll:export",

    "attendance:read",

    "audit:read",
  ],

  [ROLES.MANAGER]: [
    "employee:read",
    "employees:read",

    "attendance:read",

    "leave:approve",
    "leave:read",

    "performance:review",
  ],

  [ROLES.EMPLOYEE]: [
    "profile:read",
    "profile:update",

    "attendance:clockin",
    "attendance:clockout",
    "attendance:read",

    "leave:apply",
    "leave:read",

    "payroll:view",
    "payroll:download",

    "document:read",
    "document:upload",
  ],
});
class Roles
{
  constructor()
  {
    this.roles = roleScopes;
  }
  getPermissionOf = (role) =>
  {
    return this.roles[role];
  };
}

export default new Roles();
