export type Role = 'USER' | 'ADMIN' | 'AUDITOR';

type Permission =
  | 'user:read'
  | 'user:write'
  | 'session:revoke'
  | 'apikey:issue'
  | 'apikey:revoke'
  | 'audit:read'
  | 'health:read';

export const rolePermissions: Record<Role, Permission[]> = {
  USER: ['health:read'],
  ADMIN: ['user:read', 'user:write', 'session:revoke', 'apikey:issue', 'apikey:revoke', 'audit:read', 'health:read'],
  AUDITOR: ['user:read', 'audit:read', 'health:read']
};

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}
